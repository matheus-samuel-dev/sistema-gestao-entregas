import { Card, CardContent, Grid, Skeleton, Stack, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import type { MapDelivery, RoutePlan } from '../api/types';
import { api } from '../api/client';
import { CrudPage } from '../components/CrudPage';
import { DeliveryMap } from '../components/DeliveryMap';
import { EmptyState } from '../components/DataState';
import { routeStatusOptions } from '../components/status';
import { StatusBadge } from '../components/StatusBadge';

function RouteMapPanel() {
  const [routes, setRoutes] = useState<RoutePlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<RoutePlan[]>('/routes')
      .then((response) => setRoutes(response.data))
      .finally(() => setLoading(false));
  }, []);

  const mapRoutes = useMemo<MapDelivery[]>(
    () =>
      routes.filter((route) => route.originLat != null && route.originLng != null && route.destinationLat != null && route.destinationLng != null).map((route) => ({
        id: route.id,
        orderNumber: route.name,
        customerName: route.destination,
        driverName: 'Trajeto calculado pelo LogiTrack',
        status: route.status === 'CANCELED' ? 'CANCELED' : route.status === 'COMPLETED' ? 'DELIVERED' : 'IN_PROGRESS',
        statusLabel: route.statusLabel,
        progress: route.status === 'COMPLETED' ? 100 : route.status === 'ACTIVE' ? 50 : 0,
        currentLat: route.originLat! + (route.destinationLat! - route.originLat!) * 0.5,
        currentLng: route.originLng! + (route.destinationLng! - route.originLng!) * 0.5,
        originLat: route.originLat!,
        originLng: route.originLng!,
        destinationLat: route.destinationLat!,
        destinationLng: route.destinationLng!,
        color: route.color,
        legendLabel: route.name
      })),
    [routes]
  );

  return (
    <Card className="soft-card">
      <CardContent>
        <Typography variant="h6" mb={2}>
          Rotas no mapa
        </Typography>
        {loading ? (
          <Skeleton variant="rounded" height={360} />
        ) : mapRoutes.length ? (
          <DeliveryMap deliveries={mapRoutes} height={360} />
        ) : (
          <EmptyState title="Nenhuma rota no mapa" description="Crie uma rota para visualizar o trajeto operacional." />
        )}
      </CardContent>
    </Card>
  );
}

export function RoutesPage() {
  return (
    <Stack spacing={2.5} className="page-enter">
      <RouteMapPanel />
      <Grid container>
        <Grid item xs={12}>
          <CrudPage<RoutePlan>
            title="Rotas"
            subtitle="Crie rotas, estime distância, tempo e visualize trajetos no mapa."
            endpoint="/routes"
            noun="Rota"
            searchPlaceholder="Buscar por nome, origem ou destino"
            createLabel="Criar rota"
            saveLabel="Salvar rota"
            updateLabel="Salvar rota"
            confirmDescription="A rota será cancelada e não poderá receber novas entregas. O histórico será preservado."
            initialValues={{
              name: '',
              origin: 'CD LogiTrack - Vila Leopoldina',
              destination: '',
              status: 'PLANNED',
              color: '#10b981'
            }}
            columns={[
              { key: 'name', label: 'Rota', minWidth: 180 },
              { key: 'origin', label: 'Origem', minWidth: 180 },
              { key: 'destination', label: 'Destino', minWidth: 180 },
              { key: 'estimatedDistanceKm', label: 'Distância', render: (row) => `${row.estimatedDistanceKm} km` },
              { key: 'estimatedTimeMinutes', label: 'Tempo', render: (row) => `${row.estimatedTimeMinutes} min` },
              { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} label={row.statusLabel} /> }
            ]}
            fields={[
              { key: 'name', label: 'Nome', required: true },
              { key: 'status', label: 'Status', type: 'select', options: routeStatusOptions, required: true },
              { key: 'origin', label: 'Origem', required: true },
              { key: 'destination', label: 'Destino', required: true },
              { key: 'color', label: 'Cor da rota', type: 'color', required: true }
            ]}
            filters={[{ key: 'status', label: 'Status', type: 'select', options: routeStatusOptions }]}
            mapToPayload={(form) => ({
              name: form.name,
              origin: form.origin,
              destination: form.destination,
              status: form.status,
              color: form.color
            })}
            filterFn={(row, search, filters) => {
              const matchesSearch =
                !search ||
                row.name.toLowerCase().includes(search) ||
                row.origin.toLowerCase().includes(search) ||
                row.destination.toLowerCase().includes(search);
              const matchesStatus = !filters.status || row.status === filters.status;
              return matchesSearch && matchesStatus;
            }}
            deleteLabel="Cancelar"
          />
        </Grid>
      </Grid>
    </Stack>
  );
}
