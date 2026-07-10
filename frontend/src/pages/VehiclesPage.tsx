import { useEffect, useMemo, useState } from 'react';
import type { Driver, Vehicle } from '../api/types';
import { api } from '../api/client';
import { CrudPage } from '../components/CrudPage';
import type { Option } from '../components/CrudPage';
import { formatCurrency } from '../components/format';
import { vehicleStatusOptions } from '../components/status';
import { StatusBadge } from '../components/StatusBadge';

export function VehiclesPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);

  useEffect(() => {
    api.get<Driver[]>('/drivers').then((response) => setDrivers(response.data)).catch(() => setDrivers([]));
  }, []);

  const driverOptions = useMemo<Option[]>(
    () => [
      { value: '', label: 'Sem motorista' },
      ...drivers.map((driver) => ({ value: driver.id, label: `${driver.name} (${driver.statusLabel})` }))
    ],
    [drivers]
  );

  return (
    <CrudPage<Vehicle>
      title="Veículos"
      subtitle="Acompanhe frota, capacidade, motorista vinculado e status operacional."
      endpoint="/vehicles"
      noun="Veículo"
      searchPlaceholder="Buscar por placa ou modelo"
      initialValues={{
        plate: '',
        model: '',
        capacityKg: 0,
        status: 'AVAILABLE',
        linkedDriverId: ''
      }}
      columns={[
        { key: 'plate', label: 'Placa' },
        { key: 'model', label: 'Modelo', minWidth: 190 },
        { key: 'capacityKg', label: 'Capacidade', render: (row) => `${Number(row.capacityKg).toLocaleString('pt-BR')} kg` },
        { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} label={row.statusLabel} /> },
        { key: 'linkedDriverName', label: 'Motorista', render: (row) => row.linkedDriverName || '-' },
        { key: 'id', label: 'Patrimônio', render: (row) => formatCurrency(row.id * 1520) }
      ]}
      fields={[
        { key: 'plate', label: 'Placa', required: true },
        { key: 'model', label: 'Modelo', required: true },
        { key: 'capacityKg', label: 'Capacidade (kg)', type: 'number', required: true },
        { key: 'status', label: 'Status', type: 'select', options: vehicleStatusOptions, required: true },
        { key: 'linkedDriverId', label: 'Motorista vinculado', type: 'select', options: driverOptions }
      ]}
      filters={[{ key: 'status', label: 'Status', type: 'select', options: vehicleStatusOptions }]}
      mapToForm={(row) => ({ ...row, linkedDriverId: row.linkedDriverId ?? '' })}
      mapToPayload={(form) => ({
        plate: form.plate,
        model: form.model,
        capacityKg: Number(form.capacityKg),
        status: form.status,
        linkedDriverId: form.linkedDriverId === '' ? null : Number(form.linkedDriverId)
      })}
      filterFn={(row, search, filters) => {
        const matchesSearch =
          !search || row.plate.toLowerCase().includes(search) || row.model.toLowerCase().includes(search);
        const matchesStatus = !filters.status || row.status === filters.status;
        return matchesSearch && matchesStatus;
      }}
      deleteLabel="Inativar"
    />
  );
}
