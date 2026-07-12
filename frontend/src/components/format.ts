const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

const numberFormatter = new Intl.NumberFormat('pt-BR');

function validDate(value?: string | Date | null) {
  if (!value) {
    return null;
  }
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatCurrency(value?: number | string | null) {
  const numeric = Number(value);
  return currencyFormatter.format(Number.isFinite(numeric) ? numeric : 0);
}

export function formatNumber(value?: number | string | null, suffix = '') {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? `${numberFormatter.format(numeric)}${suffix}` : '-';
}

export function formatDateTime(value?: string | Date | null) {
  const date = validDate(value);
  if (!date) {
    return '-';
  }
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(date);
}

export function formatDate(value?: string | Date | null) {
  const date = validDate(value);
  if (!date) {
    return '-';
  }
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(date);
}

export function formatRelativeTime(value?: string | Date | null) {
  const date = validDate(value);
  if (!date) {
    return '-';
  }

  const difference = date.getTime() - Date.now();
  const absolute = Math.abs(difference);
  const formatter = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });
  if (absolute < 60_000) {
    return formatter.format(Math.round(difference / 1_000), 'second');
  }
  if (absolute < 3_600_000) {
    return formatter.format(Math.round(difference / 60_000), 'minute');
  }
  if (absolute < 86_400_000) {
    return formatter.format(Math.round(difference / 3_600_000), 'hour');
  }
  return formatter.format(Math.round(difference / 86_400_000), 'day');
}

export function toDateTimeInput(value?: string | null, defaultOffsetHours = 2) {
  const parsed = validDate(value);
  const date = parsed ?? new Date(Date.now() + defaultOffsetHours * 3_600_000);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export function fromDateTimeInput(value: string) {
  if (!value) {
    return value;
  }
  const date = validDate(value);
  return date ? date.toISOString().slice(0, 19) : value;
}

export function onlyDigits(value: string) {
  return value.replace(/\D/g, '');
}

export function maskPhone(value: string) {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
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

export function maskCpf(value: string) {
  const digits = onlyDigits(value).slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2');
}

export function maskPostalCode(value: string) {
  const digits = onlyDigits(value).slice(0, 8);
  return digits.replace(/^(\d{5})(\d)/, '$1-$2');
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

export function formatDuration(minutes?: number | null) {
  if (!minutes || minutes <= 0) {
    return '0 min';
  }
  const hours = Math.floor(minutes / 60);
  const rest = Math.round(minutes % 60);
  if (!hours) return `${rest} min`;
  return rest ? `${hours} h ${rest} min` : `${hours} h`;
}

export function initials(name?: string | null) {
  if (!name?.trim()) {
    return 'LT';
  }
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function isPast(value?: string | null) {
  const date = validDate(value);
  return Boolean(date && date.getTime() < Date.now());
}

export function downloadCsv(filename: string, rows: Array<Array<string | number | null | undefined>>) {
  const content = rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`)
        .join(';')
    )
    .join('\r\n');
  const blob = new Blob([`\uFEFF${content}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
