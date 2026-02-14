import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 2 * 60 * 1000,      // 2 minuty
            gcTime: 10 * 60 * 1000,         // 10 minut
            refetchOnMount: false,
            retry: 2,
        },
        mutations: {
            retry: false,
        },
    },
});
