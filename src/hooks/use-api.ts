import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '@/services/api';
import type { Plot, SoilData, Task, DiagnosisResult } from '@/types/api';

// ============ PLOTS ============

export function usePlots() {
  return useQuery({
    queryKey: ['plots'],
    queryFn: async () => {
      const response = await api.getPlots();
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (for offline)
  });
}

export function useCreatePlot() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (plot: Omit<Plot, 'id' | 'updatedAt' | 'syncStatus'>) => {
      const response = await api.createPlot(plot);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    onSuccess: (newPlot) => {
      queryClient.setQueryData<Plot[]>(['plots'], (old) => 
        old ? [...old, newPlot] : [newPlot]
      );
    },
  });
}

export function useUpdatePlot() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ plotId, updates }: { plotId: string; updates: Partial<Plot> }) => {
      const response = await api.updatePlot(plotId, updates);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    onSuccess: (updatedPlot) => {
      queryClient.setQueryData<Plot[]>(['plots'], (old) => 
        old?.map(p => p.id === updatedPlot.id ? updatedPlot : p)
      );
    },
  });
}

// ============ SOIL ============

export function useSoilData(plotId: string) {
  return useQuery({
    queryKey: ['soil', plotId],
    queryFn: async () => {
      const response = await api.getSoilData(plotId);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    enabled: !!plotId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateSoil() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ plotId, soil }: { plotId: string; soil: Partial<SoilData> }) => {
      const response = await api.updateSoilData(plotId, soil);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    onSuccess: (updatedSoil) => {
      queryClient.setQueryData(['soil', updatedSoil.plotId], updatedSoil);
    },
  });
}

// ============ TASKS ============

export function useTasks(plotId?: string) {
  return useQuery({
    queryKey: plotId ? ['tasks', plotId] : ['tasks'],
    queryFn: async () => {
      const response = await api.getTasks(plotId);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (task: Omit<Task, 'id' | 'updatedAt' | 'syncStatus'>) => {
      const response = await api.createTask(task);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: Partial<Task> }) => {
      const response = await api.updateTask(taskId, updates);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

// ============ DIAGNOSIS ============

export function useDiagnosis() {
  return useMutation({
    mutationFn: async ({ fileId, plotId }: { fileId: string; plotId?: string }) => {
      const response = await api.submitDiagnosisByFile(fileId, plotId);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
  });
}

export function useInitUpload() {
  return useMutation({
    mutationFn: async () => {
      const response = await api.initDiagnosisUpload();
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
  });
}
