import { Box, Button, Stack, Typography } from '@mui/material';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';

interface EmptyStateProps {
  title: string;
  description?: string;
  onRetry?: () => void;
}

export function EmptyState({ title, description, onRetry }: EmptyStateProps) {
  return (
    <Box
      sx={{
        border: '1px dashed',
        borderColor: 'divider',
        borderRadius: 2,
        py: 6,
        px: 2,
        textAlign: 'center',
        bgcolor: '#fbfefd'
      }}
    >
      <Stack spacing={1.5} alignItems="center">
        <InboxOutlinedIcon color="disabled" fontSize="large" />
        <Typography variant="subtitle1" fontWeight={800}>
          {title}
        </Typography>
        {description ? <Typography color="text.secondary">{description}</Typography> : null}
        {onRetry ? (
          <Button startIcon={<RefreshIcon />} onClick={onRetry}>
            Atualizar
          </Button>
        ) : null}
      </Stack>
    </Box>
  );
}
