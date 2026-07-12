import { Alert, Box, Button, Card, CardContent, CircularProgress, Container, LinearProgress, Stack, TextField, Typography } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { useQuery } from '@tanstack/react-query';
import { FormEvent, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, getErrorMessage } from '../api/client';
import { BrandMark } from '../components/BrandMark';
import { StatusBadge } from '../components/StatusBadge';

interface PublicTracking {
  trackingCode: string; orderNumber: string; status: string; statusLabel: string;
  expectedAt: string; progress: number; city: string; state: string;
  approximateLat?: number | null; approximateLng?: number | null;
  timeline: Array<{ title: string; description: string; timestamp: string; status: string }>;
}

export function PublicTrackingPage() {
  const params = useParams();
  const navigate = useNavigate();
  const [code, setCode] = useState(params.code ?? '');
  const activeCode = params.code?.trim() ?? '';
  const query = useQuery({
    queryKey: ['public-tracking', activeCode],
    queryFn: async () => (await api.get<PublicTracking>(`/tracking/${encodeURIComponent(activeCode)}`)).data,
    enabled: Boolean(activeCode), retry: false
  });
  const submit = (event: FormEvent) => { event.preventDefault(); if (code.trim()) navigate(`/tracking/${encodeURIComponent(code.trim())}`); };

  return (
    <Box minHeight="100vh" sx={{ bgcolor: 'background.default', py: { xs: 2, md: 5 } }}>
      <Container maxWidth="md">
        <Stack spacing={3}>
          <BrandMark />
          <Box><Typography component="h1" variant="h4">Rastreie sua entrega</Typography><Typography color="text.secondary">Consulte o progresso sem expor informações pessoais do destinatário.</Typography></Box>
          <Card><CardContent><Stack component="form" direction={{ xs: 'column', sm: 'row' }} spacing={1} onSubmit={submit}><TextField fullWidth label="Código de rastreamento" value={code} onChange={(event) => setCode(event.target.value)} placeholder="LT-... ou PED-..." /><Button type="submit" variant="contained" startIcon={<SearchRoundedIcon />}>Consultar entrega</Button></Stack></CardContent></Card>
          {query.isLoading ? <Stack alignItems="center" py={6}><CircularProgress /><Typography mt={1} color="text.secondary">Localizando sua entrega...</Typography></Stack> : null}
          {query.isError ? <Alert severity="error">{getErrorMessage(query.error)}</Alert> : null}
          {query.data ? (
            <Card><CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
              <Stack spacing={2.5}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1}><Box><Typography variant="overline" color="text.secondary">{query.data.orderNumber}</Typography><Typography variant="h5">Destino: {query.data.city}/{query.data.state}</Typography></Box><StatusBadge status={query.data.status} label={query.data.statusLabel} /></Stack>
                <Box><Stack direction="row" justifyContent="space-between"><Typography fontWeight={800}>Progresso operacional</Typography><Typography fontWeight={900}>{query.data.progress}%</Typography></Stack><LinearProgress variant="determinate" value={query.data.progress} sx={{ height: 9, mt: 1 }} /></Box>
                <Typography>Previsão: <strong>{new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(query.data.expectedAt))}</strong></Typography>
                <Box><Typography variant="h6" mb={1.5}>Histórico</Typography><Stack spacing={1.2}>{query.data.timeline.map((item, index) => <Box key={`${item.timestamp}-${index}`} sx={{ borderLeft: '3px solid', borderColor: 'primary.main', pl: 1.5, py: .4 }}><Typography fontWeight={850}>{item.title}</Typography><Typography variant="body2" color="text.secondary">{item.description}</Typography><Typography variant="caption" color="text.secondary">{new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(item.timestamp))}</Typography></Box>)}</Stack></Box>
              </Stack>
            </CardContent></Card>
          ) : null}
        </Stack>
      </Container>
    </Box>
  );
}
