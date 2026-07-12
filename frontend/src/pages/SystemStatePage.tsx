import { Box, Button, Container, Stack, Typography } from '@mui/material';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import { useNavigate } from 'react-router-dom';
import { BrandMark } from '../components/BrandMark';

export function SystemStatePage({ code, title, description }: { code: string; title: string; description: string }) {
  const navigate = useNavigate();
  return <Box minHeight="100vh" display="grid" sx={{ placeItems: 'center', bgcolor: 'background.default', p: 2 }}><Container maxWidth="sm"><Stack alignItems="center" textAlign="center" spacing={2}><BrandMark /><ErrorOutlineRoundedIcon sx={{ fontSize: 56, color: 'primary.main' }} /><Typography variant="overline" color="text.secondary">Erro {code}</Typography><Typography component="h1" variant="h4">{title}</Typography><Typography color="text.secondary">{description}</Typography><Stack direction="row" spacing={1}><Button variant="contained" onClick={() => navigate('/')}>Ir ao painel</Button><Button variant="outlined" onClick={() => window.history.back()}>Voltar</Button></Stack></Stack></Container></Box>;
}
