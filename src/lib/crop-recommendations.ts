// Crop Recommendation Engine
// Client-side scoring function with configurable weights

export interface PlotContext {
  location?: { lat: number; lng: number; label?: string };
  region?: string;
  weather?: {
    temperature?: number;
    humidity?: number;
    condition?: string;
    rainfallExpectation?: 'low' | 'normal' | 'high';
  };
  soil?: {
    type?: 'sandy' | 'clay' | 'loam' | 'silt';
    pH?: number;
    EC?: number;
    OC?: number;
    N?: number;
    P?: number;
    K?: number;
    S?: number;
    Zn?: number;
    Fe?: number;
    Cu?: number;
    Mn?: number;
    B?: number;
  };
  irrigation?: 'drip' | 'sprinkler' | 'flood' | 'rainfed';
  equipment?: string[];
  organicInputs?: string[];
  previousCrops?: string[];
  season: 'monsoon' | 'winter' | 'summer';
}

export interface CropScore {
  cropId: string;
  cropName: string;
  score: number;
  reasons: { text: string; positive: boolean }[];
  factors: {
    soilFit: number;
    waterFit: number;
    climateFit: number;
    inputsFit: number;
    equipmentFit: number;
    rotationFit: number;
    marketFit: number;
    riskAdjust: number;
  };
}

// Scoring weights (configurable)
const WEIGHTS = {
  soilFit: 0.20,
  waterFit: 0.15,
  climateFit: 0.20,
  inputsFit: 0.10,
  equipmentFit: 0.05,
  rotationFit: 0.05,
  marketFit: 0.15,
  riskAdjust: 0.10,
};

// Crop database with scoring profiles
export const CROP_CATALOG = [
  {
    id: 'rice',
    name: 'Rice',
    icon: 'sprout',
    seasons: ['monsoon'],
    soilPreference: ['clay', 'loam'],
    waterNeed: 'high',
    idealPH: { min: 5.5, max: 7.0 },
    nutrientNeeds: { N: 'high', P: 'medium', K: 'medium' },
    equipmentHelps: ['tractor', 'rotavator'],
    organicInputsHelps: ['fym', 'vermicompost', 'jeevamruth'],
    badRotationAfter: ['rice'],
    marketDemand: 'high',
    isPerennial: false,
    plantingWindow: {
      monsoon: { start: 'Jun 15', end: 'Jul 15' },
    },
  },
  {
    id: 'wheat',
    name: 'Wheat',
    icon: 'wheat',
    seasons: ['winter'],
    soilPreference: ['loam', 'clay'],
    waterNeed: 'medium',
    idealPH: { min: 6.0, max: 7.5 },
    nutrientNeeds: { N: 'high', P: 'medium', K: 'low' },
    equipmentHelps: ['tractor', 'cultivator'],
    organicInputsHelps: ['fym', 'compost', 'bioFertilizer'],
    badRotationAfter: ['wheat'],
    marketDemand: 'high',
    isPerennial: false,
    plantingWindow: {
      winter: { start: 'Oct 20', end: 'Nov 15' },
    },
  },
  {
    id: 'maize',
    name: 'Maize',
    icon: 'leaf',
    seasons: ['monsoon', 'summer'],
    soilPreference: ['loam', 'sandy'],
    waterNeed: 'medium',
    idealPH: { min: 5.8, max: 7.0 },
    nutrientNeeds: { N: 'high', P: 'medium', K: 'medium' },
    equipmentHelps: ['tractor', 'cultivator', 'knapsackSprayer'],
    organicInputsHelps: ['fym', 'jeevamruth', 'panchagavya'],
    badRotationAfter: [],
    marketDemand: 'medium',
    isPerennial: false,
    plantingWindow: {
      monsoon: { start: 'Jun 20', end: 'Jul 20' },
      summer: { start: 'Feb 15', end: 'Mar 15' },
    },
  },
  {
    id: 'cotton',
    name: 'Cotton',
    icon: 'flower',
    seasons: ['monsoon'],
    soilPreference: ['clay', 'loam'],
    waterNeed: 'medium',
    idealPH: { min: 6.0, max: 8.0 },
    nutrientNeeds: { N: 'medium', P: 'medium', K: 'high' },
    equipmentHelps: ['tractor', 'htpPump', 'knapsackSprayer'],
    organicInputsHelps: ['fym', 'vermicompost', 'panchagavya'],
    badRotationAfter: ['cotton'],
    marketDemand: 'high',
    isPerennial: false,
    plantingWindow: {
      monsoon: { start: 'May 15', end: 'Jun 30' },
    },
  },
  {
    id: 'tomato',
    name: 'Tomato',
    icon: 'apple',
    seasons: ['monsoon', 'winter', 'summer'],
    soilPreference: ['loam', 'sandy'],
    waterNeed: 'medium',
    idealPH: { min: 6.0, max: 7.0 },
    nutrientNeeds: { N: 'medium', P: 'high', K: 'high' },
    equipmentHelps: ['dripSetup', 'knapsackSprayer'],
    organicInputsHelps: ['vermicompost', 'jeevamruth', 'fishAminoAcid'],
    badRotationAfter: ['tomato', 'potato'],
    marketDemand: 'high',
    isPerennial: false,
    plantingWindow: {
      monsoon: { start: 'Jun 01', end: 'Jul 15' },
      winter: { start: 'Sep 15', end: 'Oct 30' },
      summer: { start: 'Jan 15', end: 'Feb 28' },
    },
  },
  {
    id: 'potato',
    name: 'Potato',
    icon: 'carrot',
    seasons: ['winter'],
    soilPreference: ['loam', 'sandy'],
    waterNeed: 'medium',
    idealPH: { min: 5.0, max: 6.5 },
    nutrientNeeds: { N: 'medium', P: 'high', K: 'high' },
    equipmentHelps: ['tractor', 'cultivator', 'dripSetup'],
    organicInputsHelps: ['fym', 'vermicompost', 'compost'],
    badRotationAfter: ['potato', 'tomato'],
    marketDemand: 'high',
    isPerennial: false,
    plantingWindow: {
      winter: { start: 'Oct 01', end: 'Nov 15' },
    },
  },
  {
    id: 'sugarcane',
    name: 'Sugarcane',
    icon: 'tree-pine',
    seasons: ['monsoon', 'winter', 'summer'],
    soilPreference: ['loam', 'clay'],
    waterNeed: 'high',
    idealPH: { min: 6.0, max: 7.5 },
    nutrientNeeds: { N: 'high', P: 'medium', K: 'high' },
    equipmentHelps: ['tractor', 'dripSetup', 'trailer'],
    organicInputsHelps: ['fym', 'compost', 'ghanJeevamruth'],
    badRotationAfter: ['sugarcane'],
    marketDemand: 'high',
    isPerennial: true,
    plantingWindow: {
      monsoon: { start: 'Jul 01', end: 'Aug 31' },
      winter: { start: 'Oct 01', end: 'Nov 30' },
      summer: { start: 'Feb 01', end: 'Mar 31' },
    },
  },
  {
    id: 'groundnut',
    name: 'Groundnut',
    icon: 'nut',
    seasons: ['monsoon', 'summer'],
    soilPreference: ['sandy', 'loam'],
    waterNeed: 'low',
    idealPH: { min: 6.0, max: 7.0 },
    nutrientNeeds: { N: 'low', P: 'medium', K: 'medium' },
    equipmentHelps: ['tractor', 'cultivator'],
    organicInputsHelps: ['fym', 'compost', 'bioFertilizer'],
    badRotationAfter: [],
    marketDemand: 'medium',
    isPerennial: false,
    plantingWindow: {
      monsoon: { start: 'Jun 15', end: 'Jul 15' },
      summer: { start: 'Jan 15', end: 'Feb 15' },
    },
  },
];

// Calculate individual factor scores (0-100)
function calculateSoilFit(crop: typeof CROP_CATALOG[0], context: PlotContext): number {
  let score = 50; // Base score when no data

  if (context.soil?.type) {
    score = crop.soilPreference.includes(context.soil.type) ? 90 : 40;
  }

  if (context.soil?.pH) {
    const ph = context.soil.pH;
    if (ph >= crop.idealPH.min && ph <= crop.idealPH.max) {
      score = Math.min(100, score + 10);
    } else {
      const deviation = Math.min(
        Math.abs(ph - crop.idealPH.min),
        Math.abs(ph - crop.idealPH.max)
      );
      score = Math.max(20, score - deviation * 10);
    }
  }

  return score;
}

function calculateWaterFit(crop: typeof CROP_CATALOG[0], context: PlotContext): number {
  let score = 60;

  const irrigationWaterLevel: Record<string, string> = {
    drip: 'low',
    sprinkler: 'medium',
    flood: 'high',
    rainfed: 'low',
  };

  if (context.irrigation) {
    const available = irrigationWaterLevel[context.irrigation];
    if (crop.waterNeed === available) {
      score = 90;
    } else if (
      (crop.waterNeed === 'high' && available === 'low') ||
      (crop.waterNeed === 'low' && available === 'high')
    ) {
      score = 40;
    } else {
      score = 70;
    }
  }

  // Adjust for rainfall if rainfed
  if (context.irrigation === 'rainfed' && context.weather?.rainfallExpectation) {
    if (context.weather.rainfallExpectation === 'low' && crop.waterNeed === 'high') {
      score = Math.max(20, score - 30);
    } else if (context.weather.rainfallExpectation === 'high' && crop.waterNeed === 'low') {
      score = Math.max(30, score - 20);
    }
  }

  return score;
}

function calculateClimateFit(crop: typeof CROP_CATALOG[0], context: PlotContext): number {
  // Season fit is primary
  if (!crop.seasons.includes(context.season)) {
    return 20;
  }
  return 90;
}

function calculateInputsFit(crop: typeof CROP_CATALOG[0], context: PlotContext): number {
  if (!context.organicInputs || context.organicInputs.length === 0) {
    return 50;
  }

  const matchCount = crop.organicInputsHelps.filter(input =>
    context.organicInputs?.some(i => i.toLowerCase().includes(input.toLowerCase()))
  ).length;

  const matchRatio = matchCount / crop.organicInputsHelps.length;
  return 40 + matchRatio * 60;
}

function calculateEquipmentFit(crop: typeof CROP_CATALOG[0], context: PlotContext): number {
  if (!context.equipment || context.equipment.length === 0) {
    return 50;
  }

  const matchCount = crop.equipmentHelps.filter(eq =>
    context.equipment?.some(e => e.toLowerCase().includes(eq.toLowerCase()))
  ).length;

  const matchRatio = matchCount / Math.max(1, crop.equipmentHelps.length);
  return 40 + matchRatio * 60;
}

function calculateRotationFit(crop: typeof CROP_CATALOG[0], context: PlotContext): number {
  if (!context.previousCrops || context.previousCrops.length === 0) {
    return 70;
  }

  const lastCrop = context.previousCrops[0];
  if (crop.badRotationAfter.includes(lastCrop)) {
    return 30;
  }
  return 85;
}

function calculateMarketFit(crop: typeof CROP_CATALOG[0]): number {
  const demandScores: Record<string, number> = {
    high: 90,
    medium: 70,
    low: 50,
  };
  return demandScores[crop.marketDemand] || 60;
}

function calculateRiskAdjust(crop: typeof CROP_CATALOG[0], context: PlotContext): number {
  let score = 70;

  // Lower risk for rainfed with low rainfall and high water need crop
  if (
    context.irrigation === 'rainfed' &&
    context.weather?.rainfallExpectation === 'low' &&
    crop.waterNeed === 'high'
  ) {
    score -= 30;
  }

  // Soil nutrient warnings
  if (context.soil?.K !== undefined && context.soil.K < 150 && crop.nutrientNeeds.K === 'high') {
    score -= 15;
  }

  return Math.max(20, score);
}

// Generate human-readable reasons
function generateReasons(
  crop: typeof CROP_CATALOG[0],
  context: PlotContext,
  factors: CropScore['factors']
): { text: string; positive: boolean }[] {
  const reasons: { text: string; positive: boolean }[] = [];

  // Soil fit
  if (context.soil?.type && crop.soilPreference.includes(context.soil.type)) {
    reasons.push({ text: `Suits ${context.soil.type} soil`, positive: true });
  } else if (context.soil?.type) {
    reasons.push({ text: `Prefers ${crop.soilPreference.join('/')} soil`, positive: false });
  }

  // Water fit
  if (factors.waterFit >= 80) {
    if (context.irrigation === 'rainfed') {
      reasons.push({ text: 'Rainfed friendly', positive: true });
    } else if (context.irrigation) {
      reasons.push({ text: `Works with ${context.irrigation}`, positive: true });
    }
  } else if (factors.waterFit < 50 && crop.waterNeed === 'high') {
    reasons.push({ text: 'Needs more water', positive: false });
  }

  // Organic inputs match
  if (factors.inputsFit >= 70 && context.organicInputs && context.organicInputs.length > 0) {
    reasons.push({ text: 'Matches your inputs', positive: true });
  }

  // Equipment match
  if (factors.equipmentFit >= 70 && context.equipment && context.equipment.length > 0) {
    reasons.push({ text: 'Equipment available', positive: true });
  }

  // Market demand
  if (crop.marketDemand === 'high') {
    reasons.push({ text: 'Good market demand', positive: true });
  }

  // Season specific
  reasons.push({ text: `Good for ${context.season}`, positive: true });

  // Rotation
  if (factors.rotationFit < 50 && context.previousCrops?.length) {
    reasons.push({ text: 'Consider rotation', positive: false });
  }

  // Take top 5 reasons, prioritizing positive ones
  const positiveReasons = reasons.filter(r => r.positive);
  const negativeReasons = reasons.filter(r => !r.positive);
  return [...positiveReasons.slice(0, 4), ...negativeReasons.slice(0, 1)].slice(0, 5);
}

// Main scoring function
export function scoreCrops(context: PlotContext): CropScore[] {
  const seasonalCrops = CROP_CATALOG.filter(crop =>
    crop.seasons.includes(context.season)
  );

  const scores: CropScore[] = seasonalCrops.map(crop => {
    const factors = {
      soilFit: calculateSoilFit(crop, context),
      waterFit: calculateWaterFit(crop, context),
      climateFit: calculateClimateFit(crop, context),
      inputsFit: calculateInputsFit(crop, context),
      equipmentFit: calculateEquipmentFit(crop, context),
      rotationFit: calculateRotationFit(crop, context),
      marketFit: calculateMarketFit(crop),
      riskAdjust: calculateRiskAdjust(crop, context),
    };

    const score = Math.round(
      factors.soilFit * WEIGHTS.soilFit +
      factors.waterFit * WEIGHTS.waterFit +
      factors.climateFit * WEIGHTS.climateFit +
      factors.inputsFit * WEIGHTS.inputsFit +
      factors.equipmentFit * WEIGHTS.equipmentFit +
      factors.rotationFit * WEIGHTS.rotationFit +
      factors.marketFit * WEIGHTS.marketFit +
      factors.riskAdjust * WEIGHTS.riskAdjust
    );

    const reasons = generateReasons(crop, context, factors);

    return {
      cropId: crop.id,
      cropName: crop.name,
      score,
      reasons,
      factors,
    };
  });

  return scores.sort((a, b) => b.score - a.score);
}

// Get planting window for a crop in a season
export function getPlantingWindow(
  cropId: string,
  season: 'monsoon' | 'winter' | 'summer'
): { start: string; end: string } | null {
  const crop = CROP_CATALOG.find(c => c.id === cropId);
  if (!crop) return null;
  return crop.plantingWindow[season] || null;
}

// Check if a date is within the recommended planting window
export function isDateInWindow(
  date: Date,
  window: { start: string; end: string }
): boolean {
  const year = date.getFullYear();
  const parseDate = (str: string) => {
    const [month, day] = str.split(' ');
    const monthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(month);
    return new Date(year, monthIndex, parseInt(day));
  };

  const start = parseDate(window.start);
  const end = parseDate(window.end);

  // Handle year wrap (e.g., Oct-Mar for winter)
  if (end < start) {
    return date >= start || date <= end;
  }

  return date >= start && date <= end;
}

// Get fallback crops when scoring is unavailable
export function getFallbackCrops(season: 'monsoon' | 'winter' | 'summer'): string[] {
  const seasonDefaults: Record<string, string[]> = {
    monsoon: ['rice', 'maize', 'cotton', 'groundnut'],
    winter: ['wheat', 'potato', 'tomato'],
    summer: ['maize', 'tomato', 'groundnut', 'sugarcane'],
  };
  return seasonDefaults[season] || [];
}

// Check for specific warnings based on context
export function getContextWarnings(context: PlotContext): string[] {
  const warnings: string[] = [];

  if (
    context.irrigation === 'rainfed' &&
    context.weather?.rainfallExpectation === 'low'
  ) {
    warnings.push('Low rainfall expected — choose hardy crops.');
  }

  if (context.soil?.K !== undefined && context.soil.K < 100) {
    warnings.push('Consider K amendment for better yield.');
  }

  if (context.soil?.pH !== undefined && (context.soil.pH < 5.5 || context.soil.pH > 8.0)) {
    warnings.push('Soil pH may need correction.');
  }

  return warnings;
}
