import {
  Box,
  Card,
  CardContent,
  Grid,
  IconButton,
  LinearProgress,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography
} from '@mui/material';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis
} from 'recharts';
import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { DashboardData, MetricCardData } from '../api/types';
import { DeliveryMap } from '../components/DeliveryMap';
import { EmptyState } from '../components/DataState';
import { MetricCard } from '../components/MetricCard';
import { StatusBadge } from '../components/StatusBadge';

const iconByMetric: Record<string, { icon: JSX.Element; tone: string }> = {
  ordersToday: { icon: <AssignmentTurnedInOutlinedIcon />, tone: '#10b981' },
  activeDeliveries: { icon: <LocalShippingOutlinedIcon />, tone: '#2563eb' },
  completedDeliveries: { icon: <CheckCircleOutlinedIcon />, tone: '#10b981' },
  openIncidents: { icon: <ErrorOutlineOutlinedIcon />, tone: '#f59e0b' },
  successRate: { icon: <TimelineOutlinedIcon />, tone: '#8b5cf6' }
};

function MetricSkeleton() {
  return (
    <Card>
      <CardContent>
        <Stack spacing={1.5}>
          <Skeleton width="60%" />
          <Skeleton width="40%" height={42} />
          <Skeleton width="50%" />
        </Stack>
      </CardContent>
    </Card>
  );
}

function metricVisual(metric: MetricCardData) {
  return iconByMetric[metric.key] ?? iconByMetric.ordersToday;
}

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  function load() {
    setLoading(true);
    setError(false);
    api
      .get<DashboardData>('/dashboard')
      .then((response) => setData(response.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  if (error) {
    return <EmptyState title="Dashboard indisponível" description="Verifique se a API está rodando." onRetry={load} />;
  }

  return (
    <Stack spacing={2.5}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            md: 'repeat(3, minmax(0, 1fr))',
            xl: 'repeat(5, minmax(0, 1fr))'
          },
          gap: 2
        }}
      >
        {loading
          ? Array.from({ length: 5 }).map((_, index) => (
              <MetricSkeleton key={index} />
            ))
          : data?.metrics.map((metric) => {
              const visual = metricVisual(metric);
              return (
                <MetricCard key={metric.key} metric={metric} icon={visual.icon} tone={visual.tone} />
              );
            })}
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} xl={8}>
          <Card>
            <CardContent sx={{ pb: 1.5 }}>
              <Typography variant="h6" mb={2}>
                Entregas em tempo real
              </Typography>
              {loading || !data ? <Skeleton variant="rounded" height={440} /> : <DeliveryMap deliveries={data.realtimeDeliveries} />}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} xl={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" mb={2}>
                Entregas por status
              </Typography>
              {loading || !data ? (
                <Skeleton variant="rounded" height={260} />
              ) : (
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                  <Box width={{ xs: '100%', sm: 220 }} height={230}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={data.deliveriesByStatus}
                          dataKey="value"
                          nameKey="label"
                          innerRadius={58}
                          outerRadius={92}
                          paddingAngle={2}
                        >
                          {data.deliveriesByStatus.map((entry) => (
                            <Cell key={entry.label} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                  <Stack spacing={1.1} flex={1} width="100%">
                    {data.deliveriesByStatus.map((slice) => (
                      <Stack direction="row" spacing={1} alignItems="center" key={slice.label}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: slice.color }} />
                        <Typography variant="body2" flex={1}>
                          {slice.label}
                        </Typography>
                        <Typography variant="body2" fontWeight={800}>
                          {slice.value}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} xl={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Próximas entregas</Typography>
                <Typography variant="caption" color="primary" fontWeight={800}>
                  Ver todas
                </Typography>
              </Stack>
              <Stack spacing={1.6}>
                {loading || !data
                  ? Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} height={52} />)
                  : data.upcomingDeliveries.map((delivery) => (
                      <Stack direction="row" spacing={1.5} alignItems="center" key={delivery.orderNumber}>
                        <Typography minWidth={48} variant="body2" color="primary" fontWeight={900}>
                          {delivery.time}
                        </Typography>
                        <Box flex={1} minWidth={0}>
                          <Typography variant="body2" fontWeight={900} noWrap>
                            Pedido {delivery.orderNumber}
                          </Typography>
                          <Typography variant="caption" display="block" noWrap>
                            {delivery.customerName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block" noWrap>
                            {delivery.address}
                          </Typography>
                        </Box>
                        <StatusBadge status={delivery.status} label={delivery.statusLabel} />
                      </Stack>
                    ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} xl={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" mb={2}>
                Desempenho do dia
              </Typography>
              <Box height={250}>
                {loading || !data ? (
                  <Skeleton variant="rounded" height="100%" />
                ) : (
                  <ResponsiveContainer>
                    <AreaChart data={data.dayPerformance}>
                      <defs>
                        <linearGradient id="deliveryGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#eef2f1" vertical={false} />
                      <XAxis dataKey="label" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} />
                      <ChartTooltip />
                      <Area type="monotone" dataKey="value" stroke="#10b981" fill="url(#deliveryGradient)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} xl={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" mb={2}>
                Ocorrências por tipo
              </Typography>
              <Box height={250}>
                {loading || !data ? (
                  <Skeleton variant="rounded" height="100%" />
                ) : (
                  <ResponsiveContainer>
                    <BarChart data={data.incidentsByType} layout="vertical" margin={{ left: 16 }}>
                      <CartesianGrid stroke="#eef2f1" horizontal={false} />
                      <XAxis type="number" tickLine={false} axisLine={false} />
                      <YAxis type="category" dataKey="label" width={118} tickLine={false} axisLine={false} />
                      <ChartTooltip />
                      <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                        {data.incidentsByType.map((entry) => (
                          <Cell key={entry.label} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} xl={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>
                Entregas em andamento
              </Typography>
              {loading || !data ? (
                <Skeleton variant="rounded" height={320} />
              ) : (
                <Box sx={{ overflowX: 'auto' }}>
                  <Table size="small" aria-label="Entregas em andamento">
                    <TableHead>
                      <TableRow>
                        <TableCell>Pedido</TableCell>
                        <TableCell>Cliente</TableCell>
                        <TableCell>Motorista</TableCell>
                        <TableCell>Rota</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Progresso</TableCell>
                        <TableCell>Previsão</TableCell>
                        <TableCell align="right">Ações</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.activeDeliveries.map((delivery) => (
                        <TableRow hover key={delivery.id}>
                          <TableCell>{delivery.orderNumber}</TableCell>
                          <TableCell>{delivery.customerName}</TableCell>
                          <TableCell>{delivery.driverName}</TableCell>
                          <TableCell>{delivery.routeName}</TableCell>
                          <TableCell>
                            <StatusBadge status={delivery.status} label={delivery.statusLabel} />
                          </TableCell>
                          <TableCell sx={{ minWidth: 140 }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography variant="caption" fontWeight={800}>
                                {delivery.progress}%
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={delivery.progress}
                                sx={{ flex: 1, height: 7, borderRadius: 2 }}
                              />
                            </Stack>
                          </TableCell>
                          <TableCell>{delivery.expectedTime}</TableCell>
                          <TableCell align="right">
                            <Tooltip title="Visualizar">
                              <IconButton aria-label={`Visualizar ${delivery.orderNumber}`} size="small">
                                <VisibilityOutlinedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Mais ações">
                              <IconButton aria-label={`Mais ações ${delivery.orderNumber}`} size="small">
                                <MoreHorizIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} xl={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Ocorrências recentes</Typography>
                <Typography variant="caption" color="primary" fontWeight={800}>
                  Ver todas
                </Typography>
              </Stack>
              <Stack spacing={1.4}>
                {loading || !data
                  ? Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} height={56} />)
                  : data.recentIncidents.map((incident) => (
                      <Stack direction="row" spacing={1.5} alignItems="center" key={incident.id}>
                        <Box
                          sx={{
                            width: 38,
                            height: 38,
                            borderRadius: 2,
                            display: 'grid',
                            placeItems: 'center',
                            bgcolor: incident.priority === 'CRITICAL' || incident.priority === 'HIGH' ? '#fee2e2' : '#e0f2fe',
                            color: incident.priority === 'CRITICAL' || incident.priority === 'HIGH' ? '#ef4444' : '#2563eb'
                          }}
                        >
                          <ErrorOutlineOutlinedIcon fontSize="small" />
                        </Box>
                        <Box flex={1} minWidth={0}>
                          <Typography variant="body2" fontWeight={900} noWrap>
                            {incident.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Pedido {incident.orderNumber}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {incident.timeAgo}
                        </Typography>
                      </Stack>
                    ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>
                Entregas por período
              </Typography>
              <Box height={260}>
                {loading || !data ? (
                  <Skeleton variant="rounded" height="100%" />
                ) : (
                  <ResponsiveContainer>
                    <LineChart data={data.deliveriesByPeriod}>
                      <CartesianGrid stroke="#eef2f1" vertical={false} />
                      <XAxis dataKey="label" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} />
                      <ChartTooltip />
                      <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}
