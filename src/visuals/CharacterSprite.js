/**
 * CharacterSprite
 * Animated character that climbs the musical mountain
 * Shows different animations based on game state
 */

class CharacterSprite {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.width = 80;
    this.height = 100;

    // Animation states
    this.currentAnimation = 'idle'; // idle, climbing, celebrating, stumbling
    this.animationFrame = 0;
    this.animationSpeed = 0.2;
    this.animationSmoothing = true;

    // Game state
    this.noteProgress = 0; // 0-1 for current note hold progress
    this.lastNoteResult = null;
  }

  /**
   * Update character state from game
   * @param {object} state - Game state
   */
  updateState(state) {
    // Update animation based on note result
    if (state.noteResult) {
      this.lastNoteResult = state.noteResult;

      if (state.noteResult === 'PERFECT' || state.noteResult === 'GREAT') {
        this.currentAnimation = 'celebrating';
        setTimeout(() => {
          this.currentAnimation = 'idle';
        }, 500);
      } else if (state.noteResult === 'MISS') {
        this.currentAnimation = 'stumbling';
        setTimeout(() => {
          this.currentAnimation = 'idle';
        }, 500);
      }
    }

    // Update climbing animation based on hold progress
    if (state.holdProgress !== undefined) {
      this.noteProgress = state.holdProgress;
      if (this.noteProgress > 0 && this.noteProgress < 1) {
        this.currentAnimation = 'climbing';
      }
    }
  }

  /**
   * Render character
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} canvasWidth - Canvas width
   * @param {number} canvasHeight - Canvas height
   */
  render(ctx, canvasWidth, canvasHeight) {
    // Position character in center-left
    this.x = canvasWidth * 0.3;
    this.y = canvasHeight * 0.6;

    // Update animation frame
    if (this.animationSmoothing) {
      this.animationFrame += this.animationSpeed;
      if (this.animationFrame >= 4) {
        this.animationFrame = 0;
      }
    }

    // Draw character based on animation state
    switch (this.currentAnimation) {
      case 'climbing':
        this.renderClimbing(ctx);
        break;
      case 'celebrating':
        this.renderCelebrating(ctx);
        break;
      case 'stumbling':
        this.renderStumbling(ctx);
        break;
      default:
        this.renderIdle(ctx);
    }
  }

  /**
   * Render idle animation
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  renderIdle(ctx) {
    const bobOffset = Math.sin(this.animationFrame) * 3;

    ctx.save();
    ctx.translate(this.x, this.y + bobOffset);

    // Body (teal circle)
    ctx.fillStyle = '#20B2AA';
    ctx.beginPath();
    ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
    ctx.fill();

    // Face
    this.renderFace(ctx, 'happy');

    ctx.restore();
  }

  /**
   * Render climbing animation
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  renderClimbing(ctx) {
    const climbOffset = Math.sin(this.animationFrame * 2) * 5;

    ctx.save();
    ctx.translate(this.x, this.y);

    // Tilt body slightly forward
    ctx.rotate(-0.1);

    // Body
    ctx.fillStyle = '#20B2AA';
    ctx.beginPath();
    ctx.arc(climbOffset, 0, this.width / 2, 0, Math.PI * 2);
    ctx.fill();

    // Face
    this.renderFace(ctx, 'focused');

    // Simple arms (reaching up)
    ctx.strokeStyle = '#1A9B94';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(-15, -10);
    ctx.lineTo(-25, -30);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(15, -10);
    ctx.lineTo(25, -30);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Render celebrating animation
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  renderCelebrating(ctx) {
    const jumpHeight = 20;
    const jumpOffset = Math.abs(Math.sin(this.animationFrame * 3)) * jumpHeight;

    ctx.save();
    ctx.translate(this.x, this.y - jumpOffset);

    // Body (slightly larger when celebrating)
    const scale = 1 + Math.sin(this.animationFrame * 2) * 0.1;
    ctx.scale(scale, scale);

    ctx.fillStyle = '#20B2AA';
    ctx.beginPath();
    ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
    ctx.fill();

    // Face
    this.renderFace(ctx, 'excited');

    // Arms up
    ctx.strokeStyle = '#1A9B94';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(-15, 0);
    ctx.lineTo(-30, -20);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(15, 0);
    ctx.lineTo(30, -20);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Render stumbling animation
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  renderStumbling(ctx) {
    const wobble = Math.sin(this.animationFrame * 5) * 0.3;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(wobble);

    // Body
    ctx.fillStyle = '#20B2AA';
    ctx.beginPath();
    ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
    ctx.fill();

    // Face
    this.renderFace(ctx, 'worried');

    ctx.restore();
  }

  /**
   * Render character face
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {string} expression - 'happy' | 'focused' | 'excited' | 'worried'
   */
  renderFace(ctx, expression) {
    ctx.fillStyle = '#2C3E50';

    // Eyes
    const eyeY = -5;
    const eyeSpacing = 12;

    if (expression === 'excited') {
      // Sparkle eyes
      ctx.beginPath();
      ctx.arc(-eyeSpacing, eyeY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(eyeSpacing, eyeY, 4, 0, Math.PI * 2);
      ctx.fill();

      // Sparkles
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(-eyeSpacing - 2, eyeY - 6, 2, 2);
      ctx.fillRect(eyeSpacing + 4, eyeY - 6, 2, 2);
    } else if (expression === 'worried') {
      // Wide eyes
      ctx.beginPath();
      ctx.arc(-eyeSpacing, eyeY, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(eyeSpacing, eyeY, 5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Normal eyes
      ctx.beginPath();
      ctx.arc(-eyeSpacing, eyeY, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(eyeSpacing, eyeY, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Mouth
    ctx.strokeStyle = '#2C3E50';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    ctx.beginPath();
    if (expression === 'excited' || expression === 'happy') {
      // Smile
      ctx.arc(0, 5, 12, 0.2, Math.PI - 0.2);
    } else if (expression === 'worried') {
      // Frown
      ctx.arc(0, 15, 12, Math.PI + 0.2, Math.PI * 2 - 0.2);
    } else {
      // Focused (small line)
      ctx.moveTo(-8, 10);
      ctx.lineTo(8, 10);
    }
    ctx.stroke();
  }

  /**
   * Set animation smoothing
   * @param {boolean} enabled - Enable smooth animations
   */
  setAnimationSmoothing(enabled) {
    this.animationSmoothing = enabled;
  }

  /**
   * Get current animation state
   * @returns {string} Current animation
   */
  getCurrentAnimation() {
    return this.currentAnimation;
  }
}

export default CharacterSprite;
