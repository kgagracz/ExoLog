    import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';

const expo = new Expo();

/**
 * Sends push notifications to all followers of a given user.
 */
async function sendPushToFollowers(
    db: admin.firestore.Firestore,
    actorId: string,
    notification: { title: string; body: string; data: Record<string, string> },
): Promise<void> {
    console.log(`[Push] Sending notifications for actorId=${actorId}, type=${notification.data.type}`);

    const followsSnap = await db
        .collection('follows')
        .where('followingId', '==', actorId)
        .get();

    if (followsSnap.empty) {
        console.log('[Push] No followers found — skipping');
        return;
    }

    const followerIds = followsSnap.docs.map((d) => d.data().followerId as string);
    console.log(`[Push] Found ${followerIds.length} followers: ${followerIds.join(', ')}`);

    const messages: ExpoPushMessage[] = [];
    const missingTokenIds: string[] = [];
    const invalidTokenIds: string[] = [];

    // Firestore 'in' queries limited to 10 values
    for (let i = 0; i < followerIds.length; i += 10) {
        const chunk = followerIds.slice(i, i + 10);
        const profilesSnap = await db
            .collection('userProfiles')
            .where(admin.firestore.FieldPath.documentId(), 'in', chunk)
            .get();

        profilesSnap.docs.forEach((doc) => {
            const token = doc.data().expoPushToken;
            if (!token) {
                missingTokenIds.push(doc.id);
                return;
            }
            if (!Expo.isExpoPushToken(token)) {
                invalidTokenIds.push(doc.id);
                console.warn(`[Push] Invalid token for user ${doc.id}: ${token}`);
                return;
            }
            messages.push({
                to: token,
                sound: 'default',
                title: notification.title,
                body: notification.body,
                data: notification.data,
            });
        });
    }

    if (missingTokenIds.length > 0) {
        console.warn(`[Push] ${missingTokenIds.length} followers have NO expoPushToken: ${missingTokenIds.join(', ')}`);
    }
    if (invalidTokenIds.length > 0) {
        console.warn(`[Push] ${invalidTokenIds.length} followers have INVALID token: ${invalidTokenIds.join(', ')}`);
    }

    if (messages.length === 0) {
        console.log('[Push] No valid tokens — no notifications sent');
        return;
    }

    console.log(`[Push] Sending ${messages.length} push notification(s)`);
    const chunks = expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
        try {
            const tickets = await expo.sendPushNotificationsAsync(chunk);
            console.log('[Push] Tickets:', JSON.stringify(tickets));
        } catch (error) {
            console.error('[Push] Error sending chunk:', error);
        }
    }
}

/**
 * Triggered when a new event is created in the 'events' collection.
 * Creates an activity entry and sends push notifications for molting events.
 */
export const onMoltingCreated = functions.firestore
    .document('events/{eventId}')
    .onCreate(async (snap) => {
        const eventData = snap.data();

        if (eventData.eventTypeId !== 'molting') return;

        const db = admin.firestore();

        // Get animal info
        const animalSnap = await db.doc(`animals/${eventData.animalId}`).get();
        const animal = animalSnap.data();
        if (!animal) return;

        // Get actor display name
        const actorSnap = await db.doc(`userProfiles/${eventData.userId}`).get();
        const actorName = actorSnap.data()?.displayName || 'Użytkownik';

        const previousStage = eventData.eventData?.previousStage ?? '?';
        const newStage = eventData.eventData?.newStage ?? '?';

        // Create activity entry
        await db.collection('activities').add({
            actorId: eventData.userId,
            actorDisplayName: actorName,
            activityType: 'molting_registered',
            animalId: eventData.animalId,
            animalName: animal.name,
            moltingData: {
                previousStage,
                newStage,
            },
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Send push notifications to followers
        await sendPushToFollowers(db, eventData.userId, {
            title: 'Nowa wylinka!',
            body: `${actorName} zarejestrował(a) wylinkę ${animal.name} (L${previousStage} → L${newStage})`,
            data: {
                type: 'molting',
                animalId: eventData.animalId,
                actorId: eventData.userId,
            },
        });
    });

/**
 * Triggered when an animal document is updated.
 * Detects new photos and creates activity + push notifications.
 */
export const onAnimalPhotosUpdated = functions.firestore
    .document('animals/{animalId}')
    .onUpdate(async (change, context) => {
        const before = change.before.data();
        const after = change.after.data();

        const beforePhotosCount = (before.photos || []).length;
        const afterPhotosCount = (after.photos || []).length;

        // Only trigger if photos were added
        if (afterPhotosCount <= beforePhotosCount) return;

        const db = admin.firestore();

        // Get actor display name
        const actorSnap = await db.doc(`userProfiles/${after.userId}`).get();
        const actorName = actorSnap.data()?.displayName || 'Użytkownik';

        const newPhotosCount = afterPhotosCount - beforePhotosCount;
        const photoUrl = after.mainPhotoUrl || (after.photos || []).slice(-1)[0]?.url || '';

        // Create activity entry
        await db.collection('activities').add({
            actorId: after.userId,
            actorDisplayName: actorName,
            activityType: 'photo_added',
            animalId: context.params.animalId,
            animalName: after.name,
            photoUrl,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Send push notifications to followers
        const photoWord = newPhotosCount === 1 ? 'zdjęcie' : 'zdjęcia';
        await sendPushToFollowers(db, after.userId, {
            title: 'Nowe zdjęcie!',
            body: `${actorName} dodał(a) ${newPhotosCount} ${photoWord} ${after.name}`,
            data: {
                type: 'photo',
                animalId: context.params.animalId,
                actorId: after.userId,
            },
        });
    });
