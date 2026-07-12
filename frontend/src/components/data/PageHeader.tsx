import { Box, Chip, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description: string;
  eyebrow?: string;
  icon?: ReactNode;
  primaryAction?: ReactNode;
  secondaryActions?: ReactNode;
  meta?: ReactNode;
}

export function PageHeader({
  title,
  description,
  eyebrow,
  icon,
  primaryAction,
  secondaryActions,
  meta
}: PageHeaderProps) {
  return (
    <Stack
      component="header"
      direction={{ xs: 'column', md: 'row' }}
      spacing={2}
      justifyContent="space-between"
      alignItems={{ md: 'center' }}
    >
      <Stack direction="row" spacing={1.5} alignItems="flex-start" minWidth={0}>
        {icon ? (
          <Box
            aria-hidden
            sx={{
              display: { xs: 'none', sm: 'grid' },
              placeItems: 'center',
              width: 44,
              height: 44,
              flex: '0 0 auto',
              color: 'primary.main',
              bgcolor: 'action.hover',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2
            }}
          >
            {icon}
          </Box>
        ) : null}
        <Box minWidth={0}>
          {eyebrow ? (
            <Typography variant="overline" color="primary.main" fontWeight={900} letterSpacing={1.1}>
              {eyebrow}
            </Typography>
          ) : null}
          <Typography component="h1" variant="h5">
            {title}
          </Typography>
          <Typography color="text.secondary" mt={0.35} maxWidth={760}>
            {description}
          </Typography>
          {meta ? <Box mt={1}>{meta}</Box> : null}
        </Box>
      </Stack>
      {primaryAction || secondaryActions ? (
        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          useFlexGap
          className="no-print"
          sx={{ flex: '0 0 auto', '& > *': { minHeight: 40 } }}
        >
          {secondaryActions}
          {primaryAction}
        </Stack>
      ) : null}
    </Stack>
  );
}

export function SyncStatus({ syncing, label }: { syncing: boolean; label: string }) {
  return (
    <Chip
      size="small"
      variant="outlined"
      color={syncing ? 'primary' : 'default'}
      label={syncing ? 'Sincronizando…' : label}
      sx={{ bgcolor: 'background.paper' }}
    />
  );
}
