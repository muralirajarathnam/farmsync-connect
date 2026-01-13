import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { MapPin, Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const { t } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.1 }}
          className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted"
        >
          <MapPin className="h-12 w-12 text-muted-foreground" />
        </motion.div>

        {/* 404 number */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-2 text-7xl font-bold text-primary"
        >
          404
        </motion.h1>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-3 text-2xl font-bold text-foreground"
        >
          {t('errors.pageNotFound', 'Page Not Found')}
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-8 text-lg text-muted-foreground"
        >
          {t('errors.pageNotFoundDesc', "The page you're looking for doesn't exist or has been moved.")}
        </motion.p>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col gap-3 sm:flex-row sm:justify-center"
        >
          <Link
            to="/"
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 font-semibold text-primary-foreground min-h-touch-lg"
          >
            <Home className="h-5 w-5" />
            {t('common.home')}
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 rounded-xl border border-border px-6 py-4 font-semibold text-foreground min-h-touch-lg"
          >
            <ArrowLeft className="h-5 w-5" />
            {t('common.goBack', 'Go Back')}
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;
