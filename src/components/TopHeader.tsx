import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { Globe, Check, Sprout, LogOut } from 'lucide-react';
import { supportedLanguages } from '@/i18n';
import { useAuthStore } from '@/stores/auth';
import { isEmbedded } from '@/lib/is-embedded';

export function TopHeader() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { logout: auth0Logout } = useAuth0();
  const { logout: localLogout } = useAuthStore();
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  
  const currentLang = supportedLanguages.find(l => l.code === i18n.language) || supportedLanguages[0];
  
  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
    setShowLangDropdown(false);
  };

  const handleLogout = () => {
    localLogout();

    // Auth0 logout page refuses to load inside iframes (Lovable preview). Open in new tab when embedded.
    if (isEmbedded()) {
      auth0Logout({
        logoutParams: {
          returnTo: window.location.origin,
        },
        openUrl: (url) => {
          window.open(url, '_blank', 'noopener,noreferrer');
        },
      });
      navigate('/login', { replace: true });
      return;
    }

    auth0Logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  };
  
  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-lg border-b border-border safe-top">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <Sprout className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">SWAFarms</span>
        </div>
        
        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowLangDropdown(!showLangDropdown)}
              className="flex h-10 items-center gap-1.5 rounded-xl bg-muted px-3 text-sm font-medium text-foreground"
            >
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span>{currentLang.code.toUpperCase()}</span>
            </motion.button>
            
            <AnimatePresence>
              {showLangDropdown && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-40"
                    onClick={() => setShowLangDropdown(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full z-50 mt-2 w-40 overflow-hidden rounded-xl border border-border bg-card shadow-elevated"
                  >
                    {supportedLanguages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors hover:bg-muted ${
                          currentLang.code === lang.code ? 'bg-primary/5' : ''
                        }`}
                      >
                        <span className="font-medium">{lang.nativeName}</span>
                        {currentLang.code === lang.code && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
          
          {/* Logout Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10"
            aria-label="Logout"
          >
            <LogOut className="h-5 w-5 text-primary" />
          </motion.button>
        </div>
      </div>
    </header>
  );
}
