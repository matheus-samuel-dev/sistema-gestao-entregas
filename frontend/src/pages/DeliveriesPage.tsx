import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  LinearProgress,
  MenuItem,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery
} from '@mui/material';
import type { Theme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ClearIcon from '@mui/icons-material/Clear';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import FilterAltOffOutlinedIcon from '@mui/icons-material/FilterAltOffOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { api, getErrorMessage } from '../api/client';
import type { Delivery, Driver, Order, RoutePlan, Vehicle } from '../api/types';
import { EmptyState, TableSkeleton } from '../components/DataState';
import { clampPercent, formatDateTime, fromDateTimeInput, toDateTimeInput } from '../components/format';
import { deliveryStatusOptions, incidentPriorityOptions, incidentTypeOptions } from '../components/status';
import { StatusBadge } from '../components/StatusBadge';

type DeliveryForm = {
  orderId: string;
  driverId: string;
  vehicleId: string;
  routeId: string;
  origin: string;
  destination: string;
  expectedAt: string;
  status: string;
  progress: number | string;
};

type IncidentForm = {
  type: string;
  priority: string;
  responsible: string;
  description: string;
};

const emptyDeliveryForm: DeliveryForm = {
  orderId: '',
  driverId: '',
  vehicleId: '',
  routeId: '',
  origin: 'CD LogiTrack - Vila Leopoldina',
  destination: '',
  expectedAt: toDateTimeInput(),
  status: 'IN_PROGRESS',
  progress: 10
};

const emptyIncidentForm: IncidentForm = {
  type: 'DELIVERY_DELAY',
  priority: 'MEDIUM',
  responsible: 'Operações',
  description: ''
};

function isBlank(value: unknown) {
  return value === undefined || value === null || String(value).trim() === '';
}

export function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [routes, setRoutes] = useState<RoutePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState<Delivery | null>(null);
  const [incidentDelivery, setIncidentDelivery] = useState<Delivery | null>(null);
  const [editing, setEditing] = useState<Delivery | null>(null);
  const [form, setForm] = useState<DeliveryForm>(emptyDeliveryForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [incidentForm, setIncidentForm] = useState<IncidentForm>(emptyIncidentForm);
  const [incidentError, setIncidentError] = useState('');
  const [savingDelivery, setSavingDelivery] = useState(false);
  const [savingIncident, setSavingIncident] = useState(false);
  const [rowActionId, setRowActionId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

  function load() {
    setLoading(true);
    Promise.all([
      api.get<Delivery[]>('/deliveries'),
      api.get<Order[]>('/orders'),
      api.get<Driver[]>('/drivers'),
      api.get<Vehicle[]>('/vehicles'),
      api.get<RoutePlan[]>('/routes')
    ])
      .then(([deliveryRes, orderRes, driverRes, vehicleRes, routeRes]) => {
        setDeliveries(deliveryRes.data);
        setOrders(orderRes.data);
        setDrivers(driverRes.data);
        setVehicles(vehicleRes.data);
        setRoutes(routeRes.data);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  const filteredDeliveries = useMemo(() => {
    const term = search.trim().toLowerCase();
    return deliveries.filter((delivery) => {
      const matchesSearch =
        !term ||
        delivery.orderNumber.toLowerCase().includes(term) ||
        delivery.customerName.toLowerCase().includes(term) ||
        delivery.driverName.toLowerCase().includes(term) ||
        delivery.vehiclePlate.toLowerCase().includes(term);
      const matchesStatus = !status || delivery.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [deliveries, search, status]);

  const paginatedDeliveries = useMemo(
    () => filteredDeliveries.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredDeliveries, page, rowsPerPage]
  );

  function resetPaging() {
    setPage(0);
  }

  function clearFilters() {
    setSearch('');
    setStatus('');
    resetPaging();
  }

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyDeliveryForm });
    setFormErrors({});
    setFormError('');
    setFormOpen(true);
  }

  function openEdit(delivery: Delivery) {
    setEditing(delivery);
    setForm({
      orderId: String(delivery.orderId),
      driverId: String(delivery.driverId),
      vehicleId: String(delivery.vehicleId),
      routeId: delivery.routeId ? String(delivery.routeId) : '',
      origin: delivery.origin,
      destination: delivery.destination,
      expectedAt: toDateTimeInput(delivery.expectedAt),
      status: delivery.status,
      progress: delivery.progress
    });
    setFormErrors({});
    setFormError('');
    setFormOpen(true);
  }

  function updateForm(key: keyof DeliveryForm, value: string | number) {
    setForm((current) => ({ ...current, [key]: value }));
    if (formErrors[key]) {
      setFormErrors((current) => ({ ...current, [key]: '' }));
    }
  }

  function validateDeliveryForm() {
    const nextErrors: Record<string, string> = {};
    const required: Array<[keyof DeliveryForm, string]> = [
      ['orderId', 'Pedido'],
      ['driverId', 'Motorista'],
      ['vehicleId', 'Veículo'],
      ['origin', 'Origem'],
      ['destination', 'Destino'],
      ['expectedAt', 'Previsão'],
      ['status', 'Status']
    ];

    required.forEach(([key, label]) => {
      if (isBlank(form[key])) {
        nextErrors[key] = `${label} é obrigatório.`;
      }
    });

    const progress = Number(form.progress);
    if (!Number.isFinite(progress) || progress < 0 || progress > 100) {
      nextErrors.progress = 'Informe um progresso entre 0 e 100.';
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function submitDelivery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');

    if (!validateDeliveryForm()) {
      setFormError('Revise os campos destacados antes de salvar.');
      return;
    }

    const payload = {
      orderId: Number(form.orderId),
      driverId: Number(form.driverId),
      vehicleId: Number(form.vehicleId),
      routeId: form.routeId ? Number(form.routeId) : null,
      origin: form.origin,
      destination: form.destination,
      expectedAt: fromDateTimeInput(form.expectedAt),
      status: form.status,
      progress: clampPercent(Number(form.progress))
    };

    setSavingDelivery(true);
    try {
      if (editing) {
        await api.put(`/deliveries/${editing.id}`, payload);
        setMessage('Entrega atualizada com sucesso.');
      } else {
        await api.post('/deliveries', payload);
        setMessage('Entrega criada com sucesso.');
      }
      setFormOpen(false);
      load();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSavingDelivery(false);
    }
  }

  async function markDelivered(delivery: Delivery) {
    setRowActionId(delivery.id);
    try {
      await api.post(`/deliveries/${delivery.id}/mark-delivered`);
      setMessage('Entrega marcada como entregue.');
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setRowActionId(null);
    }
  }

  async function cancelDelivery(delivery: Delivery) {
    setRowActionId(delivery.id);
    try {
      await api.delete(`/deliveries/${delivery.id}`);
      setMessage('Entrega cancelada.');
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setRowActionId(null);
    }
  }

  async function submitIncident(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIncidentError('');

    if (!incidentDelivery) {
      return;
    }
    if (isBlank(incidentForm.responsible) || isBlank(incidentForm.description)) {
      setIncidentError('Informe responsável e descrição para registrar a ocorrência.');
      return;
    }

    setSavingIncident(true);
    try {
      await api.post('/incidents', {
        deliveryId: incidentDelivery.id,
        orderId: incidentDelivery.orderId,
        type: incidentForm.type,
        priority: incidentForm.priority,
        status: 'OPEN',
        responsible: incidentForm.responsible,
        description: incidentForm.description
      });
      setIncidentDelivery(null);
      setIncidentForm({ ...emptyIncidentForm });
      setMessage('Ocorrência registrada com sucesso.');
    } catch (err) {
      setIncidentError(getErrorMessage(err));
    } finally {
      setSavingIncident(false);
    }
  }

  function deliveryActions(delivery: Delivery, compact = false) {
    const busy = rowActionId === delivery.id;
    return (
      <Stack direction="row" spacing={0.5} justifyContent={compact ? 'flex-start' : 'flex-end'} flexWrap="wrap" useFlexGap>
        <Tooltip title="Detalhes">
          <IconButton aria-label={`Detalhes ${delivery.orderNumber}`} onClick={() => setDetailsOpen(delivery)} size="small">
            <VisibilityOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Editar">
          <IconButton aria-label={`Editar ${delivery.orderNumber}`} onClick={() => openEdit(delivery)} size="small">
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Registrar ocorrência">
          <IconButton aria-label={`Registrar ocorrência ${delivery.orderNumber}`} onClick={() => setIncidentDelivery(delivery)} size="small">
            <ReportProblemOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Marcar como entregue">
          <IconButton
            aria-label={`Marcar ${delivery.orderNumber} como entregue`}
            color="success"
            onClick={() => markDelivered(delivery)}
            disabled={busy}
            size="small"
          >
            {busy ? <CircularProgress color="inherit" size={16} /> : <CheckCircleOutlineIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
        <Tooltip title="Cancelar entrega">
          <IconButton
            aria-label={`Cancelar entrega ${delivery.orderNumber}`}
            color="error"
            onClick={() => cancelDelivery(delivery)}
            disabled={busy}
            size="small"
          >
            <EventNoteOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
    );
  }

  function deliveryCard(delivery: Delivery, index: number) {
    return (
      <Card key={delivery.id} className="soft-card stagger-item" sx={{ animationDelay: `${index * 35}ms` }}>
        <CardContent>
          <Stack spacing={1.3}>
            <Stack direction="row" justifyContent="space-between" gap={2} alignItems="flex-start">
              <Box minWidth={0}>
                <Typography fontWeight={900}>{delivery.orderNumber}</Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {delivery.customerName}
                </Typography>
              </Box>
              <StatusBadge status={delivery.status} label={delivery.statusLabel} />
            </Stack>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary" fontWeight={850}>
                  Motorista
                </Typography>
                <Typography variant="body2" noWrap>
                  {delivery.driverName}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary" fontWeight={850}>
                  Veículo
                </Typography>
                <Typography variant="body2">{delivery.vehiclePlate}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary" fontWeight={850}>
                  Destino
                </Typography>
                <Typography variant="body2" noWrap>
                  {delivery.destination}
                </Typography>
              </Grid>
            </Grid>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="caption" fontWeight={850} minWidth={34}>
                {delivery.progress}%
              </Typography>
              <LinearProgress variant="determinate" value={delivery.progress} sx={{ flex: 1, height: 8 }} />
            </Stack>
            {deliveryActions(delivery, true)}
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Stack spacing={2.5} className="page-enter">
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ md: 'center' }}>
        <Box>
          <Typography variant="h5">Entregas</Typography>
          <Typography color="text.secondary">
            Atribua motoristas, veículos, rotas, acompanhe progresso e registre ocorrências.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Tooltip title="Atualizar dados">
            <IconButton aria-label="Atualizar entregas" onClick={load} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Nova entrega
          </Button>
        </Stack>
      </Stack>

      <Card className="soft-card">
        <CardContent>
          <Grid container spacing={1.5} alignItems="center">
            <Grid item xs={12} md={7}>
              <TextField
                fullWidth
                aria-label="Buscar entregas"
                placeholder="Buscar por pedido, cliente, motorista ou veículo"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  resetPaging();
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: search ? (
                    <InputAdornment position="end">
                      <Tooltip title="Limpar busca">
                        <IconButton aria-label="Limpar busca" size="small" onClick={() => setSearch('')}>
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ) : undefined
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                label="Status"
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value);
                  resetPaging();
                }}
              >
                <MenuItem value="">Todos</MenuItem>
                {deliveryStatusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterAltOffOutlinedIcon />}
                onClick={clearFilters}
                disabled={!search && !status}
              >
                Limpar
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {loading ? (
        <TableSkeleton rows={8} columns={8} />
      ) : filteredDeliveries.length === 0 ? (
        <EmptyState
          title="Nenhuma entrega encontrada"
          description="Ajuste os filtros aplicados ou crie uma nova entrega para acompanhar a operação."
          actionLabel="Nova entrega"
          onAction={openCreate}
        />
      ) : isMobile ? (
        <Stack spacing={1.5}>
          {paginatedDeliveries.map(deliveryCard)}
          <TablePagination
            component="div"
            count={filteredDeliveries.length}
            page={page}
            onPageChange={(_, nextPage) => setPage(nextPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(Number(event.target.value));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 8, 15]}
            labelRowsPerPage="Itens por página"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          />
        </Stack>
      ) : (
        <Card className="soft-card">
          <Box sx={{ overflowX: 'auto' }}>
            <Table aria-label="Lista de entregas">
              <TableHead>
                <TableRow>
                  <TableCell>Pedido</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Motorista</TableCell>
                  <TableCell>Veículo</TableCell>
                  <TableCell>Rota</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Progresso</TableCell>
                  <TableCell>Previsão</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedDeliveries.map((delivery) => (
                  <TableRow hover key={delivery.id}>
                    <TableCell sx={{ fontWeight: 850 }}>{delivery.orderNumber}</TableCell>
                    <TableCell>{delivery.customerName}</TableCell>
                    <TableCell>{delivery.driverName}</TableCell>
                    <TableCell>{delivery.vehiclePlate}</TableCell>
                    <TableCell>{delivery.routeName ?? '-'}</TableCell>
                    <TableCell>
                      <StatusBadge status={delivery.status} label={delivery.statusLabel} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 150 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="caption" fontWeight={850} minWidth={34}>
                          {delivery.progress}%
                        </Typography>
                        <LinearProgress variant="determinate" value={delivery.progress} sx={{ flex: 1, height: 7 }} />
                      </Stack>
                    </TableCell>
                    <TableCell>{formatDateTime(delivery.expectedAt)}</TableCell>
                    <TableCell align="right">{deliveryActions(delivery)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
          <TablePagination
            component="div"
            count={filteredDeliveries.length}
            page={page}
            onPageChange={(_, nextPage) => setPage(nextPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(Number(event.target.value));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 8, 15, 25]}
            labelRowsPerPage="Itens por página"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          />
        </Card>
      )}

      <Dialog open={formOpen} onClose={() => (savingDelivery ? undefined : setFormOpen(false))} maxWidth="md" fullWidth>
        <Box component="form" onSubmit={submitDelivery}>
          <DialogTitle>{editing ? 'Editar entrega' : 'Nova entrega'}</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2} pt={0.5}>
              {formError ? <Alert severity="error">{formError}</Alert> : null}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    required
                    autoFocus
                    label="Pedido"
                    value={form.orderId}
                    error={Boolean(formErrors.orderId)}
                    helperText={formErrors.orderId || ' '}
                    onChange={(event) => updateForm('orderId', event.target.value)}
                  >
                    {orders.map((order) => (
                      <MenuItem key={order.id} value={order.id}>
                        {order.orderNumber} - {order.customerName}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    required
                    label="Motorista"
                    value={form.driverId}
                    error={Boolean(formErrors.driverId)}
                    helperText={formErrors.driverId || ' '}
                    onChange={(event) => updateForm('driverId', event.target.value)}
                  >
                    {drivers.map((driver) => (
                      <MenuItem key={driver.id} value={driver.id}>
                        {driver.name} ({driver.statusLabel})
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    required
                    label="Veículo"
                    value={form.vehicleId}
                    error={Boolean(formErrors.vehicleId)}
                    helperText={formErrors.vehicleId || ' '}
                    onChange={(event) => updateForm('vehicleId', event.target.value)}
                  >
                    {vehicles.map((vehicle) => (
                      <MenuItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.plate} - {vehicle.model} ({vehicle.statusLabel})
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Rota"
                    value={form.routeId}
                    helperText=" "
                    onChange={(event) => updateForm('routeId', event.target.value)}
                  >
                    <MenuItem value="">Sem rota</MenuItem>
                    {routes.map((route) => (
                      <MenuItem key={route.id} value={route.id}>
                        {route.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Origem"
                    value={form.origin}
                    error={Boolean(formErrors.origin)}
                    helperText={formErrors.origin || ' '}
                    onChange={(event) => updateForm('origin', event.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Destino"
                    value={form.destination}
                    error={Boolean(formErrors.destination)}
                    helperText={formErrors.destination || ' '}
                    onChange={(event) => updateForm('destination', event.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    required
                    type="datetime-local"
                    label="Previsão"
                    InputLabelProps={{ shrink: true }}
                    value={form.expectedAt}
                    error={Boolean(formErrors.expectedAt)}
                    helperText={formErrors.expectedAt || ' '}
                    onChange={(event) => updateForm('expectedAt', event.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    select
                    fullWidth
                    required
                    label="Status"
                    value={form.status}
                    error={Boolean(formErrors.status)}
                    helperText={formErrors.status || ' '}
                    onChange={(event) => updateForm('status', event.target.value)}
                  >
                    {deliveryStatusOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    required
                    type="number"
                    label="Progresso (%)"
                    inputProps={{ min: 0, max: 100 }}
                    value={form.progress}
                    error={Boolean(formErrors.progress)}
                    helperText={formErrors.progress || ' '}
                    onChange={(event) => updateForm('progress', event.target.value)}
                  />
                </Grid>
              </Grid>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFormOpen(false)} disabled={savingDelivery}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={savingDelivery}
              startIcon={savingDelivery ? <CircularProgress color="inherit" size={16} /> : undefined}
            >
              {savingDelivery ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog open={Boolean(detailsOpen)} onClose={() => setDetailsOpen(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Timeline da entrega</DialogTitle>
        <DialogContent dividers>
          {detailsOpen ? (
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between" gap={2} alignItems="flex-start">
                <Box minWidth={0}>
                  <Typography variant="h6">{detailsOpen.orderNumber}</Typography>
                  <Typography color="text.secondary">{detailsOpen.customerName}</Typography>
                </Box>
                <StatusBadge status={detailsOpen.status} label={detailsOpen.statusLabel} />
              </Stack>
              {detailsOpen.timeline.length ? (
                <Stack spacing={1.5}>
                  {detailsOpen.timeline.map((item) => (
                    <Stack key={item.id} direction="row" spacing={1.5}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'primary.main', mt: 0.8, flex: '0 0 auto' }} />
                      <Box minWidth={0}>
                        <Typography fontWeight={900}>{item.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDateTime(item.timestamp)}
                        </Typography>
                      </Box>
                    </Stack>
                  ))}
                </Stack>
              ) : (
                <EmptyState title="Sem eventos na timeline" description="Atualizações operacionais desta entrega aparecerão aqui." />
              )}
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(null)}>Fechar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(incidentDelivery)} onClose={() => (savingIncident ? undefined : setIncidentDelivery(null))} maxWidth="sm" fullWidth>
        <Box component="form" onSubmit={submitIncident}>
          <DialogTitle>Registrar ocorrência</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2} pt={0.5}>
              {incidentError ? <Alert severity="error">{incidentError}</Alert> : null}
              <Alert severity="info" icon={false}>
                {incidentDelivery?.orderNumber} - {incidentDelivery?.customerName}
              </Alert>
              <TextField select fullWidth label="Tipo" value={incidentForm.type} onChange={(event) => setIncidentForm({ ...incidentForm, type: event.target.value })}>
                {incidentTypeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField select fullWidth label="Prioridade" value={incidentForm.priority} onChange={(event) => setIncidentForm({ ...incidentForm, priority: event.target.value })}>
                {incidentPriorityOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField fullWidth required label="Responsável" value={incidentForm.responsible} onChange={(event) => setIncidentForm({ ...incidentForm, responsible: event.target.value })} />
              <TextField
                fullWidth
                required
                multiline
                minRows={4}
                label="Descrição"
                value={incidentForm.description}
                onChange={(event) => setIncidentForm({ ...incidentForm, description: event.target.value })}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIncidentDelivery(null)} disabled={savingIncident}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={savingIncident}
              startIcon={savingIncident ? <CircularProgress color="inherit" size={16} /> : undefined}
            >
              {savingIncident ? 'Registrando...' : 'Registrar'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Snackbar open={Boolean(message)} autoHideDuration={3200} onClose={() => setMessage('')}>
        <Alert severity="success" variant="filled" onClose={() => setMessage('')}>
          {message}
        </Alert>
      </Snackbar>
      <Snackbar open={Boolean(error)} autoHideDuration={4200} onClose={() => setError('')}>
        <Alert severity="error" variant="filled" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
