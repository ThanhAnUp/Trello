import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { FirebaseService } from "src/firebase/firebase.service";
import { CreateBoardDto } from "./dto/create-board.dto";
import * as admin from 'firebase-admin';
import { UsersService } from "src/user/users.service";

@Injectable()
export class BoardsService {
    private readonly boardsCollection = 'boards';
    constructor(
        private readonly firebaseService: FirebaseService,
        private readonly usersService: UsersService
    ) { }

    async create(dto: CreateBoardDto, ownerId: string): Promise<any> {
        const newBoard = {
            ...dto,
            ownerId,
            memberIds: [ownerId],
            createdAt: new Date(),
        };
        const docRef = await this.firebaseService.getFirestore().collection(this.boardsCollection).add(newBoard);
        return {
            id: docRef.id,
            ...newBoard
        }
    }

    async findAllForUser(userId: string) {
        const snapshot = await this.firebaseService.getFirestore().collection(this.boardsCollection).where('memberIds', 'array-contains', userId).get();
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }

    async findOne(id: string, userId: string): Promise<any> {
        const doc = await this.firebaseService.getFirestore().collection(this.boardsCollection).doc(id).get();
        if (!doc.exists) {
            throw new NotFoundException('Board không tồn tại');
        }
        const boardData = doc.data();
        if (!boardData || !boardData.memberIds.includes(userId)) {
            throw new NotFoundException('Bạn không phải thành viên của board này.')
        }
        return {
            id: doc.id,
            ...boardData,
        }
    }

    async addMember(boardId: string, userId: string): Promise<void> {
        const boardRef = this.firebaseService.getFirestore().collection(this.boardsCollection).doc(boardId);
        await boardRef.update({
            memberIds: admin.firestore.FieldValue.arrayUnion(userId)
        });
    }

    async linkRepository(boardId: string, owner: string, repo: string): Promise<void> {
        const boardRef = this.firebaseService.getFirestore().collection('boards').doc(boardId);
        await boardRef.update({
            linkedRepo: { owner, repo }
        });
    }

    async delete(boardId: string, userId: string): Promise<void> {
        const boardRef = this.firebaseService.getFirestore().collection(this.boardsCollection).doc(boardId);
        const doc = await boardRef.get();

        if (!doc.exists) {
            throw new NotFoundException('Board không tồn tại');
        }

        const boardData = doc.data();
        if (!boardData || boardData.ownerId !== userId) {
            throw new UnauthorizedException('Bạn không có quyền xóa board này.');
        }

        await this.deleteSubCollection(boardRef, 'tasks');
        await boardRef.delete();
    }

    private async deleteSubCollection(docRef: admin.firestore.DocumentReference, subCollectionName: string) {
        const subCollection = docRef.collection(subCollectionName);
        const snapshot = await subCollection.get();

        if (snapshot.size === 0) {
            return;
        }

        const batch = this.firebaseService.getFirestore().batch();
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
    }

    async getBoardMembers(boardId: string): Promise<any[]> {
        const boardDoc = await this.firebaseService.getFirestore().collection(this.boardsCollection).doc(boardId).get();

        if (!boardDoc.exists) {
            throw new NotFoundException('Board không tồn tại');
        }

        const boardData = boardDoc.data();
        const memberIds = boardData?.memberIds || [];

        if (memberIds.length === 0) {
            return [];
        }

        const memberPromises = memberIds.map(id => this.usersService.findById(id));
        const members = await Promise.all(memberPromises);

        return members
            .filter(member => member !== null)
            .map(member => ({
                id: member.id,
                name: member.name,
                email: member.email,
                avatarUrl: member.avatarUrl
            }));
    }
}