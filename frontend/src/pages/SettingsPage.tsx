import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  Grid,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import { useEffect, useState } from 'react';
import { maskCnpj, maskPhone } from '../components/format';

const defaultSettings = {
  companyName: 'LogiTrack Operações',
  document: '12.345.678/0001-90',
  phone: '(11) 4002-2200',
  address: 'Av. Paulista, 1000 - São Paulo, SP',
  defaultSla: 6,
  alertDelayMinutes: 20,
  routeOptimization: 'balanced',
  visualDensity: 'comfortable',
  darkSidebar: true,
  emailNotifications: true
};

const categories = [
  'Atraso na entrega',
  'Cliente não localizado',
  'Endereço incorreto',
  'Veículo com problema',
  'Produto avariado',
  'Problema resolvido'
];

export function SettingsPage() {
  const [settings, setSettings] = useState(defaultSettings);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('logitrack.settings');
    if (!stored) {
      return;
    }

    try {
      setSettings({ ...defaultSettings, ...JSON.parse(stored) });
    } catch {
      localStorage.removeItem('logitrack.settings');
    }
  }, []);

  function save() {
    setSaving(true);
    window.setTimeout(() => {
      localStorage.setItem('logitrack.settings', JSON.stringify(settings));
      setSaving(false);
      setSaved(true);
    }, 350);
  }

  return (
    <Stack spacing={2.5} className="page-enter">
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ md: 'center' }}>
        <Box>
          <Typography variant="h5">Configurações</Typography>
          <Typography color="text.secondary">Dados da empresa, usuários, parâmetros de entrega e preferências visuais.</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={saving ? <CircularProgress color="inherit" size={16} /> : <SaveOutlinedIcon />}
          onClick={save}
          disabled={saving}
        >
          {saving ? 'Salvando...' : 'Salvar'}
        </Button>
      </Stack>

      <Grid container spacing={2}>
        <Grid item xs={12} lg={7}>
          <Card className="soft-card">
            <CardContent>
              <Typography variant="h6" mb={2}>
                Dados da empresa
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Empresa" value={settings.companyName} onChange={(event) => setSettings({ ...settings, companyName: event.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="CNPJ" value={settings.document} onChange={(event) => setSettings({ ...settings, document: maskCnpj(event.target.value) })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Telefone" value={settings.phone} onChange={(event) => setSettings({ ...settings, phone: maskPhone(event.target.value) })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Endereço" value={settings.address} onChange={(event) => setSettings({ ...settings, address: event.target.value })} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Card className="soft-card">
            <CardContent>
              <Typography variant="h6" mb={2}>
                Usuários
              </Typography>
              <Stack spacing={1.5}>
                <Alert severity="success" icon={false}>
                  João Silva - Administrador - admin@logitrack.com
                </Alert>
                <Alert severity="info" icon={false}>
                  Perfis adicionais podem ser conectados ao Spring Security.
                </Alert>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={7}>
          <Card className="soft-card">
            <CardContent>
              <Typography variant="h6" mb={2}>
                Parâmetros de entrega
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="SLA padrão (h)"
                    inputProps={{ min: 1 }}
                    value={settings.defaultSla}
                    onChange={(event) => setSettings({ ...settings, defaultSla: Number(event.target.value) })}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Alerta atraso (min)"
                    inputProps={{ min: 1 }}
                    value={settings.alertDelayMinutes}
                    onChange={(event) => setSettings({ ...settings, alertDelayMinutes: Number(event.target.value) })}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    select
                    fullWidth
                    label="Otimização"
                    value={settings.routeOptimization}
                    onChange={(event) => setSettings({ ...settings, routeOptimization: event.target.value })}
                  >
                    <MenuItem value="fastest">Mais rápida</MenuItem>
                    <MenuItem value="balanced">Balanceada</MenuItem>
                    <MenuItem value="lowest-cost">Menor custo</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Card className="soft-card">
            <CardContent>
              <Typography variant="h6" mb={2}>
                Preferências visuais
              </Typography>
              <Stack>
                <TextField
                  select
                  fullWidth
                  label="Densidade"
                  value={settings.visualDensity}
                  onChange={(event) => setSettings({ ...settings, visualDensity: event.target.value })}
                >
                  <MenuItem value="compact">Compacta</MenuItem>
                  <MenuItem value="comfortable">Confortável</MenuItem>
                  <MenuItem value="spacious">Espaçosa</MenuItem>
                </TextField>
                <Divider sx={{ my: 2 }} />
                <FormControlLabel
                  control={<Checkbox checked={settings.darkSidebar} onChange={(event) => setSettings({ ...settings, darkSidebar: event.target.checked })} />}
                  label="Sidebar escura"
                />
                <FormControlLabel
                  control={<Checkbox checked={settings.emailNotifications} onChange={(event) => setSettings({ ...settings, emailNotifications: event.target.checked })} />}
                  label="Notificações por e-mail"
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card className="soft-card">
            <CardContent>
              <Typography variant="h6" mb={2}>
                Categorias de ocorrência
              </Typography>
              <Grid container spacing={1.5}>
                {categories.map((category) => (
                  <Grid item xs={12} sm={6} md={4} key={category}>
                    <Box
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        p: 1.5,
                        fontWeight: 850,
                        bgcolor: '#fbfefd',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} />
                      {category}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar open={saved} autoHideDuration={3000} onClose={() => setSaved(false)}>
        <Alert severity="success" variant="filled" onClose={() => setSaved(false)}>
          Configurações salvas localmente.
        </Alert>
      </Snackbar>
    </Stack>
  );
}
