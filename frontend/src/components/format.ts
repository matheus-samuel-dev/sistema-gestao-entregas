export function formatCurrency(value: number | string) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(Number(value));
}

export function formatDateTime(value?: string | null) {
  if (!value) {
    return '-';
  }
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(new Date(value));
}

export function formatDate(value?: string | null) {
  if (!value) {
    return '-';
  }
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short'
  }).format(new Date(value));
}

export function toDateTimeInput(value?: string | null) {
  if (!value) {
    const date = new Date(Date.now() + 1000 * 60 * 60 * 2);
    return date.toISOString().slice(0, 16);
  }
  return value.slice(0, 16);
}

export function fromDateTimeInput(value: string) {
  return value.length === 16 ? `${value}:00` : value;
}

export function onlyDigits(value: string) {
  return value.replace(/\D/g, '');
}

export function maskPhone(value: string) {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 2) {
    return digits;
  }
  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function maskCnpj(value: string) {
  const digits = onlyDigits(value).slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

export function normalizeState(value: string) {
  return value.replace(/[^a-z]/gi, '').slice(0, 2).toUpperCase();
}

export function normalizePlate(value: string) {
  return value.replace(/[^a-z0-9]/gi, '').slice(0, 7).toUpperCase();
}

export function clampPercent(value: number) {
  return Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));
}

export function formatDuration(minutes: number) {
  if (minutes <= 0) {
    return '0min';
  }
  const hours = Math.floor(minutes / 60);
  const rest = Math.round(minutes % 60);
  if (!hours) {
    return `${rest}min`;
  }
  return rest ? `${hours}h ${rest}min` : `${hours}h`;
}
