import { Typography } from '@mui/material';
import type { Order } from '../api/types';
import { CrudPage } from '../components/CrudPage';
import { formatCurrency, formatDateTime, fromDateTimeInput, toDateTimeInput } from '../components/format';
import { orderStatusOptions } from '../components/status';
import { StatusBadge } from '../components/StatusBadge';

export function OrdersPage() {
  return (
    <CrudPage<Order>
      title="Pedidos"
      subtitle="Gerencie pedidos, clientes, previsão de entrega e cancelamentos."
      endpoint="/orders"
      noun="Pedido"
      searchPlaceholder="Buscar por número do pedido ou cliente"
      initialValues={{
        orderNumber: '',
        customerName: '',
        phone: '',
        address: '',
        city: 'São Paulo',
        state: 'SP',
        value: 0,
        status: 'PENDING',
        expectedDeliveryAt: toDateTimeInput()
      }}
      columns={[
        { key: 'orderNumber', label: 'Pedido', minWidth: 110 },
        { key: 'customerName', label: 'Cliente', minWidth: 180 },
        { key: 'city', label: 'Cidade' },
        { key: 'value', label: 'Valor', render: (row) => <Typography fontWeight={800}>{formatCurrency(row.value)}</Typography> },
        { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} label={row.statusLabel} /> },
        { key: 'createdAt', label: 'Criação', render: (row) => formatDateTime(row.createdAt), minWidth: 150 },
        { key: 'expectedDeliveryAt', label: 'Previsão', render: (row) => formatDateTime(row.expectedDeliveryAt), minWidth: 150 }
      ]}
      fields={[
        { key: 'orderNumber', label: 'Número do pedido', required: true },
        { key: 'customerName', label: 'Cliente', required: true },
        { key: 'phone', label: 'Telefone', required: true },
        { key: 'value', label: 'Valor', type: 'number', required: true },
        { key: 'address', label: 'Endereço', required: true, xs: 12 },
        { key: 'city', label: 'Cidade', required: true },
        { key: 'state', label: 'Estado', required: true },
        { key: 'status', label: 'Status', type: 'select', options: orderStatusOptions, required: true },
        { key: 'expectedDeliveryAt', label: 'Previsão de entrega', type: 'datetime', required: true }
      ]}
      filters={[
        { key: 'status', label: 'Status', type: 'select', options: orderStatusOptions },
        { key: 'city', label: 'Cidade' },
        { key: 'date', label: 'Data', type: 'date' }
      ]}
      mapToForm={(row) => ({ ...row, expectedDeliveryAt: toDateTimeInput(row.expectedDeliveryAt) })}
      mapToPayload={(form) => ({
        orderNumber: form.orderNumber,
        customerName: form.customerName,
        phone: form.phone,
        address: form.address,
        city: form.city,
        state: form.state,
        value: Number(form.value),
        status: form.status,
        expectedDeliveryAt: fromDateTimeInput(form.expectedDeliveryAt)
      })}
      filterFn={(row, search, filters) => {
        const matchesSearch =
          !search ||
          row.orderNumber.toLowerCase().includes(search) ||
          row.customerName.toLowerCase().includes(search);
        const matchesStatus = !filters.status || row.status === filters.status;
        const matchesCity = !filters.city || row.city.toLowerCase().includes(String(filters.city).toLowerCase());
        const matchesDate = !filters.date || row.expectedDeliveryAt.startsWith(filters.date);
        return matchesSearch && matchesStatus && matchesCity && matchesDate;
      }}
      deleteLabel="Cancelar"
    />
  );
}
