import {
  Alert, Box, Button, CircularProgress, Divider, IconButton, List, ListItemButton,
  Popover, Stack, Tooltip, Typography
} from '@mui/material';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, getErrorMessage } from '../../api/client';
import type { CalendarResponse } from './types';
import { toLocalIsoDate } from './types';
import { tokens } from '../../theme/tokens';

export function CalendarCenter() {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [date, setDate] = useState(() => new Date());
  const navigate = useNavigate();
  const isoDate = toLocalIsoDate(date);
  const query = useQuery({
    queryKey: ['calendar', isoDate],
    queryFn: async () => (await api.get<CalendarResponse>('/calendar', { params: { date: isoDate } })).data,
    enabled: Boolean(anchor),
    staleTime: 30_000
  });

  const label = new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }).format(new Date());
  const selectedLabel = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }).format(date);
  const move = (days: number) => setDate((current) => new Date(current.getFullYear(), current.getMonth(), current.getDate() + days));

  return (
    <>
      <Tooltip title="Agenda operacional">
        <Button
          variant="outlined"
          startIcon={<CalendarTodayOutlinedIcon />}
          onClick={(event) => setAnchor(event.currentTarget)}
          aria-label="Abrir agenda operacional"
          sx={{ minWidth: 0, px: { xs: 1, sm: 1.5 }, '& .MuiButton-startIcon': { mr: { xs: 0, sm: 1 } } }}
        >
          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>{label}</Box>
        </Button>
      </Tooltip>
      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { width: 390, maxWidth: 'calc(100vw - 24px)', mt: 1 } }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" p={1.5}>
          <IconButton aria-label="Dia anterior" onClick={() => move(-1)}><ChevronLeftRoundedIcon /></IconButton>
          <Box textAlign="center">
            <Typography fontWeight={850} sx={{ textTransform: 'capitalize' }}>{selectedLabel}</Typography>
            {isoDate !== toLocalIsoDate(new Date()) ? <Button size="small" onClick={() => setDate(new Date())}>Voltar para hoje</Button> : null}
          </Box>
          <IconButton aria-label="Próximo dia" onClick={() => move(1)}><ChevronRightRoundedIcon /></IconButton>
        </Stack>
        <Divider />
        <Box sx={{ maxHeight: 430, overflowY: 'auto', minHeight: 220 }}>
          {query.isLoading ? (
            <Stack alignItems="center" justifyContent="center" minHeight={220}><CircularProgress size={28} /></Stack>
          ) : query.isError ? (
            <Box p={2}><Alert severity="error" action={<Button color="inherit" size="small" onClick={() => query.refetch()}>Tentar</Button>}>{getErrorMessage(query.error)}</Alert></Box>
          ) : !query.data?.items.length ? (
            <Stack alignItems="center" textAlign="center" justifyContent="center" minHeight={220} p={3} spacing={1}>
              <EventBusyOutlinedIcon sx={{ color: 'text.disabled', fontSize: 38 }} />
              <Typography fontWeight={850}>Agenda livre neste dia</Typography>
              <Typography variant="body2" color="text.secondary">Entregas previstas e ocorrências prioritárias aparecerão aqui.</Typography>
            </Stack>
          ) : (
            <List disablePadding sx={{ py: 1 }}>
              {query.data.items.map((item) => (
                <ListItemButton
                  key={`${item.type}-${item.id}`}
                  onClick={() => { if (item.path) navigate(item.path); setAnchor(null); }}
                  sx={{ mx: 1, mb: .5, borderRadius: tokens.radius.sm, border: `1px solid ${tokens.color.border}`, alignItems: 'flex-start' }}
                >
                  <Box sx={{ width: 42, mr: 1.25, color: 'primary.main', fontWeight: 850, fontSize: '.78rem', pt: .15 }}>
                    {new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date(item.startAt))}
                  </Box>
                  <Box minWidth={0}>
                    <Typography variant="body2" fontWeight={850}>{item.title}</Typography>
                    <Typography variant="caption" color="text.secondary">{item.subtitle}</Typography>
                    {item.status ? <Typography variant="caption" display="block" color="primary.main" fontWeight={750}>{item.status}</Typography> : null}
                  </Box>
                </ListItemButton>
              ))}
            </List>
          )}
        </Box>
      </Popover>
    </>
  );
}
