import { ThemeProvider } from '@mui/material/styles';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../api/client';
import { AuthProvider } from '../contexts/AuthContext';
import { theme } from '../theme/theme';
import { LoginPage } from './LoginPage';

vi.mock('../api/client', async () => {
  const actual = await vi.importActual<typeof import('../api/client')>('../api/client');
  return {
    ...actual,
    api: {
      post: vi.fn(),
      get: vi.fn(),
      defaults: { headers: { common: {} } }
    },
    setAuthToken: vi.fn(),
    getErrorMessage: actual.getErrorMessage
  };
});

function renderLogin() {
  return render(
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(api.post).mockResolvedValue({
      data: {
        token: 'jwt-token',
        user: { id: 1, name: 'Joao Silva', email: 'admin@logitrack.com', role: 'ADMIN' }
      }
    });
    vi.mocked(api.get).mockResolvedValue({
      data: { id: 1, name: 'Joao Silva', email: 'admin@logitrack.com', role: 'ADMIN' }
    });
  });

  it('renders demo credentials and submits login', async () => {
    renderLogin();

    expect(screen.getByRole('heading', { name: /logitrack/i })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /entrar no painel/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'admin@logitrack.com',
        password: 'Admin@123'
      });
    });
  });
});
