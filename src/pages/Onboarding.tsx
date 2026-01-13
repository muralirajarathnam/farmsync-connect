import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Bell, Camera, ChevronRight, ChevronLeft, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth';

const OnboardingScreen = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: MapPin,
      titleKey: 'onboarding.step1Title',
      descKey: 'onboarding.step1Desc',
      color: 'bg-primary',
      bgGradient: 'from-primary/20 to-primary/5',
    },
    {
      icon: Bell,
      titleKey: 'onboarding.step2Title',
      descKey: 'onboarding.step2Desc',
      color: 'bg-accent',
      bgGradient: 'from-accent/20 to-accent/5',
    },
    {
      icon: Camera,
      titleKey: 'onboarding.step3Title',
      descKey: 'onboarding.step3Desc',
      color: 'bg-info',
      bgGradient: 'from-info/20 to-info/5',
    },
  ];

  const currentStepData = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
      navigate('/login');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    completeOnboarding();
    navigate('/login');
  };

  const handlePlayAudio = () => {
    // Mock audio playback - would use text-to-speech in real app
    console.log('Playing audio help for:', currentStepData.titleKey);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col safe-top safe-bottom">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <button
          onClick={handleSkip}
          className="text-muted-foreground text-sm font-medium px-3 py-2"
        >
          {t('onboarding.skip')}
        </button>
        <div className="flex gap-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentStep
                  ? 'w-8 bg-primary'
                  : index < currentStep
                  ? 'w-2 bg-primary/50'
                  : 'w-2 bg-muted'
              }`}
            />
          ))}
        </div>
        <div className="w-12" /> {/* Spacer for alignment */}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center"
          >
            {/* Icon container */}
            <div
              className={`w-40 h-40 rounded-full bg-gradient-to-br ${currentStepData.bgGradient} flex items-center justify-center mb-8`}
            >
              <div className={`w-24 h-24 rounded-full ${currentStepData.color} flex items-center justify-center shadow-lg`}>
                <currentStepData.icon className="w-12 h-12 text-white" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-foreground mb-4">
              {t(currentStepData.titleKey)}
            </h1>

            {/* Description */}
            <p className="text-lg text-muted-foreground leading-relaxed max-w-xs">
              {t(currentStepData.descKey)}
            </p>

            {/* Audio help button */}
            <button
              onClick={handlePlayAudio}
              className="mt-6 flex items-center gap-2 text-primary font-medium px-4 py-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
            >
              <Volume2 className="w-5 h-5" />
              <span>{t('onboarding.playAudio')}</span>
            </button>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-6 flex gap-4">
        {currentStep > 0 && (
          <Button
            variant="outline"
            size="lg"
            onClick={handleBack}
            className="flex-1 h-14 text-lg"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            {t('onboarding.back')}
          </Button>
        )}
        <Button
          size="lg"
          onClick={handleNext}
          className="flex-1 h-14 text-lg bg-primary hover:bg-primary/90"
        >
          {currentStep === steps.length - 1
            ? t('onboarding.getStarted')
            : t('onboarding.next')}
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default OnboardingScreen;
