const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { execSync } = require('child_process');

// 1. Vector SVG Favicon (Minimalist, high-contrast, visible in dark and light browser tabs)
const svgDiamond = `<svg viewBox="0 0 64 64" width="64" height="64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="brandAmber" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FBBF24"/>
      <stop offset="50%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#D97724"/>
    </linearGradient>
  </defs>

  <!-- Glowing Outer Amber Diamond (Instant recognition in light & dark browser tabs) -->
  <polygon points="32,2 62,32 32,62 2,32" fill="url(#brandAmber)" stroke="#000000" stroke-width="0.8" stroke-opacity="0.3" stroke-linejoin="round" />
  
  <!-- Deep Black Core Diamond -->
  <polygon points="32,7.5 56.5,32 32,56.5 7.5,32" fill="#0C0C0E" />

  <!-- Minimalist Bold White 'К' (Crimea) -->
  <g stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round">
    <line x1="16" y1="19" x2="16" y2="45"/>
    <path d="M25 19 L16 32 L25 45"/>
  </g>

  <!-- Central Amber Mini-Diamond (Union & Brand Icon) -->
  <polygon points="32,24 37,32 32,40 27,32" fill="url(#brandAmber)" />

  <!-- Minimalist Bold White 'Р' (Rome) -->
  <g stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round">
    <line x1="39" y1="19" x2="39" y2="45"/>
    <path d="M39 19 L45 19 C49 19 49 32 45 32 L39 32" fill="none"/>
  </g>
</svg>`;

// 2. Apple Touch Icon & App Icon SVG (Solid luxury dark canvas with prominent golden diamond emblem)
const svgAppleTouch = `<svg viewBox="0 0 200 200" width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#18181B"/>
      <stop offset="100%" stop-color="#09090B"/>
    </linearGradient>
    <linearGradient id="brandAmber" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FBBF24"/>
      <stop offset="50%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#D97724"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000000" flood-opacity="0.6"/>
    </filter>
  </defs>

  <!-- Background tile for iOS home screen -->
  <rect width="200" height="200" fill="url(#bgGrad)"/>

  <!-- Centered Diamond Logo scaled to 160x160 -->
  <g transform="translate(20, 20) scale(2.5)" filter="url(#shadow)">
    <!-- Glowing Outer Amber Diamond -->
    <polygon points="32,2 62,32 32,62 2,32" fill="url(#brandAmber)" stroke="#000000" stroke-width="0.8" stroke-opacity="0.3" stroke-linejoin="round" />
    
    <!-- Deep Black Core Diamond -->
    <polygon points="32,7.5 56.5,32 32,56.5 7.5,32" fill="#0C0C0E" />

    <!-- Minimalist Bold White 'К' (Crimea) -->
    <g stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round">
      <line x1="16" y1="19" x2="16" y2="45"/>
      <path d="M25 19 L16 32 L25 45"/>
    </g>

    <!-- Central Amber Mini-Diamond (Union & Brand Icon) -->
    <polygon points="32,24 37,32 32,40 27,32" fill="url(#brandAmber)" />

    <!-- Minimalist Bold White 'Р' (Rome) -->
    <g stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round">
      <line x1="39" y1="19" x2="39" y2="45"/>
      <path d="M39 19 L45 19 C49 19 49 32 45 32 L39 32" fill="none"/>
    </g>
  </g>
</svg>`;

async function main() {
  const publicDir = path.join(__dirname, '..', 'public');
  const srcAppDir = path.join(__dirname, '..', 'src', 'app');

  // 1. Write SVGs
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgDiamond);
  fs.writeFileSync(path.join(srcAppDir, 'icon.svg'), svgDiamond);

  // 2. Generate PNGs
  const diamondBuf = Buffer.from(svgDiamond);
  const appleBuf = Buffer.from(svgAppleTouch);

  // Apple touch icon (180x180)
  await sharp(appleBuf).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));
  await sharp(appleBuf).resize(180, 180).png().toFile(path.join(srcAppDir, 'apple-icon.png'));

  // Android / PWA Icons
  await sharp(appleBuf).resize(192, 192).png().toFile(path.join(publicDir, 'icon-192.png'));
  await sharp(appleBuf).resize(512, 512).png().toFile(path.join(publicDir, 'icon-512.png'));

  // Multi-resolution ICO (16x16, 32x32, 48x48)
  const png16 = path.join('/tmp', 'fav-16.png');
  const png32 = path.join('/tmp', 'fav-32.png');
  const png48 = path.join('/tmp', 'fav-48.png');

  await sharp(diamondBuf).resize(16, 16).png().toFile(png16);
  await sharp(diamondBuf).resize(32, 32).png().toFile(png32);
  await sharp(diamondBuf).resize(48, 48).png().toFile(png48);

  // 3. Build multi-size favicon.ico using python PIL
  const pyScript = `
from PIL import Image
img48 = Image.open('${png48}')
img32 = Image.open('${png32}')
img16 = Image.open('${png16}')

img48.save('${path.join(publicDir, 'favicon.ico')}', format='ICO', sizes=[(16, 16), (32, 32), (48, 48)])
img48.save('${path.join(srcAppDir, 'favicon.ico')}', format='ICO', sizes=[(16, 16), (32, 32), (48, 48)])
print('favicon.ico successfully created')
`;
  execSync(`python3 -c "${pyScript}"`);

  console.log('Minimalist high-contrast favicons generated successfully!');
}

main().catch(console.error);
