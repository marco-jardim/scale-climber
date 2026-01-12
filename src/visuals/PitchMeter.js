/**
 * PitchMeter
 * Visual feedback for pitch accuracy
 * Shows target note, current pitch, and cent deviation
 */

class PitchMeter {
  constructor() {
    this.targetNote = null;
    this.currentFrequency = null;
    this.centDeviation = 0;
    this.confidence = 0;

    this.width = 300;
    this.height = 80;
    this.x = 0;
    this.y = 0;
  }

  /**
   * Update pitch meter state
   * @param {object} state - Game state with pitch data
   */
  updateState(state) {
    if (state.targetNote) {
      this.targetNote = state.targetNote;
    }

    if (state.pitchData) {
      this.currentFrequency = state.pitchData.frequency;
      this.centDeviation = state.pitchData.cents || 0;
      this.confidence = state.pitchData.confidence || 0;
    }
  }

  /**
   * Render pitch meter
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} canvasWidth - Canvas width
   * @param {number} canvasHeight - Canvas height
   */
  render(ctx, canvasWidth, canvasHeight) {
    // Position at bottom center
    this.x = (canvasWidth - this.width) / 2;
    this.y = canvasHeight - this.height - 40;

    ctx.save();
    ctx.translate(this.x, this.y);

    // Background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(0, 0, this.width, this.height);

    // Border
    ctx.strokeStyle = '#2C3E50';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, this.width, this.height);

    // Target note label
    if (this.targetNote) {
      ctx.fillStyle = '#2C3E50';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Target: ${this.targetNote}`, this.width / 2, 25);
    }

    // Cent deviation meter
    this.renderCentMeter(ctx);

    // Confidence indicator
    if (this.confidence > 0) {
      this.renderConfidence(ctx);
    }

    ctx.restore();
  }

  /**
   * Render cent deviation meter
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  renderCentMeter(ctx) {
    const meterY = 40;
    const meterHeight = 20;
    const centerX = this.width / 2;

    // Background track
    ctx.fillStyle = '#E0E0E0';
    ctx.fillRect(20, meterY, this.width - 40, meterHeight);

    // Center line (target pitch)
    ctx.strokeStyle = '#2C3E50';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, meterY);
    ctx.lineTo(centerX, meterY + meterHeight);
    ctx.stroke();

    // Tolerance zones (±50 cents visible range)
    const maxCents = 50;
    const pixelsPerCent = (this.width - 40) / (maxCents * 2);

    // Perfect zone (±10 cents) - Gold
    const perfectZoneWidth = 10 * pixelsPerCent;
    ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
    ctx.fillRect(
      centerX - perfectZoneWidth,
      meterY,
      perfectZoneWidth * 2,
      meterHeight
    );

    // Great zone (±25 cents) - Green
    const greatZoneWidth = 25 * pixelsPerCent;
    ctx.fillStyle = 'rgba(50, 205, 50, 0.2)';
    ctx.fillRect(
      centerX - greatZoneWidth,
      meterY,
      greatZoneWidth * 2,
      meterHeight
    );

    // Current pitch indicator
    if (this.confidence > 0.5) {
      const clampedCents = Math.max(-maxCents, Math.min(maxCents, this.centDeviation));
      const indicatorX = centerX + clampedCents * pixelsPerCent;

      // Color based on accuracy
      let color = '#FF4444'; // Miss/Red
      if (Math.abs(this.centDeviation) <= 10) {
        color = '#FFD700'; // Perfect/Gold
      } else if (Math.abs(this.centDeviation) <= 25) {
        color = '#32CD32'; // Great/Green
      } else if (Math.abs(this.centDeviation) <= 50) {
        color = '#00BFFF'; // Good/Blue
      }

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(indicatorX, meterY + meterHeight / 2, 8, 0, Math.PI * 2);
      ctx.fill();

      // Cents text
      ctx.fillStyle = '#2C3E50';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(
        `${this.centDeviation > 0 ? '+' : ''}${Math.round(this.centDeviation)}¢`,
        indicatorX,
        meterY - 5
      );
    }

    // Tick marks
    ctx.strokeStyle = '#7F8C8D';
    ctx.lineWidth = 1;
    for (let cents = -50; cents <= 50; cents += 10) {
      const tickX = centerX + cents * pixelsPerCent;
      ctx.beginPath();
      ctx.moveTo(tickX, meterY + meterHeight);
      ctx.lineTo(tickX, meterY + meterHeight + 3);
      ctx.stroke();

      if (cents !== 0) {
        ctx.fillStyle = '#7F8C8D';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${cents}`, tickX, meterY + meterHeight + 15);
      }
    }
  }

  /**
   * Render confidence indicator
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  renderConfidence(ctx) {
    const barWidth = 50;
    const barHeight = 10;
    const barX = this.width - barWidth - 10;
    const barY = 10;

    // Background
    ctx.fillStyle = '#E0E0E0';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // Confidence level
    const confidenceWidth = barWidth * this.confidence;
    ctx.fillStyle = this.confidence > 0.7 ? '#32CD32' : '#FFA500';
    ctx.fillRect(barX, barY, confidenceWidth, barHeight);

    // Label
    ctx.fillStyle = '#7F8C8D';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('Conf.', barX - 5, barY + barHeight);
  }

  /**
   * Reset pitch meter
   */
  reset() {
    this.currentFrequency = null;
    this.centDeviation = 0;
    this.confidence = 0;
  }
}

export default PitchMeter;
