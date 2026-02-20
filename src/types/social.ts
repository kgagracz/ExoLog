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
        followersCount?: number;
        followingCount?: number;
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

// ========================
// Follows
// ========================

export interface Follow {
    id: string;
    followerId: string;
    followingId: string;
    followerDisplayName: string;
    followingDisplayName: string;
    createdAt: string;
}

// ========================
// Activity Feed
// ========================

export type ActivityType = 'photo_added' | 'molting_registered';

export interface ActivityItem {
    id: string;
    actorId: string;
    actorDisplayName: string;
    activityType: ActivityType;
    animalId: string;
    animalName: string;
    photoUrl?: string;
    moltingData?: {
        previousStage: number;
        newStage: number;
    };
    createdAt: string;
}
