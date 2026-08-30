/**
 * KRISHISHETRA — LIVING AGRICULTURAL INTELLIGENCE BACKGROUND SYSTEM
 * "THE LIVING FIELD"
 * 
 * An ambient, production-grade procedural background canvas:
 * 1. Topographic aerial farmland contours & shifting plot boundaries
 * 2. Animated crop rows and wind streamlines
 * 3. Market ecosystem network (Farm → Mandi → Buyer → Warehouse) with data pulses
 * 4. Micro data seeds traveling along field contours
 * 5. Orbital sunlight tracker
 * 6. Responsive to scroll depth, subtle cursor parallax, weather & seasonal state
 */

(function () {
  'use strict';

  class KrishiLivingField {
    constructor(options = {}) {
      this.container = options.container || document.getElementById('dash-living-field') || document.body;
      this.canvas = null;
      this.ctx = null;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.width = 0;
      this.height = 0;
      this.animationFrameId = null;
      this.lastTime = 0;
      this.elapsedTime = 0;
      this.isRunning = false;

      // Configuration state (extensible for weather/season)
      this.config = {
        season: options.season || 'harvest', // 'harvest' | 'monsoon' | 'winter' | 'summer'
        weather: options.weather || 'clear', // 'clear' | 'cloudy' | 'rain' | 'hot'
        intensity: options.intensity !== undefined ? options.intensity : 0.85,
        particleCount: window.innerWidth < 768 ? 16 : 32,
        enableCursor: window.matchMedia('(pointer: fine)').matches,
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
      };

      // Palette - Strictly grounded in KrishiShetra agricultural design tokens
      this.palette = {
        sage: 'rgba(91, 154, 114, ',
        mint: 'rgba(143, 203, 155, ',
        evergreen: 'rgba(18, 55, 42, ',
        gold: 'rgba(214, 168, 79, ',
        sunlight: 'rgba(254, 240, 138, ',
        warmMuted: 'rgba(111, 127, 117, '
      };

      // Cursor parallax state (clamped to max 8px)
      this.cursor = { x: 0, y: 0, targetX: 0, targetY: 0, ease: 0.05 };
      this.scrollProgress = 0;

      // Simulation entities
      this.contours = [];
      this.cropRows = [];
      this.networkNodes = [];
      this.networkEdges = [];
      this.networkPulses = [];
      this.dataSeeds = [];
      this.sunlight = { x: 0.8, y: 0.15, phase: 0 };

      this.init();
    }

    init() {
      this.createCanvas();
      this.initEntities();
      this.bindEvents();

      if (!this.config.reducedMotion) {
        this.start();
      } else {
        this.renderStaticFrame();
      }
    }

    createCanvas() {
      // Remove any existing canvas
      const existing = document.getElementById('living-field-canvas');
      if (existing) existing.remove();

      this.canvas = document.createElement('canvas');
      this.canvas.id = 'living-field-canvas';
      this.canvas.className = 'living-field-canvas';
      this.canvas.style.position = 'fixed';
      this.canvas.style.top = '0';
      this.canvas.style.left = '0';
      this.canvas.style.width = '100vw';
      this.canvas.style.height = '100vh';
      this.canvas.style.pointerEvents = 'none';
      this.canvas.style.zIndex = '-1';
      this.canvas.style.opacity = '1';
      this.canvas.style.transition = 'opacity 0.6s ease';

      this.ctx = this.canvas.getContext('2d');
      this.container.prepend(this.canvas);
      this.handleResize();
    }

    handleResize() {
      if (!this.canvas) return;
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.canvas.width = this.width * this.dpr;
      this.canvas.height = this.height * this.dpr;
      this.ctx.scale(this.dpr, this.dpr);

      // Re-initialize entity distribution for new viewport dimensions
      this.initEntities();
      if (this.config.reducedMotion) {
        this.renderStaticFrame();
      }
    }

    initEntities() {
      const w = this.width;
      const h = this.height;

      // 1. Topographic Aerial Farmland Contours (5 curved regional elevation bands)
      this.contours = [];
      const numBands = 5;
      for (let i = 0; i < numBands; i++) {
        this.contours.push({
          baseY: h * (0.2 + (i / numBands) * 0.75),
          amplitude: 25 + i * 8,
          frequency: 0.0018 - i * 0.0002,
          speed: 0.0003 + (i % 2 === 0 ? 0.00015 : -0.00015),
          phase: (i * Math.PI) / 3,
          strokeAlpha: 0.04 + (i === 2 ? 0.03 : 0),
          fillAlpha: 0.015 + (i * 0.005)
        });
      }

      // 2. Crop Row Streamlines (curved field paths representing agricultural cultivation)
      this.cropRows = [];
      const numRows = w < 768 ? 4 : 8;
      for (let i = 0; i < numRows; i++) {
        this.cropRows.push({
          startX: (w / numRows) * i + (Math.random() * 40 - 20),
          startY: h * (0.4 + Math.random() * 0.5),
          length: 180 + Math.random() * 200,
          angle: -Math.PI / 4 + (Math.random() * 0.2 - 0.1),
          curvature: 30 + Math.random() * 20,
          dashOffset: Math.random() * 100,
          speed: 0.15 + Math.random() * 0.2,
          alpha: 0.035 + Math.random() * 0.025
        });
      }

      // 3. Market Ecosystem Network (Farm → Mandi → Buyer → Warehouse Hubs)
      this.networkNodes = [
        { id: 'farm-1', label: 'Farm Cluster', x: w * 0.14, y: h * 0.32, radius: 3, type: 'farm', pulse: 0 },
        { id: 'farm-2', label: 'Nashik Valley', x: w * 0.28, y: h * 0.65, radius: 2.5, type: 'farm', pulse: 0.5 },
        { id: 'mandi-1', label: 'Pune APMC', x: w * 0.38, y: h * 0.38, radius: 4, type: 'mandi', pulse: 1.2 },
        { id: 'mandi-2', label: 'Mumbai Vashi', x: w * 0.58, y: h * 0.28, radius: 4.5, type: 'mandi', pulse: 0.8 },
        { id: 'buyer-1', label: 'Institutional Hub', x: w * 0.76, y: h * 0.45, radius: 3.5, type: 'buyer', pulse: 1.8 },
        { id: 'wh-1', label: 'Central Sourcing', x: w * 0.88, y: h * 0.72, radius: 3, type: 'warehouse', pulse: 2.4 }
      ];

      // Network Edges with curved connections
      this.networkEdges = [
        { from: 0, to: 2, tension: -25 }, // Farm 1 → Pune APMC
        { from: 1, to: 2, tension: 20 },  // Farm 2 → Pune APMC
        { from: 2, to: 3, tension: -35 }, // Pune APMC → Mumbai Vashi
        { from: 3, to: 4, tension: 25 },  // Mumbai Vashi → Buyer
        { from: 2, to: 4, tension: -15 }, // Pune APMC → Buyer
        { from: 4, to: 5, tension: 30 }   // Buyer → Warehouse
      ];

      this.networkPulses = [];

      // 4. Data Seeds (Particles traveling along topographic field contours)
      this.dataSeeds = [];
      for (let i = 0; i < this.config.particleCount; i++) {
        this.dataSeeds.push(this.createDataSeed());
      }
    }

    createDataSeed() {
      const contourIndex = Math.floor(Math.random() * this.contours.length);
      return {
        x: Math.random() * this.width,
        contourIndex: contourIndex,
        progress: Math.random(),
        speed: 0.0002 + Math.random() * 0.0003,
        size: 1.2 + Math.random() * 1.6,
        alpha: 0,
        targetAlpha: 0.3 + Math.random() * 0.35,
        colorType: Math.random() > 0.35 ? 'sage' : 'gold',
        life: Math.random() * 1000,
        maxLife: 600 + Math.random() * 800
      };
    }

    bindEvents() {
      // Resize listener with debouncing
      let resizeTimeout;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => this.handleResize(), 150);
      });

      // Desktop subtle cursor tracking (max 6-8px displacement)
      if (this.config.enableCursor) {
        window.addEventListener('mousemove', (e) => {
          const normX = (e.clientX / this.width - 0.5) * 2; // -1 to +1
          const normY = (e.clientY / this.height - 0.5) * 2;
          this.cursor.targetX = normX * 7; // Max 7px displacement
          this.cursor.targetY = normY * 7;
        });
      }

      // Scroll progress tracking for continuous vertical landscape transformation
      window.addEventListener('scroll', () => {
        const maxScroll = Math.max(document.body.scrollHeight - window.innerHeight, 1);
        this.scrollProgress = window.scrollY / maxScroll;
      }, { passive: true });

      // Page Visibility handling (pause loop when tab inactive)
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.stop();
        } else if (!this.config.reducedMotion) {
          this.start();
        }
      });

      // Periodic Market Network Data Pulse emission (every 8 to 14 seconds)
      this.pulseTimer = setInterval(() => {
        if (!document.hidden && this.networkEdges.length > 0) {
          this.triggerNetworkPulse();
        }
      }, 9000);
    }

    triggerNetworkPulse() {
      const edgeIndex = Math.floor(Math.random() * this.networkEdges.length);
      this.networkPulses.push({
        edgeIndex: edgeIndex,
        progress: 0,
        speed: 0.007 + Math.random() * 0.005,
        color: Math.random() > 0.3 ? this.palette.mint : this.palette.gold
      });
    }

    start() {
      if (this.isRunning) return;
      this.isRunning = true;
      this.lastTime = performance.now();
      const loop = (currentTime) => {
        if (!this.isRunning) return;
        const delta = currentTime - this.lastTime;
        this.lastTime = currentTime;
        this.update(delta);
        this.render();
        this.animationFrameId = requestAnimationFrame(loop);
      };
      this.animationFrameId = requestAnimationFrame(loop);
    }

    stop() {
      this.isRunning = false;
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
    }

    update(delta) {
      this.elapsedTime += delta;

      // 1. Smooth cursor lerp interpolation
      this.cursor.x += (this.cursor.targetX - this.cursor.x) * this.cursor.ease;
      this.cursor.y += (this.cursor.targetY - this.cursor.y) * this.cursor.ease;

      // 2. Sunlight gentle orbital tracking across the day
      this.sunlight.phase += 0.00015 * (delta / 16.6);
      this.sunlight.x = 0.5 + Math.cos(this.sunlight.phase) * 0.35;
      this.sunlight.y = 0.12 + Math.sin(this.sunlight.phase) * 0.08;

      // 3. Update network data pulses
      for (let i = this.networkPulses.length - 1; i >= 0; i--) {
        const p = this.networkPulses[i];
        p.progress += p.speed * (delta / 16.6);
        if (p.progress >= 1) {
          this.networkPulses.splice(i, 1);
        }
      }

      // 4. Update data seeds (particles traveling on topography lines)
      for (let i = 0; i < this.dataSeeds.length; i++) {
        const seed = this.dataSeeds[i];
        seed.life += delta;
        seed.progress += seed.speed * (delta / 16.6);
        if (seed.progress > 1) seed.progress -= 1;

        // Smooth fade-in and fade-out life cycle
        if (seed.life < 200) {
          seed.alpha = (seed.life / 200) * seed.targetAlpha;
        } else if (seed.life > seed.maxLife - 200) {
          seed.alpha = ((seed.maxLife - seed.life) / 200) * seed.targetAlpha;
        } else {
          seed.alpha = seed.targetAlpha;
        }

        if (seed.life >= seed.maxLife) {
          this.dataSeeds[i] = this.createDataSeed();
        }
      }

      // 5. Update crop row dash offsets for subtle wind animation
      for (let i = 0; i < this.cropRows.length; i++) {
        this.cropRows[i].dashOffset += this.cropRows[i].speed * (delta / 16.6);
      }
    }

    render() {
      const ctx = this.ctx;
      const w = this.width;
      const h = this.height;

      ctx.clearRect(0, 0, w, h);

      ctx.save();
      // Apply subtle global parallax shift
      ctx.translate(this.cursor.x, this.cursor.y);

      // ── Layer 1: Sunlight Ambient Radial Field ──
      this.renderSunlight(ctx, w, h);

      // ── Layer 2: Topographic Aerial Farmland Contours ──
      this.renderTopography(ctx, w, h);

      // ── Layer 3: Crop Rows & Wind Flow Streamlines ──
      this.renderCropRows(ctx);

      // ── Layer 4: Market Network & Real-Time Data Pulses ──
      this.renderMarketNetwork(ctx);

      // ── Layer 5: Agricultural Data Seeds ──
      this.renderDataSeeds(ctx);

      ctx.restore();
    }

    renderSunlight(ctx, w, h) {
      const sunX = w * this.sunlight.x;
      const sunY = h * this.sunlight.y;
      const radius = Math.max(w, h) * 0.45;

      const grad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, radius);
      grad.addColorStop(0, `${this.palette.sunlight}0.09)`);
      grad.addColorStop(0.35, `${this.palette.gold}0.04)`);
      grad.addColorStop(0.7, `${this.palette.mint}0.015)`);
      grad.addColorStop(1, 'transparent');

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }

    renderTopography(ctx, w, h) {
      const t = this.elapsedTime;
      const scrollShift = this.scrollProgress * 40;

      for (let i = 0; i < this.contours.length; i++) {
        const c = this.contours[i];
        const yOffset = c.baseY - scrollShift;

        ctx.beginPath();
        ctx.moveTo(0, yOffset);

        const step = 40;
        for (let x = 0; x <= w + step; x += step) {
          const wave1 = Math.sin(x * c.frequency + t * c.speed + c.phase) * c.amplitude;
          const wave2 = Math.cos(x * c.frequency * 0.6 + t * c.speed * 0.8) * (c.amplitude * 0.4);
          const y = yOffset + wave1 + wave2;
          ctx.lineTo(x, y);
        }

        ctx.strokeStyle = `${this.palette.sage}${c.strokeAlpha})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Subtle gradient fill under the lowest band
        if (i === this.contours.length - 1) {
          ctx.lineTo(w, h);
          ctx.lineTo(0, h);
          ctx.closePath();
          ctx.fillStyle = `${this.palette.sage}${c.fillAlpha})`;
          ctx.fill();
        }
      }
    }

    renderCropRows(ctx) {
      ctx.save();
      for (let i = 0; i < this.cropRows.length; i++) {
        const row = this.cropRows[i];
        ctx.beginPath();
        ctx.moveTo(row.startX, row.startY);

        const endX = row.startX + Math.cos(row.angle) * row.length;
        const endY = row.startY + Math.sin(row.angle) * row.length;
        const cpX = (row.startX + endX) / 2 + row.curvature;
        const cpY = (row.startY + endY) / 2;

        ctx.quadraticCurveTo(cpX, cpY, endX, endY);
        ctx.strokeStyle = `${this.palette.mint}${row.alpha})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([6, 12]);
        ctx.lineDashOffset = -row.dashOffset;
        ctx.stroke();
      }
      ctx.restore();
    }

    renderMarketNetwork(ctx) {
      const nodes = this.networkNodes;
      const edges = this.networkEdges;

      // Draw Connection Lines (curved ecosystem links)
      for (let i = 0; i < edges.length; i++) {
        const edge = edges[i];
        const n1 = nodes[edge.from];
        const n2 = nodes[edge.to];
        if (!n1 || !n2) continue;

        ctx.beginPath();
        ctx.moveTo(n1.x, n1.y);
        const midX = (n1.x + n2.x) / 2;
        const midY = (n1.y + n2.y) / 2 + edge.tension;
        ctx.quadraticCurveTo(midX, midY, n2.x, n2.y);

        ctx.strokeStyle = `${this.palette.warmMuted}0.06)`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Draw Traveling Data Pulses along network
      for (let i = 0; i < this.networkPulses.length; i++) {
        const pulse = this.networkPulses[i];
        const edge = edges[pulse.edgeIndex];
        if (!edge) continue;
        const n1 = nodes[edge.from];
        const n2 = nodes[edge.to];
        const midX = (n1.x + n2.x) / 2;
        const midY = (n1.y + n2.y) / 2 + edge.tension;

        // Quadratic bezier point interpolation
        const u = pulse.progress;
        const px = Math.pow(1 - u, 2) * n1.x + 2 * (1 - u) * u * midX + Math.pow(u, 2) * n2.x;
        const py = Math.pow(1 - u, 2) * n1.y + 2 * (1 - u) * u * midY + Math.pow(u, 2) * n2.y;

        ctx.beginPath();
        ctx.arc(px, py, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `${pulse.color}0.7)`;
        ctx.shadowColor = `${pulse.color}0.8)`;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Draw Network Nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        
        let color = this.palette.sage;
        if (node.type === 'mandi') color = this.palette.gold;
        if (node.type === 'buyer') color = this.palette.mint;

        ctx.fillStyle = `${color}0.2)`;
        ctx.strokeStyle = `${color}0.4)`;
        ctx.lineWidth = 1;
        ctx.fill();
        ctx.stroke();

        // Subtle outer pulse ring
        const ringAlpha = (Math.sin(this.elapsedTime * 0.002 + node.pulse) + 1) * 0.12;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 3.5, 0, Math.PI * 2);
        ctx.strokeStyle = `${color}${ringAlpha})`;
        ctx.stroke();
      }
    }

    renderDataSeeds(ctx) {
      for (let i = 0; i < this.dataSeeds.length; i++) {
        const seed = this.dataSeeds[i];
        if (seed.alpha <= 0.01) continue;

        const c = this.contours[seed.contourIndex] || this.contours[0];
        const scrollShift = this.scrollProgress * 40;
        const yOffset = c.baseY - scrollShift;

        const x = seed.progress * this.width;
        const wave1 = Math.sin(x * c.frequency + this.elapsedTime * c.speed + c.phase) * c.amplitude;
        const wave2 = Math.cos(x * c.frequency * 0.6 + this.elapsedTime * c.speed * 0.8) * (c.amplitude * 0.4);
        const y = yOffset + wave1 + wave2;

        const color = seed.colorType === 'gold' ? this.palette.gold : this.palette.mint;

        ctx.beginPath();
        ctx.arc(x, y, seed.size, 0, Math.PI * 2);
        ctx.fillStyle = `${color}${seed.alpha})`;
        ctx.fill();
      }
    }

    renderStaticFrame() {
      // Fallback single-pass render for reduced motion users
      this.handleResize();
      this.render();
    }

    // Extensible API for real-time weather & season adaptations
    setSeason(seasonName) {
      this.config.season = seasonName;
      if (seasonName === 'monsoon') {
        this.palette.mint = 'rgba(120, 190, 160, ';
        this.palette.sage = 'rgba(70, 140, 110, ';
      } else if (seasonName === 'harvest') {
        this.palette.gold = 'rgba(224, 178, 80, ';
        this.palette.mint = 'rgba(143, 203, 155, ';
      }
    }

    setWeather(weatherCondition) {
      this.config.weather = weatherCondition;
    }
  }

  // Expose to window for modular access across platform
  window.KrishiLivingField = KrishiLivingField;

  // Auto-initialize on DOMContentLoaded if not already instanced
  document.addEventListener('DOMContentLoaded', () => {
    if (!window.__krishiLivingFieldInstance) {
      window.__krishiLivingFieldInstance = new KrishiLivingField();
    }
  });
})();
