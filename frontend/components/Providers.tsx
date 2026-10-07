'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

export default function Providers({ children }: { children: React.ReactNode }) {
  // Khởi tạo QueryClient ổn định cho client-side
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60, // 1 phút
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Toast thông báo cấu hình theo tông màu Luxury Editorial */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#1F1B18',
            color: '#FBF9F5',
            borderRadius: '12px',
            fontSize: '13.5px',
            fontWeight: 500,
            border: '1px solid rgba(181, 159, 127, 0.25)',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15)',
            padding: '12px 18px',
          },
          success: {
            iconTheme: {
              primary: '#9A533C',
              secondary: '#FBF9F5',
            },
          },
          error: {
            iconTheme: {
              primary: '#DC2626',
              secondary: '#FFFFFF',
            },
          },
        }}
      />
    </QueryClientProvider>
  );
}
