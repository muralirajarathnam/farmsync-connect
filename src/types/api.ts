// API Types for SWAFarms

export interface PlotLocation {
  lat: number;
  lng: number;
  label?: string;
}

export interface Plot {
  id: string;
  name: string;
  area?: number;
  areaUnit?: 'hectares' | 'acres';
  location?: PlotLocation;
  locationLabel?: string;
  cropType?: string;
  season?: 'monsoon' | 'winter' | 'summer';
  targetDate?: string;
  soilType?: 'sandy' | 'clay' | 'loam' | 'silt';
  irrigationType?: 'drip' | 'sprinkler' | 'flood' | 'rainfed';
  updatedAt: string;
  syncStatus?: 'synced' | 'pending' | 'error';
}

export interface SoilData {
  plotId: string;
  ph: number;
  n: number; // Nitrogen
  p: number; // Phosphorus
  k: number; // Potassium
  moisture?: number;
  updatedAt: string;
}

export type TaskStatus = 'pending' | 'inProgress' | 'completed' | 'overdue';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskType = 'irrigation' | 'fertilizer' | 'pesticide' | 'harvest' | 'planting' | 'other';

export interface Task {
  id: string;
  plotId: string;
  plotName?: string;
  type: TaskType;
  title?: string;
  dueDate: string;
  status: TaskStatus;
  priority: TaskPriority;
  updatedAt: string;
  syncStatus?: 'synced' | 'pending' | 'error';
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'windy';
  forecast: string;
  updatedAt: string;
}

export interface DiagnosisStep {
  title: string;
  iconHint: string;
  details: string;
}

export interface DiagnosisResult {
  id: string;
  label: string;
  confidence: number; // 0-1
  summary: string;
  steps: DiagnosisStep[];
  audioAvailable: boolean;
  imageUrl?: string;
  createdAt: string;
}

export interface PendingDiagnosis {
  id: string;
  imageBlob: Blob;
  plotId?: string;
  createdAt: string;
  status: 'pending' | 'uploading' | 'error';
  errorMessage?: string;
}

export interface SyncQueueItem {
  id: string;
  type: 'plot' | 'task' | 'soil' | 'diagnosis';
  action: 'create' | 'update' | 'delete';
  data: any;
  createdAt: string;
  retryCount: number;
  lastError?: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

// Upload types for diagnosis
export interface InitUploadResponse {
  uploadUrl: string;
  fileId: string;
}

export interface DiagnosisByFileRequest {
  fileId: string;
  plotId?: string;
}

// Crop types
export interface CropInfo {
  id: string;
  name: string;
  icon: string;
  season?: 'monsoon' | 'winter' | 'summer' | 'all';
}

// Available crops
export const AVAILABLE_CROPS: CropInfo[] = [
  { id: 'rice', name: 'Rice', icon: 'sprout', season: 'monsoon' },
  { id: 'wheat', name: 'Wheat', icon: 'wheat', season: 'winter' },
  { id: 'maize', name: 'Maize', icon: 'leaf', season: 'monsoon' },
  { id: 'cotton', name: 'Cotton', icon: 'flower', season: 'monsoon' },
  { id: 'tomato', name: 'Tomato', icon: 'apple', season: 'all' },
  { id: 'potato', name: 'Potato', icon: 'carrot', season: 'winter' },
  { id: 'sugarcane', name: 'Sugarcane', icon: 'tree-pine', season: 'all' },
  { id: 'groundnut', name: 'Groundnut', icon: 'nut', season: 'monsoon' },
];
