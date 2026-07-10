import { useEffect, useMemo, useState } from 'react';
import type { Delivery, Incident, Order } from '../api/types';
import { api } from '../api/client';
import { CrudPage } from '../components/CrudPage';
import type { Option } from '../components/CrudPage';
import { formatDateTime } from '../components/format';
import { incidentPriorityOptions, incidentStatusOptions, incidentTypeOptions } from '../components/status';
import { StatusBadge } from '../components/StatusBadge';

export function IncidentsPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    Promise.all([
      api.get<Delivery[]>('/deliveries'),
      api.get<Order[]>('/orders')
    ])
      .then(([deliveriesResponse, ordersResponse]) => {
        setDeliveries(deliveriesResponse.data);
        setOrders(ordersResponse.data);
      })
      .catch(() => {
        setDeliveries([]);
        setOrders([]);
      });
  }, []);

  const deliveryOptions = useMemo<Option[]>(
    () => [
      { value: '', label: 'Sem entrega' },
      ...deliveries.map((delivery) => ({
        value: delivery.id,
        label: `${delivery.orderNumber} - ${delivery.customerName}`
      }))
    ],
    [deliveries]
  );

  const orderOptions = useMemo<Option[]>(
    () => [
      { value: '', label: 'Sem pedido' },
      ...orders.map((order) => ({ value: order.id, label: `${order.orderNumber} - ${order.customerName}` }))
    ],
    [orders]
  );

  return (
    <CrudPage<Incident>
      title="Ocorrências"
      subtitle="Registre, classifique, priorize e acompanhe resolução de problemas operacionais."
      endpoint="/incidents"
      noun="Ocorrência"
      searchPlaceholder="Buscar por tipo, pedido ou responsável"
      initialValues={{
        deliveryId: '',
        orderId: '',
        type: 'DELIVERY_DELAY',
        priority: 'MEDIUM',
        status: 'OPEN',
        responsible: '',
        description: '',
        resolution: ''
      }}
      columns={[
        { key: 'type', label: 'Tipo', render: (row) => row.typeLabel, minWidth: 190 },
        { key: 'orderNumber', label: 'Pedido' },
        { key: 'priority', label: 'Prioridade', render: (row) => <StatusBadge status={row.priority} label={row.priorityLabel} /> },
        { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} label={row.statusLabel} /> },
        { key: 'responsible', label: 'Responsável', minWidth: 150 },
        { key: 'createdAt', label: 'Criada em', render: (row) => formatDateTime(row.createdAt), minWidth: 150 }
      ]}
      fields={[
        { key: 'deliveryId', label: 'Entrega vinculada', type: 'select', options: deliveryOptions },
        { key: 'orderId', label: 'Pedido vinculado', type: 'select', options: orderOptions },
        { key: 'type', label: 'Tipo', type: 'select', options: incidentTypeOptions, required: true },
        { key: 'priority', label: 'Prioridade', type: 'select', options: incidentPriorityOptions, required: true },
        { key: 'status', label: 'Status', type: 'select', options: incidentStatusOptions, required: true },
        { key: 'responsible', label: 'Responsável', required: true },
        { key: 'description', label: 'Descrição', type: 'textarea', required: true, xs: 12 },
        { key: 'resolution', label: 'Resolução', type: 'textarea', xs: 12 }
      ]}
      filters={[
        { key: 'status', label: 'Status', type: 'select', options: incidentStatusOptions },
        { key: 'priority', label: 'Prioridade', type: 'select', options: incidentPriorityOptions }
      ]}
      mapToForm={(row) => ({
        ...row,
        deliveryId: row.deliveryId ?? '',
        orderId: row.orderId ?? '',
        resolution: row.resolution ?? ''
      })}
      mapToPayload={(form) => ({
        deliveryId: form.deliveryId === '' ? null : Number(form.deliveryId),
        orderId: form.orderId === '' ? null : Number(form.orderId),
        type: form.type,
        priority: form.priority,
        status: form.status,
        responsible: form.responsible,
        description: form.description,
        resolution: form.resolution || null
      })}
      filterFn={(row, search, filters) => {
        const matchesSearch =
          !search ||
          row.typeLabel.toLowerCase().includes(search) ||
          row.responsible.toLowerCase().includes(search) ||
          (row.orderNumber ?? '').toLowerCase().includes(search);
        const matchesStatus = !filters.status || row.status === filters.status;
        const matchesPriority = !filters.priority || row.priority === filters.priority;
        return matchesSearch && matchesStatus && matchesPriority;
      }}
      deleteLabel="Cancelar"
    />
  );
}
