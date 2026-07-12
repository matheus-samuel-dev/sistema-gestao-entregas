import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  Skeleton,
  Stack,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { useQuery } from '@tanstack/react-query';
import { Fragment, KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, getErrorMessage } from '../../api/client';
import { tokens } from '../../theme/tokens';
import type { SearchItem, SearchResponse } from './types';

function useDebouncedValue(value: string, delay = 280) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [delay, value]);
  return debounced;
}

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'ig'));
  return (
    <>
      {parts.map((part, index) =>
        part.toLocaleLowerCase('pt-BR') === query.toLocaleLowerCase('pt-BR') ? (
          <Box component="mark" key={`${part}-${index}`} sx={{ color: 'inherit', bgcolor: tokens.color.brand[100], borderRadius: 0.5, px: 0.25 }}>
            {part}
          </Box>
        ) : (
          <Fragment key={`${part}-${index}`}>{part}</Fragment>
        )
      )}
    </>
  );
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(5);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  const debouncedQuery = useDebouncedValue(query.trim());

  const searchQuery = useQuery({
    queryKey: ['global-search', debouncedQuery, limit],
    queryFn: async () => {
      const response = await api.get<SearchResponse>('/search', { params: { q: debouncedQuery, limit } });
      return response.data;
    },
    enabled: open && debouncedQuery.length >= 2,
    staleTime: 15_000
  });

  const flatItems = useMemo(
    () => searchQuery.data?.groups.flatMap((group) => group.items) ?? [],
    [searchQuery.data]
  );

  useEffect(() => {
    const handleShortcut = (event: globalThis.KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  useEffect(() => setActiveIndex(0), [debouncedQuery, searchQuery.data]);

  function closeSearch() {
    setOpen(false);
    setQuery('');
    setLimit(5);
  }

  function openResult(item: SearchItem) {
    closeSearch();
    navigate(item.path);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!flatItems.length) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % flatItems.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + flatItems.length) % flatItems.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      openResult(flatItems[activeIndex]);
    }
  }

  return (
    <>
      <Box
        component="button"
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir busca global"
        sx={{
          display: { xs: 'none', md: 'flex' },
          alignItems: 'center',
          gap: 1.15,
          width: { md: 300, xl: 420 },
          height: 42,
          px: 1.5,
          borderRadius: tokens.radius.md,
          border: `1px solid ${tokens.color.border}`,
          bgcolor: tokens.color.surfaceMuted,
          color: 'text.secondary',
          cursor: 'text',
          textAlign: 'left',
          transition: `border-color ${tokens.motion.quick}, box-shadow ${tokens.motion.quick}`,
          '&:hover': { borderColor: tokens.color.borderStrong, boxShadow: tokens.shadow.focus }
        }}
      >
        <SearchRoundedIcon fontSize="small" />
        <Typography variant="body2" flex={1}>Buscar em toda a operação...</Typography>
        <Box component="kbd" sx={{ font: 'inherit', fontSize: '.7rem', fontWeight: 750, px: 0.8, py: 0.25, borderRadius: 1, color: tokens.color.textMuted, bgcolor: '#fff', border: `1px solid ${tokens.color.border}` }}>Ctrl K</Box>
      </Box>
      <Tooltip title="Buscar (Ctrl + K)">
        <IconButton onClick={() => setOpen(true)} aria-label="Abrir busca global" sx={{ display: { md: 'none' } }}>
          <SearchRoundedIcon />
        </IconButton>
      </Tooltip>

      <Dialog
        open={open}
        onClose={closeSearch}
        fullWidth
        maxWidth="sm"
        aria-labelledby="global-search-title"
        PaperProps={{ sx: { position: 'fixed', top: { xs: 8, sm: '8vh' }, m: { xs: 1.5, sm: 2 }, maxHeight: { xs: 'calc(100dvh - 24px)', sm: '78vh' }, overflow: 'hidden' } }}
      >
        <Box sx={{ p: 1.5, borderBottom: `1px solid ${tokens.color.border}` }}>
          <TextField
            inputRef={inputRef}
            autoFocus
            fullWidth
            placeholder="Busque pedidos, entregas, motoristas, veículos..."
            value={query}
            onChange={(event) => { setQuery(event.target.value); setLimit(5); }}
            onKeyDown={handleKeyDown}
            inputProps={{
              'aria-label': 'Termo da busca global',
              role: 'combobox',
              'aria-expanded': flatItems.length > 0,
              'aria-controls': 'global-search-results',
              'aria-activedescendant': flatItems[activeIndex] ? `search-result-${flatItems[activeIndex].type}-${flatItems[activeIndex].id}` : undefined
            }}
            InputProps={{
              startAdornment: <InputAdornment position="start">{searchQuery.isFetching ? <CircularProgress size={18} /> : <SearchRoundedIcon color="action" />}</InputAdornment>,
              endAdornment: query ? (
                <InputAdornment position="end"><IconButton size="small" aria-label="Limpar busca" onClick={() => setQuery('')}><CloseRoundedIcon fontSize="small" /></IconButton></InputAdornment>
              ) : null
            }}
            sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#fff' } }}
          />
        </Box>

        <DialogContent sx={{ p: 0, minHeight: 260 }}>
          <Typography id="global-search-title" sx={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>Busca global</Typography>
          {query.trim().length < 2 ? (
            <Stack alignItems="center" justifyContent="center" textAlign="center" minHeight={280} px={4} spacing={1}>
              <Box sx={{ width: 54, height: 54, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: tokens.color.brand[50], color: 'primary.main' }}><SearchRoundedIcon /></Box>
              <Typography fontWeight={800}>Encontre qualquer item da operação</Typography>
              <Typography variant="body2" color="text.secondary">Digite ao menos dois caracteres. Use ↑ ↓ para navegar e Enter para abrir.</Typography>
            </Stack>
          ) : searchQuery.isLoading ? (
            <Stack p={2} spacing={1.25}>{[1, 2, 3, 4].map((item) => <Skeleton key={item} variant="rounded" height={58} />)}</Stack>
          ) : searchQuery.isError ? (
            <Box p={2.5}><Alert severity="error" action={<Button color="inherit" size="small" onClick={() => searchQuery.refetch()}>Tentar novamente</Button>}>{getErrorMessage(searchQuery.error)}</Alert></Box>
          ) : !flatItems.length ? (
            <Stack alignItems="center" justifyContent="center" textAlign="center" minHeight={280} px={4} spacing={1}>
              <Typography fontWeight={800}>Nenhum resultado para “{debouncedQuery}”</Typography>
              <Typography variant="body2" color="text.secondary">Confira a escrita ou tente um número de pedido, placa ou nome.</Typography>
            </Stack>
          ) : (
            <List id="global-search-results" role="listbox" disablePadding sx={{ py: 1 }}>
              {searchQuery.data?.groups.map((group) => (
                <Box key={group.type} component="li" sx={{ listStyle: 'none' }}>
                  <Stack direction="row" justifyContent="space-between" px={2} pt={1.4} pb={0.6}>
                    <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '.055em' }}>{group.label}</Typography>
                    <Typography variant="caption" color="text.secondary">{group.total}</Typography>
                  </Stack>
                  {group.items.map((item) => {
                    const index = flatItems.findIndex((candidate) => candidate.type === item.type && String(candidate.id) === String(item.id));
                    return (
                      <ListItemButton
                        key={`${item.type}-${item.id}`}
                        id={`search-result-${item.type}-${item.id}`}
                        role="option"
                        selected={index === activeIndex}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => openResult(item)}
                        sx={{ mx: 1, borderRadius: tokens.radius.sm, py: 1, '&.Mui-selected': { bgcolor: tokens.color.brand[50] } }}
                      >
                        <ListItemText
                          primary={<Typography variant="body2" fontWeight={800}><Highlight text={item.title} query={debouncedQuery} /></Typography>}
                          secondary={<Typography variant="caption" color="text.secondary"><Highlight text={item.subtitle} query={debouncedQuery} /></Typography>}
                        />
                        {item.status ? <Chip label={item.status} size="small" variant="outlined" /> : null}
                        <ArrowForwardRoundedIcon fontSize="small" sx={{ ml: 1, color: 'text.secondary' }} />
                      </ListItemButton>
                    );
                  })}
                </Box>
              ))}
            </List>
          )}
        </DialogContent>
        {Boolean(searchQuery.data?.total && searchQuery.data.total > flatItems.length) ? (
          <Box sx={{ p: 1.25, borderTop: `1px solid ${tokens.color.border}` }}>
            <Button fullWidth onClick={() => setLimit(25)} disabled={limit > 5}>Ver todos os {searchQuery.data?.total} resultados</Button>
          </Box>
        ) : null}
      </Dialog>
    </>
  );
}
