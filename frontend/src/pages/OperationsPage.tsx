import { Alert, Box, Button, Card, CardContent, Checkbox, Chip, FormControlLabel, Grid, MenuItem, Skeleton, Stack, TextField, Typography } from '@mui/material';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import RadarOutlinedIcon from '@mui/icons-material/RadarOutlined';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, getErrorMessage } from '../api/client';
import type { DashboardData, DeliveryStatus } from '../api/types';
import { DeliveryMap } from '../components/DeliveryMap';
import { PageHeader, SyncStatus } from '../components/data/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { deliveryStatusOptions } from '../components/status';

export function OperationsPage() {
  const [status, setStatus] = useState<string>('');
  const [route, setRoute] = useState('');
  const [driver, setDriver] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [onlyDelayed, setOnlyDelayed] = useState(false);
  const [onlyIncidents, setOnlyIncidents] = useState(false);
  const navigate = useNavigate();
  const query = useQuery({
    queryKey: ['dashboard', 'operations'],
    queryFn: async () => (await api.get<DashboardData>('/dashboard')).data,
    refetchInterval: 20_000,
    staleTime: 10_000
  });
  const mapSource = query.data?.realtimeDeliveries ?? [];
  const routeOptions = useMemo(() => [...new Set(mapSource.map((item) => item.routeName).filter(Boolean) as string[])].sort(), [mapSource]);
  const driverOptions = useMemo(() => [...new Set(mapSource.map((item) => item.driverName).filter(Boolean))].sort(), [mapSource]);
  const vehicleOptions = useMemo(() => [...new Set(mapSource.map((item) => item.vehiclePlate).filter(Boolean) as string[])].sort(), [mapSource]);
  const deliveries = useMemo(() => mapSource.filter((item) => {
    if (onlyDelayed && item.status !== 'DELAYED') return false;
    if (onlyIncidents && !item.hasOpenIncident) return false;
    if (status && item.status !== status) return false;
    if (route && item.routeName !== route) return false;
    if (driver && item.driverName !== driver) return false;
    return !vehicle || item.vehiclePlate === vehicle;
  }), [driver, mapSource, onlyDelayed, onlyIncidents, route, status, vehicle]);
  const visibleDeliveryIds = useMemo(() => new Set(deliveries.map((item) => item.id)), [deliveries]);
  const attentionQueue = useMemo(
    () => (query.data?.activeDeliveries ?? []).filter((item) => visibleDeliveryIds.has(item.id)),
    [query.data, visibleDeliveryIds]
  );

  return (
    <Stack spacing={2.25} className="page-enter">
      <PageHeader
        eyebrow="Monitoramento em tempo real"
        title="Centro operacional"
        description="Acompanhe rotas, SLAs e exceções em uma visão única atualizada automaticamente."
        icon={<RadarOutlinedIcon />}
        meta={<SyncStatus syncing={query.isFetching} label="Atualização automática a cada 20 s" />}
      />
      {query.isError ? <Alert severity="error" action={<Button color="inherit" onClick={() => query.refetch()}>Tentar novamente</Button>}>{getErrorMessage(query.error)}</Alert> : null}
      <Card>
        <CardContent sx={{ py: 1.4 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }} spacing={1.2} flexWrap="wrap" useFlexGap>
            <Stack direction="row" spacing={.75} alignItems="center"><FilterAltOutlinedIcon color="action" /><Typography fontWeight={850}>Filtros do mapa</Typography></Stack>
            <TextField select label="Status" value={status} onChange={(event) => setStatus(event.target.value)} sx={{ minWidth: 170 }}>
              <MenuItem value="">Todos os status</MenuItem>
              {deliveryStatusOptions.filter((item) => !['DELIVERED', 'CANCELED'].includes(item.value)).map((item) => <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>)}
            </TextField>
            <TextField select label="Rota" value={route} onChange={(event) => setRoute(event.target.value)} sx={{ minWidth: 170 }}>
              <MenuItem value="">Todas as rotas</MenuItem>
              {routeOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </TextField>
            <TextField select label="Motorista" value={driver} onChange={(event) => setDriver(event.target.value)} sx={{ minWidth: 170 }}>
              <MenuItem value="">Todos</MenuItem>
              {driverOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </TextField>
            <TextField select label="Veículo" value={vehicle} onChange={(event) => setVehicle(event.target.value)} sx={{ minWidth: 150 }}>
              <MenuItem value="">Todos</MenuItem>
              {vehicleOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </TextField>
            <FormControlLabel control={<Checkbox checked={onlyDelayed} onChange={(event) => setOnlyDelayed(event.target.checked)} />} label="Somente atrasadas" />
            <FormControlLabel control={<Checkbox checked={onlyIncidents} onChange={(event) => setOnlyIncidents(event.target.checked)} />} label="Com ocorrência" />
            <Chip label={`${deliveries.length} no mapa`} color="primary" variant="outlined" />
          </Stack>
        </CardContent>
      </Card>
      <Grid container spacing={2}>
        <Grid item xs={12} lg={8.5}>
          <Card sx={{ height: '100%' }}>
            {query.isLoading ? <Skeleton variant="rounded" height={620} /> : <DeliveryMap deliveries={deliveries} height={620} />}
          </Card>
        </Grid>
        <Grid item xs={12} lg={3.5}>
          <Card sx={{ height: '100%', maxHeight: { lg: 620 }, overflow: 'hidden' }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6">Fila de atenção</Typography>
              <Typography variant="body2" color="text.secondary" mb={1.5}>Ordenada pela previsão operacional</Typography>
              <Stack spacing={1} sx={{ overflowY: 'auto', pr: .5 }}>
                {attentionQueue.map((item) => (
                  <Box component="button" type="button" key={item.id} onClick={() => navigate(`/deliveries?details=${item.id}`)} sx={{ border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', borderRadius: 2, p: 1.35, textAlign: 'left', cursor: 'pointer', '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' } }}>
                    <Stack direction="row" justifyContent="space-between" gap={1}><Typography fontWeight={900}>{item.orderNumber}</Typography><Typography variant="caption" color="text.secondary">{item.expectedTime}</Typography></Stack>
                    <Typography variant="body2" color="text.secondary" noWrap>{item.customerName}</Typography>
                    <Typography variant="caption" display="block" mb={.7}>{item.driverName} • {item.routeName}</Typography>
                    <StatusBadge status={item.status as DeliveryStatus} label={item.statusLabel} />
                  </Box>
                ))}
                {!query.isLoading && !attentionQueue.length ? <Typography color="text.secondary">Nenhuma entrega corresponde aos filtros atuais.</Typography> : null}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}
