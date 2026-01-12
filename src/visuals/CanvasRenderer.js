/**
 * CanvasRenderer
 * Main rendering coordinator for the game's visual output
 * Manages canvas, background, character, pitch meter, and particles
 */

import PerformanceMonitor from './PerformanceMonitor.js';

class CanvasRenderer {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: false });

    this.performanceMonitor = new PerformanceMonitor();
    this.isRendering = false;
    this.renderLoopId = null;

    // Component references (injected)
    this.character = null;
    this.pitchMeter = null;
    this.particleSystem = null;

    // Game state (passed from GameEngine)
    this.gameState = {
      currentNote: null,
      targetNote: null,
      pitchData: null,
      score: 0,
      combo: 0,
      noteResult: null, // PERFECT, GREAT, OK, MISS
    };

    // Setup
    this.setupCanvas();
    this.setupPerformanceMonitoring();
  }

  /**
   * Setup canvas with proper dimensions
   */
  setupCanvas() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  /**
   * Resize canvas to fit container while maintaining aspect ratio
   */
  resize() {
    const container = this.canvas.parentElement;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // 16:9 aspect ratio
    const aspectRatio = 16 / 9;
    let width = containerWidth;
    let height = width / aspectRatio;

    // If height exceeds container, scale by height instead
    if (height > containerHeight) {
      height = containerHeight;
      width = height * aspectRatio;
    }

    // Set display size (CSS pixels)
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    // Set actual size in memory (scaled for device pixel ratio)
    const scale = window.devicePixelRatio || 1;
    this.canvas.width = width * scale;
    this.canvas.height = height * scale;

    // Scale context to match device pixel ratio
    this.ctx.scale(scale, scale);

    // Store logical dimensions
    this.width = width;
    this.height = height;
  }

  /**
   * Setup performance monitoring with quality degradation
   */
  setupPerformanceMonitoring() {
    this.performanceMonitor.on('qualityChanged', (data) => {
      console.log(`Quality changed: ${data.from} → ${data.to}`);

      // Apply quality settings to components
      const settings = this.performanceMonitor.getQualitySettings();

      if (this.particleSystem) {
        this.particleSystem.setEnabled(settings.particlesEnabled);
        this.particleSystem.setMaxParticles(settings.particleCount);
      }

      if (this.character) {
        this.character.setAnimationSmoothing(settings.animationSmoothing);
      }
    });
  }

  /**
   * Set component references
   * @param {object} components - { character, pitchMeter, particleSystem }
   */
  setComponents(components) {
    this.character = components.character;
    this.pitchMeter = components.pitchMeter;
    this.particleSystem = components.particleSystem;
  }

  /**
   * Update game state from GameEngine
   * @param {object} state - Current game state
   */
  updateGameState(state) {
    this.gameState = { ...this.gameState, ...state };

    // Pass state to components
    if (this.character) {
      this.character.updateState(state);
    }
    if (this.pitchMeter) {
      this.pitchMeter.updateState(state);
    }
    if (this.particleSystem && state.noteResult) {
      this.particleSystem.emitForResult(state.noteResult, this.width / 2, this.height / 2);
    }
  }

  /**
   * Start rendering loop
   */
  start() {
    this.isRendering = true;
    this.performanceMonitor.start();
    this.renderLoop();
  }

  /**
   * Stop rendering loop
   */
  stop() {
    this.isRendering = false;
    this.performanceMonitor.stop();
    if (this.renderLoopId) {
      cancelAnimationFrame(this.renderLoopId);
      this.renderLoopId = null;
    }
  }

  /**
   * Main render loop
   */
  renderLoop() {
    if (!this.isRendering) return;

    const frameStart = performance.now();

    // Clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Render background
    this.renderBackground();

    // Render character
    if (this.character) {
      this.character.render(this.ctx, this.width, this.height);
    }

    // Render pitch meter
    if (this.pitchMeter) {
      this.pitchMeter.render(this.ctx, this.width, this.height);
    }

    // Render particles
    if (this.particleSystem) {
      this.particleSystem.update();
      this.particleSystem.render(this.ctx);
    }

    // Render HUD
    this.renderHUD();

    // Performance monitoring
    const frameEnd = performance.now();
    this.performanceMonitor.recordFrame(frameStart, frameEnd);

    // Continue loop
    this.renderLoopId = requestAnimationFrame(() => this.renderLoop());
  }

  /**
   * Render background gradient
   */
  renderBackground() {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, '#87CEEB'); // Sky blue
    gradient.addColorStop(1, '#E0F6FF'); // Light sky blue

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw mountains in background (simplified)
    const qualitySettings = this.performanceMonitor.getQualitySettings();
    if (qualitySettings.backgroundLayers >= 2) {
      this.renderMountains();
    }
  }

  /**
   * Render decorative mountains
   */
  renderMountains() {
    this.ctx.fillStyle = '#8B7BB8';
    this.ctx.globalAlpha = 0.3;

    // Draw simple mountain shapes
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.height);
    this.ctx.lineTo(this.width * 0.3, this.height * 0.6);
    this.ctx.lineTo(this.width * 0.5, this.height);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.moveTo(this.width * 0.4, this.height);
    this.ctx.lineTo(this.width * 0.7, this.height * 0.5);
    this.ctx.lineTo(this.width, this.height);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.globalAlpha = 1.0;
  }

  /**
   * Render HUD (score, combo, performance)
   */
  renderHUD() {
    const padding = 20;
    const fontSize = 20;

    this.ctx.font = `${fontSize}px sans-serif`;
    this.ctx.fillStyle = '#2C3E50';
    this.ctx.textAlign = 'left';

    // Score
    this.ctx.fillText(`Score: ${this.gameState.score}`, padding, padding + fontSize);

    // Combo
    if (this.gameState.combo > 0) {
      this.ctx.fillStyle = '#FFD700';
      this.ctx.fillText(
        `Combo: ${this.gameState.combo}x`,
        padding,
        padding + fontSize * 2 + 10
      );
    }

    // Performance stats (top right)
    const stats = this.performanceMonitor.getStatistics();
    this.ctx.textAlign = 'right';
    this.ctx.fillStyle = '#7F8C8D';
    this.ctx.font = '14px monospace';
    this.ctx.fillText(
      `${stats.fps} FPS (${stats.qualityLevel})`,
      this.width - padding,
      padding + 14
    );
  }

  /**
   * Get performance statistics
   * @returns {object} Performance metrics
   */
  getPerformanceStats() {
    return this.performanceMonitor.getStatistics();
  }

  /**
   * Manually set quality level
   * @param {string} level - 'high' | 'medium' | 'low'
   */
  setQualityLevel(level) {
    this.performanceMonitor.setQualityLevel(level);
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.stop();
    window.removeEventListener('resize', () => this.resize());
  }
}

export default CanvasRenderer;
