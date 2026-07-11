import { Chip } from '@mui/material';
import { statusStyle } from './status';

interface StatusBadgeProps {
  status: string;
  label?: string;
  size?: 'small' | 'medium';
}

export function StatusBadge({ status, label, size = 'small' }: StatusBadgeProps) {
  const colors = statusStyle(status);
  return (
    <Chip
      size={size}
      label={label ?? status}
      sx={{
        bgcolor: colors.bg,
        color: colors.fg,
        border: '1px solid',
        borderColor: colors.border,
        borderRadius: '6px',
        fontWeight: 850,
        letterSpacing: 0,
        '.MuiChip-label': { px: 1 }
      }}
    />
  );
}
