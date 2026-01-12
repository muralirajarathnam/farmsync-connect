// API Types for SWAFarms

export interface Plot {
  id: string;
  name: string;
  area?: number;
  areaUnit?: 'hectares' | 'acres';
  locationLabel?: string;
  cropType?: string;
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
