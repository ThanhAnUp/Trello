import { Injectable } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';
import * as admin from 'firebase-admin';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    private readonly firestore: admin.firestore.Firestore;
    private readonly usersCollection = 'users';

    constructor(private readonly firebaseService: FirebaseService) {
        this.firestore = this.firebaseService.getFirestore();
    }

    async findByEmail(email: string): Promise<any | null> {
        const snapshot = await this.firestore.collection(this.usersCollection)
            .where('email', '==', email)
            .limit(1)
            .get();

        if (snapshot.empty) {
            return null;
        }
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
    }
    
    async findByGithubId(githubId: string): Promise<any | null> {
        const snapshot = await this.firestore.collection(this.usersCollection)
            .where('githubId', '==', githubId)
            .limit(1)
            .get();
            
        if (snapshot.empty) {
            return null;
        }
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
    }

    async create(userData: any): Promise<any> {
        if (userData.password) {
            userData.password = await bcrypt.hash(userData.password, 10);
        }

        const docRef = await this.firestore.collection(this.usersCollection).add({
            ...userData,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        const newUserDoc = await docRef.get();
        return { id: newUserDoc.id, ...newUserDoc.data() };
    }
    
    async update(userId: string, updateData: any): Promise<void> {
        const userRef = this.firestore.collection(this.usersCollection).doc(userId);
        await userRef.update(updateData);
    }
}