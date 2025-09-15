#!/usr/bin/env tsx

import { PNG } from 'pngjs';
import fs from 'fs';
import path from 'path';

const BACKGROUND_COLOR = {
  r: 17,  // #111827
  g: 24,
  b: 39,
  a: 255
};

function createIcon(size: number, outputPath: string): void {
  const png = new PNG({
    width: size,
    height: size,
    filterType: -1
  });

  // Fill with background color
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2;
      png.data[idx] = BACKGROUND_COLOR.r;     // Red
      png.data[idx + 1] = BACKGROUND_COLOR.g; // Green
      png.data[idx + 2] = BACKGROUND_COLOR.b; // Blue
      png.data[idx + 3] = BACKGROUND_COLOR.a; // Alpha
    }
  }

  // Add a simple "NP" text-like pattern in the center (simplified)
  const centerX = Math.floor(size / 2);
  const centerY = Math.floor(size / 2);
  const radius = Math.floor(size / 8);

  // Draw a simple circular pattern to represent the NeedPort logo
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= radius) {
        const idx = (size * y + x) << 2;
        png.data[idx] = 45;     // Lighter blue #2D9CDB
        png.data[idx + 1] = 156;
        png.data[idx + 2] = 219;
        png.data[idx + 3] = 255;
      }
    }
  }

  // Write to file
  const buffer = PNG.sync.write(png);
  fs.writeFileSync(outputPath, buffer);
  console.log(`Generated ${size}x${size} icon: ${outputPath}`);
}

function main(): void {
  const publicDir = path.resolve(process.cwd(), 'public');
  
  // Ensure public directory exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Generate icons
  createIcon(192, path.join(publicDir, 'icon-192.png'));
  createIcon(512, path.join(publicDir, 'icon-512.png'));

  console.log('PWA icons generated successfully!');
}

if (require.main === module) {
  main();
}