import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  LinearProgress,
  MenuItem,
  Skeleton,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery
} from '@mui/material';
import type { Theme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { api, getErrorMessage } from '../api/client';
import type { Delivery, Driver, Order, RoutePlan, Vehicle } from '../api/types';
import { EmptyState } from '../components/DataState';
import { formatDateTime, fromDateTimeInput, toDateTimeInput } from '../components/format';
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
  const [incidentForm, setIncidentForm] = useState<IncidentForm>(emptyIncidentForm);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
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

  function openCreate() {
    setEditing(null);
    setForm(emptyDeliveryForm);
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
    setFormOpen(true);
  }

  async function submitDelivery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = {
      orderId: Number(form.orderId),
      driverId: Number(form.driverId),
      vehicleId: Number(form.vehicleId),
      routeId: form.routeId ? Number(form.routeId) : null,
      origin: form.origin,
      destination: form.destination,
      expectedAt: fromDateTimeInput(form.expectedAt),
      status: form.status,
      progress: Number(form.progress)
    };

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
      setError(getErrorMessage(err));
    }
  }

  async function markDelivered(delivery: Delivery) {
    try {
      await api.post(`/deliveries/${delivery.id}/mark-delivered`);
      setMessage('Entrega marcada como entregue.');
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function cancelDelivery(delivery: Delivery) {
    try {
      await api.delete(`/deliveries/${delivery.id}`);
      setMessage('Entrega cancelada.');
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function submitIncident(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!incidentDelivery) {
      return;
    }
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
      setIncidentForm(emptyIncidentForm);
      setMessage('Ocorrência registrada com sucesso.');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  function deliveryCard(delivery: Delivery) {
    return (
      <Card key={delivery.id}>
        <CardContent>
          <Stack spacing={1.2}>
            <Stack direction="row" justifyContent="space-between" gap={2}>
              <Box minWidth={0}>
                <Typography fontWeight={900}>{delivery.orderNumber}</Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {delivery.customerName}
                </Typography>
              </Box>
              <StatusBadge status={delivery.status} label={delivery.statusLabel} />
            </Stack>
            <Typography variant="body2">Motorista: {delivery.driverName}</Typography>
            <Typography variant="body2">Veículo: {delivery.vehiclePlate}</Typography>
            <Typography variant="body2">Destino: {delivery.destination}</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="caption" fontWeight={800}>
                {delivery.progress}%
              </Typography>
              <LinearProgress variant="determinate" value={delivery.progress} sx={{ flex: 1, height: 8, borderRadius: 2 }} />
            </Stack>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button size="small" startIcon={<VisibilityOutlinedIcon />} onClick={() => setDetailsOpen(delivery)}>
                Detalhes
              </Button>
              <Button size="small" startIcon={<EditOutlinedIcon />} onClick={() => openEdit(delivery)}>
                Editar
              </Button>
              <Button size="small" startIcon={<ReportProblemOutlinedIcon />} onClick={() => setIncidentDelivery(delivery)}>
                Ocorrência
              </Button>
              <Button size="small" color="success" startIcon={<CheckCircleOutlineIcon />} onClick={() => markDelivered(delivery)}>
                Entregue
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Stack spacing={2.5}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ md: 'center' }}>
        <Box>
          <Typography variant="h5">Entregas</Typography>
          <Typography color="text.secondary">
            Atribua motoristas, veículos, rotas, acompanhe progresso e registre ocorrências.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Atualizar">
            <IconButton aria-label="Atualizar entregas" onClick={load}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Nova entrega
          </Button>
        </Stack>
      </Stack>

      <Card>
        <CardContent>
          <Grid container spacing={1.5}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                size="small"
                aria-label="Buscar entregas"
                placeholder="Buscar por pedido, cliente, motorista ou veículo"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                size="small"
                label="Status"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                {deliveryStatusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent>
            <Stack spacing={1}>
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} height={44} />
              ))}
            </Stack>
          </CardContent>
        </Card>
      ) : filteredDeliveries.length === 0 ? (
        <EmptyState title="Nenhuma entrega encontrada" description="Ajuste os filtros ou crie uma nova entrega." />
      ) : isMobile ? (
        <Stack spacing={1.5}>{filteredDeliveries.map(deliveryCard)}</Stack>
      ) : (
        <Card>
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
                {filteredDeliveries.map((delivery) => (
                  <TableRow hover key={delivery.id}>
                    <TableCell>{delivery.orderNumber}</TableCell>
                    <TableCell>{delivery.customerName}</TableCell>
                    <TableCell>{delivery.driverName}</TableCell>
                    <TableCell>{delivery.vehiclePlate}</TableCell>
                    <TableCell>{delivery.routeName ?? '-'}</TableCell>
                    <TableCell>
                      <StatusBadge status={delivery.status} label={delivery.statusLabel} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 140 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="caption" fontWeight={800}>
                          {delivery.progress}%
                        </Typography>
                        <LinearProgress variant="determinate" value={delivery.progress} sx={{ flex: 1, height: 7, borderRadius: 2 }} />
                      </Stack>
                    </TableCell>
                    <TableCell>{formatDateTime(delivery.expectedAt)}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Detalhes">
                        <IconButton aria-label={`Detalhes ${delivery.orderNumber}`} onClick={() => setDetailsOpen(delivery)}>
                          <VisibilityOutlinedIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton aria-label={`Editar ${delivery.orderNumber}`} onClick={() => openEdit(delivery)}>
                          <EditOutlinedIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Registrar ocorrência">
                        <IconButton aria-label={`Registrar ocorrência ${delivery.orderNumber}`} onClick={() => setIncidentDelivery(delivery)}>
                          <ReportProblemOutlinedIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Marcar como entregue">
                        <IconButton aria-label={`Marcar ${delivery.orderNumber} como entregue`} color="success" onClick={() => markDelivered(delivery)}>
                          <CheckCircleOutlineIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Cancelar entrega">
                        <IconButton aria-label={`Cancelar entrega ${delivery.orderNumber}`} color="error" onClick={() => cancelDelivery(delivery)}>
                          <EventNoteOutlinedIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Card>
      )}

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="md" fullWidth>
        <Box component="form" onSubmit={submitDelivery}>
          <DialogTitle>{editing ? 'Editar entrega' : 'Nova entrega'}</DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2} pt={0.5}>
              <Grid item xs={12} sm={6}>
                <TextField select fullWidth required label="Pedido" value={form.orderId} onChange={(event) => setForm({ ...form, orderId: event.target.value })}>
                  {orders.map((order) => (
                    <MenuItem key={order.id} value={order.id}>
                      {order.orderNumber} - {order.customerName}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField select fullWidth required label="Motorista" value={form.driverId} onChange={(event) => setForm({ ...form, driverId: event.target.value })}>
                  {drivers.map((driver) => (
                    <MenuItem key={driver.id} value={driver.id}>
                      {driver.name} ({driver.statusLabel})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField select fullWidth required label="Veículo" value={form.vehicleId} onChange={(event) => setForm({ ...form, vehicleId: event.target.value })}>
                  {vehicles.map((vehicle) => (
                    <MenuItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.plate} - {vehicle.model} ({vehicle.statusLabel})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField select fullWidth label="Rota" value={form.routeId} onChange={(event) => setForm({ ...form, routeId: event.target.value })}>
                  <MenuItem value="">Sem rota</MenuItem>
                  {routes.map((route) => (
                    <MenuItem key={route.id} value={route.id}>
                      {route.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth required label="Origem" value={form.origin} onChange={(event) => setForm({ ...form, origin: event.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth required label="Destino" value={form.destination} onChange={(event) => setForm({ ...form, destination: event.target.value })} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  required
                  type="datetime-local"
                  label="Previsão"
                  InputLabelProps={{ shrink: true }}
                  value={form.expectedAt}
                  onChange={(event) => setForm({ ...form, expectedAt: event.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField select fullWidth required label="Status" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
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
                  value={form.progress}
                  onChange={(event) => setForm({ ...form, progress: event.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFormOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="contained">
              Salvar
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog open={Boolean(detailsOpen)} onClose={() => setDetailsOpen(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Timeline da entrega</DialogTitle>
        <DialogContent dividers>
          {detailsOpen ? (
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between">
                <Box>
                  <Typography variant="h6">{detailsOpen.orderNumber}</Typography>
                  <Typography color="text.secondary">{detailsOpen.customerName}</Typography>
                </Box>
                <StatusBadge status={detailsOpen.status} label={detailsOpen.statusLabel} />
              </Stack>
              <Stack spacing={1.5}>
                {detailsOpen.timeline.map((item) => (
                  <Stack key={item.id} direction="row" spacing={1.5}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'primary.main', mt: 0.8 }} />
                    <Box>
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
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(null)}>Fechar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(incidentDelivery)} onClose={() => setIncidentDelivery(null)} maxWidth="sm" fullWidth>
        <Box component="form" onSubmit={submitIncident}>
          <DialogTitle>Registrar ocorrência</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2} pt={0.5}>
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
                minRows={3}
                label="Descrição"
                value={incidentForm.description}
                onChange={(event) => setIncidentForm({ ...incidentForm, description: event.target.value })}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIncidentDelivery(null)}>Cancelar</Button>
            <Button type="submit" variant="contained">
              Registrar
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
