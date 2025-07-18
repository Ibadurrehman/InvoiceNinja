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
    staleTime: 1000 * 30, // 30 seconds
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  return {
    user: data?.user,
    isLoading,
    isAuthenticated: !!data?.user && data !== null,
    error,
  };
}