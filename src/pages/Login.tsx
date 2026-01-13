import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Phone, ArrowRight, Loader2, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/auth';
import api from '@/services/api';

type AuthStep = 'phone' | 'otp';

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const setUser = useAuthStore((s) => s.setUser);

  const [step, setStep] = useState<AuthStep>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOTP = async () => {
    if (phone.length < 10) {
      toast({
        title: t('auth.invalidPhone'),
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Mock Auth0 phone OTP request
      // In real app: await auth0.passwordless.start({ phoneNumber: phone })
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      setStep('otp');
      toast({
        title: t('auth.otpSent'),
        description: t('auth.otpSentDesc'),
      });
    } catch {
      toast({
        title: t('errors.generic'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast({
        title: t('auth.invalidOtp'),
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Mock Auth0 OTP verification
      // In real app: await auth0.passwordless.verify({ phoneNumber, otp })
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock successful login
      const mockUser = {
        id: `user_${Date.now()}`,
        phone: phone,
        name: 'Farmer',
      };
      const mockToken = `mock_token_${Date.now()}`;

      // Set token in API instance
      api.defaults.headers.common['Authorization'] = `Bearer ${mockToken}`;

      // Update auth store
      setUser(mockUser, mockToken);

      toast({
        title: t('auth.loginSuccess'),
      });

      navigate('/');
    } catch {
      toast({
        title: t('auth.invalidOtp'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    toast({
      title: t('auth.otpResent'),
    });
  };

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
          key={step}
          initial={{ opacity: 0, x: step === 'phone' ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {step === 'phone' ? (
            <>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {t('auth.welcomeBack')}
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                {t('auth.enterPhone')}
              </p>

              <div className="space-y-6">
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder={t('auth.phonePlaceholder')}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="h-14 pl-12 text-lg"
                    maxLength={10}
                  />
                </div>

                <Button
                  onClick={handleSendOTP}
                  disabled={isLoading || phone.length < 10}
                  className="w-full h-14 text-lg bg-primary hover:bg-primary/90"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      {t('auth.sendOtp')}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {t('auth.verifyOtp')}
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                {t('auth.otpSentTo', { phone: `+91 ${phone}` })}
              </p>

              <div className="space-y-6">
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={setOtp}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} className="w-12 h-14 text-xl" />
                      <InputOTPSlot index={1} className="w-12 h-14 text-xl" />
                      <InputOTPSlot index={2} className="w-12 h-14 text-xl" />
                      <InputOTPSlot index={3} className="w-12 h-14 text-xl" />
                      <InputOTPSlot index={4} className="w-12 h-14 text-xl" />
                      <InputOTPSlot index={5} className="w-12 h-14 text-xl" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <Button
                  onClick={handleVerifyOTP}
                  disabled={isLoading || otp.length !== 6}
                  className="w-full h-14 text-lg bg-primary hover:bg-primary/90"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      {t('auth.verify')}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setStep('phone')}
                    className="text-muted-foreground font-medium"
                  >
                    {t('auth.changeNumber')}
                  </button>
                  <button
                    onClick={handleResendOTP}
                    disabled={isLoading}
                    className="text-primary font-medium"
                  >
                    {t('auth.resendOtp')}
                  </button>
                </div>
              </div>
            </>
          )}
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
