import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Leaf, 
  Plus, 
  ChevronDown,
  X
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface OrganicInputItem {
  name: string;
  selected: boolean;
  isCustom?: boolean;
  meta: {
    qty: number | '';
    unit: string;
    frequency: string;
    notes: string;
  };
}

interface OrganicInputsSectionProps {
  values: OrganicInputItem[];
  onChange: (items: OrganicInputItem[]) => void;
}

const DEFAULT_ORGANIC_INPUTS = [
  { id: 'fym', icon: '🐄' },
  { id: 'compost', icon: '🍂' },
  { id: 'vermicompost', icon: '🪱' },
  { id: 'jeevamruth', icon: '🫙' },
  { id: 'ghanJeevamruth', icon: '🧱' },
  { id: 'panchagavya', icon: '🥛' },
  { id: 'bananaLeafPotash', icon: '🍌' },
  { id: 'fishAminoAcid', icon: '🐟' },
  { id: 'cowUrine', icon: '💧' },
  { id: 'bioFertilizer', icon: '🦠' },
];

const UNITS = ['kg', 'L', 'ton', 'cart'];
const FREQUENCIES = ['weekly', 'monthly', 'seasonal', 'yearly'];

export function OrganicInputsSection({ values, onChange }: OrganicInputsSectionProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [showAddInput, setShowAddInput] = useState(false);
  const [newInputName, setNewInputName] = useState('');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const toggleInput = (inputId: string) => {
    const existingIndex = values.findIndex(e => e.name === inputId);
    
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
        { name: inputId, selected: true, meta: { qty: '', unit: 'kg', frequency: '', notes: '' } }
      ]);
    }
  };

  const isSelected = (inputId: string) => {
    const item = values.find(e => e.name === inputId);
    return item?.selected || false;
  };

  const handleAddCustom = () => {
    if (newInputName.trim()) {
      onChange([
        ...values,
        { 
          name: newInputName.trim(), 
          selected: true, 
          isCustom: true,
          meta: { qty: '', unit: 'kg', frequency: '', notes: '' } 
        }
      ]);
      setNewInputName('');
      setShowAddInput(false);
    }
  };

  const removeCustomItem = (itemName: string) => {
    onChange(values.filter(e => e.name !== itemName));
  };

  const updateMeta = (inputName: string, field: keyof OrganicInputItem['meta'], value: number | string) => {
    const updated = values.map(e => 
      e.name === inputName 
        ? { ...e, meta: { ...e.meta, [field]: value } }
        : e
    );
    onChange(updated);
  };

  const getItemMeta = (inputName: string) => {
    return values.find(e => e.name === inputName)?.meta || { qty: '', unit: 'kg', frequency: '', notes: '' };
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
          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
            <Leaf className="h-5 w-5 text-green-700" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold">{t('createPlot.organicInputs.title')}</h3>
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
                {t('createPlot.organicInputs.helper')}
              </p>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mb-3">
        {DEFAULT_ORGANIC_INPUTS.map((input) => {
          const selected = isSelected(input.id);
          return (
            <div key={input.id}>
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleInput(input.id)}
                className={`w-full flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                  selected 
                    ? 'bg-primary/10 border-primary' 
                    : 'border-border bg-background hover:border-primary/30'
                }`}
              >
                <span className="text-2xl mb-1">{input.icon}</span>
                <span className="text-xs font-medium text-center leading-tight">
                  {t(`createPlot.organicInputs.${input.id}`)}
                </span>
              </motion.button>
              
              {/* Expandable Meta */}
              {selected && (
                <button
                  type="button"
                  onClick={() => setExpandedItem(expandedItem === input.id ? null : input.id)}
                  className="w-full mt-1 text-xs text-primary flex items-center justify-center gap-1"
                >
                  <ChevronDown className={`h-3 w-3 transition-transform ${expandedItem === input.id ? 'rotate-180' : ''}`} />
                  {t('common.details')}
                </button>
              )}
              
              <AnimatePresence>
                {selected && expandedItem === input.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-2 space-y-2">
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          min="0"
                          placeholder={t('createPlot.organicInputs.qty')}
                          value={getItemMeta(input.id).qty}
                          onChange={(e) => updateMeta(input.id, 'qty', e.target.value ? parseFloat(e.target.value) : '')}
                          className="h-7 flex-1 text-xs"
                        />
                        <Select 
                          value={getItemMeta(input.id).unit} 
                          onValueChange={(v) => updateMeta(input.id, 'unit', v)}
                        >
                          <SelectTrigger className="h-7 w-14 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {UNITS.map(u => (
                              <SelectItem key={u} value={u}>{u}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Select 
                        value={getItemMeta(input.id).frequency} 
                        onValueChange={(v) => updateMeta(input.id, 'frequency', v)}
                      >
                        <SelectTrigger className="h-7 text-xs">
                          <SelectValue placeholder={t('createPlot.organicInputs.frequency')} />
                        </SelectTrigger>
                        <SelectContent>
                          {FREQUENCIES.map(f => (
                            <SelectItem key={f} value={f}>
                              {t(`createPlot.organicInputs.frequencies.${f}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder={t('createPlot.organicInputs.notes')}
                        value={getItemMeta(input.id).notes}
                        onChange={(e) => updateMeta(input.id, 'notes', e.target.value)}
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
              <span className="text-2xl mb-1">🌿</span>
              <span className="text-xs font-medium text-center leading-tight">
                {item.name}
              </span>
            </motion.div>
          </div>
        ))}
      </div>

      {/* Add Custom Input */}
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
                placeholder={t('createPlot.organicInputs.customPlaceholder')}
                value={newInputName}
                onChange={(e) => setNewInputName(e.target.value)}
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
              />
              <Button size="sm" onClick={handleAddCustom}>
                {t('common.add')}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => {
                setShowAddInput(false);
                setNewInputName('');
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
            {t('createPlot.organicInputs.addCustom')}
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
