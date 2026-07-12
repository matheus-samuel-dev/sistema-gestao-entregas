import { LinearProgress, Stack, Typography } from '@mui/material';
import type { Driver } from '../api/types';
import { CrudPage } from '../components/CrudPage';
import { driverStatusOptions } from '../components/status';
import { StatusBadge } from '../components/StatusBadge';

export function DriversPage() {
  const editableStatusOptions = driverStatusOptions.map((option) => ({
    ...option,
    disabled: option.value === 'ON_ROUTE'
  }));

  return (
    <CrudPage<Driver>
      title="Motoristas"
      subtitle="Controle disponibilidade, veículo atual, entregas concluídas e desempenho."
      endpoint="/drivers"
      noun="Motorista"
      searchPlaceholder="Buscar por nome, telefone ou CNH"
      createLabel="Adicionar motorista"
      saveLabel="Salvar motorista"
      updateLabel="Salvar motorista"
      confirmDescription="O motorista será inativado e não poderá receber novas entregas. O histórico será preservado."
      initialValues={{
        name: '',
        phone: '',
        licenseNumber: '',
        status: 'AVAILABLE',
      }}
      columns={[
        { key: 'name', label: 'Nome', minWidth: 180 },
        { key: 'phone', label: 'Telefone' },
        { key: 'licenseNumber', label: 'CNH' },
        { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} label={row.statusLabel} /> },
        { key: 'currentVehicle', label: 'Veículo atual', render: (row) => row.currentVehicle || '-' },
        { key: 'deliveriesCompleted', label: 'Concluídas' },
        {
          key: 'successRate',
          label: 'Taxa',
          render: (row) => (
            <Stack direction="row" spacing={1} alignItems="center" minWidth={130}>
              <Typography variant="body2" fontWeight={850}>
                {Number(row.successRate).toFixed(1)}%
              </Typography>
              <LinearProgress variant="determinate" value={Number(row.successRate)} sx={{ flex: 1, height: 7 }} />
            </Stack>
          )
        }
      ]}
      fields={[
        { key: 'name', label: 'Nome', required: true },
        { key: 'phone', label: 'Telefone', required: true, mask: 'phone' },
        { key: 'licenseNumber', label: 'CNH', required: true },
        { key: 'status', label: 'Status', type: 'select', options: editableStatusOptions, required: true },
      ]}
      filters={[{ key: 'status', label: 'Status', type: 'select', options: driverStatusOptions }]}
      mapToPayload={(form) => ({
        name: form.name,
        phone: form.phone,
        licenseNumber: form.licenseNumber,
        status: form.status,
        currentVehicle: null,
        deliveriesCompleted: null,
        successRate: null
      })}
      filterFn={(row, search, filters) => {
        const matchesSearch =
          !search ||
          row.name.toLowerCase().includes(search) ||
          row.phone.toLowerCase().includes(search) ||
          row.licenseNumber.toLowerCase().includes(search);
        const matchesStatus = !filters.status || row.status === filters.status;
        return matchesSearch && matchesStatus;
      }}
      deleteLabel="Inativar"
    />
  );
}
