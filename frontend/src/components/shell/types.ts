export interface SearchItem {
  id: number | string;
  type: string;
  title: string;
  subtitle: string;
  status?: string | null;
  path: string;
}

export interface SearchGroup {
  type: string;
  label: string;
  total: number;
  items: SearchItem[];
}

export interface SearchResponse {
  query: string;
  total: number;
  groups: SearchGroup[];
}

export interface NotificationItem {
  id: number;
  type: string;
  title: string;
  message: string;
  entityType?: string | null;
  entityId?: number | null;
  path?: string | null;
  read: boolean;
  createdAt: string;
}

export interface NotificationResponse {
  items: NotificationItem[];
  unreadCount: number;
}

export interface ConversationSummary {
  id: number;
  participantName: string;
  participantRole: string;
  contextType?: string | null;
  contextId?: number | null;
  unreadCount: number;
  lastMessageAt: string;
  lastMessage: string;
}

export interface ConversationMessage {
  id: number;
  senderName: string;
  senderRole: string;
  content: string;
  read: boolean;
  createdAt: string;
  attachmentType?: string | null;
  attachmentId?: number | null;
}

export interface ConversationDetail extends ConversationSummary {
  messages: ConversationMessage[];
}

export interface CalendarItem {
  id: number;
  type: string;
  title: string;
  subtitle: string;
  startAt: string;
  status?: string | null;
  entityType?: string | null;
  entityId?: number | null;
  path?: string | null;
}

export interface CalendarResponse {
  date: string;
  items: CalendarItem[];
}

export function relativeTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const rawSeconds = Math.round((date.getTime() - Date.now()) / 1000);
  // The API uses LocalDateTime. Clamp the small positive offset produced when
  // an older Docker demo database was created in UTC and is viewed in BRT.
  const seconds = rawSeconds > 0 && rawSeconds <= 4 * 3_600 ? 0 : rawSeconds;
  const formatter = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });
  const ranges: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['year', 31_536_000],
    ['month', 2_592_000],
    ['week', 604_800],
    ['day', 86_400],
    ['hour', 3_600],
    ['minute', 60]
  ];
  for (const [unit, divisor] of ranges) {
    if (Math.abs(seconds) >= divisor) return formatter.format(Math.round(seconds / divisor), unit);
  }
  return formatter.format(seconds, 'second');
}

export function getInitials(name?: string | null) {
  if (!name) return 'LT';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function toLocalIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
