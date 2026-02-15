import {
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit as firebaseLimit,
    serverTimestamp,
    writeBatch,
    setDoc,
} from 'firebase/firestore';
import { db } from './firebase.config';
import type { PublicUserProfile, FriendRequest, Friendship, FriendshipStatus } from '../../types/social';
import type { Animal } from '../../types';

export const socialService = {
    // ========================
    // Profile
    // ========================

    async createOrUpdateProfile(data: {
        uid: string;
        displayName: string;
        email: string;
        photoURL?: string;
        bio?: string;
        isPublic?: boolean;
        totalAnimals?: number;
    }): Promise<{ success: boolean; error?: string }> {
        try {
            const profileRef = doc(db, 'userProfiles', data.uid);
            const existing = await getDoc(profileRef);

            if (existing.exists()) {
                await updateDoc(profileRef, {
                    displayName: data.displayName,
                    displayNameLower: data.displayName.toLowerCase(),
                    email: data.email,
                    ...(data.photoURL !== undefined && { photoURL: data.photoURL }),
                    ...(data.bio !== undefined && { bio: data.bio }),
                    ...(data.isPublic !== undefined && { isPublic: data.isPublic }),
                    ...(data.totalAnimals !== undefined && { 'stats.totalAnimals': data.totalAnimals }),
                    updatedAt: serverTimestamp(),
                });
            } else {
                await setDoc(profileRef, {
                    uid: data.uid,
                    displayName: data.displayName,
                    displayNameLower: data.displayName.toLowerCase(),
                    email: data.email,
                    photoURL: data.photoURL || null,
                    bio: data.bio || '',
                    isPublic: data.isPublic ?? true,
                    stats: {
                        totalAnimals: data.totalAnimals ?? 0,
                        joinDate: new Date().toISOString(),
                    },
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                });
            }

            return { success: true };
        } catch (error: any) {
            console.error('Error creating/updating profile:', error);
            return { success: false, error: error.message };
        }
    },

    async getUserProfile(userId: string): Promise<{ success: boolean; data?: PublicUserProfile; error?: string }> {
        try {
            const profileRef = doc(db, 'userProfiles', userId);
            const snapshot = await getDoc(profileRef);

            if (!snapshot.exists()) {
                return { success: true, data: undefined };
            }

            const data = snapshot.data();
            return {
                success: true,
                data: {
                    ...data,
                    uid: snapshot.id,
                    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
                    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
                } as PublicUserProfile,
            };
        } catch (error: any) {
            console.error('Error getting user profile:', error);
            return { success: false, error: error.message };
        }
    },

    async updateProfileVisibility(userId: string, isPublic: boolean): Promise<{ success: boolean; error?: string }> {
        try {
            const profileRef = doc(db, 'userProfiles', userId);
            await updateDoc(profileRef, {
                isPublic,
                updatedAt: serverTimestamp(),
            });
            return { success: true };
        } catch (error: any) {
            console.error('Error updating profile visibility:', error);
            return { success: false, error: error.message };
        }
    },

    async searchUsers(term: string, currentUserId: string): Promise<{ success: boolean; data?: PublicUserProfile[]; error?: string }> {
        try {
            const lowerTerm = term.toLowerCase();
            const q = query(
                collection(db, 'userProfiles'),
                where('displayNameLower', '>=', lowerTerm),
                where('displayNameLower', '<=', lowerTerm + '\uf8ff'),
                where('isPublic', '==', true),
                firebaseLimit(20),
            );

            const snapshot = await getDocs(q);
            const profiles: PublicUserProfile[] = [];

            snapshot.forEach((docSnap) => {
                if (docSnap.id !== currentUserId) {
                    const data = docSnap.data();
                    profiles.push({
                        ...data,
                        uid: docSnap.id,
                        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
                        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
                    } as PublicUserProfile);
                }
            });

            return { success: true, data: profiles };
        } catch (error: any) {
            console.error('Error searching users:', error);
            return { success: false, error: error.message };
        }
    },

    // ========================
    // Friend Requests
    // ========================

    async sendFriendRequest(data: {
        fromUserId: string;
        toUserId: string;
        fromDisplayName: string;
        toDisplayName: string;
    }): Promise<{ success: boolean; id?: string; error?: string }> {
        try {
            // Check if a request already exists
            const existingQuery = query(
                collection(db, 'friendRequests'),
                where('fromUserId', '==', data.fromUserId),
                where('toUserId', '==', data.toUserId),
                where('status', '==', 'pending'),
            );
            const existing = await getDocs(existingQuery);
            if (!existing.empty) {
                return { success: false, error: 'Zaproszenie zostało już wysłane' };
            }

            // Check reverse direction too
            const reverseQuery = query(
                collection(db, 'friendRequests'),
                where('fromUserId', '==', data.toUserId),
                where('toUserId', '==', data.fromUserId),
                where('status', '==', 'pending'),
            );
            const reverse = await getDocs(reverseQuery);
            if (!reverse.empty) {
                return { success: false, error: 'Ten użytkownik już wysłał Ci zaproszenie' };
            }

            // Check if already friends
            const friendshipStatus = await socialService.checkFriendshipStatus(data.fromUserId, data.toUserId);
            if (friendshipStatus.data === 'friends') {
                return { success: false, error: 'Jesteście już znajomymi' };
            }

            const docRef = await addDoc(collection(db, 'friendRequests'), {
                fromUserId: data.fromUserId,
                toUserId: data.toUserId,
                status: 'pending',
                fromDisplayName: data.fromDisplayName,
                toDisplayName: data.toDisplayName,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            return { success: true, id: docRef.id };
        } catch (error: any) {
            console.error('Error sending friend request:', error);
            return { success: false, error: error.message };
        }
    },

    async getIncomingRequests(userId: string): Promise<{ success: boolean; data?: FriendRequest[]; error?: string }> {
        try {
            const q = query(
                collection(db, 'friendRequests'),
                where('toUserId', '==', userId),
                where('status', '==', 'pending'),
                orderBy('createdAt', 'desc'),
            );

            const snapshot = await getDocs(q);
            const requests: FriendRequest[] = snapshot.docs.map((docSnap) => {
                const data = docSnap.data();
                return {
                    id: docSnap.id,
                    ...data,
                    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
                    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
                } as FriendRequest;
            });

            return { success: true, data: requests };
        } catch (error: any) {
            console.error('Error getting incoming requests:', error);
            return { success: false, error: error.message };
        }
    },

    async getOutgoingRequests(userId: string): Promise<{ success: boolean; data?: FriendRequest[]; error?: string }> {
        try {
            const q = query(
                collection(db, 'friendRequests'),
                where('fromUserId', '==', userId),
                where('status', '==', 'pending'),
                orderBy('createdAt', 'desc'),
            );

            const snapshot = await getDocs(q);
            const requests: FriendRequest[] = snapshot.docs.map((docSnap) => {
                const data = docSnap.data();
                return {
                    id: docSnap.id,
                    ...data,
                    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
                    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
                } as FriendRequest;
            });

            return { success: true, data: requests };
        } catch (error: any) {
            console.error('Error getting outgoing requests:', error);
            return { success: false, error: error.message };
        }
    },

    async acceptFriendRequest(requestId: string, fromUserId: string, toUserId: string, fromDisplayName: string, toDisplayName: string): Promise<{ success: boolean; error?: string }> {
        try {
            const batch = writeBatch(db);

            // Update request status
            const requestRef = doc(db, 'friendRequests', requestId);
            batch.update(requestRef, {
                status: 'accepted',
                updatedAt: serverTimestamp(),
            });

            // Create friendship
            const sortedIds = [fromUserId, toUserId].sort() as [string, string];
            const friendshipRef = doc(collection(db, 'friendships'));
            batch.set(friendshipRef, {
                userIds: sortedIds,
                users: {
                    [fromUserId]: { displayName: fromDisplayName },
                    [toUserId]: { displayName: toDisplayName },
                },
                createdAt: serverTimestamp(),
            });

            await batch.commit();
            return { success: true };
        } catch (error: any) {
            console.error('Error accepting friend request:', error);
            return { success: false, error: error.message };
        }
    },

    async rejectFriendRequest(requestId: string): Promise<{ success: boolean; error?: string }> {
        try {
            const requestRef = doc(db, 'friendRequests', requestId);
            await updateDoc(requestRef, {
                status: 'rejected',
                updatedAt: serverTimestamp(),
            });
            return { success: true };
        } catch (error: any) {
            console.error('Error rejecting friend request:', error);
            return { success: false, error: error.message };
        }
    },

    // ========================
    // Friends
    // ========================

    async getFriends(userId: string): Promise<{ success: boolean; data?: Friendship[]; error?: string }> {
        try {
            const q = query(
                collection(db, 'friendships'),
                where('userIds', 'array-contains', userId),
            );

            const snapshot = await getDocs(q);
            const friendships: Friendship[] = snapshot.docs.map((docSnap) => {
                const data = docSnap.data();
                return {
                    id: docSnap.id,
                    ...data,
                    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
                } as Friendship;
            });

            return { success: true, data: friendships };
        } catch (error: any) {
            console.error('Error getting friends:', error);
            return { success: false, error: error.message };
        }
    },

    async removeFriend(friendshipId: string): Promise<{ success: boolean; error?: string }> {
        try {
            await deleteDoc(doc(db, 'friendships', friendshipId));
            return { success: true };
        } catch (error: any) {
            console.error('Error removing friend:', error);
            return { success: false, error: error.message };
        }
    },

    async checkFriendshipStatus(userId: string, otherUserId: string): Promise<{ success: boolean; data?: FriendshipStatus; error?: string }> {
        try {
            // Check friendship
            const friendsQuery = query(
                collection(db, 'friendships'),
                where('userIds', 'array-contains', userId),
            );
            const friendsSnapshot = await getDocs(friendsQuery);
            const isFriend = friendsSnapshot.docs.some((docSnap) => {
                const data = docSnap.data();
                return data.userIds.includes(otherUserId);
            });

            if (isFriend) {
                return { success: true, data: 'friends' };
            }

            // Check pending request sent by current user
            const sentQuery = query(
                collection(db, 'friendRequests'),
                where('fromUserId', '==', userId),
                where('toUserId', '==', otherUserId),
                where('status', '==', 'pending'),
            );
            const sentSnapshot = await getDocs(sentQuery);
            if (!sentSnapshot.empty) {
                return { success: true, data: 'pending_sent' };
            }

            // Check pending request received from other user
            const receivedQuery = query(
                collection(db, 'friendRequests'),
                where('fromUserId', '==', otherUserId),
                where('toUserId', '==', userId),
                where('status', '==', 'pending'),
            );
            const receivedSnapshot = await getDocs(receivedQuery);
            if (!receivedSnapshot.empty) {
                return { success: true, data: 'pending_received' };
            }

            return { success: true, data: 'none' };
        } catch (error: any) {
            console.error('Error checking friendship status:', error);
            return { success: false, error: error.message };
        }
    },

    // ========================
    // Public Animals
    // ========================

    async getPublicAnimals(userId: string): Promise<{ success: boolean; data?: Animal[]; error?: string }> {
        try {
            const q = query(
                collection(db, 'animals'),
                where('userId', '==', userId),
                where('isActive', '==', true),
            );

            const snapshot = await getDocs(q);
            const animals: Animal[] = snapshot.docs.map((docSnap) => {
                const data = docSnap.data();
                return {
                    id: docSnap.id,
                    ...data,
                    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
                    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
                } as Animal;
            });

            return { success: true, data: animals };
        } catch (error: any) {
            console.error('Error getting public animals:', error);
            return { success: false, error: error.message };
        }
    },
};
