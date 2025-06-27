import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { User } from "@shared/schema";

interface AuthResponse {
  user: User;
}

export function useAuth() {
  const { data, isLoading, error } = useQuery<AuthResponse>({
    queryKey: ["/api/auth/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    staleTime: 1000 * 30, // 30 seconds - shorter for better responsiveness
    gcTime: 1000 * 60 * 10, // 10 minutes (renamed from cacheTime in v5)
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    refetchOnReconnect: true, // Refetch when network reconnects
  });

  return {
    user: data?.user,
    isLoading,
    isAuthenticated: !!data?.user && data !== null,
    error,
  };
}