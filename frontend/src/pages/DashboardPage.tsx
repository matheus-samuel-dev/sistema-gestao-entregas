import {
  Box,
  Button,
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
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
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
import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { api } from '../api/client';
import type { DashboardData, MetricCardData } from '../api/types';
import { DeliveryMap } from '../components/DeliveryMap';
import { EmptyState } from '../components/DataState';
import { MetricCard } from '../components/MetricCard';
import { StatusBadge } from '../components/StatusBadge';

const iconByMetric: Record<string, { icon: JSX.Element; tone: string }> = {
  activeDeliveries: { icon: <LocalShippingOutlinedIcon />, tone: '#2563eb' },
  delayedDeliveries: { icon: <WarningAmberOutlinedIcon />, tone: '#ef4444' },
  completedDeliveries: { icon: <CheckCircleOutlinedIcon />, tone: '#10b981' },
  successRate: { icon: <TimelineOutlinedIcon />, tone: '#14b8a6' },
  averageDeliveryTime: { icon: <TimerOutlinedIcon />, tone: '#8b5cf6' },
  monthRevenue: { icon: <AttachMoneyOutlinedIcon />, tone: '#009f6b' },
  activeDrivers: { icon: <GroupsOutlinedIcon />, tone: '#0f766e' },
  ordersToday: { icon: <AssignmentTurnedInOutlinedIcon />, tone: '#f59e0b' },
  openIncidents: { icon: <ErrorOutlineOutlinedIcon />, tone: '#ef4444' }
};

const routeByMetric: Record<string, string> = {
  activeDeliveries: '/deliveries',
  delayedDeliveries: '/deliveries',
  completedDeliveries: '/deliveries',
  successRate: '/reports',
  averageDeliveryTime: '/reports',
  monthRevenue: '/reports',
  activeDrivers: '/drivers',
  ordersToday: '/orders',
  openIncidents: '/incidents'
};

const chartTooltipStyle = {
  border: '1px solid #e6ecea',
  borderRadius: 8,
  boxShadow: '0 14px 34px rgba(15, 23, 42, 0.12)'
};

function MetricSkeleton() {
  return (
    <Card className="page-enter" sx={{ height: '100%' }}>
      <CardContent>
        <Stack spacing={1.5}>
          <Skeleton width="62%" />
          <Skeleton width="46%" height={44} />
          <Skeleton width="54%" />
        </Stack>
      </CardContent>
    </Card>
  );
}

function Panel({
  title,
  action,
  children,
  minHeight
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  minHeight?: number;
}) {
  return (
    <Card
      className="soft-card"
      sx={{
        width: '100%',
        height: 'auto'
      }}
    >
      <CardContent
        sx={{
          minHeight,
          '&:last-child': {
            paddingBottom: 3
          }
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6">{title}</Typography>
          {action}
        </Stack>

        {children}
      </CardContent>
    </Card>
  );
}

function metricVisual(metric: MetricCardData) {
  return iconByMetric[metric.key] ?? iconByMetric.ordersToday;
}

function ChartEmpty({ title = 'Sem dados para exibir' }: { title?: string }) {
  return <EmptyState title={title} description="Os dados aparecerão automaticamente quando houver registros suficientes." />;
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

  const deliveryTotal = useMemo(
    () => data?.deliveriesByStatus.reduce((sum, slice) => sum + slice.value, 0) ?? 0,
    [data]
  );

  if (error) {
    return (
      <EmptyState
        title="Dashboard indisponível"
        description="Verifique se a API está rodando e tente atualizar os dados."
        actionLabel="Tentar novamente"
        onAction={load}
      />
    );
  }

  return (
    <Stack spacing={2.5} className="page-enter">
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ md: 'center' }}>
        <Box>
          <Typography variant="h5">Centro operacional</Typography>
          <Typography color="text.secondary">
            Visão consolidada de entregas, atrasos, frota, receita e ocorrências.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button component={NavLink} to="/deliveries" variant="contained" startIcon={<LocalShippingOutlinedIcon />}>
            Criar entrega
          </Button>
          <Button component={NavLink} to="/reports" variant="outlined" startIcon={<TimelineOutlinedIcon />}>
            Relatórios
          </Button>
        </Stack>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(4, minmax(0, 1fr))'
          },
          gap: 2
        }}
      >
        {loading
          ? Array.from({ length: 8 }).map((_, index) => <MetricSkeleton key={index} />)
          : data?.metrics.map((metric, index) => {
              const visual = metricVisual(metric);
              return (
                <Box
                  key={metric.key}
                  component={NavLink}
                  to={routeByMetric[metric.key] ?? '/reports'}
                  aria-label={`Abrir detalhes de ${metric.title}`}
                  sx={{
                    color: 'inherit',
                    display: 'block',
                    borderRadius: 2,
                    textDecoration: 'none',
                    '&:focus-visible': {
                      outline: '3px solid',
                      outlineColor: 'primary.main',
                      outlineOffset: 3
                    },
                    '&:hover .soft-card': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 16px 36px rgba(15, 23, 42, 0.12)'
                    }
                  }}
                >
                  <MetricCard
                    metric={metric}
                    icon={visual.icon}
                    tone={visual.tone}
                    delay={index * 45}
                  />
                </Box>
              );
            })}
      </Box>

      <Grid container spacing={2} alignItems="flex-start">
        <Grid item xs={12} xl={8}>
          <Panel
            title="Entregas em operação"
            action={
              <Button component={NavLink} to="/deliveries" size="small">
                Ver entregas
              </Button>
            }
          >
            {loading || !data ? (
              <Skeleton variant="rounded" height={440} />
            ) : data.realtimeDeliveries.length ? (
              <DeliveryMap deliveries={data.realtimeDeliveries} />
            ) : (
              <EmptyState title="Nenhuma entrega ativa no mapa" description="Entregas em rota aparecerão aqui com posição e progresso." />
            )}
          </Panel>
        </Grid>

        <Grid item xs={12} md={6} xl={4}>
          <Panel title="Entregas por status">
            {loading || !data ? (
              <Skeleton variant="rounded" height={280} />
            ) : data.deliveriesByStatus.length ? (
              <Stack spacing={2}>
                <Stack direction={{ xs: 'column', sm: 'row', xl: 'column' }} spacing={2} alignItems="center">
                  <Box width="100%" maxWidth={240} height={220}>
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
                        <ChartTooltip contentStyle={chartTooltipStyle} />
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
                        <Typography variant="body2" fontWeight={850}>
                          {slice.value}
                        </Typography>
                      </Stack>
                    ))}
                    <DividerLine />
                    <Typography variant="caption" color="text.secondary">
                      Total de entregas: {deliveryTotal}
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
            ) : (
              <ChartEmpty />
            )}
          </Panel>
        </Grid>

        <Grid item xs={12} md={6} xl={4}>
          <Panel
            title="Próximas entregas"
            action={
              <Button component={NavLink} to="/deliveries" size="small">
                Ver todas
              </Button>
            }
          >
            <Stack spacing={1.4}>
              {loading || !data
                ? Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} height={58} />)
                : data.upcomingDeliveries.length
                  ? data.upcomingDeliveries.map((delivery, index) => (
                      <Stack
                        className="stagger-item"
                        sx={{ animationDelay: `${index * 35}ms` }}
                        component={NavLink}
                        to="/deliveries"
                        aria-label={`Abrir entrega do pedido ${delivery.orderNumber}`}
                        direction="row"
                        spacing={1.5}
                        alignItems="center"
                        key={delivery.orderNumber}
                        style={{ color: 'inherit', textDecoration: 'none' }}
                      >
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
                    ))
                  : <EmptyState title="Sem próximas entregas" description="A fila de próximas entregas está vazia no momento." />}
            </Stack>
          </Panel>
        </Grid>

        <Grid item xs={12} md={6} xl={4}>
          <Panel title="Desempenho do dia">
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
                    <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                    <ChartTooltip contentStyle={chartTooltipStyle} />
                    <Area type="monotone" dataKey="value" name="Entregas" stroke="#10b981" fill="url(#deliveryGradient)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </Box>
          </Panel>
        </Grid>

        <Grid item xs={12} md={6} xl={4}>
          <Panel title="Ocorrências por tipo">
            <Box height={250}>
              {loading || !data ? (
                <Skeleton variant="rounded" height="100%" />
              ) : data.incidentsByType.length ? (
                <ResponsiveContainer>
                  <BarChart data={data.incidentsByType} layout="vertical" margin={{ left: 16, right: 8 }}>
                    <CartesianGrid stroke="#eef2f1" horizontal={false} />
                    <XAxis type="number" tickLine={false} axisLine={false} allowDecimals={false} />
                    <YAxis type="category" dataKey="label" width={120} tickLine={false} axisLine={false} />
                    <ChartTooltip contentStyle={chartTooltipStyle} />
                    <Bar dataKey="value" name="Ocorrências" radius={[0, 6, 6, 0]}>
                      {data.incidentsByType.map((entry) => (
                        <Cell key={entry.label} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ChartEmpty title="Nenhuma ocorrência registrada" />
              )}
            </Box>
          </Panel>
        </Grid>

        <Grid item xs={12} xl={8}>
          <Panel
            title="Entregas em andamento"
            action={
              <Button component={NavLink} to="/deliveries" size="small">
                Ver entregas
              </Button>
            }
          >
            {loading || !data ? (
              <Skeleton variant="rounded" height={330} />
            ) : data.activeDeliveries.length ? (
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
                        <TableCell sx={{ fontWeight: 850 }}>{delivery.orderNumber}</TableCell>
                        <TableCell>{delivery.customerName}</TableCell>
                        <TableCell>{delivery.driverName}</TableCell>
                        <TableCell>{delivery.routeName}</TableCell>
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
                        <TableCell>{delivery.expectedTime}</TableCell>
                        <TableCell align="right">
                          <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
                            <Tooltip title="Visualizar">
                              <IconButton
                                component={NavLink}
                                to="/deliveries"
                                aria-label={`Visualizar entrega ${delivery.orderNumber}`}
                                size="small"
                              >
                                <VisibilityOutlinedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            ) : (
              <EmptyState title="Nenhuma entrega em andamento" description="Quando uma entrega for iniciada, ela aparecerá nesta fila operacional." />
            )}
          </Panel>
        </Grid>

        <Grid item xs={12} xl={4}>
          <Panel
            title="Ocorrências recentes"
            action={
              <Button component={NavLink} to="/incidents" size="small">
                Ver todas
              </Button>
            }
          >
            <Stack spacing={1.4}>
              {loading || !data
                ? Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} height={58} />)
                : data.recentIncidents.length
                  ? data.recentIncidents.map((incident, index) => (
                      <Stack
                        className="stagger-item"
                        sx={{ animationDelay: `${index * 35}ms` }}
                        component={NavLink}
                        to="/incidents"
                        aria-label={`Abrir ocorrência ${incident.title}`}
                        direction="row"
                        spacing={1.5}
                        alignItems="center"
                        key={incident.id}
                        style={{ color: 'inherit', textDecoration: 'none' }}
                      >
                        <Box
                          sx={{
                            width: 38,
                            height: 38,
                            borderRadius: 2,
                            display: 'grid',
                            placeItems: 'center',
                            bgcolor: incident.priority === 'CRITICAL' || incident.priority === 'HIGH' ? '#fee2e2' : '#e0f2fe',
                            color: incident.priority === 'CRITICAL' || incident.priority === 'HIGH' ? '#ef4444' : '#2563eb',
                            flex: '0 0 auto'
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
                        <Typography variant="caption" color="text.secondary" flexShrink={0}>
                          {incident.timeAgo}
                        </Typography>
                      </Stack>
                    ))
                  : <EmptyState title="Sem ocorrências recentes" description="A operação não possui ocorrências abertas no momento." />}
            </Stack>
          </Panel>
        </Grid>

        <Grid item xs={12}>
          <Panel title="Entregas por período">
            <Box height={280}>
              {loading || !data ? (
                <Skeleton variant="rounded" height="100%" />
              ) : (
                <ResponsiveContainer>
                  <LineChart data={data.deliveriesByPeriod}>
                    <CartesianGrid stroke="#eef2f1" vertical={false} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                    <ChartTooltip contentStyle={chartTooltipStyle} />
                    <Line type="monotone" dataKey="value" name="Entregas" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Box>
          </Panel>
        </Grid>
      </Grid>
    </Stack>
  );
}

function DividerLine() {
  return <Box sx={{ height: 1, bgcolor: 'divider', my: 0.3 }} />;
}
