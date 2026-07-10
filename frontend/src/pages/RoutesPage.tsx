import { Card, CardContent, Grid, Skeleton, Stack, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import type { MapDelivery, RoutePlan } from '../api/types';
import { api } from '../api/client';
import { CrudPage } from '../components/CrudPage';
import { DeliveryMap } from '../components/DeliveryMap';
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
      routes.map((route) => ({
        id: route.id,
        orderNumber: route.name,
        customerName: route.destination,
        driverName: 'Rota planejada',
        status: 'IN_PROGRESS',
        statusLabel: route.statusLabel,
        progress: 50,
        currentLat: route.originLat + (route.destinationLat - route.originLat) * 0.5,
        currentLng: route.originLng + (route.destinationLng - route.originLng) * 0.5,
        originLat: route.originLat,
        originLng: route.originLng,
        destinationLat: route.destinationLat,
        destinationLng: route.destinationLng,
        color: route.color
      })),
    [routes]
  );

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" mb={2}>
          Rotas no mapa
        </Typography>
        {loading ? <Skeleton variant="rounded" height={360} /> : <DeliveryMap deliveries={mapRoutes} height={360} />}
      </CardContent>
    </Card>
  );
}

export function RoutesPage() {
  return (
    <Stack spacing={2.5}>
      <RouteMapPanel />
      <Grid container>
        <Grid item xs={12}>
          <CrudPage<RoutePlan>
            title="Rotas"
            subtitle="Crie rotas, estime distância, tempo e visualize trajetos no mapa."
            endpoint="/routes"
            noun="Rota"
            searchPlaceholder="Buscar por nome, origem ou destino"
            initialValues={{
              name: '',
              origin: 'CD LogiTrack - Vila Leopoldina',
              destination: '',
              estimatedDistanceKm: 0,
              estimatedTimeMinutes: 0,
              status: 'PLANNED',
              originLat: -23.529,
              originLng: -46.737,
              destinationLat: -23.55,
              destinationLng: -46.63,
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
              { key: 'estimatedDistanceKm', label: 'Distância estimada (km)', type: 'number', required: true },
              { key: 'estimatedTimeMinutes', label: 'Tempo estimado (min)', type: 'number', required: true },
              { key: 'originLat', label: 'Latitude origem', type: 'number', required: true },
              { key: 'originLng', label: 'Longitude origem', type: 'number', required: true },
              { key: 'destinationLat', label: 'Latitude destino', type: 'number', required: true },
              { key: 'destinationLng', label: 'Longitude destino', type: 'number', required: true },
              { key: 'color', label: 'Cor da rota', type: 'color', required: true }
            ]}
            filters={[{ key: 'status', label: 'Status', type: 'select', options: routeStatusOptions }]}
            mapToPayload={(form) => ({
              name: form.name,
              origin: form.origin,
              destination: form.destination,
              estimatedDistanceKm: Number(form.estimatedDistanceKm),
              estimatedTimeMinutes: Number(form.estimatedTimeMinutes),
              status: form.status,
              originLat: Number(form.originLat),
              originLng: Number(form.originLng),
              destinationLat: Number(form.destinationLat),
              destinationLng: Number(form.destinationLng),
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
