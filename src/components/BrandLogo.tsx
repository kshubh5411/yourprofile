import React from 'react';

interface BrandLogoProps {
  size?: number;
  className?: string;
  variant?: 'light' | 'dark';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 28, className, variant = 'dark' }) => {
  const palette =
    variant === 'light'
      ? {
          stroke: '#FFFFFF',
          fill: '#FFFFFF',
          accent: '#C7D2FE',
          card: 'rgba(255,255,255,0.18)',
        }
      : {
          stroke: '#4338CA',
          fill: '#4338CA',
          accent: '#7C3AED',
          card: '#EEF2FF',
        };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect x="6" y="6" width="52" height="52" rx="16" stroke={palette.stroke} strokeWidth="3.5" />

      <rect x="16" y="14" width="32" height="36" rx="8" fill={palette.card} stroke={palette.stroke} strokeWidth="2.5" />

      <circle cx="32" cy="24" r="5.2" fill={palette.fill} />
      <path d="M22 37C22 31.8 26.3 28 32 28C37.7 28 42 31.8 42 37V39H22V37Z" fill={palette.fill} />

      <path d="M22 16L32 8L42 16" stroke={palette.accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};
