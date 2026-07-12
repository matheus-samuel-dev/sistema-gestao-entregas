import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  timeout: 15_000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      !String(error.config?.url ?? '').includes('/auth/login')
    ) {
      window.dispatchEvent(new CustomEvent('logitrack:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return navigator.onLine
        ? 'Não foi possível conectar ao servidor. Tente novamente em instantes.'
        : 'Você está offline. Verifique sua conexão e tente novamente.';
    }

    const payload = error.response.data as { message?: unknown; errors?: unknown } | undefined;
    const message = payload?.message;
    if (typeof message === 'string') {
      return message;
    }

    if (Array.isArray(payload?.errors)) {
      const firstError = payload.errors.find((item) => typeof item === 'string');
      if (typeof firstError === 'string') return firstError;
    }

    if (error.response.status === 403) return 'Você não tem permissão para realizar esta ação.';
    if (error.response.status === 404) return 'O recurso solicitado não foi encontrado.';
    if (error.response.status >= 500) return 'O serviço está temporariamente indisponível. Tente novamente.';
  }
  return 'Não foi possível concluir a operação.';
}

export function isClientError(error: unknown) {
  return axios.isAxiosError(error) && Boolean(error.response && error.response.status >= 400 && error.response.status < 500);
}
