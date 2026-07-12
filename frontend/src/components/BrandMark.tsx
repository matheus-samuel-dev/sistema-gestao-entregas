import { Box, Stack, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { useId } from 'react';
import { tokens } from '../theme/tokens';

interface BrandMarkProps {
  size?: number;
  showWordmark?: boolean;
  inverse?: boolean;
  compact?: boolean;
  sx?: SxProps<Theme>;
}

export function BrandMark({
  size = 42,
  showWordmark = true,
  inverse = false,
  compact = false,
  sx
}: BrandMarkProps) {
  const gradientId = useId().replace(/:/g, '');
  const labelColor = inverse ? tokens.color.white : tokens.color.brand[950];
  const captionColor = inverse ? 'rgba(255,255,255,0.66)' : tokens.color.textMuted;

  return (
    <Stack direction="row" alignItems="center" spacing={1.25} sx={sx}>
      <Box
        component="svg"
        viewBox="0 0 48 48"
        role="img"
        aria-label="LogiTrack"
        sx={{ width: size, height: size, flex: '0 0 auto', filter: 'drop-shadow(0 10px 18px rgba(4, 61, 45, .18))' }}
      >
        <defs>
          <linearGradient id={gradientId} x1="7" y1="4" x2="41" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor={tokens.color.brand[400]} />
            <stop offset="1" stopColor={tokens.color.brand[700]} />
          </linearGradient>
        </defs>
        <rect width="48" height="48" rx="13" fill={inverse ? 'rgba(255,255,255,.1)' : tokens.color.brand[950]} />
        <path
          d="M14.2 14.5v12.8c0 4.1 2.7 6.9 6.9 6.9h12.7"
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="m28.9 28.7 5.8 5.5-5.8 5.3" fill="none" stroke="#ecfdf5" strokeWidth="3.1" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="14.2" cy="13.2" r="4.1" fill="#ecfdf5" />
        <circle cx="14.2" cy="13.2" r="1.65" fill={tokens.color.brand[500]} />
      </Box>
      {showWordmark ? (
        <Box minWidth={0}>
          <Typography
            component="span"
            sx={{
              display: 'block',
              color: labelColor,
              fontSize: compact ? '1.02rem' : '1.22rem',
              fontWeight: 850,
              letterSpacing: '-0.035em',
              lineHeight: 1.05
            }}
          >
            Logi<span style={{ color: tokens.color.brand[400] }}>Track</span>
          </Typography>
          {!compact ? (
            <Typography
              component="span"
              sx={{ display: 'block', mt: 0.35, color: captionColor, fontSize: '0.68rem', fontWeight: 650, letterSpacing: '.045em' }}
            >
              INTELIGÊNCIA LOGÍSTICA
            </Typography>
          ) : null}
        </Box>
      ) : null}
    </Stack>
  );
}
