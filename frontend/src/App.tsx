import { lazy, Suspense } from 'react';
import type { ReactNode } from 'react';
import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { useAuth } from './contexts/AuthContext';
import { LoginPage } from './pages/LoginPage';

const DashboardPage = lazy(() => import('./pages/DashboardPage').then((module) => ({ default: module.DashboardPage })));
const DeliveriesPage = lazy(() => import('./pages/DeliveriesPage').then((module) => ({ default: module.DeliveriesPage })));
const DriversPage = lazy(() => import('./pages/DriversPage').then((module) => ({ default: module.DriversPage })));
const IncidentsPage = lazy(() => import('./pages/IncidentsPage').then((module) => ({ default: module.IncidentsPage })));
const OrdersPage = lazy(() => import('./pages/OrdersPage').then((module) => ({ default: module.OrdersPage })));
const ReportsPage = lazy(() => import('./pages/ReportsPage').then((module) => ({ default: module.ReportsPage })));
const RoutesPage = lazy(() => import('./pages/RoutesPage').then((module) => ({ default: module.RoutesPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then((module) => ({ default: module.SettingsPage })));
const VehiclesPage = lazy(() => import('./pages/VehiclesPage').then((module) => ({ default: module.VehiclesPage })));
const OperationsPage = lazy(() => import('./pages/OperationsPage').then((module) => ({ default: module.OperationsPage })));
const PublicTrackingPage = lazy(() => import('./pages/PublicTrackingPage').then((module) => ({ default: module.PublicTrackingPage })));
const SystemStatePage = lazy(() => import('./pages/SystemStatePage').then((module) => ({ default: module.SystemStatePage })));

function FullPageLoader() {
  return (
    <Box minHeight="100vh" display="grid" sx={{ placeItems: 'center', bgcolor: 'background.default' }}>
      <Stack spacing={1.5} alignItems="center">
        <CircularProgress aria-label="Carregando sessão" />
        <Typography color="text.secondary" fontWeight={800}>
          Preparando operação...
        </Typography>
      </Stack>
    </Box>
  );
}

function PageLoader() {
  return (
    <Box minHeight={360} display="grid" sx={{ placeItems: 'center' }}>
      <Stack spacing={1.5} alignItems="center">
        <CircularProgress size={28} aria-label="Carregando página" />
        <Typography color="text.secondary" fontWeight={800}>
          Carregando dados...
        </Typography>
      </Stack>
    </Box>
  );
}

function LazyPage({ children }: { children: ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

function ProtectedRoute() {
  const { token, loading } = useAuth();

  if (loading) {
    return <FullPageLoader />;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/tracking" element={<LazyPage><PublicTrackingPage /></LazyPage>} />
        <Route path="/tracking/:code" element={<LazyPage><PublicTrackingPage /></LazyPage>} />
        <Route path="/offline" element={<LazyPage><SystemStatePage code="offline" title="Você está offline" description="Reconecte-se para sincronizar os dados da operação." /></LazyPage>} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<LazyPage><DashboardPage /></LazyPage>} />
            <Route path="operations" element={<LazyPage><OperationsPage /></LazyPage>} />
            <Route path="orders" element={<LazyPage><OrdersPage /></LazyPage>} />
            <Route path="deliveries" element={<LazyPage><DeliveriesPage /></LazyPage>} />
            <Route path="drivers" element={<LazyPage><DriversPage /></LazyPage>} />
            <Route path="vehicles" element={<LazyPage><VehiclesPage /></LazyPage>} />
            <Route path="routes" element={<LazyPage><RoutesPage /></LazyPage>} />
            <Route path="incidents" element={<LazyPage><IncidentsPage /></LazyPage>} />
            <Route path="reports" element={<LazyPage><ReportsPage /></LazyPage>} />
            <Route path="settings" element={<LazyPage><SettingsPage /></LazyPage>} />
          </Route>
          <Route path="403" element={<LazyPage><SystemStatePage code="403" title="Acesso restrito" description="Seu perfil não possui permissão para esta área." /></LazyPage>} />
          <Route path="500" element={<LazyPage><SystemStatePage code="500" title="Falha inesperada" description="A operação não pôde ser concluída. Tente novamente em instantes." /></LazyPage>} />
        </Route>
        <Route path="*" element={<LazyPage><SystemStatePage code="404" title="Página não encontrada" description="O endereço informado não existe ou foi movido." /></LazyPage>} />
      </Routes>
    </BrowserRouter>
  );
}
