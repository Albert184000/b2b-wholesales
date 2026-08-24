import type React from 'react';

const escapeSvgText = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

export const createPublicImageFallback = (label = 'WholesaleHub') => {
  const safeLabel = escapeSvgText(label.trim().slice(0, 52) || 'WholesaleHub');
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="620" viewBox="0 0 900 620">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#eff6ff"/>
          <stop offset="0.55" stop-color="#f8fafc"/>
          <stop offset="1" stop-color="#dcfce7"/>
        </linearGradient>
      </defs>
      <rect width="900" height="620" fill="url(#bg)"/>
      <rect x="72" y="72" width="756" height="476" rx="32" fill="#ffffff" opacity="0.8" stroke="#cbd5e1" stroke-width="2"/>
      <circle cx="450" cy="262" r="64" fill="#2563eb" opacity="0.12"/>
      <path d="M399 281h102v42H399zM420 237h60l21 44H399z" fill="#2563eb"/>
      <path d="M383 323h134v26H383z" fill="#0f172a" opacity="0.86"/>
      <text x="450" y="406" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="34" font-weight="800" fill="#0f172a">WholesaleHub</text>
      <text x="450" y="448" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="700" fill="#475569">${safeLabel}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

export const applyPublicImageFallback = (
  event: React.SyntheticEvent<HTMLImageElement>,
  label?: string
) => {
  const image = event.currentTarget;

  if (image.dataset.fallbackApplied === 'true') return;

  image.dataset.fallbackApplied = 'true';
  image.src = createPublicImageFallback(label);
};
