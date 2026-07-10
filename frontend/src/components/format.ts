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
