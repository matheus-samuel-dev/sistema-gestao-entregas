export type Trend = 'up' | 'down' | 'neutral';

export type OrderStatus =
  | 'PENDING'
  | 'PICKING'
  | 'COLLECTING'
  | 'ON_THE_WAY'
  | 'DELIVERED'
  | 'DELAYED'
  | 'CANCELED'
  | 'ARCHIVED';

/**
 * The API still returns a few legacy delivery states. Keeping them in the
 * client contract lets the UI present old records while using the clearer
 * operational states for new interactions.
 */
export type DeliveryStatus =
  | 'PENDING'
  | 'PICKUP_SCHEDULED'
  | 'COLLECTING'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'IN_PROGRESS'
  | 'ON_THE_WAY'
  | 'DELIVERED'
  | 'DELAYED'
  | 'CANCELED';

export type DriverStatus = 'AVAILABLE' | 'ON_ROUTE' | 'UNAVAILABLE' | 'INACTIVE';
export type VehicleStatus = 'AVAILABLE' | 'ON_ROUTE' | 'MAINTENANCE' | 'INACTIVE';
export type RouteStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELED' | 'ARCHIVED';
export type IncidentType =
  | 'DELIVERY_DELAY'
  | 'CUSTOMER_NOT_FOUND'
  | 'WRONG_ADDRESS'
  | 'VEHICLE_PROBLEM'
  | 'DAMAGED_PRODUCT'
  | 'REFUSED_DELIVERY'
  | 'ACCIDENT'
  | 'THEFT_OR_LOSS'
  | 'DOCUMENTATION_FAILURE'
  | 'DRIVER_UNAVAILABLE'
  | 'OTHER';
export type IncidentPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IncidentStatus =
  | 'OPEN'
  | 'IN_REVIEW'
  | 'IN_TREATMENT'
  | 'WAITING_THIRD_PARTY'
  | 'RESOLVED'
  | 'CANCELED';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'OPERATOR' | 'MONITORING' | 'FLEET_MANAGER' | 'DRIVER' | 'VIEWER';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface MetricCardData {
  key: string;
  title: string;
  value: string;
  variation?: string | null;
  trend?: Trend | null;
  description?: string;
  href?: string;
}

export interface ChartSlice {
  key?: string;
  label: string;
  value: number;
  color: string;
}

export interface PerformancePoint {
  label: string;
  value: number;
  previousValue?: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  trackingCode?: string | null;
  customerName: string;
  phone: string;
  email?: string | null;
  address: string;
  addressNumber?: string | null;
  complement?: string | null;
  district?: string | null;
  city: string;
  state: string;
  postalCode?: string | null;
  reference?: string | null;
  value: number;
  weightKg?: number | null;
  volumeM3?: number | null;
  itemCount?: number | null;
  notes?: string | null;
  priority?: IncidentPriority | null;
  serviceType?: string | null;
  status: OrderStatus;
  statusLabel: string;
  createdAt: string;
  updatedAt?: string | null;
  expectedDeliveryAt: string;
  deliveryId?: number | null;
}

export interface Driver {
  id: number;
  name: string;
  phone: string;
  email?: string | null;
  cpf?: string | null;
  photoUrl?: string | null;
  licenseNumber: string;
  licenseCategory?: string | null;
  licenseExpiresAt?: string | null;
  hiredAt?: string | null;
  city?: string | null;
  notes?: string | null;
  status: DriverStatus;
  statusLabel: string;
  currentVehicle?: string | null;
  deliveriesCompleted: number;
  successRate: number;
  averageRating?: number | null;
  lastActivityAt?: string | null;
}

export interface Vehicle {
  id: number;
  plate: string;
  model: string;
  brand?: string | null;
  year?: number | null;
  type?: string | null;
  capacityKg: number;
  volumeM3?: number | null;
  assetCode?: string | null;
  mileageKm?: number | null;
  licensingExpiresAt?: string | null;
  insuranceExpiresAt?: string | null;
  nextServiceAt?: string | null;
  imageUrl?: string | null;
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
  estimatedDistanceKm?: number | null;
  estimatedTimeMinutes?: number | null;
  status: RouteStatus;
  statusLabel: string;
  originLat?: number | null;
  originLng?: number | null;
  destinationLat?: number | null;
  destinationLng?: number | null;
  color: string;
  driverName?: string | null;
  vehiclePlate?: string | null;
  deliveryCount?: number | null;
  progress?: number | null;
}

export interface TimelineItem {
  id: number;
  title: string;
  description: string;
  timestamp: string;
  status: DeliveryStatus;
  statusLabel: string;
  actor?: string | null;
  location?: string | null;
}

export interface DeliveryProof {
  recipientName: string;
  recipientDocument?: string | null;
  receivedAt: string;
  notes?: string | null;
  photoUrl?: string | null;
  signatureUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  confirmationCode?: string | null;
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
  currentLat?: number | null;
  currentLng?: number | null;
  timeline: TimelineItem[];
  proof?: DeliveryProof | null;
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
  dueAt?: string | null;
  rootCause?: string | null;
  preventiveAction?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MapDelivery {
  id: number;
  orderNumber: string;
  customerName: string;
  driverName: string;
  vehiclePlate?: string | null;
  routeName?: string | null;
  expectedAt?: string | null;
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
  hasOpenIncident?: boolean;
  legendLabel?: string;
}

export interface UpcomingDelivery {
  id?: number;
  time: string;
  orderNumber: string;
  customerName: string;
  address: string;
  driverName?: string | null;
  vehiclePlate?: string | null;
  routeName?: string | null;
  distanceKm?: number | null;
  expectedAt?: string | null;
  status: DeliveryStatus;
  statusLabel: string;
}

export interface RecentIncident {
  id: number;
  deliveryId?: number | null;
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

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export type CollectionResponse<T> = T[] | PagedResponse<T>;
