import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import LocationSearchingRoundedIcon from '@mui/icons-material/LocationSearchingRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { FormEvent, KeyboardEvent, useMemo, useState } from 'react';
import { Navigate, Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { BrandMark } from '../components/BrandMark';
import { getErrorMessage } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { tokens } from '../theme/tokens';
import loginImage from '../assets/login-logistics-hub.webp';

const DEMO_EMAIL = 'admin@logitrack.com';
const DEMO_PASSWORD = 'Admin@123';
const REMEMBERED_EMAIL_KEY = 'logitrack.remembered-email';

interface LocationState {
  from?: { pathname?: string };
}

export function LoginPage() {
  const { login, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(() => localStorage.getItem(REMEMBERED_EMAIL_KEY) ?? '');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(Boolean(localStorage.getItem(REMEMBERED_EMAIL_KEY)));
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validation = useMemo(() => {
    const normalizedEmail = email.trim();
    return {
      email: !normalizedEmail
        ? 'Informe seu e-mail corporativo.'
        : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
          ? ''
          : 'Digite um endereço de e-mail válido.',
      password: !password ? 'Informe sua senha.' : password.length < 6 ? 'A senha deve ter ao menos 6 caracteres.' : ''
    };
  }, [email, password]);

  if (token) {
    const destination = (location.state as LocationState | null)?.from?.pathname ?? '/';
    return <Navigate to={destination} replace />;
  }

  function handleCapsLock(event: KeyboardEvent<HTMLInputElement>) {
    setCapsLock(event.getModifierState('CapsLock'));
  }

  function fillDemoAccess() {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setError('');
    setSubmitted(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    setError('');
    if (validation.email || validation.password) return;

    setLoading(true);
    try {
      await login(email.trim(), password, remember);
      if (remember) localStorage.setItem(REMEMBERED_EMAIL_KEY, email.trim());
      else localStorage.removeItem(REMEMBERED_EMAIL_KEY);
      const destination = (location.state as LocationState | null)?.from?.pathname ?? '/';
      navigate(destination, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box component="main" minHeight="100dvh" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(520px, 1.08fr) minmax(500px, .92fr)' }, bgcolor: 'background.paper' }}>
      <Box
        component="section"
        aria-label="Plataforma de operações LogiTrack"
        sx={{
          display: { xs: 'none', lg: 'flex' },
          position: 'relative',
          isolation: 'isolate',
          minHeight: '100dvh',
          overflow: 'hidden',
          color: '#fff',
          p: { lg: 5, xl: 7 },
          alignItems: 'flex-end'
        }}
      >
        <Box component="img" src={loginImage} alt="Centro de distribuição com frota e docas logísticas" sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: -3 }} />
        <Box sx={{ position: 'absolute', inset: 0, zIndex: -2, background: 'linear-gradient(180deg, rgba(2,25,19,.28) 0%, rgba(2,31,23,.58) 46%, rgba(2,24,18,.96) 100%)' }} />
        <Box sx={{ position: 'absolute', inset: 0, zIndex: -1, background: 'radial-gradient(circle at 20% 14%, rgba(60,195,151,.34), transparent 34%)' }} />

        <Box sx={{ position: 'absolute', top: { lg: 40, xl: 56 }, left: { lg: 40, xl: 56 } }}>
          <BrandMark inverse />
        </Box>

        <Stack spacing={3.5} maxWidth={690} className="page-enter">
          <Chip label="CENTRAL DE OPERAÇÕES EM TEMPO REAL" size="small" sx={{ alignSelf: 'flex-start', color: '#d8fff0', bgcolor: 'rgba(14,168,117,.18)', border: '1px solid rgba(117,217,183,.34)', letterSpacing: '.05em' }} />
          <Box>
            <Typography component="h1" sx={{ fontSize: { lg: '2.5rem', xl: '3.25rem' }, fontWeight: 800, letterSpacing: '-.045em', lineHeight: 1.04, maxWidth: 640 }}>
              Logística sob controle, do pedido à entrega.
            </Typography>
            <Typography sx={{ mt: 2, maxWidth: 590, color: 'rgba(255,255,255,.74)', fontSize: { lg: '1rem', xl: '1.08rem' }, lineHeight: 1.7 }}>
              Visibilidade operacional, gestão de frota e decisões orientadas por dados em uma única plataforma.
            </Typography>
          </Box>

          <Stack direction={{ lg: 'column', xl: 'row' }} spacing={{ lg: 1.25, xl: 2.25 }}>
            {[
              ['Rastreamento contínuo', <LocationSearchingRoundedIcon key="tracking" />],
              ['Rotas e recursos integrados', <LocalShippingOutlinedIcon key="fleet" />],
              ['SLAs e ocorrências visíveis', <Inventory2OutlinedIcon key="sla" />]
            ].map(([label, icon]) => (
              <Stack key={String(label)} direction="row" spacing={1} alignItems="center">
                <Box sx={{ width: 30, height: 30, display: 'grid', placeItems: 'center', color: tokens.color.brand[300], '& svg': { fontSize: 19 } }}>{icon}</Box>
                <Typography variant="body2" fontWeight={700} color="rgba(255,255,255,.88)">{label}</Typography>
              </Stack>
            ))}
          </Stack>

          <Stack direction="row" spacing={1.25}>
            {[
              ['98,7%', 'SLA monitorado'],
              ['24/7', 'Visibilidade'],
              ['1 painel', 'Toda a operação']
            ].map(([value, label]) => (
              <Box key={label} sx={{ flex: 1, minWidth: 0, p: 1.5, borderRadius: tokens.radius.md, bgcolor: 'rgba(255,255,255,.075)', border: '1px solid rgba(255,255,255,.12)', backdropFilter: 'blur(10px)' }}>
                <Typography fontWeight={800} fontSize="1.1rem">{value}</Typography>
                <Typography variant="caption" color="rgba(255,255,255,.6)">{label}</Typography>
              </Box>
            ))}
          </Stack>
        </Stack>
      </Box>

      <Box component="section" sx={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', position: 'relative', px: { xs: 2.5, sm: 5, lg: 7 }, py: { xs: 3, sm: 5 }, background: { xs: `linear-gradient(145deg, ${tokens.color.brand[50]}, #fff 48%)`, lg: '#fff' } }}>
        <Box sx={{ width: '100%', maxWidth: 470 }} className="page-enter">
          <Box sx={{ display: { xs: 'block', lg: 'none' }, mb: { xs: 5, sm: 7 } }}>
            <BrandMark size={46} />
          </Box>

          <Box mb={3.5}>
            <Typography component="h1" variant="h4" sx={{ letterSpacing: '-.035em' }}>Bem-vindo ao LogiTrack</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>Acesse sua central para acompanhar e gerenciar a operação.</Typography>
          </Box>

          {error ? <Alert severity="error" sx={{ mb: 2.5 }} onClose={() => setError('')}>{error}</Alert> : null}

          <Box component="form" noValidate onSubmit={handleSubmit}>
            <Stack spacing={2.1}>
              <TextField
                label="E-mail"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                error={submitted && Boolean(validation.email)}
                helperText={submitted ? validation.email : 'Use o e-mail cadastrado na sua conta.'}
                fullWidth
                autoFocus
                autoComplete="email"
                inputProps={{ 'aria-describedby': 'login-email-helper' }}
              />
              <TextField
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                onKeyUp={handleCapsLock}
                onKeyDown={handleCapsLock}
                onBlur={() => setCapsLock(false)}
                error={submitted && Boolean(validation.password)}
                helperText={submitted && validation.password ? validation.password : capsLock ? 'Caps Lock está ativado.' : ' '}
                FormHelperTextProps={{ sx: capsLock ? { color: 'warning.main', fontWeight: 700 } : undefined }}
                fullWidth
                autoComplete="current-password"
                InputProps={{
                  startAdornment: <InputAdornment position="start"><LockOutlinedIcon fontSize="small" /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}>
                        <IconButton edge="end" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} onClick={() => setShowPassword((value) => !value)}>
                          {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  )
                }}
              />

              <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
                <FormControlLabel control={<Checkbox checked={remember} onChange={(event) => setRemember(event.target.checked)} />} label={<Typography variant="body2">Lembrar de mim</Typography>} />
                <Typography variant="caption" color="text.secondary" textAlign="right">Acesso protegido</Typography>
              </Stack>

              <Button type="submit" size="large" variant="contained" endIcon={loading ? <CircularProgress color="inherit" size={18} /> : <ArrowForwardRoundedIcon />} disabled={loading} sx={{ minHeight: 50 }}>
                {loading ? 'Validando acesso...' : 'Entrar na plataforma'}
              </Button>
            </Stack>
          </Box>

          <Box sx={{ mt: 3, p: 2, borderRadius: tokens.radius.md, border: `1px solid ${tokens.color.border}`, bgcolor: tokens.color.surfaceMuted }}>
            <Stack direction="row" spacing={1.25} alignItems="flex-start">
              <CheckCircleRoundedIcon color="primary" fontSize="small" sx={{ mt: 0.2 }} />
              <Box flex={1} minWidth={0}>
                <Typography variant="body2" fontWeight={800}>Ambiente de demonstração</Typography>
                <Typography variant="caption" color="text.secondary">Use uma conta preparada para explorar todos os recursos do produto.</Typography>
              </Box>
              <Button size="small" variant="text" startIcon={<ContentCopyRoundedIcon />} onClick={fillDemoAccess} aria-label="Preencher acesso demo">Preencher</Button>
            </Stack>
          </Box>

          <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2} mt={4} pt={2.5} borderTop={`1px solid ${tokens.color.border}`}>
            <Typography variant="caption" color="text.secondary">© {new Date().getFullYear()} LogiTrack</Typography>
            <Link component={RouterLink} to="/tracking" underline="hover" variant="body2" fontWeight={750}>Rastrear uma entrega</Link>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
