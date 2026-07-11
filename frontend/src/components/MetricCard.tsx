import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import type { MetricCardData } from '../api/types';

interface MetricCardProps {
  metric: MetricCardData;
  icon: ReactNode;
  tone: string;
  delay?: number;
}

function normalizeNumber(value: string) {
  const trimmed = value.trim();
  if (!/\d/.test(trimmed)) {
    return null;
  }

  if (trimmed.includes('R$')) {
    const numeric = Number(trimmed.replace(/[^\d,-]/g, '').replace(/\./g, '').replace(',', '.'));
    return Number.isFinite(numeric) ? { value: numeric, type: 'currency' as const } : null;
  }

  if (trimmed.includes('%')) {
    const numeric = Number(trimmed.replace(/[^\d,-]/g, '').replace(',', '.'));
    return Number.isFinite(numeric) ? { value: numeric, type: 'percent' as const } : null;
  }

  if (/[a-z]/i.test(trimmed)) {
    return null;
  }

  const numeric = Number(trimmed.replace(/[^\d,-]/g, '').replace(',', '.'));
  return Number.isFinite(numeric) ? { value: numeric, type: 'number' as const } : null;
}

function useAnimatedValue(target: number, duration = 850) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frame = 0;
    const startedAt = performance.now();

    function tick(now: number) {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [duration, target]);

  return value;
}

function formatAnimatedValue(raw: string, animated: number, type?: 'currency' | 'percent' | 'number') {
  if (!type) {
    return raw;
  }

  if (type === 'currency') {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(animated);
  }

  if (type === 'percent') {
    return `${animated.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;
  }

  return Math.round(animated).toLocaleString('pt-BR');
}

export function MetricCard({ metric, icon, tone, delay = 0 }: MetricCardProps) {
  const isUp = metric.trend === 'up';
  const parsed = useMemo(() => normalizeNumber(metric.value), [metric.value]);
  const animated = useAnimatedValue(parsed?.value ?? 0);
  const displayValue = parsed ? formatAnimatedValue(metric.value, animated, parsed.type) : metric.value;

  return (
    <Card
      className="soft-card stagger-item"
      sx={{
        height: '100%',
        animationDelay: `${delay}ms`,
        position: 'relative',
        '&:before': {
          content: '""',
          position: 'absolute',
          inset: '0 auto 0 0',
          width: 4,
          bgcolor: tone,
          opacity: 0.86
        }
      }}
    >
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1.8} alignItems="center">
            <Box
              aria-hidden
              sx={{
                width: 58,
                height: 58,
                borderRadius: 2,
                display: 'grid',
                placeItems: 'center',
                bgcolor: `${tone}18`,
                color: tone,
                flex: '0 0 auto',
                '& svg': { fontSize: 30 }
              }}
            >
              {icon}
            </Box>
            <Box minWidth={0}>
              <Typography variant="body2" color="text.secondary" fontWeight={750}>
                {metric.title}
              </Typography>
              <Typography variant="h4" lineHeight={1} mt={0.7}>
                {displayValue}
              </Typography>
            </Box>
          </Stack>
          <Stack
            direction="row"
            spacing={0.6}
            alignItems="center"
            sx={{
              color: isUp ? 'success.main' : 'error.main',
              bgcolor: isUp ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              alignSelf: 'flex-start',
              borderRadius: 1,
              px: 0.9,
              py: 0.45
            }}
          >
            {isUp ? <ArrowUpwardIcon sx={{ fontSize: 14 }} /> : <ArrowDownwardIcon sx={{ fontSize: 14 }} />}
            <Typography variant="caption" fontWeight={850}>
              {metric.variation}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
