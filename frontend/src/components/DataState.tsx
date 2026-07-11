import { Box, Button, Card, CardContent, Skeleton, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  icon?: ReactNode;
  onAction?: () => void;
  onRetry?: () => void;
}

export function EmptyState({ title, description, actionLabel, icon, onAction, onRetry }: EmptyStateProps) {
  const action = onAction ?? onRetry;
  const label = actionLabel ?? (onRetry ? 'Atualizar' : undefined);

  return (
    <Box
      className="page-enter"
      sx={{
        border: '1px dashed',
        borderColor: 'divider',
        borderRadius: 2,
        py: { xs: 5, md: 6 },
        px: 2,
        textAlign: 'center',
        bgcolor: '#fbfefd'
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

export function TableSkeleton({ rows = 7, columns = 6 }: { rows?: number; columns?: number }) {
  return (
    <Card className="page-enter">
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
    <Card className="page-enter" sx={{ height: '100%' }}>
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
