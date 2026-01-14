import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  Ruler, 
  Mountain, 
  Droplets, 
  Minus, 
  Plus,
  Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { SoilTestingSection, SoilTestingData } from './SoilTestingSection';
import { EquipmentSection, EquipmentItem } from './EquipmentSection';
import { OrganicInputsSection, OrganicInputItem } from './OrganicInputsSection';

interface DetailsStepProps {
  initialData: {
    name: string;
    area?: number;
    areaUnit: 'hectares' | 'acres';
    soilType?: 'sandy' | 'clay' | 'loam' | 'silt';
    irrigationType?: 'drip' | 'sprinkler' | 'flood' | 'rainfed';
    soilTesting?: SoilTestingData;
    equipment?: EquipmentItem[];
    organicInputs?: OrganicInputItem[];
  };
  onComplete: (details: {
    name: string;
    area: number;
    areaUnit: 'hectares' | 'acres';
    soilType?: 'sandy' | 'clay' | 'loam' | 'silt';
    irrigationType?: 'drip' | 'sprinkler' | 'flood' | 'rainfed';
    soilTesting?: SoilTestingData;
    equipment?: EquipmentItem[];
    organicInputs?: OrganicInputItem[];
  }) => void;
  isLoading: boolean;
}

const SOIL_TYPES = [
  { id: 'sandy', icon: '🏜️', color: 'bg-amber-100 border-amber-300' },
  { id: 'clay', icon: '🧱', color: 'bg-orange-100 border-orange-300' },
  { id: 'loam', icon: '🌱', color: 'bg-emerald-100 border-emerald-300' },
  { id: 'silt', icon: '💧', color: 'bg-blue-100 border-blue-300' },
] as const;

const IRRIGATION_TYPES = [
  { id: 'drip', icon: '💧', color: 'bg-cyan-100 border-cyan-300' },
  { id: 'sprinkler', icon: '🌧️', color: 'bg-sky-100 border-sky-300' },
  { id: 'flood', icon: '🌊', color: 'bg-blue-100 border-blue-300' },
  { id: 'rainfed', icon: '☁️', color: 'bg-slate-100 border-slate-300' },
] as const;

export function DetailsStep({ initialData, onComplete, isLoading }: DetailsStepProps) {
  const { t } = useTranslation();
  const [name, setName] = useState(initialData.name || '');
  const [area, setArea] = useState(initialData.area || 1);
  const [areaUnit, setAreaUnit] = useState<'hectares' | 'acres'>(initialData.areaUnit);
  const [soilType, setSoilType] = useState<'sandy' | 'clay' | 'loam' | 'silt' | undefined>(initialData.soilType);
  const [irrigationType, setIrrigationType] = useState<'drip' | 'sprinkler' | 'flood' | 'rainfed' | undefined>(initialData.irrigationType);
  const [soilTesting, setSoilTesting] = useState<SoilTestingData>(initialData.soilTesting || {});
  const [equipment, setEquipment] = useState<EquipmentItem[]>(initialData.equipment || []);
  const [organicInputs, setOrganicInputs] = useState<OrganicInputItem[]>(initialData.organicInputs || []);

  const handleAreaChange = (delta: number) => {
    const newArea = Math.max(0.1, Math.round((area + delta) * 10) / 10);
    setArea(newArea);
  };

  const handleSubmit = () => {
    onComplete({
      name: name || `Plot ${Date.now()}`,
      area,
      areaUnit,
      soilType,
      irrigationType,
      soilTesting,
      equipment: equipment.filter(e => e.selected),
      organicInputs: organicInputs.filter(o => o.selected),
    });
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      <div className="flex-1 px-4 py-4 space-y-6">
        {/* Plot Name */}
        <Card className="p-4">
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            {t('createPlot.plotName')} <span className="text-muted-foreground">({t('common.optional')})</span>
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('createPlot.plotNamePlaceholder')}
            className="text-lg h-12"
          />
        </Card>

        {/* Area with Stepper */}
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Ruler className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{t('createPlot.plotArea')}</h3>
              <p className="text-sm text-muted-foreground">{t('createPlot.areaRequired')}</p>
            </div>
          </div>

          {/* Unit Toggle */}
          <div className="flex rounded-lg border border-border overflow-hidden mb-4">
            <button
              type="button"
              onClick={() => setAreaUnit('acres')}
              className={`flex-1 py-3 text-center font-medium transition-colors ${
                areaUnit === 'acres' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {t('plots.acres')}
            </button>
            <button
              type="button"
              onClick={() => setAreaUnit('hectares')}
              className={`flex-1 py-3 text-center font-medium transition-colors ${
                areaUnit === 'hectares' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {t('plots.hectares')}
            </button>
          </div>

          {/* Stepper */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              className="h-14 w-14 rounded-full text-xl"
              onClick={() => handleAreaChange(-0.5)}
              disabled={area <= 0.1}
            >
              <Minus className="h-6 w-6" />
            </Button>
            
            <div className="text-center min-w-[100px]">
              <span className="text-4xl font-bold">{area}</span>
              <p className="text-sm text-muted-foreground">{t(`plots.${areaUnit}`)}</p>
            </div>
            
            <Button
              variant="outline"
              size="icon"
              className="h-14 w-14 rounded-full text-xl"
              onClick={() => handleAreaChange(0.5)}
            >
              <Plus className="h-6 w-6" />
            </Button>
          </div>
        </Card>

        {/* Equipment (Optional) */}
        <EquipmentSection values={equipment} onChange={setEquipment} />

        {/* Organic Inputs (Optional) */}
        <OrganicInputsSection values={organicInputs} onChange={setOrganicInputs} />

        {/* Soil Type (Optional) */}
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Mountain className="h-5 w-5 text-amber-700" />
            </div>
            <div>
              <h3 className="font-semibold">{t('createPlot.soilType')}</h3>
              <p className="text-sm text-muted-foreground">{t('common.optional')}</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {SOIL_TYPES.map((type) => (
              <motion.button
                key={type.id}
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => setSoilType(soilType === type.id ? undefined : type.id)}
                className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                  soilType === type.id 
                    ? `${type.color} border-primary` 
                    : 'border-border bg-background hover:border-primary/30'
                }`}
              >
                <span className="text-2xl mb-1">{type.icon}</span>
                <span className="text-xs font-medium">{t(`createPlot.soil.${type.id}`)}</span>
              </motion.button>
            ))}
          </div>
        </Card>

        {/* Irrigation Type (Optional) */}
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Droplets className="h-5 w-5 text-blue-700" />
            </div>
            <div>
              <h3 className="font-semibold">{t('createPlot.irrigationType')}</h3>
              <p className="text-sm text-muted-foreground">{t('common.optional')}</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {IRRIGATION_TYPES.map((type) => (
              <motion.button
                key={type.id}
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => setIrrigationType(irrigationType === type.id ? undefined : type.id)}
                className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                  irrigationType === type.id 
                    ? `${type.color} border-primary` 
                    : 'border-border bg-background hover:border-primary/30'
                }`}
              >
                <span className="text-2xl mb-1">{type.icon}</span>
                <span className="text-xs font-medium">{t(`createPlot.irrigation.${type.id}`)}</span>
              </motion.button>
            ))}
          </div>
        </Card>

        {/* Soil Testing Parameters (Optional) */}
        <SoilTestingSection 
          values={soilTesting} 
          onChange={setSoilTesting} 
        />
      </div>

      {/* Save Button */}
      <div className="p-4 border-t border-border bg-background">
        <Button
          size="lg"
          className="w-full h-14 text-lg font-semibold"
          onClick={handleSubmit}
          disabled={isLoading || area <= 0}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              {t('common.saving')}
            </>
          ) : (
            t('createPlot.savePlot')
          )}
        </Button>
      </div>
    </div>
  );
}
