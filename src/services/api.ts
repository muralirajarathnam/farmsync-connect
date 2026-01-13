import axios, { AxiosError, AxiosInstance } from 'axios';
import type { 
  Plot, 
  SoilData, 
  Task, 
  DiagnosisResult, 
  InitUploadResponse,
  ApiResponse,
  WeatherData
} from '@/types/api';
import { setCacheItem, getCacheItem, addToSyncQueue } from '@/lib/offline-storage';
import { useConnectivityStore } from '@/stores/connectivity';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token interceptor (Auth0)
api.interceptors.request.use(async (config) => {
  // In a real app, get token from Auth0
  // const token = await getAccessTokenSilently();
  // config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Error handler with offline fallback
async function handleApiError<T>(
  error: AxiosError,
  cacheKey?: string
): Promise<ApiResponse<T>> {
  if (!navigator.onLine && cacheKey) {
    const cached = await getCacheItem<T>(cacheKey);
    if (cached) {
      return { data: cached.data, success: true };
    }
  }
  
  return {
    data: null as T,
    success: false,
    error: error.message || 'Network error',
  };
}

// ============ PLOTS ============

export async function getPlots(): Promise<ApiResponse<Plot[]>> {
  const cacheKey = 'plots';
  
  try {
    // For now, return mock data
    const mockPlots: Plot[] = [
      {
        id: '1',
        name: 'North Field',
        area: 2.5,
        areaUnit: 'hectares',
        location: { lat: 15.3173, lng: 75.7139, label: 'Near Village Road' },
        locationLabel: 'Village Road',
        cropType: 'Rice',
        season: 'kharif',
        updatedAt: new Date().toISOString(),
        syncStatus: 'synced',
      },
      {
        id: '2',
        name: 'South Field',
        area: 1.8,
        areaUnit: 'hectares',
        location: { lat: 15.3200, lng: 75.7180, label: 'Near Temple' },
        locationLabel: 'Near Temple',
        cropType: 'Wheat',
        season: 'rabi',
        updatedAt: new Date().toISOString(),
        syncStatus: 'synced',
      },
      {
        id: '3',
        name: 'West Plot',
        area: 3.2,
        areaUnit: 'acres',
        location: { lat: 15.3150, lng: 75.7100, label: 'Highway Side' },
        locationLabel: 'Highway Side',
        cropType: 'Cotton',
        season: 'kharif',
        updatedAt: new Date().toISOString(),
        syncStatus: 'synced',
      },
    ];
    
    await setCacheItem(cacheKey, mockPlots);
    return { data: mockPlots, success: true };
    
    // Real implementation:
    // const response = await api.get<Plot[]>('/v1/plots');
    // await setCacheItem(cacheKey, response.data);
    // return { data: response.data, success: true };
  } catch (error) {
    return handleApiError<Plot[]>(error as AxiosError, cacheKey);
  }
}

export async function createPlot(plot: Omit<Plot, 'id' | 'updatedAt' | 'syncStatus'>): Promise<ApiResponse<Plot>> {
  const isOnline = useConnectivityStore.getState().isOnline;
  
  const newPlot: Plot = {
    ...plot,
    id: `local_${Date.now()}`,
    updatedAt: new Date().toISOString(),
    syncStatus: isOnline ? 'synced' : 'pending',
  };
  
  if (!isOnline) {
    await addToSyncQueue({
      type: 'plot',
      action: 'create',
      data: newPlot,
    });
    return { data: newPlot, success: true };
  }
  
  try {
    // Mock success
    return { data: newPlot, success: true };
    // Real: const response = await api.post<Plot>('/v1/plots', plot);
  } catch (error) {
    await addToSyncQueue({
      type: 'plot',
      action: 'create',
      data: newPlot,
    });
    return { data: { ...newPlot, syncStatus: 'pending' }, success: true };
  }
}

export async function updatePlot(plotId: string, updates: Partial<Plot>): Promise<ApiResponse<Plot>> {
  const isOnline = useConnectivityStore.getState().isOnline;
  
  const updatedPlot: Partial<Plot> = {
    ...updates,
    id: plotId,
    updatedAt: new Date().toISOString(),
    syncStatus: isOnline ? 'synced' : 'pending',
  };
  
  if (!isOnline) {
    await addToSyncQueue({
      type: 'plot',
      action: 'update',
      data: updatedPlot,
    });
  }
  
  return { data: updatedPlot as Plot, success: true };
}

// ============ WEATHER ============

export async function getWeather(lat: number, lng: number): Promise<ApiResponse<WeatherData>> {
  const cacheKey = `weather_${lat.toFixed(2)}_${lng.toFixed(2)}`;
  
  try {
    // Mock weather data
    const conditions: WeatherData['condition'][] = ['sunny', 'cloudy', 'rainy', 'windy'];
    const mockWeather: WeatherData = {
      temperature: 28 + Math.floor(Math.random() * 8),
      humidity: 50 + Math.floor(Math.random() * 30),
      condition: conditions[Math.floor(Math.random() * conditions.length)],
      forecast: 'Good conditions for farming activities',
      updatedAt: new Date().toISOString(),
    };
    
    await setCacheItem(cacheKey, mockWeather, 30 * 60 * 1000); // 30 min cache
    return { data: mockWeather, success: true };
  } catch (error) {
    return handleApiError<WeatherData>(error as AxiosError, cacheKey);
  }
}

// ============ SOIL ============

export async function getSoilData(plotId: string): Promise<ApiResponse<SoilData>> {
  const cacheKey = `soil_${plotId}`;
  
  try {
    // Mock data
    const mockSoil: SoilData = {
      plotId,
      ph: 6.5 + Math.random() * 1.5,
      n: 20 + Math.random() * 40,
      p: 15 + Math.random() * 30,
      k: 150 + Math.random() * 100,
      moisture: 30 + Math.random() * 40,
      updatedAt: new Date().toISOString(),
    };
    
    await setCacheItem(cacheKey, mockSoil);
    return { data: mockSoil, success: true };
  } catch (error) {
    return handleApiError<SoilData>(error as AxiosError, cacheKey);
  }
}

export async function updateSoilData(plotId: string, soil: Partial<SoilData>): Promise<ApiResponse<SoilData>> {
  const isOnline = useConnectivityStore.getState().isOnline;
  
  const updatedSoil: SoilData = {
    plotId,
    ph: soil.ph || 0,
    n: soil.n || 0,
    p: soil.p || 0,
    k: soil.k || 0,
    moisture: soil.moisture,
    updatedAt: new Date().toISOString(),
  };
  
  if (!isOnline) {
    await addToSyncQueue({
      type: 'soil',
      action: 'update',
      data: updatedSoil,
    });
  }
  
  return { data: updatedSoil, success: true };
}

// ============ TASKS ============

export async function getTasks(plotId?: string): Promise<ApiResponse<Task[]>> {
  const cacheKey = plotId ? `tasks_${plotId}` : 'tasks_all';
  
  try {
    const mockTasks: Task[] = [
      {
        id: '1',
        plotId: '1',
        plotName: 'North Field',
        type: 'irrigation',
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        status: 'pending',
        priority: 'high',
        updatedAt: new Date().toISOString(),
        syncStatus: 'synced',
      },
      {
        id: '2',
        plotId: '2',
        plotName: 'South Field',
        type: 'fertilizer',
        dueDate: new Date(Date.now() + 172800000).toISOString(),
        status: 'pending',
        priority: 'medium',
        updatedAt: new Date().toISOString(),
        syncStatus: 'synced',
      },
      {
        id: '3',
        plotId: '1',
        plotName: 'North Field',
        type: 'pesticide',
        dueDate: new Date(Date.now() - 86400000).toISOString(),
        status: 'overdue',
        priority: 'high',
        updatedAt: new Date().toISOString(),
        syncStatus: 'synced',
      },
      {
        id: '4',
        plotId: '3',
        plotName: 'West Plot',
        type: 'harvest',
        dueDate: new Date(Date.now() + 604800000).toISOString(),
        status: 'pending',
        priority: 'low',
        updatedAt: new Date().toISOString(),
        syncStatus: 'synced',
      },
    ];
    
    const filtered = plotId ? mockTasks.filter(t => t.plotId === plotId) : mockTasks;
    await setCacheItem(cacheKey, filtered);
    return { data: filtered, success: true };
  } catch (error) {
    return handleApiError<Task[]>(error as AxiosError, cacheKey);
  }
}

export async function createTask(task: Omit<Task, 'id' | 'updatedAt' | 'syncStatus'>): Promise<ApiResponse<Task>> {
  const isOnline = useConnectivityStore.getState().isOnline;
  
  const newTask: Task = {
    ...task,
    id: `local_${Date.now()}`,
    updatedAt: new Date().toISOString(),
    syncStatus: isOnline ? 'synced' : 'pending',
  };
  
  if (!isOnline) {
    await addToSyncQueue({
      type: 'task',
      action: 'create',
      data: newTask,
    });
  }
  
  return { data: newTask, success: true };
}

export async function updateTask(taskId: string, updates: Partial<Task>): Promise<ApiResponse<Task>> {
  const isOnline = useConnectivityStore.getState().isOnline;
  
  const updatedTask: Partial<Task> = {
    ...updates,
    id: taskId,
    updatedAt: new Date().toISOString(),
    syncStatus: isOnline ? 'synced' : 'pending',
  };
  
  if (!isOnline) {
    await addToSyncQueue({
      type: 'task',
      action: 'update',
      data: updatedTask,
    });
  }
  
  return { data: updatedTask as Task, success: true };
}

// ============ DIAGNOSIS ============

export async function initDiagnosisUpload(): Promise<ApiResponse<InitUploadResponse>> {
  try {
    // Mock response - in real app this returns a signed GCS URL
    const mockResponse: InitUploadResponse = {
      uploadUrl: `${API_URL}/v1/uploads/mock-${Date.now()}`,
      fileId: `file_${Date.now()}`,
    };
    return { data: mockResponse, success: true };
  } catch (error) {
    return { data: null as unknown as InitUploadResponse, success: false, error: 'Failed to init upload' };
  }
}

export async function submitDiagnosisByFile(fileId: string, plotId?: string): Promise<ApiResponse<DiagnosisResult>> {
  try {
    // Mock diagnosis result
    const mockResult: DiagnosisResult = {
      id: `diag_${Date.now()}`,
      label: 'Leaf Blight',
      confidence: 0.87,
      summary: 'Early stage fungal infection detected. Treatment recommended within 48 hours.',
      steps: [
        {
          title: 'Remove Infected Leaves',
          iconHint: 'scissors',
          details: 'Carefully remove all visibly infected leaves and dispose away from the field.',
        },
        {
          title: 'Apply Fungicide',
          iconHint: 'spray',
          details: 'Use copper-based fungicide. Apply in early morning or evening.',
        },
        {
          title: 'Improve Drainage',
          iconHint: 'droplet',
          details: 'Ensure proper water drainage to prevent moisture buildup.',
        },
        {
          title: 'Monitor Daily',
          iconHint: 'eye',
          details: 'Check plants daily for 2 weeks. Take photos to track progress.',
        },
      ],
      audioAvailable: true,
      createdAt: new Date().toISOString(),
    };
    
    return { data: mockResult, success: true };
  } catch (error) {
    return { data: null as unknown as DiagnosisResult, success: false, error: 'Diagnosis failed' };
  }
}

export default api;
