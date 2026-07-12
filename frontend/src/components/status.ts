import type {
  DeliveryStatus,
  DriverStatus,
  IncidentPriority,
  IncidentStatus,
  IncidentType,
  OrderStatus,
  RouteStatus,
  VehicleStatus
} from '../api/types';

export interface StatusOption<T extends string = string> {
  value: T;
  label: string;
}

export const orderStatusOptions: StatusOption<OrderStatus>[] = [
  { value: 'PENDING', label: 'Pendente' },
  { value: 'PICKING', label: 'Em separação' },
  { value: 'COLLECTING', label: 'Coletando' },
  { value: 'ON_THE_WAY', label: 'Em transporte' },
  { value: 'DELIVERED', label: 'Entregue' },
  { value: 'DELAYED', label: 'Atrasado' },
  { value: 'CANCELED', label: 'Cancelado' }
];

/** Statuses currently accepted by the delivery API. */
export const deliveryStatusOptions: StatusOption<DeliveryStatus>[] = [
  { value: 'IN_PROGRESS', label: 'Coleta agendada' },
  { value: 'COLLECTING', label: 'Coletando' },
  { value: 'ON_THE_WAY', label: 'Em trânsito' },
  { value: 'DELAYED', label: 'Atrasada' },
  { value: 'DELIVERED', label: 'Entregue' },
  { value: 'CANCELED', label: 'Cancelada' }
];

export const driverStatusOptions: StatusOption<DriverStatus>[] = [
  { value: 'AVAILABLE', label: 'Disponível' },
  { value: 'ON_ROUTE', label: 'Em rota' },
  { value: 'UNAVAILABLE', label: 'Indisponível' },
  { value: 'INACTIVE', label: 'Inativo' }
];

export const vehicleStatusOptions: StatusOption<VehicleStatus>[] = [
  { value: 'AVAILABLE', label: 'Disponível' },
  { value: 'ON_ROUTE', label: 'Em rota' },
  { value: 'MAINTENANCE', label: 'Em manutenção' },
  { value: 'INACTIVE', label: 'Inativo' }
];

export const routeStatusOptions: StatusOption<RouteStatus>[] = [
  { value: 'PLANNED', label: 'Planejada' },
  { value: 'ACTIVE', label: 'Ativa' },
  { value: 'COMPLETED', label: 'Concluída' },
  { value: 'CANCELED', label: 'Cancelada' }
];

export const incidentTypeOptions: StatusOption<IncidentType>[] = [
  { value: 'DELIVERY_DELAY', label: 'Atraso na entrega' },
  { value: 'CUSTOMER_NOT_FOUND', label: 'Cliente não localizado' },
  { value: 'WRONG_ADDRESS', label: 'Endereço incorreto' },
  { value: 'DAMAGED_PRODUCT', label: 'Produto avariado' },
  { value: 'VEHICLE_PROBLEM', label: 'Veículo com problema' },
  { value: 'REFUSED_DELIVERY', label: 'Recusa no recebimento' },
  { value: 'ACCIDENT', label: 'Acidente' },
  { value: 'THEFT_OR_LOSS', label: 'Roubo ou extravio' },
  { value: 'DOCUMENTATION_FAILURE', label: 'Falha de documentação' },
  { value: 'DRIVER_UNAVAILABLE', label: 'Indisponibilidade do motorista' },
  { value: 'OTHER', label: 'Outro' }
];

export const incidentPriorityOptions: StatusOption<IncidentPriority>[] = [
  { value: 'LOW', label: 'Baixa' },
  { value: 'MEDIUM', label: 'Média' },
  { value: 'HIGH', label: 'Alta' },
  { value: 'CRITICAL', label: 'Crítica' }
];

export const incidentStatusOptions: StatusOption<IncidentStatus>[] = [
  { value: 'OPEN', label: 'Aberta' },
  { value: 'IN_REVIEW', label: 'Em análise' },
  { value: 'IN_TREATMENT', label: 'Em tratamento' },
  { value: 'WAITING_THIRD_PARTY', label: 'Aguardando terceiro' },
  { value: 'RESOLVED', label: 'Resolvida' },
  { value: 'CANCELED', label: 'Cancelada' }
];

interface StatusVisual {
  label: string;
  fg: string;
  bg: string;
  border: string;
  map: string;
}

const visuals: Record<string, StatusVisual> = {
  PENDING: { label: 'Pendente', fg: '#475569', bg: '#f1f5f9', border: '#cbd5e1', map: '#64748b' },
  PICKUP_SCHEDULED: { label: 'Coleta agendada', fg: '#6d28d9', bg: '#ede9fe', border: '#c4b5fd', map: '#7c3aed' },
  PICKING: { label: 'Em separação', fg: '#6d28d9', bg: '#ede9fe', border: '#c4b5fd', map: '#7c3aed' },
  COLLECTING: { label: 'Coletando', fg: '#9a3412', bg: '#ffedd5', border: '#fed7aa', map: '#f97316' },
  IN_PROGRESS: { label: 'Coleta agendada', fg: '#6d28d9', bg: '#ede9fe', border: '#c4b5fd', map: '#7c3aed' },
  IN_TRANSIT: { label: 'Em trânsito', fg: '#1d4ed8', bg: '#dbeafe', border: '#bfdbfe', map: '#2563eb' },
  ON_THE_WAY: { label: 'Em trânsito', fg: '#1d4ed8', bg: '#dbeafe', border: '#bfdbfe', map: '#2563eb' },
  OUT_FOR_DELIVERY: { label: 'Em rota de entrega', fg: '#0e7490', bg: '#cffafe', border: '#a5f3fc', map: '#0891b2' },
  DELIVERED: { label: 'Entregue', fg: '#047857', bg: '#dcfce7', border: '#bbf7d0', map: '#10b981' },
  DELAYED: { label: 'Atrasada', fg: '#b91c1c', bg: '#fee2e2', border: '#fecaca', map: '#ef4444' },
  CANCELED: { label: 'Cancelada', fg: '#475569', bg: '#e2e8f0', border: '#cbd5e1', map: '#475569' },
  ARCHIVED: { label: 'Arquivada', fg: '#475569', bg: '#f1f5f9', border: '#cbd5e1', map: '#64748b' },
  AVAILABLE: { label: 'Disponível', fg: '#047857', bg: '#dcfce7', border: '#bbf7d0', map: '#10b981' },
  ON_ROUTE: { label: 'Em rota', fg: '#1d4ed8', bg: '#dbeafe', border: '#bfdbfe', map: '#2563eb' },
  UNAVAILABLE: { label: 'Indisponível', fg: '#9a3412', bg: '#ffedd5', border: '#fed7aa', map: '#f97316' },
  INACTIVE: { label: 'Inativo', fg: '#475569', bg: '#e2e8f0', border: '#cbd5e1', map: '#64748b' },
  MAINTENANCE: { label: 'Em manutenção', fg: '#9a3412', bg: '#ffedd5', border: '#fed7aa', map: '#f97316' },
  ACTIVE: { label: 'Ativa', fg: '#0e7490', bg: '#cffafe', border: '#a5f3fc', map: '#0891b2' },
  PLANNED: { label: 'Planejada', fg: '#6d28d9', bg: '#ede9fe', border: '#c4b5fd', map: '#7c3aed' },
  COMPLETED: { label: 'Concluída', fg: '#047857', bg: '#dcfce7', border: '#bbf7d0', map: '#10b981' },
  OPEN: { label: 'Aberta', fg: '#b91c1c', bg: '#fee2e2', border: '#fecaca', map: '#ef4444' },
  IN_REVIEW: { label: 'Em análise', fg: '#a16207', bg: '#fef9c3', border: '#fde68a', map: '#eab308' },
  IN_TREATMENT: { label: 'Em tratamento', fg: '#1d4ed8', bg: '#dbeafe', border: '#bfdbfe', map: '#2563eb' },
  WAITING_THIRD_PARTY: { label: 'Aguardando terceiro', fg: '#6d28d9', bg: '#ede9fe', border: '#c4b5fd', map: '#7c3aed' },
  RESOLVED: { label: 'Resolvida', fg: '#047857', bg: '#dcfce7', border: '#bbf7d0', map: '#10b981' },
  LOW: { label: 'Baixa', fg: '#047857', bg: '#dcfce7', border: '#bbf7d0', map: '#10b981' },
  MEDIUM: { label: 'Média', fg: '#1d4ed8', bg: '#dbeafe', border: '#bfdbfe', map: '#2563eb' },
  HIGH: { label: 'Alta', fg: '#9a3412', bg: '#ffedd5', border: '#fed7aa', map: '#f97316' },
  CRITICAL: { label: 'Crítica', fg: '#b91c1c', bg: '#fee2e2', border: '#fecaca', map: '#ef4444' }
};

const fallbackVisual: StatusVisual = {
  label: 'Não informado',
  fg: '#334155',
  bg: '#f1f5f9',
  border: '#e2e8f0',
  map: '#64748b'
};

export function statusStyle(status?: string | null) {
  return (status && visuals[status]) || fallbackVisual;
}

export function statusLabel(status?: string | null, apiLabel?: string | null) {
  if (apiLabel?.trim()) {
    return apiLabel;
  }
  return statusStyle(status).label;
}

export function statusMapColor(status?: string | null) {
  return statusStyle(status).map;
}

export function optionLabel(options: StatusOption[], value?: string | null) {
  return options.find((option) => option.value === value)?.label ?? statusLabel(value);
}

const deliveryProgress: Partial<Record<DeliveryStatus, number>> = {
  PENDING: 0,
  PICKUP_SCHEDULED: 10,
  IN_PROGRESS: 10,
  COLLECTING: 25,
  IN_TRANSIT: 50,
  ON_THE_WAY: 50,
  OUT_FOR_DELIVERY: 75,
  DELIVERED: 100,
  CANCELED: 0
};

export function progressForDeliveryStatus(status: DeliveryStatus, current = 0) {
  if (status === 'DELAYED') {
    return Math.min(99, Math.max(0, current));
  }
  return deliveryProgress[status] ?? Math.min(99, Math.max(0, current));
}

export function isTerminalStatus(status?: string | null) {
  return status === 'DELIVERED' || status === 'COMPLETED' || status === 'CANCELED' || status === 'ARCHIVED';
}
