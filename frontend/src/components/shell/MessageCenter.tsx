import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Skeleton,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery
} from '@mui/material';
import type { Theme } from '@mui/material/styles';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import SmsOutlinedIcon from '@mui/icons-material/SmsOutlined';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { KeyboardEvent, MouseEvent, useEffect, useMemo, useRef, useState } from 'react';
import { api, getErrorMessage } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import { tokens } from '../../theme/tokens';
import type { ConversationDetail, ConversationSummary } from './types';
import { getInitials, relativeTime } from './types';

function useDebouncedValue(value: string, delay = 280) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [delay, value]);
  return debounced;
}

type AttachmentType = 'ORDER' | 'INCIDENT' | null;

export function MessageCenter() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeId, setActiveId] = useState<number | null>(null);
  const [content, setContent] = useState('');
  const [attachmentType, setAttachmentType] = useState<AttachmentType>(null);
  const [attachmentId, setAttachmentId] = useState('');
  const [attachmentAnchor, setAttachmentAnchor] = useState<HTMLElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const lastMarkedId = useRef<number | null>(null);
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
  const debouncedSearch = useDebouncedValue(search.trim());
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const conversationsQuery = useQuery({
    queryKey: ['conversations', debouncedSearch],
    queryFn: async () => (await api.get<ConversationSummary[]>('/conversations', { params: { query: debouncedSearch } })).data,
    refetchInterval: 20_000,
    staleTime: 10_000
  });

  const conversationQuery = useQuery({
    queryKey: ['conversation', activeId],
    queryFn: async () => (await api.get<ConversationDetail>(`/conversations/${activeId}`)).data,
    enabled: open && activeId !== null,
    refetchInterval: open ? 10_000 : false
  });

  const totalUnread = useMemo(
    () => conversationsQuery.data?.reduce((total, item) => total + item.unreadCount, 0) ?? 0,
    [conversationsQuery.data]
  );

  const markRead = useMutation({
    mutationFn: (id: number) => api.patch(`/conversations/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['conversations'] })
  });

  const sendMessage = useMutation({
    mutationFn: () => api.post(`/conversations/${activeId}/messages`, {
      content: content.trim(),
      ...(attachmentType && attachmentId ? { attachmentType, attachmentId: Number(attachmentId) } : {})
    }),
    onSuccess: async () => {
      setContent('');
      setAttachmentType(null);
      setAttachmentId('');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['conversation', activeId] }),
        queryClient.invalidateQueries({ queryKey: ['conversations'] })
      ]);
    }
  });

  useEffect(() => {
    if (!open || isMobile || activeId !== null || !conversationsQuery.data?.length) return;
    setActiveId(conversationsQuery.data[0].id);
  }, [activeId, conversationsQuery.data, isMobile, open]);

  useEffect(() => {
    if (!conversationQuery.data || activeId === null || lastMarkedId.current === activeId) return;
    const summary = conversationsQuery.data?.find((item) => item.id === activeId);
    if (summary?.unreadCount) {
      lastMarkedId.current = activeId;
      markRead.mutate(activeId);
    }
  }, [activeId, conversationQuery.data, conversationsQuery.data, markRead]);

  useEffect(() => {
    if (conversationQuery.data?.messages.length) endRef.current?.scrollIntoView({ block: 'end' });
  }, [conversationQuery.data?.messages.length]);

  function selectConversation(id: number) {
    setActiveId(id);
    lastMarkedId.current = null;
  }

  function close() {
    setOpen(false);
    setAttachmentAnchor(null);
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (content.trim() && (!attachmentType || Number(attachmentId) > 0) && !sendMessage.isPending) sendMessage.mutate();
    }
  }

  const attachmentValid = !attachmentType || Number(attachmentId) > 0;
  const showList = !isMobile || activeId === null;
  const showConversation = !isMobile || activeId !== null;

  return (
    <>
      <Tooltip title="Central de mensagens">
        <IconButton aria-label={`${totalUnread} mensagens não lidas`} onClick={() => setOpen(true)}>
          <Badge badgeContent={totalUnread} color="error" max={99}><SmsOutlinedIcon /></Badge>
        </IconButton>
      </Tooltip>

      <Drawer
        anchor="right"
        open={open}
        onClose={close}
        ModalProps={{ keepMounted: true }}
        PaperProps={{ sx: { width: { xs: '100%', sm: 760, md: 840 }, maxWidth: '100vw' } }}
      >
        <Stack height="100dvh" minHeight={0}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" px={{ xs: 2, sm: 2.5 }} py={1.6}>
            <Box>
              <Typography variant="h6">Central de mensagens</Typography>
              <Typography variant="caption" color="text.secondary">Comunicação operacional integrada</Typography>
            </Box>
            <IconButton aria-label="Fechar mensagens" onClick={close}><CloseRoundedIcon /></IconButton>
          </Stack>
          <Divider />

          <Box sx={{ minHeight: 0, flex: 1, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '300px minmax(0, 1fr)' } }}>
            {showList ? (
              <Stack minHeight={0} sx={{ borderRight: { sm: `1px solid ${tokens.color.border}` } }}>
                <Box p={1.5}>
                  <TextField
                    fullWidth
                    placeholder="Buscar conversa..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    inputProps={{ 'aria-label': 'Buscar conversas' }}
                    InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> }}
                  />
                </Box>
                <Divider />
                <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                  {conversationsQuery.isLoading ? (
                    <Stack p={1.5} spacing={1}>{[1, 2, 3, 4].map((item) => <Skeleton key={item} variant="rounded" height={68} />)}</Stack>
                  ) : conversationsQuery.isError ? (
                    <Box p={1.5}><Alert severity="error" action={<Button color="inherit" size="small" onClick={() => conversationsQuery.refetch()}>Tentar</Button>}>{getErrorMessage(conversationsQuery.error)}</Alert></Box>
                  ) : !conversationsQuery.data?.length ? (
                    <Stack alignItems="center" textAlign="center" p={4} spacing={1}><SmsOutlinedIcon color="disabled" /><Typography fontWeight={800}>Nenhuma conversa</Typography><Typography variant="body2" color="text.secondary">As conversas da equipe aparecerão aqui.</Typography></Stack>
                  ) : (
                    <List disablePadding sx={{ py: 0.75 }}>
                      {conversationsQuery.data.map((conversation) => (
                        <ListItemButton key={conversation.id} selected={conversation.id === activeId} onClick={() => selectConversation(conversation.id)} sx={{ mx: 0.75, mb: 0.35, px: 1.25, borderRadius: tokens.radius.sm, alignItems: 'flex-start' }}>
                          <Badge color="primary" variant="dot" invisible={!conversation.unreadCount} overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                            <Avatar sx={{ width: 38, height: 38, mr: 1.1, bgcolor: tokens.color.brand[100], color: tokens.color.brand[900], fontSize: '.78rem', fontWeight: 800 }}>{getInitials(conversation.participantName)}</Avatar>
                          </Badge>
                          <ListItemText
                            sx={{ m: 0, minWidth: 0 }}
                            primary={<Stack direction="row" justifyContent="space-between" gap={1}><Typography variant="body2" fontWeight={conversation.unreadCount ? 850 : 750} noWrap>{conversation.participantName}</Typography><Typography variant="caption" color="text.secondary" sx={{ fontSize: '.65rem', flexShrink: 0 }}>{relativeTime(conversation.lastMessageAt)}</Typography></Stack>}
                            secondary={<Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', mt: 0.25 }}>{conversation.lastMessage}</Typography>}
                          />
                          {conversation.unreadCount ? <Badge badgeContent={conversation.unreadCount} color="primary" sx={{ ml: 0.75, mt: 3 }} /> : null}
                        </ListItemButton>
                      ))}
                    </List>
                  )}
                </Box>
              </Stack>
            ) : null}

            {showConversation ? (
              activeId === null ? (
                <Stack alignItems="center" justifyContent="center" textAlign="center" p={4} spacing={1}><SmsOutlinedIcon sx={{ fontSize: 40, color: 'text.disabled' }} /><Typography fontWeight={800}>Selecione uma conversa</Typography><Typography variant="body2" color="text.secondary">Escolha um contato para visualizar o histórico.</Typography></Stack>
              ) : (
                <Stack minHeight={0}>
                  <Stack direction="row" alignItems="center" spacing={1.2} px={1.5} py={1.25}>
                    {isMobile ? <IconButton aria-label="Voltar para conversas" onClick={() => setActiveId(null)}><ArrowBackRoundedIcon /></IconButton> : null}
                    <Avatar sx={{ width: 38, height: 38, bgcolor: tokens.color.brand[100], color: tokens.color.brand[900], fontSize: '.78rem', fontWeight: 800 }}>{getInitials(conversationQuery.data?.participantName)}</Avatar>
                    <Box minWidth={0} flex={1}>
                      <Typography variant="body2" fontWeight={850} noWrap>{conversationQuery.data?.participantName ?? 'Carregando...'}</Typography>
                      <Typography variant="caption" color="text.secondary">{conversationQuery.data?.participantRole ?? 'Equipe operacional'}</Typography>
                    </Box>
                    {conversationQuery.data?.contextType ? <Chip size="small" label={`${conversationQuery.data.contextType} #${conversationQuery.data.contextId}`} variant="outlined" /> : null}
                  </Stack>
                  <Divider />

                  <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: { xs: 1.5, sm: 2 }, bgcolor: tokens.color.surfaceMuted }}>
                    {conversationQuery.isLoading ? (
                      <Stack spacing={1.5}>{[1, 2, 3].map((item) => <Skeleton key={item} variant="rounded" height={64} sx={{ width: item % 2 ? '76%' : '64%', ml: item % 2 ? 0 : 'auto' }} />)}</Stack>
                    ) : conversationQuery.isError ? (
                      <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => conversationQuery.refetch()}>Tentar</Button>}>{getErrorMessage(conversationQuery.error)}</Alert>
                    ) : !conversationQuery.data?.messages.length ? (
                      <Stack alignItems="center" textAlign="center" py={8}><Typography fontWeight={800}>Comece a conversa</Typography><Typography variant="body2" color="text.secondary">Envie uma mensagem para a equipe.</Typography></Stack>
                    ) : (
                      <Stack spacing={1.15}>
                        {conversationQuery.data.messages.map((message) => {
                          const mine = message.senderName === user?.name || message.senderRole === 'ADMIN';
                          return (
                            <Box key={message.id} sx={{ maxWidth: '82%', alignSelf: mine ? 'flex-end' : 'flex-start' }}>
                              <Box sx={{ px: 1.5, py: 1.05, borderRadius: mine ? '14px 14px 4px 14px' : '14px 14px 14px 4px', bgcolor: mine ? tokens.color.brand[700] : '#fff', color: mine ? '#fff' : 'text.primary', border: mine ? 0 : `1px solid ${tokens.color.border}`, boxShadow: '0 4px 12px rgba(15,35,27,.04)' }}>
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{message.content}</Typography>
                                {message.attachmentType ? <Chip size="small" icon={message.attachmentType === 'ORDER' ? <Inventory2OutlinedIcon /> : <ReportProblemOutlinedIcon />} label={`${message.attachmentType === 'ORDER' ? 'Pedido' : 'Ocorrência'} #${message.attachmentId}`} sx={{ mt: 0.8, bgcolor: mine ? 'rgba(255,255,255,.14)' : tokens.color.surfaceMuted, color: 'inherit' }} /> : null}
                              </Box>
                              <Stack direction="row" justifyContent={mine ? 'flex-end' : 'flex-start'} alignItems="center" spacing={0.4} mt={0.35} px={0.4}><Typography variant="caption" color="text.secondary" sx={{ fontSize: '.65rem' }}>{relativeTime(message.createdAt)}</Typography>{mine ? <CheckRoundedIcon sx={{ fontSize: 13, color: message.read ? 'primary.main' : 'text.disabled' }} /> : null}</Stack>
                            </Box>
                          );
                        })}
                        <div ref={endRef} />
                      </Stack>
                    )}
                  </Box>

                  <Divider />
                  <Box p={1.25}>
                    {sendMessage.isError ? <Alert severity="error" sx={{ mb: 1 }}>{getErrorMessage(sendMessage.error)}</Alert> : null}
                    {attachmentType ? (
                      <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                        <Chip label={attachmentType === 'ORDER' ? 'Vincular pedido' : 'Vincular ocorrência'} onDelete={() => { setAttachmentType(null); setAttachmentId(''); }} />
                        <TextField size="small" type="number" value={attachmentId} onChange={(event) => setAttachmentId(event.target.value)} label={attachmentType === 'ORDER' ? 'ID do pedido' : 'ID da ocorrência'} error={Boolean(attachmentId) && Number(attachmentId) <= 0} sx={{ maxWidth: 170 }} />
                      </Stack>
                    ) : null}
                    <Stack direction="row" spacing={0.75} alignItems="flex-end">
                      <Tooltip title="Anexar contexto"><IconButton aria-label="Anexar pedido ou ocorrência" onClick={(event: MouseEvent<HTMLElement>) => setAttachmentAnchor(event.currentTarget)}><AttachFileRoundedIcon /></IconButton></Tooltip>
                      <TextField fullWidth multiline maxRows={4} placeholder="Escreva uma mensagem..." value={content} onChange={(event) => setContent(event.target.value)} onKeyDown={handleComposerKeyDown} inputProps={{ 'aria-label': 'Mensagem' }} />
                      <Tooltip title="Enviar mensagem"><span><IconButton color="primary" aria-label="Enviar mensagem" disabled={!content.trim() || !attachmentValid || sendMessage.isPending} onClick={() => sendMessage.mutate()} sx={{ bgcolor: tokens.color.brand[50] }}>{sendMessage.isPending ? <CircularProgress size={18} /> : <SendRoundedIcon />}</IconButton></span></Tooltip>
                    </Stack>
                  </Box>
                </Stack>
              )
            ) : null}
          </Box>
        </Stack>
      </Drawer>

      <Menu anchorEl={attachmentAnchor} open={Boolean(attachmentAnchor)} onClose={() => setAttachmentAnchor(null)}>
        <MenuItem onClick={() => { setAttachmentType('ORDER'); setAttachmentAnchor(null); }}><Inventory2OutlinedIcon fontSize="small" sx={{ mr: 1.2 }} />Vincular pedido</MenuItem>
        <MenuItem onClick={() => { setAttachmentType('INCIDENT'); setAttachmentAnchor(null); }}><ReportProblemOutlinedIcon fontSize="small" sx={{ mr: 1.2 }} />Vincular ocorrência</MenuItem>
      </Menu>
    </>
  );
}
