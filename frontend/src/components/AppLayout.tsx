import {
  AppBar, Box, Chip, Divider, Drawer, IconButton, List, ListItemButton, ListItemIcon,
  ListItemText, Stack, Toolbar, Tooltip, Typography, useMediaQuery
} from '@mui/material';
import type { Theme } from '@mui/material/styles';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import WifiOffRoundedIcon from '@mui/icons-material/WifiOffRounded';
import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { BrandMark } from './BrandMark';
import { CalendarCenter } from './shell/CalendarCenter';
import { GlobalSearch } from './shell/GlobalSearch';
import { MessageCenter } from './shell/MessageCenter';
import { navigationGroups } from './shell/navigation';
import { NotificationCenter } from './shell/NotificationCenter';
import { UserMenu } from './shell/UserMenu';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { tokens } from '../theme/tokens';

const expandedWidth = 264;
const collapsedWidth = 84;
const preferenceKey = 'logitrack.sidebar-collapsed';

function Sidebar({ collapsed, mobile, onNavigate, onToggle }: {
  collapsed: boolean;
  mobile?: boolean;
  onNavigate?: () => void;
  onToggle: () => void;
}) {
  return (
    <Stack height="100%" sx={{ bgcolor: tokens.color.brand[950], color: '#fff', overflowX: 'hidden' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: collapsed ? 2.1 : 2.25, py: 2.25, minHeight: 82 }}>
        <BrandMark inverse size={42} showWordmark={!collapsed} compact />
        {!mobile && !collapsed ? (
          <Tooltip title="Recolher menu"><IconButton size="small" onClick={onToggle} aria-label="Recolher menu lateral" sx={{ color: 'rgba(255,255,255,.75)' }}><ChevronLeftRoundedIcon /></IconButton></Tooltip>
        ) : null}
      </Stack>
      <Divider sx={{ borderColor: 'rgba(255,255,255,.1)' }} />
      <List component="nav" aria-label="Navegação principal" sx={{ px: collapsed ? 1.4 : 1.5, py: 1.5, flex: 1, overflowY: 'auto' }}>
        {navigationGroups.map((group) => (
          <Box key={group.label} sx={{ mb: 1.35 }}>
            {!collapsed ? <Typography component="h2" variant="caption" sx={{ display: 'block', px: 1.25, mb: .55, color: 'rgba(255,255,255,.43)', fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase' }}>{group.label}</Typography> : null}
            {group.items.map((item) => (
              <Tooltip key={item.path} title={collapsed ? item.label : ''} placement="right">
                <ListItemButton
                  component={NavLink}
                  to={item.path}
                  end={item.end}
                  onClick={onNavigate}
                  sx={{ minHeight: 44, my: .3, px: collapsed ? 1.3 : 1.2, justifyContent: collapsed ? 'center' : 'flex-start', borderRadius: tokens.radius.md, color: 'rgba(255,255,255,.72)', '&.active': { color: '#fff', bgcolor: 'rgba(16,185,129,.2)', boxShadow: 'inset 3px 0 #34d399' }, '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,.075)' } }}
                >
                  <ListItemIcon sx={{ minWidth: collapsed ? 0 : 38, color: 'inherit', justifyContent: 'center', '& svg': { fontSize: 21 } }}>{item.icon}</ListItemIcon>
                  {!collapsed ? <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '.875rem', fontWeight: 750 }} /> : null}
                </ListItemButton>
              </Tooltip>
            ))}
          </Box>
        ))}
      </List>
      <Box sx={{ px: collapsed ? 1.4 : 1.5, pb: 1.5 }}>
        {!mobile && collapsed ? (
          <Tooltip title="Expandir menu" placement="right"><IconButton onClick={onToggle} aria-label="Expandir menu lateral" sx={{ width: '100%', color: 'rgba(255,255,255,.72)', mb: 1 }}><ChevronRightRoundedIcon /></IconButton></Tooltip>
        ) : null}
        <UserMenu sidebar collapsed={collapsed} />
      </Box>
    </Stack>
  );
}

export function AppLayout() {
  const desktop = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(preferenceKey) === 'true');
  const online = useNetworkStatus();
  const location = useLocation();
  const width = collapsed ? collapsedWidth : expandedWidth;

  useEffect(() => { if (!desktop) setMobileOpen(false); }, [desktop, location.pathname]);
  const toggle = () => setCollapsed((value) => { localStorage.setItem(preferenceKey, String(!value)); return !value; });

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box component="a" href="#main-content" className="skip-link">Pular para o conteúdo</Box>
      <AppBar position="fixed" elevation={0} className="no-print" sx={{ width: { lg: `calc(100% - ${width}px)` }, ml: { lg: `${width}px` }, bgcolor: 'rgba(255,255,255,.93)', color: 'text.primary', borderBottom: `1px solid ${tokens.color.border}`, backdropFilter: 'blur(16px)', transition: `width ${tokens.motion.standard}, margin ${tokens.motion.standard}` }}>
        <Toolbar sx={{ minHeight: { xs: 64, sm: 70 }, gap: { xs: .25, sm: .75 }, px: { xs: 1, sm: 2 } }}>
          <IconButton aria-label="Abrir menu lateral" onClick={() => setMobileOpen(true)} sx={{ display: { lg: 'none' } }}><MenuRoundedIcon /></IconButton>
          <GlobalSearch />
          <Box flex={1} />
          {!online ? <Chip icon={<WifiOffRoundedIcon />} label="Offline" size="small" color="warning" sx={{ display: { xs: 'none', sm: 'flex' } }} /> : null}
          <NotificationCenter />
          <MessageCenter />
          <CalendarCenter />
          <UserMenu />
        </Toolbar>
      </AppBar>

      <Box component="nav" aria-label="Menu lateral" className="no-print" sx={{ width: { lg: width }, flexShrink: { lg: 0 }, transition: `width ${tokens.motion.standard}` }}>
        {desktop ? (
          <Drawer variant="permanent" open PaperProps={{ sx: { width, border: 0, transition: `width ${tokens.motion.standard}` } }}>
            <Sidebar collapsed={collapsed} onToggle={toggle} />
          </Drawer>
        ) : (
          <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }} PaperProps={{ sx: { width: 280, border: 0 } }}>
            <Sidebar collapsed={false} mobile onToggle={() => undefined} onNavigate={() => setMobileOpen(false)} />
          </Drawer>
        )}
      </Box>

      <Box component="main" id="main-content" tabIndex={-1} sx={{ flexGrow: 1, minWidth: 0, overflowX: 'hidden', width: { lg: `calc(100% - ${width}px)` }, pt: { xs: 9.5, sm: 11 }, px: { xs: 1.5, sm: 2.5, xl: 3 }, pb: 4, transition: `width ${tokens.motion.standard}` }}>
        <Outlet />
      </Box>
    </Box>
  );
}
