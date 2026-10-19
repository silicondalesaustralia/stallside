import { useEffect, useState, type ReactNode } from "react";
import { AppState, Platform } from "react-native";
import { QueryCache, QueryClient, QueryClientProvider, focusManager } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/auth/useAuth";

export default function QueryProvider({ children }: { children: ReactNode }) {
  const { state, signOut } = useAuth();
  const [client] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error) => {
            if (error instanceof ApiError && error.status === 401) void signOut();
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 15_000,
            retry: (count, error) => !(error instanceof ApiError && error.status < 500) && count < 2,
          },
        },
      }),
  );

  // Refetch when the app comes back to the foreground, so changes made on the website show up.
  useEffect(() => {
    if (Platform.OS === "web") return;
    const sub = AppState.addEventListener("change", (status) => {
      focusManager.setFocused(status === "active");
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (state.status === "signedOut") client.clear();
  }, [state.status, client]);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
