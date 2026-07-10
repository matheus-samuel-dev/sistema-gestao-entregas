import { Card, CardContent, Stack, Typography } from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import type { ReactNode } from 'react';
import type { MetricCardData } from '../api/types';

interface MetricCardProps {
  metric: MetricCardData;
  icon: ReactNode;
  tone: string;
}

export function MetricCard({ metric, icon, tone }: MetricCardProps) {
  const isUp = metric.trend === 'up';
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center">
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: `${tone}18`,
              color: tone,
              flex: '0 0 auto'
            }}
          >
            {icon}
          </Stack>
          <Stack spacing={0.5} minWidth={0}>
            <Typography variant="body2" color="text.secondary" fontWeight={700}>
              {metric.title}
            </Typography>
            <Typography variant="h4" lineHeight={1}>
              {metric.value}
            </Typography>
            <Stack direction="row" spacing={0.5} alignItems="center">
              {isUp ? (
                <ArrowUpwardIcon sx={{ fontSize: 14, color: 'success.main' }} />
              ) : (
                <ArrowDownwardIcon sx={{ fontSize: 14, color: 'error.main' }} />
              )}
              <Typography variant="caption" color={isUp ? 'success.main' : 'error.main'} fontWeight={800}>
                {metric.variation}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
