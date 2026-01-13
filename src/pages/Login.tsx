import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Loader2, Leaf, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth0 } from '@auth0/auth0-react';
import { useAuthStore } from '@/stores/auth';

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { loginWithRedirect, isAuthenticated, isLoading, user, getAccessTokenSilently } = useAuth0();
  const { setUser, hasCompletedOnboarding } = useAuthStore();

  // Sync Auth0 state with local auth store
  useEffect(() => {
    const syncAuth = async () => {
      if (isAuthenticated && user) {
        try {
          const token = await getAccessTokenSilently();
          setUser(
            {
              id: user.sub || '',
              phone: user.phone_number || '',
              name: user.name || user.nickname || 'Farmer',
            },
            token
          );
          
          // Navigate to appropriate page
          if (hasCompletedOnboarding) {
            navigate('/');
          } else {
            navigate('/onboarding');
          }
        } catch (error) {
          console.error('Error getting token:', error);
        }
      }
    };

    syncAuth();
  }, [isAuthenticated, user, getAccessTokenSilently, setUser, navigate, hasCompletedOnboarding]);

  const handleLogin = () => {
    loginWithRedirect();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col safe-top safe-bottom">
      {/* Header */}
      <div className="p-6 pt-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-2"
        >
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <Leaf className="w-7 h-7 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold text-foreground">
            {t('app.name')}
          </span>
        </motion.div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center px-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t('auth.welcomeBack')}
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            {t('auth.loginDescription', 'Sign in to access your farm dashboard')}
          </p>

          <div className="space-y-6">
            <Button
              onClick={handleLogin}
              className="w-full h-14 text-lg bg-primary hover:bg-primary/90"
            >
              <LogIn className="w-5 h-5 mr-2" />
              {t('auth.signIn', 'Sign In')}
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="p-6 text-center">
        <p className="text-sm text-muted-foreground">
          {t('auth.termsNotice')}
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
