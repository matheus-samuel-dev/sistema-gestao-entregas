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
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
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
import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { DashboardData, Delivery, Driver, Incident } from '../api/types';
import { formatDateTime } from '../components/format';
import { StatusBadge } from '../components/StatusBadge';

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
      ['Pedido', 'Cliente', 'Motorista', 'Status', 'Progresso', 'Previsao'],
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
        .map((row) => `<tr>${row.map((cell) => `<td>${String(cell).replace(/&/g, '&amp;')}</td>`).join('')}</tr>`)
      .join('')}</table>`;
    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'logitrack-relatorio.xls';
    link.click();
    URL.revokeObjectURL(url);
  }

  const productivity = drivers.map((driver) => ({
    name: driver.name.split(' ')[0],
    entregas: driver.deliveriesCompleted,
    sucesso: Number(driver.successRate)
  }));

  return (
    <Stack spacing={2.5}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ md: 'center' }}>
        <Box>
          <Typography variant="h5">Relatórios</Typography>
          <Typography color="text.secondary">Análises de produtividade, atrasos, ocorrências e taxa de sucesso.</Typography>
        </Box>
        <Stack direction="row" spacing={1} className="no-print">
          <Button startIcon={<PictureAsPdfOutlinedIcon />} variant="outlined" onClick={() => window.print()}>
            Exportar PDF
          </Button>
          <Button startIcon={<DownloadOutlinedIcon />} variant="contained" onClick={exportExcel}>
            Exportar Excel
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                Entregas no período
              </Typography>
              <Typography variant="h4">{deliveries.length}</Typography>
              <Typography color="text.secondary">Volume total de entregas demo</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                Ocorrências
              </Typography>
              <Typography variant="h4">{incidents.length}</Typography>
              <Typography color="text.secondary">Abertas, em análise e resolvidas</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                Produtividade média
              </Typography>
              <Typography variant="h4">
                {drivers.length
                  ? Math.round(drivers.reduce((sum, driver) => sum + driver.deliveriesCompleted, 0) / drivers.length)
                  : 0}
              </Typography>
              <Typography color="text.secondary">Entregas concluídas por motorista</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Card>
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
                      <YAxis tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>
                Entregas por motorista
              </Typography>
              <Box height={300}>
                {loading ? (
                  <Skeleton variant="rounded" height="100%" />
                ) : (
                  <ResponsiveContainer>
                    <BarChart data={productivity}>
                      <CartesianGrid stroke="#eef2f1" vertical={false} />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="entregas" fill="#2563eb" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>
                Ocorrências por tipo
              </Typography>
              <Box height={300}>
                {loading || !dashboard ? (
                  <Skeleton variant="rounded" height="100%" />
                ) : (
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={dashboard.incidentsByType} dataKey="value" nameKey="label" outerRadius={110}>
                        {dashboard.incidentsByType.map((entry) => (
                          <Cell key={entry.label} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>
                Atrasos e entregas críticas
              </Typography>
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
                    {deliveries
                      .filter((delivery) => delivery.status === 'DELAYED' || delivery.progress < 35)
                      .map((delivery) => (
                        <TableRow key={delivery.id}>
                          <TableCell>{delivery.orderNumber}</TableCell>
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
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}
