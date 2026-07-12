import { Box, Chip } from '@mui/material';
import { statusLabel, statusStyle } from './status';

interface StatusBadgeProps {
  status: string;
  label?: string;
  size?: 'small' | 'medium';
}

export function StatusBadge({ status, label, size = 'small' }: StatusBadgeProps) {
  const colors = statusStyle(status);
  const resolvedLabel = statusLabel(status, label);
  return (
    <Chip
      size={size}
      aria-label={`Status: ${resolvedLabel}`}
      icon={
        <Box
          component="span"
          aria-hidden
          sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: 'currentColor', ml: '8px !important' }}
        />
      }
      label={resolvedLabel}
      sx={{
        bgcolor: colors.bg,
        color: colors.fg,
        border: '1px solid',
        borderColor: colors.border,
        borderRadius: '6px',
        fontWeight: 850,
        letterSpacing: 0,
        '.MuiChip-label': { pl: 0.6, pr: 1 },
        '.MuiChip-icon': { color: 'inherit' }
      }}
    />
  );
}
