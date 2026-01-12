# Scale Climber - Asset Generation Scripts

This directory contains scripts to generate game assets for Scale Climber.

## Scripts

### `generate-sounds.py`

Generates all game sound effects as Opus audio files.

**Requirements:**
- Python 3.x
- numpy (`pip install numpy`)
- ffmpeg (must be in PATH)

**Usage:**
```bash
python scripts/generate-sounds.py
```

**Generated Files:**
- `public/assets/sounds/perfect.opus` - High pleasant chord (800-1200 Hz)
- `public/assets/sounds/great.opus` - Medium-high tone (600 Hz)
- `public/assets/sounds/ok.opus` - Medium neutral tone (400 Hz)
- `public/assets/sounds/miss.opus` - Low dissonant tone (200-210 Hz)
- `public/assets/sounds/combo.opus` - Ascending sweep (400-800 Hz)
- `public/assets/sounds/victory.opus` - Triumphant arpeggio (C-E-G)
- `public/assets/sounds/failure.opus` - Descending sweep (400-200 Hz)
- `public/assets/sounds/click.opus` - Short tick (1200 Hz)

### `generate-icons.py`

Converts SVG icon to PNG format for PWA.

**Requirements:**
- Python 3.x
- cairosvg (`pip install cairosvg`)
- Cairo library (system dependency)

**Usage:**
```bash
python scripts/generate-icons.py
```

**Note:** On Windows, the Cairo library may not be available. Use the HTML converter instead.

### `icon-converter.html`

Browser-based SVG to PNG converter (no dependencies required).

**Usage:**
1. Open `scripts/icon-converter.html` in a web browser
2. Click "Download 192x192" to save icon-192.png
3. Click "Download 512x512" to save icon-512.png
4. Save both files to `public/` directory

Or use the "Download All Icons" button to get both at once.

## PWA Icon

The `public/icon.svg` file contains the app icon design featuring:
- Musical notes ascending a scale (representing the climbing concept)
- Staff lines in the background
- Gradient purple background
- Microphone icon (subtle)
- "SCALE CLIMBER" title

## Regenerating Assets

If you need to regenerate all assets:

```bash
# Generate sound effects
python scripts/generate-sounds.py

# Generate icons (use HTML converter on Windows)
python scripts/generate-icons.py
# OR
start scripts/icon-converter.html
```

## Asset Specifications

### Sound Effects
- Format: Opus (high quality, small file size)
- Sample Rate: 48 kHz
- Bitrate: 64 kbps
- Channels: Mono
- Duration: 0.05s - 0.6s depending on type

### Icons
- Format: PNG with transparency
- Sizes: 192x192 and 512x512 pixels
- Color: Full color with gradients
- Source: SVG vector for infinite scaling
