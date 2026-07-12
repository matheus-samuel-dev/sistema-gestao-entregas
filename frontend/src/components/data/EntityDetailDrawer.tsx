import {
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Typography,
  useMediaQuery
} from '@mui/material';
import type { Theme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import type { ReactNode } from 'react';

export interface DetailItem {
  label: string;
  value: ReactNode;
  fullWidth?: boolean;
}

interface EntityDetailDrawerProps {
  open: boolean;
  title: string;
  subtitle?: string;
  status?: ReactNode;
  items?: DetailItem[];
  children?: ReactNode;
  actions?: ReactNode;
  onClose: () => void;
}

export function EntityDetailDrawer({
  open,
  title,
  subtitle,
  status,
  items = [],
  children,
  actions,
  onClose
}: EntityDetailDrawerProps) {
  const fullScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: fullScreen ? '100%' : 'min(560px, 92vw)',
          p: 0
        }
      }}
    >
      <Stack height="100%">
        <Stack direction="row" spacing={2} alignItems="flex-start" justifyContent="space-between" p={2.5}>
          <Box minWidth={0}>
            <Typography component="h2" variant="h6">
              {title}
            </Typography>
            {subtitle ? (
              <Typography color="text.secondary" variant="body2" mt={0.4}>
                {subtitle}
              </Typography>
            ) : null}
            {status ? <Box mt={1}>{status}</Box> : null}
          </Box>
          <IconButton aria-label="Fechar detalhes" onClick={onClose} edge="end">
            <CloseIcon />
          </IconButton>
        </Stack>
        <Divider />
        <Box flex={1} overflow="auto" p={2.5}>
          {items.length ? (
            <Box
              component="dl"
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                gap: 2,
                m: 0
              }}
            >
              {items.map((item) => (
                <Box key={item.label} sx={{ gridColumn: item.fullWidth ? '1 / -1' : undefined, minWidth: 0 }}>
                  <Typography component="dt" variant="caption" color="text.secondary" fontWeight={800}>
                    {item.label}
                  </Typography>
                  <Box component="dd" sx={{ m: 0, mt: 0.45, overflowWrap: 'anywhere' }}>
                    {typeof item.value === 'string' || typeof item.value === 'number' ? (
                      <Typography variant="body2" fontWeight={700}>
                        {item.value}
                      </Typography>
                    ) : (
                      item.value
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          ) : null}
          {children ? <Box mt={items.length ? 3 : 0}>{children}</Box> : null}
        </Box>
        {actions ? (
          <>
            <Divider />
            <Stack direction="row" spacing={1} p={2} justifyContent="flex-end" flexWrap="wrap" useFlexGap>
              {actions}
              <Button onClick={onClose}>Fechar detalhes</Button>
            </Stack>
          </>
        ) : null}
      </Stack>
    </Drawer>
  );
}
