import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wrench, 
  Plus, 
  ChevronDown,
  X
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import plotConfigData from '@/data/plotConfigData.json';

export interface EquipmentItem {
  name: string;
  selected: boolean;
  isCustom?: boolean;
  meta: {
    qty: number;
    notes: string;
  };
}

interface EquipmentSectionProps {
  values: EquipmentItem[];
  onChange: (items: EquipmentItem[]) => void;
}

const DEFAULT_EQUIPMENT = plotConfigData.equipment;

export function EquipmentSection({ values, onChange }: EquipmentSectionProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [showAddInput, setShowAddInput] = useState(false);
  const [newEquipmentName, setNewEquipmentName] = useState('');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const toggleEquipment = (equipmentId: string) => {
    const existingIndex = values.findIndex(e => e.name === equipmentId);
    
    if (existingIndex >= 0) {
      const updated = [...values];
      updated[existingIndex] = {
        ...updated[existingIndex],
        selected: !updated[existingIndex].selected
      };
      onChange(updated);
    } else {
      onChange([
        ...values,
        { name: equipmentId, selected: true, meta: { qty: 1, notes: '' } }
      ]);
    }
  };

  const isSelected = (equipmentId: string) => {
    const item = values.find(e => e.name === equipmentId);
    return item?.selected || false;
  };

  const handleAddCustom = () => {
    if (newEquipmentName.trim()) {
      onChange([
        ...values,
        { 
          name: newEquipmentName.trim(), 
          selected: true, 
          isCustom: true,
          meta: { qty: 1, notes: '' } 
        }
      ]);
      setNewEquipmentName('');
      setShowAddInput(false);
    }
  };

  const removeCustomItem = (itemName: string) => {
    onChange(values.filter(e => e.name !== itemName));
  };

  const updateMeta = (equipmentName: string, field: 'qty' | 'notes', value: number | string) => {
    const updated = values.map(e => 
      e.name === equipmentName 
        ? { ...e, meta: { ...e.meta, [field]: value } }
        : e
    );
    onChange(updated);
  };

  const getItemMeta = (equipmentName: string) => {
    return values.find(e => e.name === equipmentName)?.meta || { qty: 1, notes: '' };
  };

  const customItems = values.filter(e => e.isCustom && e.selected);
  const selectedCount = values.filter(e => e.selected).length;

  return (
    <Card className="p-4">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
            <Wrench className="h-5 w-5 text-slate-700" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold">{t('createPlot.equipment.title')}</h3>
            <p className="text-sm text-muted-foreground">
              {selectedCount > 0 ? `${selectedCount} ${t('common.selected')}` : t('common.optional')}
            </p>
          </div>
        </div>
        <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-4">
              <p className="text-xs text-muted-foreground mb-4">
                {t('createPlot.equipment.helper')}
              </p>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mb-3">
        {DEFAULT_EQUIPMENT.map((eq) => {
          const selected = isSelected(eq.id);
          return (
            <div key={eq.id}>
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleEquipment(eq.id)}
                className={`w-full flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                  selected 
                    ? 'bg-primary/10 border-primary' 
                    : 'border-border bg-background hover:border-primary/30'
                }`}
              >
                <span className="text-2xl mb-1">{eq.icon}</span>
                <span className="text-xs font-medium text-center leading-tight">
                  {t(`createPlot.equipment.${eq.id}`)}
                </span>
              </motion.button>
              
              {/* Expandable Meta */}
              {selected && (
                <button
                  type="button"
                  onClick={() => setExpandedItem(expandedItem === eq.id ? null : eq.id)}
                  className="w-full mt-1 text-xs text-primary flex items-center justify-center gap-1"
                >
                  <ChevronDown className={`h-3 w-3 transition-transform ${expandedItem === eq.id ? 'rotate-180' : ''}`} />
                  {t('common.details')}
                </button>
              )}
              
              <AnimatePresence>
                {selected && expandedItem === eq.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-2 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{t('createPlot.equipment.qty')}:</span>
                        <Input
                          type="number"
                          min="1"
                          value={getItemMeta(eq.id).qty}
                          onChange={(e) => updateMeta(eq.id, 'qty', parseInt(e.target.value) || 1)}
                          className="h-7 w-16 text-xs"
                        />
                      </div>
                      <Input
                        placeholder={t('createPlot.equipment.notes')}
                        value={getItemMeta(eq.id).notes}
                        onChange={(e) => updateMeta(eq.id, 'notes', e.target.value)}
                        className="h-7 text-xs"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {/* Custom Items */}
        {customItems.map((item) => (
          <div key={item.name}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative w-full flex flex-col items-center p-3 rounded-xl border-2 bg-primary/10 border-primary"
            >
              <button
                type="button"
                onClick={() => removeCustomItem(item.name)}
                className="absolute -top-1 -right-1 h-5 w-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
              >
                <X className="h-3 w-3" />
              </button>
              <span className="text-2xl mb-1">🔧</span>
              <span className="text-xs font-medium text-center leading-tight">
                {item.name}
              </span>
            </motion.div>
          </div>
        ))}
      </div>

      {/* Add Custom Equipment */}
      <AnimatePresence>
        {showAddInput ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex gap-2 mt-2">
              <Input
                placeholder={t('createPlot.equipment.customPlaceholder')}
                value={newEquipmentName}
                onChange={(e) => setNewEquipmentName(e.target.value)}
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
              />
              <Button size="sm" onClick={handleAddCustom}>
                {t('common.add')}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => {
                setShowAddInput(false);
                setNewEquipmentName('');
              }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowAddInput(true)}
            className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 mt-2"
          >
            <Plus className="h-4 w-4" />
            {t('createPlot.equipment.addCustom')}
          </motion.button>
        )}
      </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
