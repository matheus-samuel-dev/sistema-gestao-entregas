import { Alert, Box, Button, Card, CardContent, Skeleton, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloudOffOutlinedIcon from '@mui/icons-material/CloudOffOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  icon?: ReactNode;
  onAction?: () => void;
  onRetry?: () => void;
  compact?: boolean;
}

export function EmptyState({ title, description, actionLabel, icon, onAction, onRetry, compact = false }: EmptyStateProps) {
  const action = onAction ?? onRetry;
  const label = actionLabel ?? (onRetry ? 'Atualizar' : undefined);

  return (
    <Box
      className="page-enter"
      sx={{
        border: '1px dashed',
        borderColor: 'divider',
        borderRadius: 2,
        py: compact ? 3 : { xs: 5, md: 6 },
        px: 2,
        textAlign: 'center',
        bgcolor: 'background.paper'
      }}
    >
      <Stack spacing={1.5} alignItems="center" maxWidth={460} mx="auto">
        <Box
          sx={{
            width: 58,
            height: 58,
            borderRadius: 2,
            display: 'grid',
            placeItems: 'center',
            bgcolor: '#ddf8eb',
            color: 'primary.dark'
          }}
        >
          {icon ?? <InboxOutlinedIcon fontSize="large" />}
        </Box>
        <Typography variant="subtitle1">{title}</Typography>
        {description ? (
          <Typography color="text.secondary" maxWidth={420}>
            {description}
          </Typography>
        ) : null}
        {action && label ? (
          <Button startIcon={onRetry && !onAction ? <RefreshIcon /> : undefined} variant="contained" onClick={action}>
            {label}
          </Button>
        ) : null}
      </Stack>
    </Box>
  );
}

export function ErrorState({
  title = 'Não foi possível carregar os dados',
  description = 'Tente novamente. Se o problema persistir, verifique a conexão com a API.',
  onRetry
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      title={title}
      description={description}
      icon={<ErrorOutlineOutlinedIcon color="error" fontSize="large" />}
      onRetry={onRetry}
      actionLabel="Tentar novamente"
    />
  );
}

export function OfflineState({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      title="Você está offline"
      description="Os dados já carregados continuam disponíveis. Reconecte-se para sincronizar alterações."
      icon={<CloudOffOutlinedIcon fontSize="large" />}
      onRetry={onRetry}
      actionLabel="Verificar conexão"
    />
  );
}

export function BackgroundSyncAlert() {
  return (
    <Alert severity="info" variant="outlined" role="status" sx={{ py: 0 }}>
      Sincronizando dados em segundo plano…
    </Alert>
  );
}

export function TableSkeleton({ rows = 7, columns = 6 }: { rows?: number; columns?: number }) {
  return (
    <Card className="page-enter" aria-busy="true" aria-label="Carregando tabela">
      <CardContent>
        <Stack spacing={1.2}>
          <Skeleton variant="rounded" height={42} />
          {Array.from({ length: rows }).map((_, row) => (
            <Stack key={row} direction="row" spacing={1.2}>
              {Array.from({ length: columns }).map((__, column) => (
                <Skeleton key={column} height={34} sx={{ flex: column === 1 ? 1.5 : 1 }} />
              ))}
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

export function CardSkeleton({ rows = 3, height = 160 }: { rows?: number; height?: number }) {
  return (
    <Card className="page-enter" aria-busy="true" aria-label="Carregando conteúdo" sx={{ height: '100%' }}>
      <CardContent>
        <Stack spacing={1.4}>
          <Skeleton variant="rounded" height={height} />
          {Array.from({ length: rows }).map((_, index) => (
            <Skeleton key={index} height={22} width={`${86 - index * 14}%`} />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
