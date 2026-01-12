/**
 * ParticleSystem
 * Celebratory particle effects for note hits
 * Adaptive particle count based on performance
 */

class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 8;
    this.vy = (Math.random() - 0.5) * 8 - 2; // Slight upward bias
    this.life = 1.0;
    this.decay = Math.random() * 0.02 + 0.01;
    this.size = Math.random() * 6 + 2;
    this.color = color;
    this.gravity = 0.2;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.gravity; // Apply gravity
    this.life -= this.decay;
    return this.life > 0;
  }

  render(ctx) {
    ctx.save();
    ctx.globalAlpha = this.life;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

class ParticleSystem {
  constructor() {
    this.particles = [];
    this.maxParticles = 50;
    this.enabled = true;
  }

  /**
   * Emit particles for a note result
   * @param {string} result - 'PERFECT' | 'GREAT' | 'OK' | 'MISS'
   * @param {number} x - X position
   * @param {number} y - Y position
   */
  emitForResult(result, x, y) {
    if (!this.enabled) return;

    const colorMap = {
      PERFECT: '#FFD700',
      GREAT: '#32CD32',
      OK: '#00BFFF',
      MISS: '#FF4444',
    };

    const countMap = {
      PERFECT: 30,
      GREAT: 20,
      OK: 10,
      MISS: 5,
    };

    const color = colorMap[result] || '#FFFFFF';
    const count = Math.min(countMap[result] || 0, this.maxParticles);

    for (let i = 0; i < count; i++) {
      if (this.particles.length < this.maxParticles) {
        this.particles.push(new Particle(x, y, color));
      }
    }
  }

  /**
   * Emit particles at specific position
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {string} color - Particle color
   * @param {number} count - Number of particles
   */
  emit(x, y, color, count = 10) {
    if (!this.enabled) return;

    for (let i = 0; i < Math.min(count, this.maxParticles); i++) {
      if (this.particles.length < this.maxParticles) {
        this.particles.push(new Particle(x, y, color));
      }
    }
  }

  /**
   * Update all particles
   */
  update() {
    // Update and remove dead particles
    this.particles = this.particles.filter((particle) => particle.update());
  }

  /**
   * Render all particles
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  render(ctx) {
    if (!this.enabled) return;

    this.particles.forEach((particle) => {
      particle.render(ctx);
    });
  }

  /**
   * Set particle system enabled state
   * @param {boolean} enabled - Enable particles
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) {
      this.particles = [];
    }
  }

  /**
   * Set maximum particle count
   * @param {number} max - Maximum particles
   */
  setMaxParticles(max) {
    this.maxParticles = max;
    // Remove excess particles if limit lowered
    if (this.particles.length > max) {
      this.particles = this.particles.slice(0, max);
    }
  }

  /**
   * Clear all particles
   */
  clear() {
    this.particles = [];
  }

  /**
   * Get current particle count
   * @returns {number} Number of active particles
   */
  getParticleCount() {
    return this.particles.length;
  }
}

export default ParticleSystem;
