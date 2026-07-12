import {
  Alert,
  Badge,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItemButton,
  Popover,
  Skeleton,
  Stack,
  Tooltip,
  Typography
} from '@mui/material';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MouseEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, getErrorMessage } from '../../api/client';
import { tokens } from '../../theme/tokens';
import type { NotificationItem, NotificationResponse } from './types';
import { relativeTime } from './types';

const queryKey = ['notifications'] as const;

function notificationAppearance(type: string) {
  const normalized = type.toUpperCase();
  if (normalized.includes('DELAY') || normalized.includes('SLA')) return { icon: <ScheduleRoundedIcon />, color: tokens.color.error, background: '#fff1f2' };
  if (normalized.includes('INCIDENT') || normalized.includes('CRITICAL')) return { icon: <ReportProblemOutlinedIcon />, color: tokens.color.warning, background: '#fff7ed' };
  if (normalized.includes('MAINTENANCE') || normalized.includes('VEHICLE')) return { icon: <BuildOutlinedIcon />, color: tokens.color.violet, background: '#f5f3ff' };
  if (normalized.includes('ROUTE')) return { icon: <RouteOutlinedIcon />, color: tokens.color.info, background: '#eff6ff' };
  if (normalized.includes('COMPLETE') || normalized.includes('DELIVERED')) return { icon: <CheckCircleOutlineRoundedIcon />, color: tokens.color.success, background: '#ecfdf5' };
  return { icon: <LocalShippingOutlinedIcon />, color: tokens.color.brand[600], background: tokens.color.brand[50] };
}

function groupLabel(dateValue: string) {
  const value = new Date(dateValue);
  if (Number.isNaN(value.getTime())) return 'Anteriores';
  const today = new Date();
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const startValue = new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();
  const difference = Math.round((startToday - startValue) / 86_400_000);
  if (difference <= 0) return 'Hoje';
  if (difference === 1) return 'Ontem';
  return 'Anteriores';
}

export function NotificationCenter() {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const notificationsQuery = useQuery({
    queryKey,
    queryFn: async () => (await api.get<NotificationResponse>('/notifications', { params: { unreadOnly: false } })).data,
    refetchInterval: 30_000,
    staleTime: 15_000
  });

  const groups = useMemo(() => {
    const result = new Map<string, NotificationItem[]>([['Hoje', []], ['Ontem', []], ['Anteriores', []]]);
    for (const item of notificationsQuery.data?.items ?? []) result.get(groupLabel(item.createdAt))?.push(item);
    return [...result.entries()].filter(([, items]) => items.length > 0);
  }, [notificationsQuery.data]);

  const markRead = useMutation({
    mutationFn: (id: number) => api.patch(`/notifications/${id}/read`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<NotificationResponse>(queryKey);
      queryClient.setQueryData<NotificationResponse>(queryKey, (current) => current ? {
        ...current,
        unreadCount: Math.max(0, current.unreadCount - (current.items.find((item) => item.id === id && !item.read) ? 1 : 0)),
        items: current.items.map((item) => item.id === id ? { ...item, read: true } : item)
      } : current);
      return { previous };
    },
    onError: (_error, _id, context) => queryClient.setQueryData(queryKey, context?.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey })
  });

  const markAllRead = useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<NotificationResponse>(queryKey);
      queryClient.setQueryData<NotificationResponse>(queryKey, (current) => current ? { unreadCount: 0, items: current.items.map((item) => ({ ...item, read: true })) } : current);
      return { previous };
    },
    onError: (_error, _variables, context) => queryClient.setQueryData(queryKey, context?.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey })
  });

  const removeNotification = useMutation({
    mutationFn: (id: number) => api.delete(`/notifications/${id}`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<NotificationResponse>(queryKey);
      queryClient.setQueryData<NotificationResponse>(queryKey, (current) => {
        if (!current) return current;
        const removed = current.items.find((item) => item.id === id);
        return { items: current.items.filter((item) => item.id !== id), unreadCount: Math.max(0, current.unreadCount - (removed && !removed.read ? 1 : 0)) };
      });
      return { previous };
    },
    onError: (_error, _id, context) => queryClient.setQueryData(queryKey, context?.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey })
  });

  function openNotification(item: NotificationItem) {
    if (!item.read) markRead.mutate(item.id);
    setAnchor(null);
    if (item.path) navigate(item.path);
  }

  const mutationError = markRead.error ?? markAllRead.error ?? removeNotification.error;

  return (
    <>
      <Tooltip title="Notificações">
        <IconButton
          aria-label={`${notificationsQuery.data?.unreadCount ?? 0} notificações não lidas`}
          aria-haspopup="dialog"
          aria-expanded={Boolean(anchor)}
          onClick={(event: MouseEvent<HTMLElement>) => setAnchor(event.currentTarget)}
        >
          <Badge badgeContent={notificationsQuery.data?.unreadCount ?? 0} color="error" max={99}>
            <NotificationsNoneRoundedIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { mt: 1, width: 410, maxWidth: 'calc(100vw - 24px)', maxHeight: 'min(680px, calc(100dvh - 92px))', display: 'flex', flexDirection: 'column' } } }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" p={2} gap={2}>
          <Box>
            <Typography variant="h6">Notificações</Typography>
            <Typography variant="caption" color="text.secondary">Atualizadas automaticamente</Typography>
          </Box>
          <Tooltip title="Marcar todas como lidas">
            <span><IconButton size="small" aria-label="Marcar todas como lidas" disabled={!notificationsQuery.data?.unreadCount || markAllRead.isPending} onClick={() => markAllRead.mutate()}>{markAllRead.isPending ? <CircularProgress size={16} /> : <DoneAllRoundedIcon fontSize="small" />}</IconButton></span>
          </Tooltip>
        </Stack>
        <Divider />

        <Box sx={{ overflowY: 'auto', flex: 1 }}>
          {mutationError ? <Alert severity="error" sx={{ m: 1.5 }}>{getErrorMessage(mutationError)}</Alert> : null}
          {notificationsQuery.isLoading ? (
            <Stack p={1.5} spacing={1}>{[1, 2, 3, 4].map((item) => <Skeleton key={item} variant="rounded" height={72} />)}</Stack>
          ) : notificationsQuery.isError ? (
            <Box p={2}><Alert severity="error" action={<Button color="inherit" size="small" onClick={() => notificationsQuery.refetch()}>Tentar novamente</Button>}>{getErrorMessage(notificationsQuery.error)}</Alert></Box>
          ) : !notificationsQuery.data?.items.length ? (
            <Stack alignItems="center" textAlign="center" px={4} py={7} spacing={1}>
              <Box sx={{ width: 54, height: 54, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: tokens.color.brand[50], color: 'primary.main' }}><DoneAllRoundedIcon /></Box>
              <Typography fontWeight={800}>Tudo em dia por aqui</Typography>
              <Typography variant="body2" color="text.secondary">Novos alertas operacionais aparecerão nesta central.</Typography>
            </Stack>
          ) : (
            <List disablePadding>
              {groups.map(([label, items]) => (
                <Box component="li" key={label} sx={{ listStyle: 'none' }}>
                  <Typography component="h3" variant="caption" fontWeight={800} color="text.secondary" sx={{ display: 'block', px: 2, pt: 1.7, pb: 0.7, textTransform: 'uppercase', letterSpacing: '.055em' }}>{label}</Typography>
                  {items.map((item) => {
                    const appearance = notificationAppearance(item.type);
                    return (
                      <Box key={item.id} sx={{ position: 'relative', mx: 0.75, mb: 0.35, borderRadius: tokens.radius.sm, bgcolor: item.read ? 'transparent' : tokens.color.brand[50] }}>
                        <ListItemButton onClick={() => openNotification(item)} sx={{ alignItems: 'flex-start', borderRadius: 'inherit', pr: 9, py: 1.25 }}>
                          <Box sx={{ width: 38, height: 38, mr: 1.25, flex: '0 0 auto', borderRadius: tokens.radius.sm, display: 'grid', placeItems: 'center', color: appearance.color, bgcolor: appearance.background, '& svg': { fontSize: 20 } }}>{appearance.icon}</Box>
                          <Box minWidth={0}>
                            <Stack direction="row" alignItems="center" spacing={0.75}>
                              {!item.read ? <Box aria-label="Não lida" sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: 'primary.main', flex: '0 0 auto' }} /> : null}
                              <Typography variant="body2" fontWeight={item.read ? 700 : 850}>{item.title}</Typography>
                            </Stack>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.2 }}>{item.message}</Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.45, fontSize: '.68rem' }}>{relativeTime(item.createdAt)}</Typography>
                          </Box>
                        </ListItemButton>
                        <Stack direction="row" sx={{ position: 'absolute', right: 6, top: 8 }}>
                          {!item.read ? <Tooltip title="Marcar como lida"><IconButton size="small" aria-label={`Marcar ${item.title} como lida`} onClick={(event) => { event.stopPropagation(); markRead.mutate(item.id); }}><CheckCircleOutlineRoundedIcon sx={{ fontSize: 17 }} /></IconButton></Tooltip> : null}
                          <Tooltip title="Excluir"><IconButton size="small" aria-label={`Excluir ${item.title}`} onClick={(event) => { event.stopPropagation(); removeNotification.mutate(item.id); }}><DeleteOutlineRoundedIcon sx={{ fontSize: 17 }} /></IconButton></Tooltip>
                        </Stack>
                      </Box>
                    );
                  })}
                </Box>
              ))}
            </List>
          )}
        </Box>
      </Popover>
    </>
  );
}
