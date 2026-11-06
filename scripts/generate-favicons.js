const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { execSync } = require('child_process');

// 1. Vector SVG Favicon (Transparent background, gold & white diamond brandmark)
const svgDiamond = `<svg viewBox="0 0 200 200" width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="brandGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FBBF24"/>
      <stop offset="50%" stop-color="#D97724"/>
      <stop offset="100%" stop-color="#9A3412"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.4"/>
    </filter>
  </defs>

  <g filter="url(#shadow)">
    <!-- Outer Black Diamond with Gold Rim -->
    <polygon points="100,8 192,100 100,192 8,100" fill="#0C0C0E" stroke="url(#brandGold)" stroke-width="4.5" stroke-linejoin="round" />
    
    <!-- Inner White Diamond Frame -->
    <polygon points="100,17 183,100 100,183 17,100" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linejoin="round" />

    <!-- Left Radiating Accent Lines in Gold -->
    <line x1="42" y1="90" x2="58" y2="95" stroke="url(#brandGold)" stroke-width="3" stroke-linecap="round" />
    <line x1="38" y1="100" x2="56" y2="100" stroke="url(#brandGold)" stroke-width="3" stroke-linecap="round" />
    <line x1="42" y1="110" x2="58" y2="105" stroke="url(#brandGold)" stroke-width="3" stroke-linecap="round" />

    <!-- Right Radiating Accent Lines in Gold -->
    <line x1="158" y1="90" x2="142" y2="95" stroke="url(#brandGold)" stroke-width="3" stroke-linecap="round" />
    <line x1="162" y1="100" x2="144" y2="100" stroke="url(#brandGold)" stroke-width="3" stroke-linecap="round" />
    <line x1="158" y1="110" x2="142" y2="105" stroke="url(#brandGold)" stroke-width="3" stroke-linecap="round" />

    <!-- TOP ROW: К Р И М -->
    <g stroke="#FFFFFF" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
      <!-- К -->
      <line x1="69" y1="60" x2="69" y2="96" />
      <path d="M69 69 C75 69 78 64 78 60" />
      <path d="M69 86 C75 86 78 91 78 96" />

      <!-- Р -->
      <line x1="85" y1="60" x2="85" y2="96" />
      <path d="M85 60 C95 60 95 72 85 72" />

      <!-- И -->
      <line x1="100" y1="60" x2="100" y2="96" />
      <line x1="100" y1="96" x2="110" y2="60" />
      <line x1="110" y1="60" x2="110" y2="96" />

      <!-- М -->
      <polyline points="117,96 117,60 124.5,87 132,60 132,96" />
    </g>

    <!-- BOTTOM ROW: & Р И М -->
    <g stroke="#FFFFFF" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
      <!-- & (Gold) -->
      <path d="M79 140 L71 114 C69.5 109 71 104 74 104 C77 104 78.5 109 76.5 114 L70.5 127 C68.5 132 70.5 140 74.5 140 C77.5 140 79.5 134 80.5 127" stroke="url(#brandGold)" stroke-width="3.2" />

      <!-- Р -->
      <line x1="85" y1="104" x2="85" y2="140" />
      <path d="M85 104 C95 104 95 116 85 116" />

      <!-- И -->
      <line x1="100" y1="104" x2="100" y2="140" />
      <line x1="100" y1="140" x2="110" y2="104" />
      <line x1="110" y1="104" x2="110" y2="140" />

      <!-- М -->
      <polyline points="117,140 117,104 124.5,131 132,104 132,140" />
    </g>
  </g>
</svg>`;

// 2. Apple Touch Icon SVG (Luxury dark solid canvas with centered diamond logo)
const svgAppleTouch = `<svg viewBox="0 0 200 200" width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#18181B"/>
      <stop offset="100%" stop-color="#09090B"/>
    </linearGradient>
    <linearGradient id="brandGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FBBF24"/>
      <stop offset="50%" stop-color="#D97724"/>
      <stop offset="100%" stop-color="#9A3412"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.6"/>
    </filter>
  </defs>

  <!-- Background square for Apple touch icon -->
  <rect width="200" height="200" fill="url(#bgGrad)"/>

  <!-- Centered Scaled Diamond -->
  <g transform="translate(10, 10) scale(0.9)" filter="url(#shadow)">
    <!-- Outer Black Diamond with Gold Rim -->
    <polygon points="100,8 192,100 100,192 8,100" fill="#0C0C0E" stroke="url(#brandGold)" stroke-width="4.5" stroke-linejoin="round" />
    
    <!-- Inner White Diamond Frame -->
    <polygon points="100,17 183,100 100,183 17,100" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linejoin="round" />

    <!-- Left Radiating Accent Lines in Gold -->
    <line x1="42" y1="90" x2="58" y2="95" stroke="url(#brandGold)" stroke-width="3" stroke-linecap="round" />
    <line x1="38" y1="100" x2="56" y2="100" stroke="url(#brandGold)" stroke-width="3" stroke-linecap="round" />
    <line x1="42" y1="110" x2="58" y2="105" stroke="url(#brandGold)" stroke-width="3" stroke-linecap="round" />

    <!-- Right Radiating Accent Lines in Gold -->
    <line x1="158" y1="90" x2="142" y2="95" stroke="url(#brandGold)" stroke-width="3" stroke-linecap="round" />
    <line x1="162" y1="100" x2="144" y2="100" stroke="url(#brandGold)" stroke-width="3" stroke-linecap="round" />
    <line x1="158" y1="110" x2="142" y2="105" stroke="url(#brandGold)" stroke-width="3" stroke-linecap="round" />

    <!-- TOP ROW: К Р И М -->
    <g stroke="#FFFFFF" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="69" y1="60" x2="69" y2="96" />
      <path d="M69 69 C75 69 78 64 78 60" />
      <path d="M69 86 C75 86 78 91 78 96" />

      <line x1="85" y1="60" x2="85" y2="96" />
      <path d="M85 60 C95 60 95 72 85 72" />

      <line x1="100" y1="60" x2="100" y2="96" />
      <line x1="100" y1="96" x2="110" y2="60" />
      <line x1="110" y1="60" x2="110" y2="96" />

      <polyline points="117,96 117,60 124.5,87 132,60 132,96" />
    </g>

    <!-- BOTTOM ROW: & Р И М -->
    <g stroke="#FFFFFF" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M79 140 L71 114 C69.5 109 71 104 74 104 C77 104 78.5 109 76.5 114 L70.5 127 C68.5 132 70.5 140 74.5 140 C77.5 140 79.5 134 80.5 127" stroke="url(#brandGold)" stroke-width="3.2" />

      <line x1="85" y1="104" x2="85" y2="140" />
      <path d="M85 104 C95 104 95 116 85 116" />

      <line x1="100" y1="104" x2="100" y2="140" />
      <line x1="100" y1="140" x2="110" y2="104" />
      <line x1="110" y1="104" x2="110" y2="140" />

      <polyline points="117,140 117,104 124.5,131 132,104 132,140" />
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

  // Favicon PNG intermediate sizes for ICO
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

  console.log('All favicons and app icons generated successfully!');
}

main().catch(console.error);
