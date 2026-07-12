import { useQuery } from '@tanstack/react-query';
import type { QueryKey } from '@tanstack/react-query';
import { api } from '../api/client';
import type { CollectionResponse } from '../api/types';

export const queryKeys = {
  dashboard: ['dashboard'] as const,
  orders: ['orders'] as const,
  deliveries: ['deliveries'] as const,
  drivers: ['drivers'] as const,
  vehicles: ['vehicles'] as const,
  routes: ['routes'] as const,
  incidents: ['incidents'] as const,
  settings: ['settings'] as const
};

export function normalizeCollection<T>(response: CollectionResponse<T>): T[] {
  return Array.isArray(response) ? response : response.content;
}

export async function fetchCollection<T>(endpoint: string) {
  const response = await api.get<CollectionResponse<T>>(endpoint);
  return normalizeCollection(response.data);
}

export function useApiCollection<T>({
  queryKey,
  endpoint,
  refetchInterval = 30_000,
  enabled = true
}: {
  queryKey: QueryKey;
  endpoint: string;
  refetchInterval?: number | false;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey,
    queryFn: () => fetchCollection<T>(endpoint),
    enabled,
    staleTime: 15_000,
    refetchInterval,
    refetchIntervalInBackground: false,
    retry: 1
  });
}

export function formatLastSync(timestamp: number) {
  if (!timestamp) return 'Aguardando sincronização';
  return `Atualizado às ${new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(timestamp)}`;
}
