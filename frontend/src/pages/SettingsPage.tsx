import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import RestartAltOutlinedIcon from '@mui/icons-material/RestartAltOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { api, getErrorMessage } from '../api/client';
import { EmptyState, ErrorState, TableSkeleton } from '../components/DataState';
import { PageHeader, SyncStatus } from '../components/data/PageHeader';
import { formatDateTime } from '../components/format';

type Density = 'compact' | 'comfortable' | 'spacious';
type NotificationEmphasis = 'standard' | 'discreet';

interface DevicePreferences {
  density: Density;
  notificationEmphasis: NotificationEmphasis;
}

interface AuditItem {
  id: number;
  action: string;
  entityType: string;
  entityId: number | null;
  actor: string;
  description: string;
  createdAt: string;
}

const PREFERENCES_KEY = 'logitrack.device-preferences.v1';
const defaultPreferences: DevicePreferences = {
  density: 'comfortable',
  notificationEmphasis: 'standard'
};

const actionLabels: Record<string, string> = {
  CREATE: 'Criação',
  UPDATE: 'Atualização',
  DELETE: 'Exclusão',
  CANCEL: 'Cancelamento',
  DELIVER: 'Entrega concluída',
  RESCHEDULE: 'Reagendamento',
  RESOLVE: 'Resolução'
};

function readPreferences(): DevicePreferences {
  try {
    const stored = localStorage.getItem(PREFERENCES_KEY);
    if (!stored) return defaultPreferences;
    const parsed = JSON.parse(stored) as Partial<DevicePreferences>;
    return {
      density: ['compact', 'comfortable', 'spacious'].includes(parsed.density ?? '')
        ? (parsed.density as Density)
        : defaultPreferences.density,
      notificationEmphasis: ['standard', 'discreet'].includes(parsed.notificationEmphasis ?? '')
        ? (parsed.notificationEmphasis as NotificationEmphasis)
        : defaultPreferences.notificationEmphasis
    };
  } catch {
    localStorage.removeItem(PREFERENCES_KEY);
    return defaultPreferences;
  }
}

function applyPreferences(preferences: DevicePreferences) {
  const styleId = 'logitrack-device-preference-styles';
  let style = document.getElementById(styleId) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      html[data-logitrack-density='compact'] .MuiTableCell-root {
        padding-top: 8px !important;
        padding-bottom: 8px !important;
      }
      html[data-logitrack-density='compact'] .MuiCardContent-root {
        padding: 16px !important;
      }
      html[data-logitrack-density='spacious'] .MuiTableCell-root {
        padding-top: 17px !important;
        padding-bottom: 17px !important;
      }
      html[data-logitrack-density='spacious'] .MuiCardContent-root {
        padding: 24px !important;
      }
      html[data-logitrack-notification-emphasis='discreet'] .MuiBadge-badge {
        filter: saturate(0.65);
        opacity: 0.72;
        box-shadow: none !important;
      }
    `;
    document.head.appendChild(style);
  }
  document.documentElement.dataset.logitrackDensity = preferences.density;
  document.documentElement.dataset.logitrackNotificationEmphasis = preferences.notificationEmphasis;
}

function auditActionLabel(action: string) {
  return actionLabels[action.toUpperCase()] ?? action.replace(/_/g, ' ');
}

export function SettingsPage() {
  const [preferences, setPreferences] = useState<DevicePreferences>(readPreferences);
  const [savedPreferences, setSavedPreferences] = useState<DevicePreferences>(readPreferences);
  const [saved, setSaved] = useState(false);

  const auditQuery = useQuery({
    queryKey: ['audit'],
    queryFn: async () => (await api.get<AuditItem[]>('/audit')).data
  });

  useEffect(() => {
    applyPreferences(savedPreferences);
  }, [savedPreferences]);

  const changed =
    preferences.density !== savedPreferences.density ||
    preferences.notificationEmphasis !== savedPreferences.notificationEmphasis;

  function savePreferences() {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
    applyPreferences(preferences);
    setSavedPreferences(preferences);
    setSaved(true);
  }

  function restoreDefaults() {
    setPreferences(defaultPreferences);
  }

  return (
    <Stack spacing={2.5} className="page-enter">
      <PageHeader
        eyebrow="Meu dispositivo"
        title="Preferências e auditoria"
        description="Ajuste a apresentação desta interface e consulte o histórico operacional registrado pelo servidor."
        icon={<SettingsOutlinedIcon />}
        meta={
          <SyncStatus
            syncing={auditQuery.isFetching && !auditQuery.isLoading}
            label={auditQuery.dataUpdatedAt ? `Auditoria atualizada às ${formatDateTime(new Date(auditQuery.dataUpdatedAt))}` : 'Auditoria conectada à API'}
          />
        }
        secondaryActions={
          <Button
            variant="outlined"
            startIcon={<RestartAltOutlinedIcon />}
            onClick={restoreDefaults}
            disabled={preferences.density === defaultPreferences.density && preferences.notificationEmphasis === defaultPreferences.notificationEmphasis}
          >
            Restaurar padrão
          </Button>
        }
        primaryAction={
          <Button variant="contained" startIcon={<SaveOutlinedIcon />} onClick={savePreferences} disabled={!changed}>
            Salvar preferências
          </Button>
        }
      />

      <Alert severity="info" variant="outlined">
        Estas opções ficam somente neste navegador. Dados da empresa, perfis de acesso, SLA e categorias operacionais
        não são alterados aqui porque dependem de configuração administrativa no servidor.
      </Alert>

      <Card className="soft-card">
        <CardContent>
          <Stack direction="row" spacing={1.25} alignItems="center" mb={2.5}>
            <Box
              aria-hidden
              sx={{ width: 38, height: 38, borderRadius: 2, display: 'grid', placeItems: 'center', bgcolor: 'action.hover', color: 'primary.main' }}
            >
              <TuneOutlinedIcon />
            </Box>
            <Box>
              <Typography variant="h6">Apresentação da interface</Typography>
              <Typography variant="body2" color="text.secondary">
                Preferências locais aplicadas ao documento assim que você salva.
              </Typography>
            </Box>
          </Stack>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl>
                <FormLabel id="density-label">Densidade de informação</FormLabel>
                <RadioGroup
                  aria-labelledby="density-label"
                  value={preferences.density}
                  onChange={(event) => setPreferences((current) => ({ ...current, density: event.target.value as Density }))}
                >
                  <FormControlLabel value="compact" control={<Radio />} label="Compacta — mais linhas visíveis" />
                  <FormControlLabel value="comfortable" control={<Radio />} label="Confortável — equilíbrio padrão" />
                  <FormControlLabel value="spacious" control={<Radio />} label="Espaçosa — mais respiro visual" />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl>
                <FormLabel id="notification-emphasis-label">Destaque dos alertas</FormLabel>
                <RadioGroup
                  aria-labelledby="notification-emphasis-label"
                  value={preferences.notificationEmphasis}
                  onChange={(event) => setPreferences((current) => ({
                    ...current,
                    notificationEmphasis: event.target.value as NotificationEmphasis
                  }))}
                >
                  <FormControlLabel value="standard" control={<Radio />} label="Padrão — contadores em destaque" />
                  <FormControlLabel value="discreet" control={<Radio />} label="Discreto — contadores com menor ênfase" />
                </RadioGroup>
                <Typography variant="caption" color="text.secondary" mt={0.5}>
                  O centro de notificações permanece disponível nas duas opções.
                </Typography>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card className="soft-card">
        <CardContent sx={{ pb: '0 !important' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="space-between" alignItems={{ sm: 'center' }} mb={2}>
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Box
                aria-hidden
                sx={{ width: 38, height: 38, borderRadius: 2, display: 'grid', placeItems: 'center', bgcolor: 'action.hover', color: 'primary.main' }}
              >
                <HistoryOutlinedIcon />
              </Box>
              <Box>
                <Typography variant="h6">Histórico de auditoria</Typography>
                <Typography variant="body2" color="text.secondary">
                  Eventos reais registrados pela API. Este histórico é somente leitura.
                </Typography>
              </Box>
            </Stack>
            {auditQuery.data ? <Chip variant="outlined" label={`${auditQuery.data.length} eventos`} /> : null}
          </Stack>

          {auditQuery.isLoading ? (
            <Box pb={2}>
              <TableSkeleton rows={5} columns={5} />
            </Box>
          ) : auditQuery.isError ? (
            <Box pb={2}>
              <ErrorState
                title="Não foi possível carregar a auditoria"
                description={getErrorMessage(auditQuery.error)}
                onRetry={() => auditQuery.refetch()}
              />
            </Box>
          ) : !auditQuery.data?.length ? (
            <Box pb={2}>
              <EmptyState
                compact
                title="Nenhum evento registrado"
                description="As alterações operacionais aparecerão aqui quando forem registradas pelo servidor."
                icon={<HistoryOutlinedIcon fontSize="large" />}
              />
            </Box>
          ) : (
            <TableContainer sx={{ mx: -2.5, width: 'calc(100% + 40px)' }}>
              <Table size="small" aria-label="Histórico de auditoria">
                <TableHead>
                  <TableRow>
                    <TableCell>Data e hora</TableCell>
                    <TableCell>Ação</TableCell>
                    <TableCell>Registro</TableCell>
                    <TableCell>Responsável</TableCell>
                    <TableCell>Descrição</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {auditQuery.data.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDateTime(item.createdAt)}</TableCell>
                      <TableCell><Chip size="small" variant="outlined" label={auditActionLabel(item.action)} /></TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        {item.entityType}{item.entityId ? ` #${item.entityId}` : ''}
                      </TableCell>
                      <TableCell>{item.actor || 'Sistema'}</TableCell>
                      <TableCell sx={{ minWidth: 260 }}>{item.description || 'Sem detalhes adicionais.'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Snackbar open={saved} autoHideDuration={3000} onClose={() => setSaved(false)}>
        <Alert severity="success" variant="filled" onClose={() => setSaved(false)}>
          Preferências salvas neste dispositivo.
        </Alert>
      </Snackbar>
    </Stack>
  );
}
