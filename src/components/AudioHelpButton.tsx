import { Volume2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface AudioHelpButtonProps {
  audioKey?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function AudioHelpButton({ size = 'md', className = '' }: AudioHelpButtonProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };
  
  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };
  
  const handlePlay = () => {
    // Mock audio playback - in real app would use text-to-speech
    console.log('Playing audio help...');
  };
  
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={handlePlay}
      className={`
        inline-flex items-center justify-center rounded-full 
        bg-primary/10 text-primary
        hover:bg-primary/20 active:bg-primary/30
        transition-colors ${sizeClasses[size]} ${className}
      `}
      aria-label="Listen to audio help"
    >
      <Volume2 className={iconSizes[size]} />
    </motion.button>
  );
}
