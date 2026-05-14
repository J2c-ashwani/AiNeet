'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SWRConfig } from 'swr';
import { useState } from 'react';

export default function QueryProvider({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute default stale time
            retry: 1, // retry once on failure
            refetchOnWindowFocus: false, // prevent unnecessary network requests
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SWRConfig
        value={{
          revalidateOnFocus: false,
          errorRetryCount: 3,
        }}
      >
        {children}
      </SWRConfig>
    </QueryClientProvider>
  );
}
