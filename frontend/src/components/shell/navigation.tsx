import type { ReactNode } from 'react';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import PinDropOutlinedIcon from '@mui/icons-material/PinDropOutlined';
import RadarOutlinedIcon from '@mui/icons-material/RadarOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';

export interface NavigationItem {
  label: string;
  path: string;
  icon: ReactNode;
  end?: boolean;
}

export interface NavigationGroup {
  label: string;
  items: NavigationItem[];
}

export const navigationGroups: NavigationGroup[] = [
  {
    label: 'Operação',
    items: [
      { label: 'Dashboard', path: '/', icon: <DashboardOutlinedIcon />, end: true },
      { label: 'Centro operacional', path: '/operations', icon: <RadarOutlinedIcon /> },
      { label: 'Pedidos', path: '/orders', icon: <Inventory2OutlinedIcon /> },
      { label: 'Entregas', path: '/deliveries', icon: <LocalShippingOutlinedIcon /> },
      { label: 'Rotas', path: '/routes', icon: <PinDropOutlinedIcon /> }
    ]
  },
  {
    label: 'Recursos',
    items: [
      { label: 'Motoristas', path: '/drivers', icon: <PeopleAltOutlinedIcon /> },
      { label: 'Veículos', path: '/vehicles', icon: <DirectionsCarOutlinedIcon /> }
    ]
  },
  {
    label: 'Controle',
    items: [
      { label: 'Ocorrências', path: '/incidents', icon: <ReportProblemOutlinedIcon /> },
      { label: 'Relatórios', path: '/reports', icon: <AssessmentOutlinedIcon /> }
    ]
  },
  {
    label: 'Administração',
    items: [{ label: 'Configurações', path: '/settings', icon: <SettingsOutlinedIcon /> }]
  }
];
