import { ReactNode } from 'react';
import { motion, Variants } from 'framer-motion';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

// Subtle, native-feeling page transitions
const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: {
      duration: 0.15,
      ease: 'easeOut',
    },
  },
};

export function PageTransition({ children, className = '' }: PageTransitionProps) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Stagger children animations for lists
export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
};

// Card hover/tap animations
export const cardInteraction = {
  whileHover: { scale: 1.01 },
  whileTap: { scale: 0.98 },
  transition: { type: 'spring', stiffness: 400, damping: 25 },
};

// Button tap animation
export const buttonTap = {
  whileTap: { scale: 0.95 },
  transition: { type: 'spring', stiffness: 400, damping: 25 },
};
