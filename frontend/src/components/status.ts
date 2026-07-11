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

export const orderStatusOptions: Array<{ value: OrderStatus; label: string }> = [
  { value: 'PENDING', label: 'Pendente' },
  { value: 'PICKING', label: 'Separando' },
  { value: 'COLLECTING', label: 'Coletando' },
  { value: 'ON_THE_WAY', label: 'A caminho' },
  { value: 'DELIVERED', label: 'Entregue' },
  { value: 'DELAYED', label: 'Atrasado' },
  { value: 'CANCELED', label: 'Cancelado' }
];

export const deliveryStatusOptions: Array<{ value: DeliveryStatus; label: string }> = [
  { value: 'IN_PROGRESS', label: 'Em andamento' },
  { value: 'COLLECTING', label: 'Coletando' },
  { value: 'ON_THE_WAY', label: 'A caminho' },
  { value: 'DELIVERED', label: 'Entregue' },
  { value: 'DELAYED', label: 'Atrasada' },
  { value: 'CANCELED', label: 'Cancelada' }
];

export const driverStatusOptions: Array<{ value: DriverStatus; label: string }> = [
  { value: 'AVAILABLE', label: 'Disponível' },
  { value: 'ON_ROUTE', label: 'Em rota' },
  { value: 'UNAVAILABLE', label: 'Indisponível' },
  { value: 'INACTIVE', label: 'Inativo' }
];

export const vehicleStatusOptions: Array<{ value: VehicleStatus; label: string }> = [
  { value: 'AVAILABLE', label: 'Disponível' },
  { value: 'ON_ROUTE', label: 'Em rota' },
  { value: 'MAINTENANCE', label: 'Manutenção' },
  { value: 'INACTIVE', label: 'Inativo' }
];

export const routeStatusOptions: Array<{ value: RouteStatus; label: string }> = [
  { value: 'PLANNED', label: 'Planejada' },
  { value: 'ACTIVE', label: 'Ativa' },
  { value: 'COMPLETED', label: 'Concluída' },
  { value: 'CANCELED', label: 'Cancelada' }
];

export const incidentTypeOptions: Array<{ value: IncidentType; label: string }> = [
  { value: 'DELIVERY_DELAY', label: 'Atraso na entrega' },
  { value: 'CUSTOMER_NOT_FOUND', label: 'Cliente não localizado' },
  { value: 'WRONG_ADDRESS', label: 'Endereço incorreto' },
  { value: 'VEHICLE_PROBLEM', label: 'Veículo com problema' },
  { value: 'DAMAGED_PRODUCT', label: 'Produto avariado' },
  { value: 'PROBLEM_SOLVED', label: 'Problema resolvido' }
];

export const incidentPriorityOptions: Array<{ value: IncidentPriority; label: string }> = [
  { value: 'LOW', label: 'Baixa' },
  { value: 'MEDIUM', label: 'Média' },
  { value: 'HIGH', label: 'Alta' },
  { value: 'CRITICAL', label: 'Crítica' }
];

export const incidentStatusOptions: Array<{ value: IncidentStatus; label: string }> = [
  { value: 'OPEN', label: 'Aberta' },
  { value: 'IN_REVIEW', label: 'Em análise' },
  { value: 'RESOLVED', label: 'Resolvida' },
  { value: 'CANCELED', label: 'Cancelada' }
];

const palette: Record<string, { fg: string; bg: string; border: string }> = {
  PENDING: { fg: '#92400e', bg: '#fef3c7', border: '#fde68a' },
  PICKING: { fg: '#0369a1', bg: '#e0f2fe', border: '#bae6fd' },
  COLLECTING: { fg: '#0369a1', bg: '#e0f2fe', border: '#bae6fd' },
  IN_PROGRESS: { fg: '#0f766e', bg: '#ccfbf1', border: '#99f6e4' },
  ON_THE_WAY: { fg: '#1d4ed8', bg: '#dbeafe', border: '#bfdbfe' },
  DELIVERED: { fg: '#047857', bg: '#dcfce7', border: '#bbf7d0' },
  DELAYED: { fg: '#b91c1c', bg: '#fee2e2', border: '#fecaca' },
  CANCELED: { fg: '#475569', bg: '#e2e8f0', border: '#cbd5e1' },
  AVAILABLE: { fg: '#047857', bg: '#dcfce7', border: '#bbf7d0' },
  ON_ROUTE: { fg: '#1d4ed8', bg: '#dbeafe', border: '#bfdbfe' },
  UNAVAILABLE: { fg: '#92400e', bg: '#fef3c7', border: '#fde68a' },
  INACTIVE: { fg: '#475569', bg: '#e2e8f0', border: '#cbd5e1' },
  MAINTENANCE: { fg: '#92400e', bg: '#fef3c7', border: '#fde68a' },
  ACTIVE: { fg: '#1d4ed8', bg: '#dbeafe', border: '#bfdbfe' },
  PLANNED: { fg: '#92400e', bg: '#fef3c7', border: '#fde68a' },
  COMPLETED: { fg: '#047857', bg: '#dcfce7', border: '#bbf7d0' },
  OPEN: { fg: '#b91c1c', bg: '#fee2e2', border: '#fecaca' },
  IN_REVIEW: { fg: '#92400e', bg: '#fef3c7', border: '#fde68a' },
  RESOLVED: { fg: '#047857', bg: '#dcfce7', border: '#bbf7d0' },
  LOW: { fg: '#047857', bg: '#dcfce7', border: '#bbf7d0' },
  MEDIUM: { fg: '#1d4ed8', bg: '#dbeafe', border: '#bfdbfe' },
  HIGH: { fg: '#92400e', bg: '#fef3c7', border: '#fde68a' },
  CRITICAL: { fg: '#b91c1c', bg: '#fee2e2', border: '#fecaca' }
};

export function statusStyle(status: string) {
  return palette[status] ?? { fg: '#334155', bg: '#f1f5f9', border: '#e2e8f0' };
}

export function optionLabel(options: Array<{ value: string; label: string }>, value?: string | null) {
  return options.find((option) => option.value === value)?.label ?? value ?? '-';
}
