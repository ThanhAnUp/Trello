import * as admin from 'firebase-admin';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FirebaseService {
    private firebaseApp: admin.app.App;

    constructor() {
        console.log(process.env.FIREBASE_PRIVATE_KEY, 'process.env.FIREBASE_PRIVATE_KEY')
        this.firebaseApp = admin.initializeApp({
            credential: admin.credential.cert({
                projectId: 'trello-app-3600b',
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL
            }),
        });
    }

    getFirestore() {
        return admin.firestore();
    }

    getAuth() {
        return admin.auth();
    }
}