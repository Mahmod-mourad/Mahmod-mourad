import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { useAuthStore } from '../../../app/store';

export function useAuth() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  const meQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        const data = await api.auth.me();
        setUser(data);
        return data;
      } catch (err) {
        setUser(null);
        throw err;
      }
    },
    retry: false,
    // Resolve the session once and cache it. Without this the query refetched on
    // every observer mount/re-render and hammered /auth/me in a tight loop while
    // the app sat on "Loading". Login/logout update this query's data directly.
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const loginMutation = useMutation({
    mutationFn: api.auth.login,
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.setQueryData(['auth', 'me'], data.user);
    },
  });

  const registerMutation = useMutation({
    mutationFn: api.auth.register,
    onSuccess: () => {
      // After register we typically require login, but assuming it logs in:
      // setUser(data.user);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: api.auth.logout,
    onSuccess: () => {
      setUser(null);
      queryClient.setQueryData(['auth', 'me'], null);
    },
  });

  return {
    me: meQuery,
    login: loginMutation,
    register: registerMutation,
    logout: logoutMutation,
  };
}
