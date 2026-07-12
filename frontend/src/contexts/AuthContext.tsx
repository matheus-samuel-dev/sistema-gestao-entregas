import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { api, setAuthToken } from '../api/client';
import type { AuthResponse, User } from '../api/types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const TOKEN_KEY = 'logitrack.token';
const USER_KEY = 'logitrack.user';

function readStoredUser(): User | null {
  const stored = localStorage.getItem(USER_KEY) ?? sessionStorage.getItem(USER_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as User;
  } catch {
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(USER_KEY);
    return null;
  }
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY)
  );
  const [user, setUser] = useState<User | null>(readStoredUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const storedToken = localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
    const persistent = Boolean(localStorage.getItem(TOKEN_KEY));

    setAuthToken(storedToken);
    if (!storedToken) {
      setLoading(false);
      return;
    }

    api
      .get<User>('/auth/me')
      .then((response) => {
        if (!active) return;
        setUser(response.data);
        (persistent ? localStorage : sessionStorage).setItem(USER_KEY, JSON.stringify(response.data));
      })
      .catch(() => {
        if (!active) return;
        clearSession();
        setToken(null);
        setUser(null);
        setAuthToken(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string, remember = true) => {
    const response = await api.post<AuthResponse>('/auth/login', { email, password });
    clearSession();
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(TOKEN_KEY, response.data.token);
    storage.setItem(USER_KEY, JSON.stringify(response.data.user));
    setAuthToken(response.data.token);
    setToken(response.data.token);
    setUser(response.data.user);
    setLoading(false);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setAuthToken(null);
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => logout();
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== TOKEN_KEY) return;
      const nextToken = localStorage.getItem(TOKEN_KEY);
      setAuthToken(nextToken);
      setToken(nextToken);
      setUser(nextToken ? readStoredUser() : null);
    };

    window.addEventListener('logitrack:unauthorized', handleUnauthorized);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('logitrack:unauthorized', handleUnauthorized);
      window.removeEventListener('storage', handleStorage);
    };
  }, [logout]);

  const value = useMemo(
    () => ({ user, token, loading, login, logout }),
    [user, token, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
