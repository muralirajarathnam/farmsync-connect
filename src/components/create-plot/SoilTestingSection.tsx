import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlaskConical, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export interface SoilTestingData {
  ph?: number;
  ec?: number;
  oc?: number;
  n?: number;
  p?: number;
  k?: number;
  s?: number;
  zn?: number;
  fe?: number;
  cu?: number;
  mn?: number;
  b?: number;
}

interface SoilTestingSectionProps {
  values: SoilTestingData;
  onChange: (values: SoilTestingData) => void;
}

interface ParameterField {
  key: keyof SoilTestingData;
  labelKey: string;
  unit: string;
  step: number;
}

const MAIN_PARAMETERS: ParameterField[] = [
  { key: 'ph', labelKey: 'soilTesting.ph', unit: '', step: 0.1 },
  { key: 'ec', labelKey: 'soilTesting.ec', unit: 'dS/m', step: 0.01 },
  { key: 'oc', labelKey: 'soilTesting.oc', unit: '%', step: 0.01 },
  { key: 'n', labelKey: 'soilTesting.nitrogen', unit: 'kg/ha', step: 1 },
  { key: 'p', labelKey: 'soilTesting.phosphorus', unit: 'kg/ha', step: 1 },
  { key: 'k', labelKey: 'soilTesting.potassium', unit: 'kg/ha', step: 1 },
  { key: 's', labelKey: 'soilTesting.sulphur', unit: 'kg/ha', step: 1 },
];

const MICRONUTRIENTS: ParameterField[] = [
  { key: 'zn', labelKey: 'soilTesting.zinc', unit: 'mg/kg', step: 0.01 },
  { key: 'fe', labelKey: 'soilTesting.iron', unit: 'mg/kg', step: 0.1 },
  { key: 'cu', labelKey: 'soilTesting.copper', unit: 'mg/kg', step: 0.01 },
  { key: 'mn', labelKey: 'soilTesting.manganese', unit: 'mg/kg', step: 0.1 },
  { key: 'b', labelKey: 'soilTesting.boron', unit: 'mg/kg', step: 0.01 },
];

export function SoilTestingSection({ values, onChange }: SoilTestingSectionProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (key: keyof SoilTestingData, value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    onChange({ ...values, [key]: numValue });
  };

  const renderParameterInput = (param: ParameterField) => (
    <div key={param.key} className="flex items-center justify-between gap-3 py-2">
      <label className="text-sm font-medium text-foreground flex-shrink-0">
        {t(param.labelKey)}
      </label>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          step={param.step}
          value={values[param.key] ?? ''}
          onChange={(e) => handleChange(param.key, e.target.value)}
          placeholder={t('soilTesting.enterValue')}
          className="w-24 h-9 text-right text-sm"
        />
        {param.unit && (
          <span className="text-xs text-muted-foreground w-12 flex-shrink-0">
            {param.unit}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <Card className="p-4">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
            <FlaskConical className="h-5 w-5 text-purple-700" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold">{t('soilTesting.title')}</h3>
            <p className="text-sm text-muted-foreground">{t('common.optional')}</p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="pt-4">
              {/* Main Parameters */}
              <div className="space-y-1 divide-y divide-border">
                {MAIN_PARAMETERS.map(renderParameterInput)}
              </div>

              {/* Micronutrients Group */}
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm font-medium text-muted-foreground mb-3">
                  {t('soilTesting.micronutrients')}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {MICRONUTRIENTS.map((param) => (
                    <div key={param.key} className="space-y-1">
                      <label className="text-xs font-medium text-foreground">
                        {t(param.labelKey)}
                      </label>
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          step={param.step}
                          value={values[param.key] ?? ''}
                          onChange={(e) => handleChange(param.key, e.target.value)}
                          placeholder="—"
                          className="h-8 text-sm text-right"
                        />
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {param.unit}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
