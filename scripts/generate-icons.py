#!/usr/bin/env python3
"""
Generate PWA icons from SVG
Converts icon.svg to PNG in required sizes (192x192 and 512x512)
"""

import subprocess
import sys
from pathlib import Path

def install_cairosvg():
    """Install cairosvg if not available"""
    try:
        import cairosvg
        return True
    except ImportError:
        print("Installing cairosvg...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "cairosvg"])
            print("✓ cairosvg installed successfully")
            return True
        except subprocess.CalledProcessError:
            print("Error: Failed to install cairosvg")
            return False

def convert_svg_to_png(svg_path, output_path, width, height):
    """Convert SVG to PNG using cairosvg"""
    try:
        import cairosvg
        cairosvg.svg2png(
            url=str(svg_path),
            write_to=str(output_path),
            output_width=width,
            output_height=height
        )
        print(f"✓ Generated {output_path.name} ({width}x{height})")
        return True
    except Exception as e:
        print(f"Error converting {svg_path.name}: {e}")
        return False

def main():
    """Generate PWA icons in required sizes"""
    print("Generating PWA icons...")

    # Install cairosvg if needed
    if not install_cairosvg():
        print("\nAlternative: You can manually convert icon.svg to PNG using:")
        print("  - Online tools: https://cloudconvert.com/svg-to-png")
        print("  - Inkscape: inkscape icon.svg -w 192 -h 192 -o icon-192.png")
        print("  - ImageMagick: magick convert -background none icon.svg -resize 192x192 icon-192.png")
        return

    # Import here after potential installation
    import cairosvg

    # Paths
    project_root = Path(__file__).parent.parent
    svg_path = project_root / "public" / "icon.svg"
    output_dir = project_root / "public"

    if not svg_path.exists():
        print(f"Error: {svg_path} not found")
        return

    # Generate icons in required sizes
    sizes = [
        (192, 192, "icon-192.png"),
        (512, 512, "icon-512.png"),
    ]

    for width, height, filename in sizes:
        output_path = output_dir / filename
        convert_svg_to_png(svg_path, output_path, width, height)

    print("\nAll icons generated successfully!")
    print(f"Files saved to: {output_dir}")

if __name__ == "__main__":
    main()
