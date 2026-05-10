import admin from 'firebase-admin';

/**
 * Firebase Admin SDK — Singleton
 * 
 * Used server-side for sending push notifications via FCM.
 * Requires FIREBASE_SERVICE_ACCOUNT_KEY env var (stringified JSON).
 * 
 * Usage:
 *   import { getMessaging } from '@/lib/firebase-admin';
 *   const messaging = getMessaging();
 *   await messaging.send({ token, notification: { title, body } });
 */

function initializeFirebaseAdmin() {
    if (admin.apps.length > 0) {
        return admin.app();
    }

    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    
    if (!serviceAccountKey) {
        console.warn('⚠️ FIREBASE_SERVICE_ACCOUNT_KEY not set — push notifications disabled');
        return null;
    }

    try {
        const serviceAccount = JSON.parse(serviceAccountKey);
        return admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    } catch (e) {
        console.error('Failed to initialize Firebase Admin:', e.message);
        return null;
    }
}

export function getMessaging() {
    const app = initializeFirebaseAdmin();
    if (!app) return null;
    return admin.messaging();
}

export function isFirebaseConfigured() {
    return !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
}
