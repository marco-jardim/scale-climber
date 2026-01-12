#!/usr/bin/env node
/**
 * Generate PNG icons from SVG using Node.js canvas
 * This is more reliable than browser-based conversion
 */

/* eslint-disable no-console */
/* eslint-disable import/no-unresolved */

import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateIcon(svgPath, outputPath, size) {
  try {
    // Read SVG as base64
    const svgBuffer = fs.readFileSync(svgPath);
    const svgBase64 = `data:image/svg+xml;base64,${svgBuffer.toString('base64')}`;

    // Load SVG image
    const img = await loadImage(svgBase64);

    // Create canvas
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Draw white background (in case SVG has transparency issues)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // Draw SVG
    ctx.drawImage(img, 0, 0, size, size);

    // Save as PNG
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);

    console.log(`✓ Generated ${path.basename(outputPath)} (${size}x${size})`);
    return true;
  } catch (error) {
    console.error(`Error generating ${outputPath}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('Generating PWA icons from SVG...');

  const projectRoot = path.join(__dirname, '..');
  const svgPath = path.join(projectRoot, 'public', 'icon.svg');
  const outputDir = path.join(projectRoot, 'public');

  if (!fs.existsSync(svgPath)) {
    console.error(`Error: ${svgPath} not found`);
    process.exit(1);
  }

  // Generate icons
  const sizes = [
    { size: 192, filename: 'icon-192.png' },
    { size: 512, filename: 'icon-512.png' },
  ];

  for (const { size, filename } of sizes) {
    const outputPath = path.join(outputDir, filename);
    await generateIcon(svgPath, outputPath, size);
  }

  console.log('\nAll icons generated successfully!');
  console.log(`Files saved to: ${outputDir}`);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
