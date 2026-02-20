import {
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    deleteField,
    query,
    where,
    orderBy,
    limit as firebaseLimit,
    serverTimestamp,
    writeBatch,
    setDoc,
    increment,
} from 'firebase/firestore';
import { db } from './firebase.config';
import type { PublicUserProfile, FriendRequest, Friendship, FriendshipStatus, Follow, ActivityItem } from '../../types/social';
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
            // Check which follow directions already exist
            const [followABSnap, followBASnap] = await Promise.all([
                getDocs(query(
                    collection(db, 'follows'),
                    where('followerId', '==', fromUserId),
                    where('followingId', '==', toUserId),
                )),
                getDocs(query(
                    collection(db, 'follows'),
                    where('followerId', '==', toUserId),
                    where('followingId', '==', fromUserId),
                )),
            ]);

            const alreadyAFollowsB = !followABSnap.empty;
            const alreadyBFollowsA = !followBASnap.empty;

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

            // Auto-follow: fromUser -> toUser
            if (!alreadyAFollowsB) {
                const followABRef = doc(collection(db, 'follows'));
                batch.set(followABRef, {
                    followerId: fromUserId,
                    followingId: toUserId,
                    followerDisplayName: fromDisplayName,
                    followingDisplayName: toDisplayName,
                    createdAt: serverTimestamp(),
                });

                const fromProfileRef = doc(db, 'userProfiles', fromUserId);
                batch.update(fromProfileRef, { 'stats.followingCount': increment(1) });

                const toProfileRef = doc(db, 'userProfiles', toUserId);
                batch.update(toProfileRef, { 'stats.followersCount': increment(1) });
            }

            // Auto-follow: toUser -> fromUser
            if (!alreadyBFollowsA) {
                const followBARef = doc(collection(db, 'follows'));
                batch.set(followBARef, {
                    followerId: toUserId,
                    followingId: fromUserId,
                    followerDisplayName: toDisplayName,
                    followingDisplayName: fromDisplayName,
                    createdAt: serverTimestamp(),
                });

                const toProfileRef2 = doc(db, 'userProfiles', toUserId);
                batch.update(toProfileRef2, { 'stats.followingCount': increment(1) });

                const fromProfileRef2 = doc(db, 'userProfiles', fromUserId);
                batch.update(fromProfileRef2, { 'stats.followersCount': increment(1) });
            }

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

    // ========================
    // Follows
    // ========================

    async followUser(data: {
        followerId: string;
        followingId: string;
        followerDisplayName: string;
        followingDisplayName: string;
    }): Promise<{ success: boolean; error?: string }> {
        try {
            const existingQuery = query(
                collection(db, 'follows'),
                where('followerId', '==', data.followerId),
                where('followingId', '==', data.followingId),
            );
            const existing = await getDocs(existingQuery);
            if (!existing.empty) {
                return { success: false, error: 'Już obserwujesz tego użytkownika' };
            }

            const batch = writeBatch(db);

            const followRef = doc(collection(db, 'follows'));
            batch.set(followRef, {
                followerId: data.followerId,
                followingId: data.followingId,
                followerDisplayName: data.followerDisplayName,
                followingDisplayName: data.followingDisplayName,
                createdAt: serverTimestamp(),
            });

            const followerProfileRef = doc(db, 'userProfiles', data.followerId);
            batch.update(followerProfileRef, { 'stats.followingCount': increment(1) });

            const followingProfileRef = doc(db, 'userProfiles', data.followingId);
            batch.update(followingProfileRef, { 'stats.followersCount': increment(1) });

            await batch.commit();
            return { success: true };
        } catch (error: any) {
            console.error('Error following user:', error);
            return { success: false, error: error.message };
        }
    },

    async unfollowUser(followerId: string, followingId: string): Promise<{ success: boolean; error?: string }> {
        try {
            const q = query(
                collection(db, 'follows'),
                where('followerId', '==', followerId),
                where('followingId', '==', followingId),
            );
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                return { success: false, error: 'Nie obserwujesz tego użytkownika' };
            }

            const batch = writeBatch(db);
            snapshot.docs.forEach((docSnap) => {
                batch.delete(docSnap.ref);
            });

            const followerProfileRef = doc(db, 'userProfiles', followerId);
            batch.update(followerProfileRef, { 'stats.followingCount': increment(-1) });

            const followingProfileRef = doc(db, 'userProfiles', followingId);
            batch.update(followingProfileRef, { 'stats.followersCount': increment(-1) });

            await batch.commit();
            return { success: true };
        } catch (error: any) {
            console.error('Error unfollowing user:', error);
            return { success: false, error: error.message };
        }
    },

    async checkFollowStatus(followerId: string, followingId: string): Promise<{ success: boolean; data?: boolean; error?: string }> {
        try {
            const q = query(
                collection(db, 'follows'),
                where('followerId', '==', followerId),
                where('followingId', '==', followingId),
            );
            const snapshot = await getDocs(q);
            return { success: true, data: !snapshot.empty };
        } catch (error: any) {
            console.error('Error checking follow status:', error);
            return { success: false, error: error.message };
        }
    },

    async getFollowers(userId: string): Promise<{ success: boolean; data?: Follow[]; error?: string }> {
        try {
            const q = query(
                collection(db, 'follows'),
                where('followingId', '==', userId),
                orderBy('createdAt', 'desc'),
            );
            const snapshot = await getDocs(q);
            const followers: Follow[] = snapshot.docs.map((docSnap) => {
                const data = docSnap.data();
                return {
                    id: docSnap.id,
                    ...data,
                    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
                } as Follow;
            });
            return { success: true, data: followers };
        } catch (error: any) {
            console.error('Error getting followers:', error);
            return { success: false, error: error.message };
        }
    },

    async getFollowing(userId: string): Promise<{ success: boolean; data?: Follow[]; error?: string }> {
        try {
            const q = query(
                collection(db, 'follows'),
                where('followerId', '==', userId),
                orderBy('createdAt', 'desc'),
            );
            const snapshot = await getDocs(q);
            const following: Follow[] = snapshot.docs.map((docSnap) => {
                const data = docSnap.data();
                return {
                    id: docSnap.id,
                    ...data,
                    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
                } as Follow;
            });
            return { success: true, data: following };
        } catch (error: any) {
            console.error('Error getting following:', error);
            return { success: false, error: error.message };
        }
    },

    async getActivityFeed(followedUserIds: string[], limitCount: number = 20): Promise<{ success: boolean; data?: ActivityItem[]; error?: string }> {
        try {
            if (followedUserIds.length === 0) {
                return { success: true, data: [] };
            }

            const allActivities: ActivityItem[] = [];

            // Firestore 'in' queries are limited to 30 values
            for (let i = 0; i < followedUserIds.length; i += 30) {
                const chunk = followedUserIds.slice(i, i + 30);
                const q = query(
                    collection(db, 'activities'),
                    where('actorId', 'in', chunk),
                    orderBy('createdAt', 'desc'),
                    firebaseLimit(limitCount),
                );
                const snapshot = await getDocs(q);
                snapshot.docs.forEach((docSnap) => {
                    const data = docSnap.data();
                    allActivities.push({
                        id: docSnap.id,
                        ...data,
                        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
                    } as ActivityItem);
                });
            }

            allActivities.sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
            );

            return { success: true, data: allActivities.slice(0, limitCount) };
        } catch (error: any) {
            console.error('Error getting activity feed:', error);
            return { success: false, error: error.message };
        }
    },

    // ========================
    // Push Token
    // ========================

    async savePushToken(userId: string, token: string): Promise<{ success: boolean; error?: string }> {
        try {
            const profileRef = doc(db, 'userProfiles', userId);
            await updateDoc(profileRef, {
                expoPushToken: token,
                updatedAt: serverTimestamp(),
            });
            return { success: true };
        } catch (error: any) {
            console.error('Error saving push token:', error);
            return { success: false, error: error.message };
        }
    },

    async removePushToken(userId: string): Promise<{ success: boolean; error?: string }> {
        try {
            const profileRef = doc(db, 'userProfiles', userId);
            await updateDoc(profileRef, {
                expoPushToken: deleteField(),
                updatedAt: serverTimestamp(),
            });
            return { success: true };
        } catch (error: any) {
            console.error('Error removing push token:', error);
            return { success: false, error: error.message };
        }
    },
};
