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
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
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

  it('preenche as credenciais demo e envia o login', async () => {
    renderLogin();

    expect(screen.getByRole('heading', { name: /logitrack/i })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /preencher acesso demo/i }));
    await userEvent.click(screen.getByRole('button', { name: /entrar na plataforma/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'admin@logitrack.com',
        password: 'Admin@123'
      });
    });
  });

  it('valida campos obrigatórios antes de chamar a API', async () => {
    renderLogin();

    await userEvent.click(screen.getByRole('button', { name: /entrar na plataforma/i }));

    expect(await screen.findByText(/informe seu e-mail corporativo/i)).toBeInTheDocument();
    expect(screen.getByText(/informe sua senha/i)).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });

  it('permite mostrar e ocultar a senha', async () => {
    renderLogin();
    const password = screen.getByLabelText('Senha') as HTMLInputElement;

    await userEvent.type(password, 'segredo123');
    expect(password.type).toBe('password');
    await userEvent.click(screen.getByRole('button', { name: /mostrar senha/i }));
    expect(password.type).toBe('text');
    await userEvent.click(screen.getByRole('button', { name: /ocultar senha/i }));
    expect(password.type).toBe('password');
  });
});
