import { Component, ErrorInfo, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return <ErrorFallback onRetry={this.handleRetry} onGoHome={this.handleGoHome} />;
    }

    return this.props.children;
  }
}

// Functional error fallback component with translations
function ErrorFallback({ onRetry, onGoHome }: { onRetry: () => void; onGoHome: () => void }) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center"
      >
        {/* Error icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.1 }}
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10"
        >
          <AlertTriangle className="h-10 w-10 text-destructive" />
        </motion.div>

        {/* Title */}
        <h1 className="mb-3 text-2xl font-bold text-foreground">
          {t('errors.generic')}
        </h1>

        {/* Description */}
        <p className="mb-8 text-muted-foreground text-lg">
          {t('errors.tryAgain', 'Something unexpected happened. Please try again.')}
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onRetry}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 font-semibold text-primary-foreground min-h-touch-lg"
          >
            <RefreshCw className="h-5 w-5" />
            {t('common.retry')}
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onGoHome}
            className="flex items-center justify-center gap-2 rounded-xl border border-border px-6 py-4 font-semibold text-foreground min-h-touch-lg"
          >
            <Home className="h-5 w-5" />
            {t('common.home')}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

// HOC for wrapping pages with error boundary
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundaryWrapper(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}
