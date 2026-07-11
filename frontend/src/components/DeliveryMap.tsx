import { Box, Dialog, DialogContent, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import L from 'leaflet';
import { useMemo, useState } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet';
import type { MapDelivery } from '../api/types';
import { StatusBadge } from './StatusBadge';

interface DeliveryMapProps {
  deliveries: MapDelivery[];
  height?: number | string;
}

function createIcon(color: string) {
  return L.divIcon({
    className: '',
    html: `<div class="delivery-marker" style="background:${color}">&#8599;</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });
}

function MapBody({ deliveries, height = 440 }: DeliveryMapProps) {
  const center = useMemo<[number, number]>(() => {
    if (!deliveries.length) {
      return [-23.55052, -46.63331];
    }
    const lat = deliveries.reduce((sum, item) => sum + item.currentLat, 0) / deliveries.length;
    const lng = deliveries.reduce((sum, item) => sum + item.currentLng, 0) / deliveries.length;
    return [lat, lng];
  }, [deliveries]);

  return (
    <Box sx={{ height, position: 'relative' }}>
      <MapContainer center={center} zoom={11} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {deliveries.map((delivery) => (
          <Marker
            key={delivery.id}
            position={[delivery.currentLat, delivery.currentLng]}
            icon={createIcon(delivery.color)}
          >
            <Popup>
              <Stack spacing={0.6}>
                <Typography fontWeight={850}>{delivery.orderNumber}</Typography>
                <Typography variant="body2">{delivery.customerName}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Motorista: {delivery.driverName}
                </Typography>
                <StatusBadge status={delivery.status} label={delivery.statusLabel} />
                <Typography variant="caption">Progresso: {delivery.progress}%</Typography>
              </Stack>
            </Popup>
          </Marker>
        ))}
        {deliveries.map((delivery) => (
          <Polyline
            key={`route-${delivery.id}`}
            positions={[
              [delivery.originLat, delivery.originLng],
              [delivery.currentLat, delivery.currentLng],
              [delivery.destinationLat, delivery.destinationLng]
            ]}
            pathOptions={{ color: delivery.color, weight: 5, opacity: 0.82 }}
          />
        ))}
      </MapContainer>
      {deliveries.length ? (
        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          sx={{
            position: 'absolute',
            left: 12,
            right: 12,
            bottom: 12,
            zIndex: 500,
            bgcolor: 'rgba(255,255,255,0.94)',
            border: '1px solid #e6ecea',
            borderRadius: 2,
            px: 1.2,
            py: 1,
            boxShadow: '0 10px 26px rgba(15,23,42,0.12)'
          }}
        >
          {deliveries.slice(0, 5).map((delivery) => (
            <Stack key={`legend-${delivery.id}`} direction="row" spacing={0.8} alignItems="center">
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: delivery.color }} />
              <Typography variant="caption" fontWeight={850}>
                {delivery.statusLabel}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {delivery.progress}%
              </Typography>
            </Stack>
          ))}
        </Stack>
      ) : null}
    </Box>
  );
}

export function DeliveryMap({ deliveries, height = 440 }: DeliveryMapProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <Box sx={{ position: 'relative' }}>
        <Tooltip title="Expandir mapa">
          <IconButton
            aria-label="Expandir mapa"
            onClick={() => setExpanded(true)}
            className="no-print"
            sx={{
              position: 'absolute',
              right: 12,
              top: 12,
              zIndex: 600,
              bgcolor: '#fff',
              boxShadow: '0 8px 20px rgba(15,23,42,0.14)',
              '&:hover': { bgcolor: '#f8fafc' }
            }}
          >
            <FullscreenIcon />
          </IconButton>
        </Tooltip>
        <MapBody deliveries={deliveries} height={height} />
      </Box>
      <Dialog fullScreen open={expanded} onClose={() => setExpanded(false)}>
        <DialogContent sx={{ p: 2, bgcolor: '#f5f8f7' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Box>
              <Typography variant="h5">Entregas em tempo real</Typography>
              <Typography color="text.secondary">Rotas e marcadores ativos em São Paulo</Typography>
            </Box>
            <IconButton aria-label="Fechar mapa expandido" onClick={() => setExpanded(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>
          <MapBody deliveries={deliveries} height="calc(100vh - 116px)" />
        </DialogContent>
      </Dialog>
    </>
  );
}
