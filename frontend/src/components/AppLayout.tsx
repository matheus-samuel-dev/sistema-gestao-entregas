import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery
} from '@mui/material';
import type { Theme } from '@mui/material/styles';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import PinDropOutlinedIcon from '@mui/icons-material/PinDropOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import SearchIcon from '@mui/icons-material/Search';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import SmsOutlinedIcon from '@mui/icons-material/SmsOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 260;

const navigation = [
  { label: 'Dashboard', path: '/', icon: <DashboardOutlinedIcon /> },
  { label: 'Pedidos', path: '/orders', icon: <Inventory2OutlinedIcon /> },
  { label: 'Entregas', path: '/deliveries', icon: <LocalShippingOutlinedIcon /> },
  { label: 'Motoristas', path: '/drivers', icon: <PeopleAltOutlinedIcon /> },
  { label: 'Veículos', path: '/vehicles', icon: <DirectionsCarOutlinedIcon /> },
  { label: 'Rotas', path: '/routes', icon: <PinDropOutlinedIcon /> },
  { label: 'Ocorrências', path: '/incidents', icon: <ReportProblemOutlinedIcon /> },
  { label: 'Relatórios', path: '/reports', icon: <AssessmentOutlinedIcon /> },
  { label: 'Configurações', path: '/settings', icon: <SettingsOutlinedIcon /> }
];

const notifications = [
  {
    title: 'Entrega atrasada',
    description: 'Pedido #10452 passou do SLA planejado.',
    time: 'há 15 min',
    color: '#ef4444',
    icon: <WarningAmberOutlinedIcon fontSize="small" />,
    path: '/deliveries'
  },
  {
    title: 'Ocorrência crítica',
    description: 'Produto avariado aguardando tratativa.',
    time: 'há 35 min',
    color: '#f59e0b',
    icon: <ReportProblemOutlinedIcon fontSize="small" />,
    path: '/incidents'
  },
  {
    title: 'Entrega concluída',
    description: 'Pedido #10453 finalizado com sucesso.',
    time: 'há 1 h',
    color: '#10b981',
    icon: <CheckCircleOutlinedIcon fontSize="small" />,
    path: '/reports'
  }
];

function pageTitle(pathname: string) {
  const item = navigation.find((nav) => nav.path === pathname);
  return item?.label ?? 'Dashboard';
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  return (
    <Stack height="100%" sx={{ bgcolor: '#003d2f', color: '#effdf5' }}>
      <Box px={2.5} py={3}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            aria-hidden
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              bgcolor: '#10b981',
              color: '#003d2f',
              fontWeight: 900,
              boxShadow: '0 14px 30px rgba(16, 185, 129, 0.25)'
            }}
          >
            LT
          </Box>
          <Box minWidth={0}>
            <Typography variant="h6" lineHeight={1} color="#fff">
              LogiTrack
            </Typography>
            <Typography variant="caption" color="rgba(255,255,255,0.72)">
              Gestão de Entregas
            </Typography>
          </Box>
        </Stack>
      </Box>
      <List sx={{ px: 1.5, flex: 1 }}>
        {navigation.map((item) => (
          <ListItemButton
            key={item.path}
            component={NavLink}
            to={item.path}
            onClick={onNavigate}
            sx={{
              my: 0.35,
              minHeight: 44,
              borderRadius: 2,
              color: 'rgba(255,255,255,0.82)',
              transition: 'transform 160ms ease, background-color 160ms ease, color 160ms ease',
              '&.active': {
                bgcolor: '#008756',
                color: '#fff',
                boxShadow: '0 12px 30px rgba(0, 135, 86, 0.28)'
              },
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.08)',
                transform: 'translateX(2px)'
              }
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 38 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 800 }} />
          </ListItemButton>
        ))}
      </List>
      <Box px={1.5} pb={2}>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)', mb: 2 }} />
        <Button
          fullWidth
          onClick={(event) => setAnchorEl(event.currentTarget)}
          endIcon={<ExpandMoreIcon />}
          sx={{
            justifyContent: 'flex-start',
            color: '#fff',
            p: 1.2,
            border: '1px solid rgba(255,255,255,0.12)',
            bgcolor: 'rgba(255,255,255,0.05)'
          }}
        >
          <Avatar sx={{ width: 34, height: 34, mr: 1.2, bgcolor: '#d1fae5', color: '#003d2f' }}>
            {user?.name?.slice(0, 1) ?? 'A'}
          </Avatar>
          <Box textAlign="left" minWidth={0}>
            <Typography variant="body2" fontWeight={850} noWrap>
              {user?.name ?? 'Administrador'}
            </Typography>
            <Typography variant="caption" color="rgba(255,255,255,0.65)" noWrap>
              Administrador
            </Typography>
          </Box>
        </Button>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          <MenuItem onClick={logout}>Sair</MenuItem>
        </Menu>
      </Box>
    </Stack>
  );
}

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);
  const location = useLocation();
  const isDesktop = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'));
  const title = useMemo(() => pageTitle(location.pathname), [location.pathname]);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const { user } = useAuth();
  const today = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short'
  }).format(new Date());

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchRef.current?.focus();
      }
    }

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        elevation={0}
        className="no-print"
        sx={{
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          ml: { lg: `${drawerWidth}px` },
          bgcolor: 'rgba(255,255,255,0.94)',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
          backdropFilter: 'blur(14px)'
        }}
      >
        <Toolbar sx={{ gap: 2, minHeight: 72 }}>
          <Tooltip title="Abrir menu">
            <IconButton
              color="inherit"
              edge="start"
              aria-label="Abrir menu lateral"
              onClick={() => setMobileOpen(true)}
              sx={{ display: { lg: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
          </Tooltip>
          <Box minWidth={0} flexShrink={0}>
            <Typography variant="h6" lineHeight={1.1}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              Visão geral das operações
            </Typography>
          </Box>
          <TextField
            inputRef={searchRef}
            aria-label="Buscar entregas, pedidos ou motoristas"
            placeholder="Buscar entregas, pedidos, motoristas..."
            sx={{
              maxWidth: 460,
              ml: 'auto',
              display: { xs: 'none', md: 'block' },
              '& .MuiOutlinedInput-root': { bgcolor: '#fbfefd' }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ border: '1px solid #dbe5e1', px: 0.8, borderRadius: 1, lineHeight: 1.7 }}
                  >
                    Ctrl K
                  </Typography>
                </InputAdornment>
              )
            }}
          />
          <Stack direction="row" spacing={0.5} alignItems="center" className="no-print">
            <Tooltip title="Notificações">
              <IconButton aria-label="Abrir notificações" onClick={(event) => setNotificationAnchor(event.currentTarget)}>
                <Badge badgeContent={notifications.length} color="error">
                  <NotificationsNoneOutlinedIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title="Mensagens">
              <IconButton aria-label="Abrir mensagens">
                <Badge badgeContent={3} color="error">
                  <SmsOutlinedIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            <Button
              variant="outlined"
              startIcon={<CalendarTodayOutlinedIcon />}
              sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
            >
              {today}
            </Button>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ display: { xs: 'none', sm: 'flex' } }}>
              <Avatar sx={{ width: 38, height: 38, bgcolor: '#d1fae5', color: '#003d2f' }}>
                {user?.name?.slice(0, 1) ?? 'A'}
              </Avatar>
              <Box sx={{ display: { xs: 'none', xl: 'block' } }}>
                <Typography variant="body2" fontWeight={850}>
                  {user?.name ?? 'Administrador'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Administrador
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={() => setNotificationAnchor(null)}
        PaperProps={{ sx: { width: 380, maxWidth: 'calc(100vw - 32px)', mt: 1 } }}
      >
        <Box px={2} py={1.5}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="subtitle1">Notificações</Typography>
            <Typography variant="caption" color="text.secondary">
              {notifications.length} novas
            </Typography>
          </Stack>
        </Box>
        <Divider />
        {notifications.map((notification) => (
          <MenuItem
            key={notification.title}
            component={NavLink}
            to={notification.path}
            onClick={() => setNotificationAnchor(null)}
            sx={{ alignItems: 'flex-start', gap: 1.2, py: 1.4, whiteSpace: 'normal' }}
          >
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: 2,
                display: 'grid',
                placeItems: 'center',
                bgcolor: `${notification.color}18`,
                color: notification.color,
                flex: '0 0 auto'
              }}
            >
              {notification.icon}
            </Box>
            <Box minWidth={0} flex={1}>
              <Stack direction="row" justifyContent="space-between" gap={1}>
                <Typography variant="body2" fontWeight={850}>
                  {notification.title}
                </Typography>
                <Typography variant="caption" color="text.secondary" flexShrink={0}>
                  {notification.time}
                </Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                {notification.description}
              </Typography>
            </Box>
          </MenuItem>
        ))}
        <Divider />
        <Box p={1}>
          <Button fullWidth size="small" component={NavLink} to="/incidents" onClick={() => setNotificationAnchor(null)}>
            Ver central operacional
          </Button>
        </Box>
      </Menu>

      <Box component="nav" className="no-print" sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}>
        {isDesktop ? (
          <Drawer
            variant="permanent"
            open
            PaperProps={{ sx: { width: drawerWidth, border: 0, bgcolor: '#003d2f' } }}
          >
            <SidebarContent />
          </Drawer>
        ) : (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            PaperProps={{ sx: { width: drawerWidth, border: 0, bgcolor: '#003d2f' } }}
          >
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </Drawer>
        )}
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          pt: { xs: 10, lg: 11 },
          px: { xs: 2, md: 3 },
          pb: 4
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
