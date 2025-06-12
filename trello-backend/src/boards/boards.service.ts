import { Injectable, NotFoundException } from "@nestjs/common";
import { FirebaseService } from "src/firebase/firebase.service";
import { CreateBoardDto } from "./dto/create-board.dto";
import * as admin from 'firebase-admin';

@Injectable()
export class BoardsService {
    private readonly boardsCollection = 'boards';
    constructor(private readonly firebaseService: FirebaseService) { }

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
}