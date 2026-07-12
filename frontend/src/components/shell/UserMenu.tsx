import { Avatar, Box, Button, Divider, IconButton, ListItemIcon, Menu, MenuItem, Stack, Typography } from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getInitials } from './types';

const roles: Record<string, string> = {
  ADMIN: 'Administrador', OPERATOR: 'Operador', MONITORING: 'Monitoramento', MONITOR: 'Monitoramento',
  FLEET_MANAGER: 'Gestor de frota', DRIVER: 'Motorista', VIEWER: 'Visualizador'
};

export function UserMenu({ sidebar = false, collapsed = false }: { sidebar?: boolean; collapsed?: boolean }) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = roles[user?.role ?? 'ADMIN'] ?? user?.role;
  const openSettings = (tab: string) => { setAnchor(null); navigate(`/settings?tab=${tab}`); };
  const signOut = () => { setAnchor(null); logout(); navigate('/login', { replace: true }); };

  return (
    <>
      {sidebar ? (
        <Button
          fullWidth
          aria-label="Abrir menu da conta"
          onClick={(event) => setAnchor(event.currentTarget)}
          endIcon={collapsed ? undefined : <ExpandMoreRoundedIcon />}
          sx={{ justifyContent: collapsed ? 'center' : 'flex-start', minWidth: 0, px: collapsed ? .5 : 1, color: '#fff', border: '1px solid rgba(255,255,255,.13)', bgcolor: 'rgba(255,255,255,.055)' }}
        >
          <Avatar sx={{ width: 36, height: 36, mr: collapsed ? 0 : 1.1, bgcolor: '#d1fae5', color: '#064e3b', fontSize: '.8rem', fontWeight: 850 }}>{getInitials(user?.name)}</Avatar>
          {!collapsed ? <Box textAlign="left" minWidth={0} flex={1}><Typography variant="body2" color="#fff" fontWeight={850} noWrap>{user?.name}</Typography><Typography variant="caption" color="rgba(255,255,255,.62)" noWrap>{role}</Typography></Box> : null}
        </Button>
      ) : (
        <IconButton aria-label="Abrir menu do perfil" onClick={(event) => setAnchor(event.currentTarget)}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: '#d1fae5', color: '#064e3b', fontSize: '.8rem', fontWeight: 850 }}>{getInitials(user?.name)}</Avatar>
        </IconButton>
      )}

      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: sidebar ? 'left' : 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: sidebar ? 'left' : 'right' }}
        PaperProps={{ sx: { width: 285, mt: 1 } }}>
        <Box px={2} py={1.5}>
          <Stack direction="row" spacing={1.2} alignItems="center">
            <Avatar sx={{ bgcolor: '#d1fae5', color: '#064e3b', fontWeight: 850 }}>{getInitials(user?.name)}</Avatar>
            <Box minWidth={0}><Typography fontWeight={850} noWrap>{user?.name}</Typography><Typography variant="caption" color="text.secondary" display="block" noWrap>{user?.email}</Typography><Typography variant="caption" color="primary.main" fontWeight={750}>{role}</Typography></Box>
          </Stack>
        </Box>
        <Divider />
        <MenuItem onClick={() => openSettings('profile')}><ListItemIcon><ManageAccountsOutlinedIcon fontSize="small" /></ListItemIcon>Meu perfil</MenuItem>
        <MenuItem onClick={() => openSettings('appearance')}><ListItemIcon><PaletteOutlinedIcon fontSize="small" /></ListItemIcon>Preferências visuais</MenuItem>
        <MenuItem onClick={() => openSettings('security')}><ListItemIcon><SecurityOutlinedIcon fontSize="small" /></ListItemIcon>Segurança da conta</MenuItem>
        <Divider />
        <MenuItem onClick={signOut} sx={{ color: 'error.main' }}><ListItemIcon sx={{ color: 'error.main' }}><LogoutRoundedIcon fontSize="small" /></ListItemIcon>Sair do LogiTrack</MenuItem>
      </Menu>
    </>
  );
}
