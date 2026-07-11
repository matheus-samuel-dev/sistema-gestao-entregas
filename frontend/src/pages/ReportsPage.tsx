import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { api } from '../api/client';
import type { DashboardData, Delivery, Driver, Incident } from '../api/types';
import { EmptyState } from '../components/DataState';
import { formatDateTime } from '../components/format';
import { StatusBadge } from '../components/StatusBadge';

const chartTooltipStyle = {
  border: '1px solid #e6ecea',
  borderRadius: 8,
  boxShadow: '0 14px 34px rgba(15, 23, 42, 0.12)'
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function ReportSummaryCard({
  label,
  value,
  description,
  icon,
  tone
}: {
  label: string;
  value: string | number;
  description: string;
  icon: ReactNode;
  tone: string;
}) {
  return (
    <Card className="soft-card" sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" spacing={1.6} alignItems="center">
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              bgcolor: `${tone}18`,
              color: tone
            }}
          >
            {icon}
          </Box>
          <Box minWidth={0}>
            <Typography variant="overline" color="text.secondary">
              {label}
            </Typography>
            <Typography variant="h4">{value}</Typography>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export function ReportsPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<DashboardData>('/dashboard'),
      api.get<Driver[]>('/drivers'),
      api.get<Delivery[]>('/deliveries'),
      api.get<Incident[]>('/incidents')
    ])
      .then(([dashboardRes, driverRes, deliveryRes, incidentRes]) => {
        setDashboard(dashboardRes.data);
        setDrivers(driverRes.data);
        setDeliveries(deliveryRes.data);
        setIncidents(incidentRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  function exportExcel() {
    const rows = [
      ['Pedido', 'Cliente', 'Motorista', 'Status', 'Progresso', 'Previsão'],
      ...deliveries.map((delivery) => [
        delivery.orderNumber,
        delivery.customerName,
        delivery.driverName,
        delivery.statusLabel,
        `${delivery.progress}%`,
        formatDateTime(delivery.expectedAt)
      ])
    ];
    const html = `<table>${rows
      .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(String(cell))}</td>`).join('')}</tr>`)
      .join('')}</table>`;
    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'logitrack-relatorio.xls';
    link.click();
    URL.revokeObjectURL(url);
  }

  const productivity = useMemo(
    () =>
      drivers.map((driver) => ({
        name: driver.name.split(' ')[0],
        entregas: driver.deliveriesCompleted,
        sucesso: Number(driver.successRate)
      })),
    [drivers]
  );

  const criticalDeliveries = useMemo(
    () => deliveries.filter((delivery) => delivery.status === 'DELAYED' || delivery.progress < 35),
    [deliveries]
  );

  const averageProductivity = drivers.length
    ? Math.round(drivers.reduce((sum, driver) => sum + driver.deliveriesCompleted, 0) / drivers.length)
    : 0;

  return (
    <Stack spacing={2.5} className="page-enter">
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ md: 'center' }}>
        <Box>
          <Typography variant="h5">Relatórios</Typography>
          <Typography color="text.secondary">Análises de produtividade, atrasos, ocorrências e taxa de sucesso.</Typography>
        </Box>
        <Stack direction="row" spacing={1} className="no-print" flexWrap="wrap" useFlexGap>
          <Button startIcon={<PictureAsPdfOutlinedIcon />} variant="outlined" onClick={() => window.print()}>
            Exportar PDF
          </Button>
          <Button startIcon={<DownloadOutlinedIcon />} variant="contained" onClick={exportExcel}>
            Exportar Excel
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card>
                <CardContent>
                  <Skeleton width="55%" />
                  <Skeleton height={48} width="38%" />
                  <Skeleton width="70%" />
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <>
            <Grid item xs={12} md={4}>
              <ReportSummaryCard
                label="Entregas no período"
                value={deliveries.length}
                description="Volume total registrado"
                icon={<LocalShippingOutlinedIcon />}
                tone="#2563eb"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <ReportSummaryCard
                label="Ocorrências"
                value={incidents.length}
                description="Abertas, em análise e resolvidas"
                icon={<ErrorOutlineOutlinedIcon />}
                tone="#ef4444"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <ReportSummaryCard
                label="Produtividade média"
                value={averageProductivity}
                description="Entregas concluídas por motorista"
                icon={<TimelineOutlinedIcon />}
                tone="#10b981"
              />
            </Grid>
          </>
        )}

        <Grid item xs={12} lg={6}>
          <Card className="soft-card">
            <CardContent>
              <Typography variant="h6" mb={2}>
                Entregas por período
              </Typography>
              <Box height={300}>
                {loading || !dashboard ? (
                  <Skeleton variant="rounded" height="100%" />
                ) : (
                  <ResponsiveContainer>
                    <LineChart data={dashboard.deliveriesByPeriod}>
                      <CartesianGrid stroke="#eef2f1" vertical={false} />
                      <XAxis dataKey="label" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip contentStyle={chartTooltipStyle} />
                      <Line type="monotone" dataKey="value" name="Entregas" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Card className="soft-card">
            <CardContent>
              <Typography variant="h6" mb={2}>
                Entregas por motorista
              </Typography>
              <Box height={300}>
                {loading ? (
                  <Skeleton variant="rounded" height="100%" />
                ) : productivity.length ? (
                  <ResponsiveContainer>
                    <BarChart data={productivity}>
                      <CartesianGrid stroke="#eef2f1" vertical={false} />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip contentStyle={chartTooltipStyle} />
                      <Legend />
                      <Bar dataKey="entregas" name="Entregas" fill="#2563eb" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState title="Sem motoristas para analisar" description="Cadastre motoristas para acompanhar produtividade." />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Card className="soft-card">
            <CardContent>
              <Typography variant="h6" mb={2}>
                Ocorrências por tipo
              </Typography>
              <Box height={300}>
                {loading || !dashboard ? (
                  <Skeleton variant="rounded" height="100%" />
                ) : dashboard.incidentsByType.length ? (
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={dashboard.incidentsByType} dataKey="value" nameKey="label" outerRadius={110}>
                        {dashboard.incidentsByType.map((entry) => (
                          <Cell key={entry.label} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={chartTooltipStyle} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState title="Nenhuma ocorrência registrada" description="Ocorrências aparecerão aqui por categoria." />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Card className="soft-card">
            <CardContent>
              <Typography variant="h6" mb={2}>
                Atrasos e entregas críticas
              </Typography>
              {loading ? (
                <Skeleton variant="rounded" height={300} />
              ) : criticalDeliveries.length ? (
                <Box sx={{ overflowX: 'auto' }}>
                  <Table size="small" aria-label="Entregas críticas">
                    <TableHead>
                      <TableRow>
                        <TableCell>Pedido</TableCell>
                        <TableCell>Cliente</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Previsão</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {criticalDeliveries.map((delivery) => (
                        <TableRow hover key={delivery.id}>
                          <TableCell sx={{ fontWeight: 850 }}>{delivery.orderNumber}</TableCell>
                          <TableCell>{delivery.customerName}</TableCell>
                          <TableCell>
                            <StatusBadge status={delivery.status} label={delivery.statusLabel} />
                          </TableCell>
                          <TableCell>{formatDateTime(delivery.expectedAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              ) : (
                <EmptyState title="Sem entregas críticas" description="Não há atrasos ou entregas com baixo progresso neste momento." />
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}
