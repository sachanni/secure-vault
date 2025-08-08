import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authService, type User } from "@/lib/authService";

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["auth", "user"],
    queryFn: async (): Promise<User | null> => {
      console.log('useAuth query - checking authentication...');
      const isAuth = authService.isAuthenticated();
      console.log('useAuth query - isAuthenticated result:', isAuth);
      
      if (!isAuth) {
        console.log('useAuth query - not authenticated');
        return null;
      }
      
      console.log('useAuth query - authenticated, getting user...');
      const currentUser = await authService.getCurrentUser();
      console.log('useAuth query - got user:', currentUser);
      return currentUser;
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const login = async (identifier: string, password: string) => {
    const response = await authService.login(identifier, password);
    if (response.success) {
      queryClient.setQueryData(["auth", "user"], response.user);
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    }
    return response;
  };

  const loginWithOTP = async (identifier: string, otp: string) => {
    const response = await authService.loginWithOTP(identifier, otp);
    if (response.success) {
      queryClient.setQueryData(["auth", "user"], response.user);
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    }
    return response;
  };

  const loginWithGoogle = async (userData: { email: string; name: string; providerId?: string }) => {
    const response = await authService.loginWithGoogle(userData);
    if (response.success) {
      queryClient.setQueryData(["auth", "user"], response.user);
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    }
    return response;
  };

  const loginWithApple = async (userData: { email: string; name: string; providerId?: string }) => {
    const response = await authService.loginWithApple(userData);
    if (response.success) {
      queryClient.setQueryData(["auth", "user"], response.user);
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    }
    return response;
  };

  const register = async (step1Data: any, step2Data: { email: string; password: string }) => {
    const response = await authService.register(step1Data, step2Data);
    if (response.success) {
      queryClient.setQueryData(["auth", "user"], response.user);
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    }
    return response;
  };

  const logout = async () => {
    await authService.logout();
    queryClient.setQueryData(["auth", "user"], null);
    queryClient.invalidateQueries({ queryKey: ["auth"] });
    queryClient.clear(); // Clear all cached data
    window.location.href = '/login'; // Force redirect to login page
  };

  const sendOTP = async (identifier: string) => {
    return await authService.sendOTP(identifier);
  };

  const isAuthenticated = !!user && !error;
  
  // Debug authentication state
  console.log('useAuth - Auth state:', { user: !!user, error: !!error, isAuthenticated, isLoading });

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    loginWithOTP,
    loginWithGoogle,
    loginWithApple,
    register,
    logout,
    sendOTP,
    isError: !!error
  };
}
