/**
 * PitchDetector Web Worker
 * Performs YIN algorithm pitch detection in a separate thread
 * Uses Transferable Objects for zero-copy buffer transfer
 */

let sampleRate = 44100;
let bufferSize = 1024;
let yinThreshold = 0.15;

// YIN algorithm parameters
const MIN_FREQUENCY = 80; // E2 (lowest typical singing voice)
const MAX_FREQUENCY = 1000; // B5 (highest typical singing voice)

/**
 * YIN Algorithm Implementation
 * Reference: De Cheveigné, A., & Kawahara, H. (2002)
 */

/**
 * Step 1: Calculate difference function
 * @param {Float32Array} buffer - Audio buffer
 * @returns {Float32Array} Difference function
 */
function differenceFunction(buffer) {
  const bufferLength = buffer.length;
  const halfLength = Math.floor(bufferLength / 2);
  const yinBuffer = new Float32Array(halfLength);

  for (let tau = 0; tau < halfLength; tau++) {
    let sum = 0;
    for (let i = 0; i < halfLength; i++) {
      const delta = buffer[i] - buffer[i + tau];
      sum += delta * delta;
    }
    yinBuffer[tau] = sum;
  }

  return yinBuffer;
}

/**
 * Step 2: Calculate cumulative mean normalized difference function
 * @param {Float32Array} yinBuffer - Difference function output
 * @returns {Float32Array} Normalized difference
 */
function cumulativeMeanNormalizedDifference(yinBuffer) {
  const yinBufferLength = yinBuffer.length;
  const normalizedBuffer = new Float32Array(yinBufferLength);

  normalizedBuffer[0] = 1;

  let runningSum = 0;
  for (let tau = 1; tau < yinBufferLength; tau++) {
    runningSum += yinBuffer[tau];
    normalizedBuffer[tau] = yinBuffer[tau] / (runningSum / tau);
  }

  return normalizedBuffer;
}

/**
 * Step 3: Find absolute threshold
 * @param {Float32Array} normalizedBuffer - Normalized difference function
 * @param {number} threshold - YIN threshold (typically 0.10-0.20)
 * @returns {number} Tau value (period in samples), or -1 if not found
 */
function absoluteThreshold(normalizedBuffer, threshold) {
  const minTau = Math.floor(sampleRate / MAX_FREQUENCY);
  const maxTau = Math.floor(sampleRate / MIN_FREQUENCY);

  for (let tau = minTau; tau < maxTau && tau < normalizedBuffer.length; tau++) {
    if (normalizedBuffer[tau] < threshold) {
      // Find local minimum
      while (
        tau + 1 < normalizedBuffer.length &&
        normalizedBuffer[tau + 1] < normalizedBuffer[tau]
      ) {
        tau++;
      }
      return tau;
    }
  }

  return -1; // No pitch found
}

/**
 * Step 4: Parabolic interpolation for sub-sample precision
 * @param {Float32Array} normalizedBuffer - Normalized difference function
 * @param {number} tau - Tau value from absolute threshold
 * @returns {number} Refined tau value
 */
function parabolicInterpolation(normalizedBuffer, tau) {
  if (tau === 0 || tau >= normalizedBuffer.length - 1) {
    return tau;
  }

  const s0 = normalizedBuffer[tau - 1];
  const s1 = normalizedBuffer[tau];
  const s2 = normalizedBuffer[tau + 1];

  // Parabolic interpolation formula
  const adjustment = (s2 - s0) / (2 * (2 * s1 - s2 - s0));

  return tau + adjustment;
}

/**
 * Detect pitch using YIN algorithm
 * @param {Float32Array} buffer - Audio time-domain data
 * @returns {{frequency: number|null, confidence: number, clarity: number}}
 */
function detectPitch(buffer) {
  // Step 1: Difference function
  const yinBuffer = differenceFunction(buffer);

  // Step 2: Cumulative mean normalized difference
  const normalizedBuffer = cumulativeMeanNormalizedDifference(yinBuffer);

  // Step 3: Absolute threshold
  const tau = absoluteThreshold(normalizedBuffer, yinThreshold);

  if (tau === -1) {
    return {
      frequency: null,
      confidence: 0,
      clarity: 0,
    };
  }

  // Step 4: Parabolic interpolation
  const refinedTau = parabolicInterpolation(normalizedBuffer, tau);

  // Step 5: Calculate frequency
  const frequency = sampleRate / refinedTau;

  // Calculate confidence (inverse of YIN value at tau)
  const confidence = 1 - normalizedBuffer[Math.round(tau)];

  // Calculate clarity (how distinct the pitch is)
  // Based on ratio of minimum to average
  const minValue = normalizedBuffer[Math.round(tau)];
  const avgValue = normalizedBuffer.reduce((sum, val) => sum + val, 0) / normalizedBuffer.length;
  const clarity = avgValue > 0 ? 1 - minValue / avgValue : 0;

  return {
    frequency,
    confidence: Math.max(0, Math.min(1, confidence)),
    clarity: Math.max(0, Math.min(1, clarity)),
  };
}

/**
 * Calculate RMS volume of buffer
 * @param {Float32Array} buffer
 * @returns {number} RMS volume (0-1)
 */
function calculateVolume(buffer) {
  let sum = 0;
  for (let i = 0; i < buffer.length; i++) {
    sum += buffer[i] * buffer[i];
  }
  const rms = Math.sqrt(sum / buffer.length);
  return Math.min(rms * 10, 1.0);
}

// Worker message handler
self.onmessage = function (e) {
  const { type, data, id } = e.data;

  switch (type) {
    case 'init':
      sampleRate = data.sampleRate || 44100;
      bufferSize = data.bufferSize || 1024;
      yinThreshold = data.yinThreshold || 0.15;
      self.postMessage({
        type: 'initialized',
        data: { sampleRate, bufferSize, yinThreshold },
      });
      break;

    case 'process': {
      const { buffer } = data;

      if (!buffer) {
        console.error('Worker received process message with no buffer!');
        return;
      }

      // Calculate volume
      const volume = calculateVolume(buffer);

      // Only detect pitch if volume is above threshold
      // Lowered to 0.005 to allow quiet mics/environments
      let result;
      if (volume < 0.005) {
        // Too quiet, no pitch detection
        result = {
          frequency: null,
          confidence: 0,
          clarity: 0,
          volume,
        };
      } else {
        // Detect pitch
        const pitchResult = detectPitch(buffer);
        result = {
          ...pitchResult,
          volume,
        };
      }

      self.postMessage({
        type: 'result',
        id,
        data: result,
      });
      break;
    }

    case 'update-config':
      if (data.sampleRate) sampleRate = data.sampleRate;
      if (data.bufferSize) bufferSize = data.bufferSize;
      if (data.yinThreshold !== undefined) yinThreshold = data.yinThreshold;
      self.postMessage({
        type: 'config-updated',
        data: { sampleRate, bufferSize, yinThreshold },
      });
      break;

    default:
      console.warn(`Unknown message type: ${type}`);
  }
};

// Export for testing (not used in worker context)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    detectPitch,
    differenceFunction,
    cumulativeMeanNormalizedDifference,
    absoluteThreshold,
    parabolicInterpolation,
  };
}
