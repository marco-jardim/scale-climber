#!/usr/bin/env python3
"""
Generate game sound effects for Scale Climber
Creates opus audio files with different tones for game events
"""

import numpy as np
import subprocess
import os
from pathlib import Path

# Constants
SAMPLE_RATE = 48000
OUTPUT_DIR = Path(__file__).parent.parent / "public" / "assets" / "sounds"

def generate_tone(frequency, duration, volume=0.3):
    """Generate a sine wave tone"""
    samples = int(SAMPLE_RATE * duration)
    t = np.linspace(0, duration, samples, False)
    wave = volume * np.sin(2 * np.pi * frequency * t)
    return wave

def generate_multi_tone(frequencies, duration, volume=0.3):
    """Generate a chord or sequence of tones"""
    samples = int(SAMPLE_RATE * duration)
    t = np.linspace(0, duration, samples, False)
    wave = np.zeros(samples)

    for freq in frequencies:
        wave += (volume / len(frequencies)) * np.sin(2 * np.pi * freq * t)

    return wave

def generate_sweep(start_freq, end_freq, duration, volume=0.3):
    """Generate a frequency sweep (ascending or descending)"""
    samples = int(SAMPLE_RATE * duration)
    t = np.linspace(0, duration, samples, False)

    # Linear frequency sweep
    freq = np.linspace(start_freq, end_freq, samples)
    phase = 2 * np.pi * np.cumsum(freq) / SAMPLE_RATE
    wave = volume * np.sin(phase)

    return wave

def apply_envelope(wave, attack=0.01, release=0.05):
    """Apply attack/release envelope to avoid clicks"""
    samples = len(wave)
    attack_samples = int(SAMPLE_RATE * attack)
    release_samples = int(SAMPLE_RATE * release)

    envelope = np.ones(samples)

    # Attack
    if attack_samples > 0:
        envelope[:attack_samples] = np.linspace(0, 1, attack_samples)

    # Release
    if release_samples > 0:
        envelope[-release_samples:] = np.linspace(1, 0, release_samples)

    return wave * envelope

def save_as_opus(wave, filename):
    """Save audio data as opus file using ffmpeg"""
    # Normalize to 16-bit PCM
    wave_normalized = np.int16(wave * 32767)

    # Create temporary WAV in memory and pipe to ffmpeg
    output_path = OUTPUT_DIR / filename

    # Use ffmpeg to encode to opus
    ffmpeg_cmd = [
        'ffmpeg',
        '-f', 's16le',  # Input format: signed 16-bit little-endian
        '-ar', str(SAMPLE_RATE),  # Sample rate
        '-ac', '1',  # Mono
        '-i', 'pipe:0',  # Read from stdin
        '-codec:a', 'libopus',
        '-b:a', '64k',
        '-y',  # Overwrite output
        str(output_path)
    ]

    try:
        process = subprocess.Popen(
            ffmpeg_cmd,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        stdout, stderr = process.communicate(input=wave_normalized.tobytes())

        if process.returncode != 0:
            print(f"Warning: ffmpeg returned {process.returncode} for {filename}")
        else:
            print(f"✓ Generated {filename}")

    except FileNotFoundError:
        print("Error: ffmpeg not found. Please install ffmpeg to generate audio files.")
        return False

    return True

def main():
    """Generate all game sound effects"""
    print("Generating Scale Climber sound effects...")
    print(f"Output directory: {OUTPUT_DIR}")

    # Create output directory
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # 1. Perfect - High pleasant tone (major chord)
    wave = generate_multi_tone([800, 1000, 1200], 0.3, volume=0.25)
    wave = apply_envelope(wave, attack=0.01, release=0.1)
    save_as_opus(wave, "perfect.opus")

    # 2. Great - Medium-high pleasant tone
    wave = generate_tone(600, 0.3, volume=0.3)
    wave = apply_envelope(wave, attack=0.01, release=0.1)
    save_as_opus(wave, "great.opus")

    # 3. OK - Medium neutral tone
    wave = generate_tone(400, 0.3, volume=0.3)
    wave = apply_envelope(wave, attack=0.02, release=0.1)
    save_as_opus(wave, "ok.opus")

    # 4. Miss - Low unpleasant tone with slight dissonance
    wave = generate_multi_tone([200, 210], 0.2, volume=0.3)
    wave = apply_envelope(wave, attack=0.01, release=0.05)
    save_as_opus(wave, "miss.opus")

    # 5. Combo - Exciting ascending sweep
    wave = generate_sweep(400, 800, 0.4, volume=0.25)
    wave = apply_envelope(wave, attack=0.01, release=0.1)
    save_as_opus(wave, "combo.opus")

    # 6. Victory - Triumphant ascending major arpeggio
    # Three tones in sequence
    tone1 = generate_tone(523, 0.15, volume=0.3)  # C5
    tone2 = generate_tone(659, 0.15, volume=0.3)  # E5
    tone3 = generate_tone(784, 0.3, volume=0.3)   # G5 (longer)

    wave = np.concatenate([
        apply_envelope(tone1, attack=0.01, release=0.05),
        apply_envelope(tone2, attack=0.01, release=0.05),
        apply_envelope(tone3, attack=0.01, release=0.15)
    ])
    save_as_opus(wave, "victory.opus")

    # 7. Failure - Descending sad tones
    wave = generate_sweep(400, 200, 0.5, volume=0.25)
    wave = apply_envelope(wave, attack=0.02, release=0.15)
    save_as_opus(wave, "failure.opus")

    # 8. Click - Very short tick
    wave = generate_tone(1200, 0.05, volume=0.2)
    wave = apply_envelope(wave, attack=0.005, release=0.02)
    save_as_opus(wave, "click.opus")

    print("\nAll sound effects generated successfully!")
    print(f"Files saved to: {OUTPUT_DIR}")

if __name__ == "__main__":
    main()
