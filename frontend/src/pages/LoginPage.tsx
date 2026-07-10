import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import { FormEvent, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../api/client';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const { login, token } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@logitrack.com');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (token) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      minHeight="100vh"
      sx={{
        display: 'grid',
        placeItems: 'center',
        p: 2,
        bgcolor: '#003d2f',
        backgroundImage:
          'linear-gradient(135deg, rgba(16,185,129,0.18), transparent 42%), linear-gradient(315deg, rgba(37,99,235,0.18), transparent 35%)'
      }}
    >
      <Container maxWidth="sm">
        <Card sx={{ border: 0, boxShadow: '0 30px 80px rgba(0,0,0,0.25)' }}>
          <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
            <Stack spacing={3}>
              <Stack spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 62,
                    height: 62,
                    borderRadius: 2,
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: '#ddf8eb',
                    color: 'primary.dark'
                  }}
                >
                  <LocalShippingOutlinedIcon fontSize="large" />
                </Box>
                <Box textAlign="center">
                  <Typography variant="h4">LogiTrack</Typography>
                  <Typography color="text.secondary">Gestão de Entregas</Typography>
                </Box>
              </Stack>
              {error ? <Alert severity="error">{error}</Alert> : null}
              <Box component="form" onSubmit={handleSubmit}>
                <Stack spacing={2}>
                  <TextField
                    label="E-mail"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    fullWidth
                    autoComplete="email"
                  />
                  <TextField
                    label="Senha"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    fullWidth
                    autoComplete="current-password"
                  />
                  <Button type="submit" size="large" variant="contained" startIcon={<LockOutlinedIcon />} disabled={loading}>
                    {loading ? 'Entrando...' : 'Entrar no painel'}
                  </Button>
                </Stack>
              </Box>
              <Alert severity="success" icon={false}>
                Demo: admin@logitrack.com / Admin@123
              </Alert>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
