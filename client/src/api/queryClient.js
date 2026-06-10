import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 3, // 3 minutes fresh cache window
      gcTime: 1000 * 60 * 15,    // 15 minutes garbage collection window
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default queryClient;
