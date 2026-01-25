"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
    // QueryClient は一度だけ生成されるように useState で保持する
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                // オフライン PWA を意識し、リマウント時の再フェッチなどを抑制する設定も可能
                staleTime: 60 * 1000,
            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
