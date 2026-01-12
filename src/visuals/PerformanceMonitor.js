/**
 * PerformanceMonitor
 * Tracks frame times and automatically adjusts rendering quality
 * to maintain target frame rate
 */

class PerformanceMonitor {
  constructor() {
    this.frameTimes = [];
    this.maxSamples = 60; // Track last 60 frames (1 second at 60fps)
    this.qualityLevel = 'high'; // high | medium | low

    this.thresholds = {
      high: 16.6, // 60fps
      medium: 20, // 50fps
      low: 33.3, // 30fps
    };

    this.listeners = new Map();
    this.isMonitoring = false;
    this.lastFrameTime = 0;
  }

  /**
   * Start monitoring performance
   */
  start() {
    this.isMonitoring = true;
    this.lastFrameTime = performance.now();
  }

  /**
   * Stop monitoring performance
   */
  stop() {
    this.isMonitoring = false;
    this.frameTimes = [];
  }

  /**
   * Record a frame's timing
   * @param {number} startTime - Frame start timestamp
   * @param {number} endTime - Frame end timestamp
   */
  recordFrame(startTime, endTime) {
    if (!this.isMonitoring) return;

    const frameTime = endTime - startTime;
    this.frameTimes.push(frameTime);

    if (this.frameTimes.length > this.maxSamples) {
      this.frameTimes.shift();
    }

    // Check if quality adjustment needed (every 60 frames)
    if (this.frameTimes.length === this.maxSamples) {
      this.adjustQuality();
    }
  }

  /**
   * Automatically adjust quality based on average frame time
   */
  adjustQuality() {
    const avgFrameTime =
      this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;

    const previousQuality = this.qualityLevel;

    // Degrade quality if needed
    if (
      avgFrameTime > this.thresholds.medium &&
      this.qualityLevel === 'high'
    ) {
      this.qualityLevel = 'medium';
      console.warn(
        `Reducing quality to medium (avg frame time: ${avgFrameTime.toFixed(2)}ms)`
      );
      this.emit('qualityChanged', {
        from: previousQuality,
        to: 'medium',
        avgFrameTime,
      });
    } else if (
      avgFrameTime > this.thresholds.low &&
      this.qualityLevel === 'medium'
    ) {
      this.qualityLevel = 'low';
      console.warn(
        `Reducing quality to low (avg frame time: ${avgFrameTime.toFixed(2)}ms)`
      );
      this.emit('qualityChanged', {
        from: previousQuality,
        to: 'low',
        avgFrameTime,
      });
    }
    // Improve quality if stable
    else if (
      avgFrameTime < this.thresholds.high * 0.9 &&
      this.qualityLevel === 'medium'
    ) {
      // Only upgrade after sustained good performance (90% of target)
      this.qualityLevel = 'high';
      console.log(
        `Improving quality to high (avg frame time: ${avgFrameTime.toFixed(2)}ms)`
      );
      this.emit('qualityChanged', {
        from: previousQuality,
        to: 'high',
        avgFrameTime,
      });
    } else if (
      avgFrameTime < this.thresholds.medium * 0.9 &&
      this.qualityLevel === 'low'
    ) {
      this.qualityLevel = 'medium';
      console.log(
        `Improving quality to medium (avg frame time: ${avgFrameTime.toFixed(2)}ms)`
      );
      this.emit('qualityChanged', {
        from: previousQuality,
        to: 'medium',
        avgFrameTime,
      });
    }

    // Reset samples after adjustment to give time for new quality to stabilize
    this.frameTimes = [];
  }

  /**
   * Get current quality level
   * @returns {string} 'high' | 'medium' | 'low'
   */
  getQualityLevel() {
    return this.qualityLevel;
  }

  /**
   * Manually set quality level
   * @param {string} level - 'high' | 'medium' | 'low'
   */
  setQualityLevel(level) {
    if (['high', 'medium', 'low'].includes(level)) {
      const previousQuality = this.qualityLevel;
      this.qualityLevel = level;
      this.frameTimes = []; // Reset samples
      this.emit('qualityChanged', {
        from: previousQuality,
        to: level,
        manual: true,
      });
    }
  }

  /**
   * Get quality settings for rendering
   * @returns {object} Quality configuration
   */
  getQualitySettings() {
    const settings = {
      high: {
        particlesEnabled: true,
        particleCount: 50,
        shadowsEnabled: true,
        animationSmoothing: true,
        backgroundLayers: 3,
      },
      medium: {
        particlesEnabled: true,
        particleCount: 25,
        shadowsEnabled: false,
        animationSmoothing: true,
        backgroundLayers: 2,
      },
      low: {
        particlesEnabled: false,
        particleCount: 0,
        shadowsEnabled: false,
        animationSmoothing: false,
        backgroundLayers: 1,
      },
    };

    return settings[this.qualityLevel];
  }

  /**
   * Get performance statistics
   * @returns {object} Performance metrics
   */
  getStatistics() {
    if (this.frameTimes.length === 0) {
      return {
        avgFrameTime: 0,
        minFrameTime: 0,
        maxFrameTime: 0,
        fps: 0,
        qualityLevel: this.qualityLevel,
      };
    }

    const avgFrameTime =
      this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    const minFrameTime = Math.min(...this.frameTimes);
    const maxFrameTime = Math.max(...this.frameTimes);
    const fps = 1000 / avgFrameTime;

    return {
      avgFrameTime: Math.round(avgFrameTime * 100) / 100,
      minFrameTime: Math.round(minFrameTime * 100) / 100,
      maxFrameTime: Math.round(maxFrameTime * 100) / 100,
      fps: Math.round(fps),
      qualityLevel: this.qualityLevel,
      sampleCount: this.frameTimes.length,
    };
  }

  /**
   * Register event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  off(event, callback) {
    if (!this.listeners.has(event)) return;

    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  /**
   * Emit event
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data) {
    if (!this.listeners.has(event)) return;

    const callbacks = this.listeners.get(event);
    callbacks.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in PerformanceMonitor listener for ${event}:`, error);
      }
    });
  }

  /**
   * Reset monitor state
   */
  reset() {
    this.frameTimes = [];
    this.qualityLevel = 'high';
  }
}

export default PerformanceMonitor;
