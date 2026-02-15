export interface PublicUserProfile {
    uid: string;
    displayName: string;
    displayNameLower: string;
    email: string;
    photoURL?: string;
    bio?: string;
    isPublic: boolean;
    stats: {
        totalAnimals: number;
        joinDate: string;
    };
    createdAt: string;
    updatedAt: string;
}

export type FriendRequestStatus = 'pending' | 'accepted' | 'rejected';

export interface FriendRequest {
    id: string;
    fromUserId: string;
    toUserId: string;
    status: FriendRequestStatus;
    fromDisplayName: string;
    toDisplayName: string;
    createdAt: string;
    updatedAt: string;
}

export interface Friendship {
    id: string;
    userIds: [string, string];
    users: Record<string, { displayName: string; photoURL?: string }>;
    createdAt: string;
}

export type FriendshipStatus = 'none' | 'pending_sent' | 'pending_received' | 'friends';
