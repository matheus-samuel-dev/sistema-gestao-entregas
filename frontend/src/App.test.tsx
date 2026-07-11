import { ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from './api/client';
import { App } from './App';
import { AuthProvider } from './contexts/AuthContext';
import { theme } from './theme/theme';

vi.mock('./api/client', async () => {
  const actual = await vi.importActual<typeof import('./api/client')>('./api/client');
  return {
    ...actual,
    api: {
      get: vi.fn(),
      post: vi.fn(),
      defaults: { headers: { common: {} } }
    },
    setAuthToken: vi.fn(),
    getErrorMessage: actual.getErrorMessage
  };
});

vi.mock('./components/DeliveryMap', () => ({
  DeliveryMap: () => <div data-testid="delivery-map">Mapa</div>
}));

const dashboard = {
  metrics: [
    { key: 'activeDeliveries', title: 'Entregas em andamento', value: '5', variation: 'monitoradas agora', trend: 'up' },
    { key: 'delayedDeliveries', title: 'Entregas atrasadas', value: '1', variation: 'requer ação', trend: 'down' },
    { key: 'completedDeliveries', title: 'Entregas concluídas', value: '8', variation: 'finalizadas hoje', trend: 'up' },
    { key: 'successRate', title: 'Taxa de sucesso', value: '96.3%', variation: 'base total', trend: 'up' },
    { key: 'averageDeliveryTime', title: 'Tempo médio', value: '2h 10min', variation: 'entregas concluídas', trend: 'up' },
    { key: 'monthRevenue', title: 'Receita do mês', value: 'R$ 15.000,00', variation: 'pedidos faturados', trend: 'up' },
    { key: 'activeDrivers', title: 'Motoristas ativos', value: '4', variation: 'disponíveis ou em rota', trend: 'up' },
    { key: 'ordersToday', title: 'Pedidos hoje', value: '15', variation: 'entrada operacional', trend: 'up' }
  ],
  deliveriesByStatus: [{ label: 'A caminho', value: 5, color: '#2563eb' }],
  dayPerformance: [{ label: '08h', value: 12 }],
  deliveriesByPeriod: [{ label: '01/07', value: 6 }],
  incidentsByType: [{ label: 'Atraso', value: 2, color: '#ef4444' }],
  realtimeDeliveries: [
    {
      id: 1,
      orderNumber: '#10451',
      customerName: 'Cliente Teste',
      driverName: 'João Silva',
      status: 'ON_THE_WAY',
      statusLabel: 'A caminho',
      progress: 60,
      currentLat: -23.55,
      currentLng: -46.63,
      originLat: -23.529,
      originLng: -46.737,
      destinationLat: -23.561,
      destinationLng: -46.655,
      color: '#2563eb'
    }
  ],
  upcomingDeliveries: [],
  recentIncidents: [],
  activeDeliveries: []
};

function renderApp() {
  return render(
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  );
}

describe('App navigation', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(api.get).mockReset();
  });

  it('redirects anonymous users to login', async () => {
    window.history.pushState({}, '', '/');
    renderApp();

    expect(await screen.findByRole('heading', { name: /logitrack/i })).toBeInTheDocument();
  });

  it('renders dashboard for authenticated users', async () => {
    localStorage.setItem('logitrack.token', 'jwt-token');
    localStorage.setItem('logitrack.user', JSON.stringify({ id: 1, name: 'João Silva', email: 'admin@logitrack.com', role: 'ADMIN' }));
    vi.mocked(api.get).mockImplementation((url: string) => {
      if (url === '/auth/me') {
        return Promise.resolve({ data: { id: 1, name: 'João Silva', email: 'admin@logitrack.com', role: 'ADMIN' } });
      }
      if (url === '/dashboard') {
        return Promise.resolve({ data: dashboard });
      }
      return Promise.resolve({ data: [] });
    });

    window.history.pushState({}, '', '/');
    renderApp();

    expect(await screen.findByText('Pedidos hoje', {}, { timeout: 6000 })).toBeInTheDocument();
    expect(await screen.findByTestId('delivery-map', {}, { timeout: 6000 })).toBeInTheDocument();
  });
});
