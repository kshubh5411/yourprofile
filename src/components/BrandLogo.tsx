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

      <circle cx="26" cy="24" r="4.2" fill={palette.fill} />
      <circle cx="38" cy="24" r="4.2" fill={palette.fill} />
      <path d="M20 36C20 31.9 23.2 29 27 29C30.8 29 34 31.9 34 36V38H20V36Z" fill={palette.fill} />
      <path d="M30 36C30 31.9 33.2 29 37 29C40.8 29 44 31.9 44 36V38H30V36Z" fill={palette.fill} />

      <path d="M22 16L32 8L42 16" stroke={palette.accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};
