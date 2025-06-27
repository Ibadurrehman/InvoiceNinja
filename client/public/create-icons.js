// Create simple PNG icons for PWA
const fs = require('fs');

// Create a simple SVG that we'll save as .svg first
const iconSvg = `<svg width="192" height="192" viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="192" height="192" rx="24" fill="#2563eb"/>
  <rect x="24" y="24" width="144" height="144" rx="12" fill="white"/>
  <rect x="48" y="48" width="96" height="8" rx="4" fill="#2563eb"/>
  <rect x="48" y="72" width="72" height="8" rx="4" fill="#94a3b8"/>
  <rect x="48" y="96" width="84" height="8" rx="4" fill="#94a3b8"/>
  <rect x="48" y="120" width="60" height="8" rx="4" fill="#94a3b8"/>
  <rect x="120" y="120" width="24" height="24" rx="4" fill="#10b981"/>
</svg>`;

const icon512Svg = iconSvg.replace('width="192" height="192"', 'width="512" height="512"')
                          .replace('viewBox="0 0 192 192"', 'viewBox="0 0 512 512"');

fs.writeFileSync('icon-192x192.svg', iconSvg);
fs.writeFileSync('icon-512x512.svg', icon512Svg);

console.log('Icon SVGs created');
