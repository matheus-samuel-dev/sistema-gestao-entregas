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
    { key: 'ordersToday', title: 'Pedidos hoje', value: '15', variation: '+10%', trend: 'up' },
    { key: 'activeDeliveries', title: 'Entregas em andamento', value: '5', variation: '+5%', trend: 'up' },
    { key: 'completedDeliveries', title: 'Entregas concluidas', value: '8', variation: '+2%', trend: 'up' },
    { key: 'openIncidents', title: 'Ocorrencias abertas', value: '2', variation: '-1', trend: 'down' },
    { key: 'successRate', title: 'Taxa de sucesso', value: '96.3%', variation: '+4%', trend: 'up' }
  ],
  deliveriesByStatus: [{ label: 'A caminho', value: 5, color: '#2563eb' }],
  dayPerformance: [{ label: '08:00', value: 12 }],
  deliveriesByPeriod: [{ label: '01/07', value: 6 }],
  incidentsByType: [{ label: 'Atraso', value: 2, color: '#ef4444' }],
  realtimeDeliveries: [],
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
    localStorage.setItem('logitrack.user', JSON.stringify({ id: 1, name: 'Joao Silva', email: 'admin@logitrack.com', role: 'ADMIN' }));
    vi.mocked(api.get).mockImplementation((url: string) => {
      if (url === '/auth/me') {
        return Promise.resolve({ data: { id: 1, name: 'Joao Silva', email: 'admin@logitrack.com', role: 'ADMIN' } });
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
