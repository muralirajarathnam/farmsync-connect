import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  Sprout, 
  ClipboardList, 
  Camera, 
  Settings 
} from 'lucide-react';

const navItems = [
  { path: '/', icon: Sprout, labelKey: 'nav.plots' },
  { path: '/tasks', icon: ClipboardList, labelKey: 'nav.tasks' },
  { path: '/diagnosis', icon: Camera, labelKey: 'nav.diagnosis' },
  { path: '/settings', icon: Settings, labelKey: 'nav.settings' },
];

export function BottomNavigation() {
  const { t } = useTranslation();
  const location = useLocation();
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg safe-bottom">
      <div className="mx-auto flex max-w-lg items-center justify-around">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/' && location.pathname.startsWith(item.path));
          const Icon = item.icon;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="relative flex flex-1 flex-col items-center justify-center gap-1 py-3 transition-colors"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-x-2 top-0 h-0.5 rounded-full bg-primary"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon 
                className={`h-6 w-6 transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`} 
              />
              <span 
                className={`text-xs font-medium transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {t(item.labelKey)}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
