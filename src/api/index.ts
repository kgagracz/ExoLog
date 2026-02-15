// Infrastructure
export { queryClient } from './queryClient';
export { queryKeys } from './queryKeys';
export { unwrapService, unwrapServiceWithMeta } from './serviceAdapter';

// Animals
export {
    useAnimalsQuery,
    useAnimalQuery,
    useAddAnimalMutation,
    useAddSpiderMutation,
    useAddMultipleSpidersMutation,
    useUpdateAnimalMutation,
    useDeleteAnimalMutation,
    useMarkDeceasedMutation,
} from './animals';
export type { SpiderData } from './animals';

// Feeding
export {
    useFeedingHistoryQuery,
    useFeedAnimalMutation,
    useBulkFeedMutation,
    useDeleteFeedingMutation,
} from './feeding';

// Events
export {
    useMoltingHistoryQuery,
    useMatingHistoryQuery,
    useCocoonHistoryQuery,
    useAnimalEventsQuery,
    useLastMoltDatesQuery,
    useMatingStatusesQuery,
    useCocoonStatusesQuery,
    useUpcomingHatchesQuery,
    useAddMoltingMutation,
    useAddMatingMutation,
    useAddCocoonMutation,
    useUpdateCocoonStatusMutation,
    useDeleteMoltingMutation,
} from './events';

// Lookup
export {
    useCategoriesQuery,
    useAnimalTypesQuery,
    useEventTypesQuery,
    useAppDataQueries,
} from './lookup';

// Social
export {
    useUserProfileQuery,
    useUpdateProfileMutation,
    useToggleVisibilityMutation,
    useSearchUsersQuery,
    useIncomingRequestsQuery,
    useOutgoingRequestsQuery,
    useSendRequestMutation,
    useAcceptRequestMutation,
    useRejectRequestMutation,
    useFriendsQuery,
    useRemoveFriendMutation,
    useFriendshipStatusQuery,
    usePublicAnimalsQuery,
} from './social';
