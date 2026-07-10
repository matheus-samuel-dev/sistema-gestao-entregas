export type Trend = 'up' | 'down';

export type OrderStatus =
  | 'PENDING'
  | 'PICKING'
  | 'COLLECTING'
  | 'ON_THE_WAY'
  | 'DELIVERED'
  | 'DELAYED'
  | 'CANCELED';

export type DeliveryStatus =
  | 'IN_PROGRESS'
  | 'COLLECTING'
  | 'ON_THE_WAY'
  | 'DELIVERED'
  | 'DELAYED'
  | 'CANCELED';

export type DriverStatus = 'AVAILABLE' | 'ON_ROUTE' | 'UNAVAILABLE' | 'INACTIVE';
export type VehicleStatus = 'AVAILABLE' | 'ON_ROUTE' | 'MAINTENANCE' | 'INACTIVE';
export type RouteStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELED';
export type IncidentType =
  | 'DELIVERY_DELAY'
  | 'CUSTOMER_NOT_FOUND'
  | 'WRONG_ADDRESS'
  | 'VEHICLE_PROBLEM'
  | 'DAMAGED_PRODUCT'
  | 'PROBLEM_SOLVED';
export type IncidentPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IncidentStatus = 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'CANCELED';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface MetricCardData {
  key: string;
  title: string;
  value: string;
  variation: string;
  trend: Trend;
}

export interface ChartSlice {
  label: string;
  value: number;
  color: string;
}

export interface PerformancePoint {
  label: string;
  value: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  value: number;
  status: OrderStatus;
  statusLabel: string;
  createdAt: string;
  expectedDeliveryAt: string;
}

export interface Driver {
  id: number;
  name: string;
  phone: string;
  licenseNumber: string;
  status: DriverStatus;
  statusLabel: string;
  currentVehicle?: string | null;
  deliveriesCompleted: number;
  successRate: number;
}

export interface Vehicle {
  id: number;
  plate: string;
  model: string;
  capacityKg: number;
  status: VehicleStatus;
  statusLabel: string;
  linkedDriverId?: number | null;
  linkedDriverName?: string | null;
}

export interface RoutePlan {
  id: number;
  name: string;
  origin: string;
  destination: string;
  estimatedDistanceKm: number;
  estimatedTimeMinutes: number;
  status: RouteStatus;
  statusLabel: string;
  originLat: number;
  originLng: number;
  destinationLat: number;
  destinationLng: number;
  color: string;
}

export interface TimelineItem {
  id: number;
  title: string;
  description: string;
  timestamp: string;
  status: DeliveryStatus;
  statusLabel: string;
}

export interface Delivery {
  id: number;
  orderId: number;
  orderNumber: string;
  customerName: string;
  driverId: number;
  driverName: string;
  vehicleId: number;
  vehiclePlate: string;
  routeId?: number | null;
  routeName?: string | null;
  origin: string;
  destination: string;
  expectedAt: string;
  deliveredAt?: string | null;
  status: DeliveryStatus;
  statusLabel: string;
  progress: number;
  currentLat: number;
  currentLng: number;
  timeline: TimelineItem[];
}

export interface Incident {
  id: number;
  deliveryId?: number | null;
  orderId?: number | null;
  orderNumber?: string | null;
  type: IncidentType;
  typeLabel: string;
  priority: IncidentPriority;
  priorityLabel: string;
  status: IncidentStatus;
  statusLabel: string;
  responsible: string;
  description: string;
  resolution?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MapDelivery {
  id: number;
  orderNumber: string;
  customerName: string;
  driverName: string;
  status: DeliveryStatus;
  statusLabel: string;
  progress: number;
  currentLat: number;
  currentLng: number;
  originLat: number;
  originLng: number;
  destinationLat: number;
  destinationLng: number;
  color: string;
}

export interface UpcomingDelivery {
  time: string;
  orderNumber: string;
  customerName: string;
  address: string;
  status: DeliveryStatus;
  statusLabel: string;
}

export interface RecentIncident {
  id: number;
  title: string;
  orderNumber: string;
  timeAgo: string;
  status: IncidentStatus;
  statusLabel: string;
  priority: IncidentPriority;
}

export interface ActiveDeliveryRow {
  id: number;
  orderNumber: string;
  customerName: string;
  driverName: string;
  routeName: string;
  status: DeliveryStatus;
  statusLabel: string;
  progress: number;
  expectedTime: string;
}

export interface DashboardData {
  metrics: MetricCardData[];
  deliveriesByStatus: ChartSlice[];
  dayPerformance: PerformancePoint[];
  deliveriesByPeriod: PerformancePoint[];
  incidentsByType: ChartSlice[];
  realtimeDeliveries: MapDelivery[];
  upcomingDeliveries: UpcomingDelivery[];
  recentIncidents: RecentIncident[];
  activeDeliveries: ActiveDeliveryRow[];
}
