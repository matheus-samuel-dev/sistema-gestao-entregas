import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography
} from '@mui/material';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';

interface ConfirmActionDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  severity?: 'warning' | 'error' | 'info';
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmActionDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Voltar',
  severity = 'warning',
  loading = false,
  onConfirm,
  onClose
}: ConfirmActionDialogProps) {
  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Alert severity={severity} icon={<WarningAmberOutlinedIcon />}>
            Esta ação pode alterar o andamento da operação.
          </Alert>
          <Typography color="text.secondary">{description}</Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          variant="contained"
          color={severity === 'error' ? 'error' : 'primary'}
          onClick={onConfirm}
          disabled={loading}
          startIcon={loading ? <CircularProgress color="inherit" size={16} /> : undefined}
        >
          {loading ? 'Processando…' : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
