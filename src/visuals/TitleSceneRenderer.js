/**
 * TitleSceneRenderer.js
 * Renders the "Basecamp at Night" title screen scene.
 * Handles background (mountains, aurora), climber (idle), campfire, and pitch orb.
 */

class TitleSceneRenderer {
  constructor(canvasElement, characterSprite) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: false });
    this.character = characterSprite;

    this.width = 0;
    this.height = 0;
    this.time = 0; // For animations

    // Visual State
    this.orbState = {
      x: 0,
      y: 0,
      radius: 10,
      color: '#FFFFFF',
      alpha: 0,
      targetX: 0,
      targetY: 0,
      blur: 0,
    };

    this.campfireState = {
      intensity: 0.5,
      particles: [],
    };

    this.auroraPoints = [];

    this.nodes = []; // { note: 'C4', x: 0.5, y: 0.8, visible: false }

    this.initAurora();
    this.setupResize();
    this.resize();
  }

  initAurora() {
    this.auroraPoints = [];
    for (let i = 0; i <= 10; i++) {
      this.auroraPoints.push({
        x: i / 10,
        y: 0.2 + Math.random() * 0.1,
        offset: Math.random() * Math.PI * 2,
      });
    }
  }

  setupResize() {
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const parent = this.canvas.parentElement;
    if (parent) {
      this.width = parent.clientWidth;
      this.height = parent.clientHeight;

      // Full screen responsive
      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
      this.canvas.style.position = 'absolute';
      this.canvas.style.left = '0';
      this.canvas.style.top = '0';

      const scale = window.devicePixelRatio || 1;
      this.canvas.width = this.width * scale;
      this.canvas.height = this.height * scale;
      this.ctx.scale(scale, scale);

      // Recalculate node positions based on screen size
      this.recalculateNodePositions();
    }
  }

  recalculateNodePositions() {
    // Defines the curve of nodes up the mountain
    // C4 (start) -> C5 (peak)
    // Simple S-curve or diagonal up
    this.nodes = [
      {
        note: 'C4', x: 0.25, y: 0.75, label: 'C',
      },
      {
        note: 'D4', x: 0.35, y: 0.65, label: 'D',
      },
      {
        note: 'E4', x: 0.45, y: 0.58, label: 'E',
      },
      {
        note: 'F4', x: 0.55, y: 0.50, label: 'F',
      },
      {
        note: 'G4', x: 0.65, y: 0.42, label: 'G',
      },
      {
        note: 'A4', x: 0.75, y: 0.35, label: 'A',
      },
      {
        note: 'B4', x: 0.82, y: 0.28, label: 'B',
      },
      {
        note: 'C5', x: 0.90, y: 0.20, label: 'C',
      },
    ];
  }

  update(dt, state) {
    this.time += dt;

    // Update Aurora
    this.auroraPoints.forEach((p, i) => {
      // eslint-disable-next-line no-param-reassign
      p.y = 0.2 + Math.sin(this.time * 0.5 + p.offset + i * 0.5) * 0.05;
    });

    // Update Campfire
    // Add particles based on audio amplitude (passed in state.volume)
    if (state.volume > 0.01) {
      if (Math.random() < state.volume * 2) {
        this.campfireState.particles.push({
          x: this.width * 0.2, // Basecamp position
          y: this.height * 0.8,
          vx: (Math.random() - 0.5) * 20,
          vy: -Math.random() * 50 - (state.volume * 100),
          life: 1.0,
          size: Math.random() * 3 + 2,
        });
      }
    } else if (Math.random() < 0.1) {
      // Idle fire
      this.campfireState.particles.push({
        x: this.width * 0.2,
        y: this.height * 0.8,
        vx: (Math.random() - 0.5) * 10,
        vy: -Math.random() * 30,
        life: 1.0,
        size: Math.random() * 2 + 1,
      });
    }

    // Update fire particles
    this.campfireState.particles.forEach((p) => {
      /* eslint-disable no-param-reassign */
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      p.size *= 0.95;
      /* eslint-enable no-param-reassign */
    });
    this.campfireState.particles = this.campfireState.particles.filter((p) => p.life > 0);

    // Update Orb (Pitch Feedback)
    if (state.pitchCents !== null && state.pitchCents !== undefined) {
      // Find the start node (C4)
      const targetNode = this.nodes[0];
      const targetX = targetNode.x * this.width;
      const targetY = targetNode.y * this.height;

      // Calculate position based on pitch error (horizontal/vertical drift)
      // If flat, drift left/down. If sharp, drift right/up.
      // 50 cents = max drift distance
      const maxDrift = 100;
      const driftX = (state.pitchCents / 50) * maxDrift;
      const driftY = -(state.pitchCents / 50) * (maxDrift * 0.5);

      this.orbState.targetX = targetX + driftX;
      this.orbState.targetY = targetY + driftY;
      this.orbState.alpha = Math.min(state.confidence || 0, 1);

      // Lerp to target
      const smooth = 5 * dt;
      this.orbState.x += (this.orbState.targetX - this.orbState.x) * smooth;
      this.orbState.y += (this.orbState.targetY - this.orbState.y) * smooth;

      // Blur based on confidence
      this.orbState.blur = (1 - (state.confidence || 0)) * 20;
    } else {
      this.orbState.alpha *= 0.9; // Fade out
    }
  }

  render(state) {
    // Clear
    this.ctx.fillStyle = '#050B14'; // Deep night blue
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Render Layers
    this.renderAurora();
    this.renderMountains();
    this.renderNodes(state);
    this.renderCampfire();
    this.renderClimber(); // Placeholder or actual sprite
    this.renderOrb();

    // Render Rope/Clip-in animation if active
    if (state.isClippingIn || state.clipProgress > 0) {
      this.renderClipIn(state);
    }
  }

  renderAurora() {
    const { ctx } = this;
    ctx.save();
    // Soft gradient
    const gradient = ctx.createLinearGradient(0, 0, this.width, 0);
    gradient.addColorStop(0, 'rgba(0, 255, 128, 0)');
    gradient.addColorStop(0.5, 'rgba(0, 255, 128, 0.2)');
    gradient.addColorStop(1, 'rgba(0, 255, 128, 0)');

    ctx.fillStyle = gradient;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    this.auroraPoints.forEach((p) => {
      ctx.lineTo(p.x * this.width, p.y * this.height);
    });
    ctx.lineTo(this.width, 0);
    ctx.fill();
    ctx.restore();
  }

  renderMountains() {
    const { ctx } = this;
    // Far layer
    ctx.fillStyle = '#0F1A2A';
    ctx.beginPath();
    ctx.moveTo(0, this.height);
    ctx.lineTo(0, this.height * 0.6);
    ctx.lineTo(this.width * 0.5, this.height * 0.3);
    ctx.lineTo(this.width, this.height * 0.5);
    ctx.lineTo(this.width, this.height);
    ctx.fill();

    // Mid layer
    ctx.fillStyle = '#162438';
    ctx.beginPath();
    ctx.moveTo(0, this.height);
    ctx.lineTo(0, this.height * 0.8);
    ctx.lineTo(this.width * 0.3, this.height * 0.5);
    ctx.lineTo(this.width * 0.7, this.height * 0.7);
    ctx.lineTo(this.width, this.height * 0.6);
    ctx.lineTo(this.width, this.height);
    ctx.fill();
  }

  renderNodes(state) {
    const { ctx } = this;
    // Only show nodes if enabled (or ghosted)
    if (!state.nodesVisible) {
      // Just show the first one ghosted
      const node = this.nodes[0];
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      ctx.arc(node.x * this.width, node.y * this.height, 5, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    // Draw connection line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    this.nodes.forEach((node, i) => {
      if (i === 0) ctx.moveTo(node.x * this.width, node.y * this.height);
      else ctx.lineTo(node.x * this.width, node.y * this.height);
    });
    ctx.stroke();

    // Draw nodes
    this.nodes.forEach((node) => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(node.x * this.width, node.y * this.height, 6, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  renderCampfire() {
    const { ctx } = this;
    ctx.globalCompositeOperation = 'screen';
    this.campfireState.particles.forEach((p) => {
      ctx.fillStyle = `rgba(255, 150, 50, ${p.life})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalCompositeOperation = 'source-over';

    // Fire base
    ctx.fillStyle = '#FF4500';
    ctx.beginPath();
    ctx.arc(this.width * 0.2, this.height * 0.8, 5 + Math.random() * 2, 0, Math.PI * 2);
    ctx.fill();
  }

  renderClimber() {
    // Ideally use CharacterSprite here
    // For now, simple silhouette at the base
    const { ctx } = this;
    const x = this.width * 0.2 - 20;
    const y = this.height * 0.8 - 40;

    ctx.fillStyle = '#000';
    ctx.fillRect(x, y, 20, 40); // Placeholder
  }

  renderOrb() {
    if (this.orbState.alpha <= 0.01) return;

    const { ctx } = this;
    ctx.save();
    ctx.globalAlpha = this.orbState.alpha;
    ctx.shadowColor = this.orbState.color;
    ctx.shadowBlur = 10 + Math.random() * 5;
    ctx.fillStyle = this.orbState.color;

    // Draw Orb
    ctx.beginPath();
    ctx.arc(this.orbState.x, this.orbState.y, this.orbState.radius, 0, Math.PI * 2);
    ctx.fill();

    // "Confidence Fog" if low confidence
    if (this.orbState.blur > 5) {
      ctx.shadowBlur = this.orbState.blur;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fill();
    }

    ctx.restore();
  }

  renderClipIn({ clipProgress }) {
    const { ctx } = this;
    const startNode = this.nodes[0];
    const tx = startNode.x * this.width;
    const ty = startNode.y * this.height;

    // Progress Ring
    if (clipProgress > 0) {
      ctx.strokeStyle = '#00FF88';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(tx, ty, 20, -Math.PI / 2, (-Math.PI / 2) + (Math.PI * 2 * clipProgress));
      ctx.stroke();
    }
  }
}

export default TitleSceneRenderer;
