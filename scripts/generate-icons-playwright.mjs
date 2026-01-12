#!/usr/bin/env node
/**
 * Generate PNG icons from SVG using Playwright
 * Uses existing Playwright installation from e2e tests
 */

import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateIcon(page, svgContent, outputPath, size) {
  try {
    // Create HTML with SVG embedded
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { margin: 0; padding: 0; background: transparent; }
          svg { display: block; width: ${size}px; height: ${size}px; }
        </style>
      </head>
      <body>
        ${svgContent}
      </body>
      </html>
    `;

    // Set viewport to exact size
    await page.setViewportSize({ width: size, height: size });

    // Load HTML
    await page.setContent(html);

    // Wait for SVG to render
    await page.waitForTimeout(100);

    // Take screenshot
    await page.screenshot({
      path: outputPath,
      type: 'png',
      omitBackground: false,
    });

    console.log(`✓ Generated ${path.basename(outputPath)} (${size}x${size})`);
    return true;
  } catch (error) {
    console.error(`Error generating ${outputPath}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('Generating PWA icons from SVG using Playwright...');

  const projectRoot = path.join(__dirname, '..');
  const svgPath = path.join(projectRoot, 'public', 'icon.svg');
  const outputDir = path.join(projectRoot, 'public');

  if (!fs.existsSync(svgPath)) {
    console.error(`Error: ${svgPath} not found`);
    process.exit(1);
  }

  // Read SVG content
  const svgContent = fs.readFileSync(svgPath, 'utf-8');

  // Launch browser
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Generate icons
  const sizes = [
    { size: 192, filename: 'icon-192.png' },
    { size: 512, filename: 'icon-512.png' },
  ];

  for (const { size, filename } of sizes) {
    const outputPath = path.join(outputDir, filename);
    await generateIcon(page, svgContent, outputPath, size);
  }

  // Cleanup
  await browser.close();

  console.log('\nAll icons generated successfully!');
  console.log(`Files saved to: ${outputDir}`);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
