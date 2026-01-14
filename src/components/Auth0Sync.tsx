import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useAuthStore } from '@/stores/auth';

/**
 * Keeps the local auth store in sync with Auth0 session state.
 * This ensures we always have a fresh access token after redirects / refresh.
 */
export function Auth0Sync() {
  const { isAuthenticated, isLoading, user, getAccessTokenSilently } = useAuth0();
  const { setUser, logout } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;

    // If Auth0 says we're logged out, clear local auth state.
    if (!isAuthenticated) {
      logout();
      return;
    }

    if (!user) return;

    let cancelled = false;

    (async () => {
      try {
        const token = await getAccessTokenSilently();
        if (cancelled) return;

        setUser(
          {
            id: user.sub || '',
            phone: (user as any).phone_number || '',
            name: user.name || (user as any).nickname || 'Farmer',
          },
          token
        );
      } catch {
        // Avoid noisy logs in production; failures here usually mean silent token fetch is blocked.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [getAccessTokenSilently, isAuthenticated, isLoading, logout, setUser, user]);

  return null;
}
