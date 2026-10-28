/* Spring-based text particles. Physics is also exported for the Node checks. */
(function () {
  "use strict";

  function advanceParticle(point, pointer, step = 1) {
    const dt = Math.max(0, Math.min(step, 2));
    point.vx += (point.homeX - point.x) * 0.035 * dt;
    point.vy += (point.homeY - point.y) * 0.035 * dt;
    if (pointer.active) {
      const dx = point.x - pointer.x;
      const dy = point.y - pointer.y;
      const distance = Math.hypot(dx, dy);
      if (distance < pointer.radius) {
        // A deterministic direction also handles a pointer exactly on a glyph.
        const angle = distance < 0.01 ? point.phase : Math.atan2(dy, dx);
        const force = (1 - distance / pointer.radius) * 3.8 * dt;
        point.vx += Math.cos(angle) * force;
        point.vy += Math.sin(angle) * force;
      }
    }
    const damping = Math.pow(0.84, dt);
    point.vx *= damping;
    point.vy *= damping;
    point.x += point.vx * dt;
    point.y += point.vy * dt;
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { advanceParticle };
  }
  if (typeof document === "undefined") return;

  const glyphs = "01+×:3579·";

  class ParticleSignature {
    constructor(host) {
      host.className = "particle-signature";
      host.removeAttribute("aria-hidden");
      host.innerHTML = `
        <div class="signature-meta"><span>ARASH / HUMAN SIGNAL</span><span>INTERACTIVE TYPEFIELD — 001</span></div>
        <canvas tabindex="0" role="img" aria-label="ARASH written in neon particles. Move your pointer or drag to scatter them; they spring back into place. Press Space to scatter, or Home to reform."></canvas>
        <div class="signature-controls"><span>MOVE THROUGH THE LETTERS. LEAVE A LITTLE CHAOS.</span><div><button type="button" data-scatter>Scatter ↗</button><button type="button" data-reform>Reform ↺</button></div></div>`;
      this.host = host;
      this.canvas = host.querySelector("canvas");
      this.ctx = this.canvas.getContext("2d");
      this.points = [];
      this.pointer = { active: false, x: 0, y: 0, radius: 85 };
      this.visible = false;
      this.dirty = true;
      this.settled = true;
      this.lastTime = 0;
      if (!this.ctx) {
        host.innerHTML =
          '<div class="signature-fallback">ARASH.</div><p>Built from curiosity.</p>';
        return;
      }

      new ResizeObserver(() => this.resize()).observe(this.canvas);
      new IntersectionObserver(
        (entries) => {
          this.visible = entries[0].isIntersecting;
          this.dirty = true;
          this.lastTime = 0;
        },
        { rootMargin: "80px" },
      ).observe(host);

      const locate = (event) => {
        const rect = this.canvas.getBoundingClientRect();
        this.pointer.x = event.clientX - rect.left;
        this.pointer.y = event.clientY - rect.top;
        this.pointer.active = !calmMotion();
        this.settled = false;
        this.host.dataset.state = this.pointer.active ? "repelling" : "settled";
      };
      this.canvas.addEventListener("pointermove", locate);
      this.canvas.addEventListener("pointerdown", (event) => {
        locate(event);
        if (event.pointerType !== "mouse")
          this.canvas.setPointerCapture(event.pointerId);
        this.scatter(false);
      });
      const release = () => {
        this.pointer.active = false;
        this.host.dataset.state = "returning";
      };
      this.canvas.addEventListener("pointerleave", release);
      this.canvas.addEventListener("pointerup", (event) => {
        if (event.pointerType !== "mouse") release();
      });
      this.canvas.addEventListener("pointercancel", release);
      this.canvas.addEventListener("keydown", (event) => {
        if (event.key === " ") {
          event.preventDefault();
          this.scatter(true);
        }
        if (event.key === "Home") {
          event.preventDefault();
          this.reform();
        }
      });
      host
        .querySelector("[data-scatter]")
        .addEventListener("click", () => this.scatter(true));
      host
        .querySelector("[data-reform]")
        .addEventListener("click", () => this.reform());
      addFrameTask((time) => this.render(time));
      document.fonts?.ready.then(() => this.resize());
      this.resize();
    }

    resize() {
      const { width, height } = this.canvas.getBoundingClientRect();
      if (!width || !height) return;
      this.width = width;
      this.height = height;
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      this.canvas.width = Math.round(width * dpr);
      this.canvas.height = Math.round(height * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const stencil = document.createElement("canvas");
      stencil.width = Math.ceil(width);
      stencil.height = Math.ceil(height);
      const ink = stencil.getContext("2d", { willReadFrequently: true });
      if (!ink) return;
      let size = Math.min(height * 0.9, width * 0.27);
      ink.font = `900 ${size}px Arial, sans-serif`;
      size *= (width * 0.94) / ink.measureText("ARASH.").width;
      size = Math.min(size, height * 0.94);
      ink.font = `900 ${size}px Arial, sans-serif`;
      ink.textAlign = "center";
      ink.textBaseline = "middle";
      ink.fillText("ARASH.", width / 2, height * 0.52);
      const pixels = ink.getImageData(0, 0, stencil.width, stencil.height).data;
      const spacing = width < 500 ? 4 : 6;
      this.points = [];
      for (let y = 0; y < height; y += spacing) {
        for (let x = 0; x < width; x += spacing) {
          if (pixels[(y * stencil.width + x) * 4 + 3] > 128) {
            const index = this.points.length;
            this.points.push({
              x,
              y,
              homeX: x,
              homeY: y,
              vx: 0,
              vy: 0,
              phase: index * 2.399963,
              glyph: index % glyphs.length,
            });
          }
        }
      }
      this.pointer.radius = Math.min(105, width * 0.2);
      this.reform();
    }

    scatter(all) {
      if (calmMotion()) {
        this.reform();
        return;
      }
      for (const point of this.points) {
        if (
          !all &&
          Math.hypot(point.x - this.pointer.x, point.y - this.pointer.y) >
            this.pointer.radius
        )
          continue;
        const speed = all ? 12 : 6;
        point.vx += Math.cos(point.phase) * speed;
        point.vy += Math.sin(point.phase) * speed;
      }
      this.settled = false;
      this.host.dataset.state = all ? "scattered" : "repelling";
    }

    reform() {
      this.pointer.active = false;
      for (const point of this.points) {
        point.x = point.homeX;
        point.y = point.homeY;
        point.vx = 0;
        point.vy = 0;
      }
      this.dirty = true;
      this.settled = true;
      this.host.dataset.state = "settled";
    }

    render(time) {
      if (!this.visible || !this.width) return;
      const calm = calmMotion();
      if (calm && !this.settled) this.reform();
      if (this.settled && !this.dirty && !this.pointer.active) return;
      const step = Math.min(2, (time - this.lastTime || 32) / 32);
      this.lastTime = time;
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.width, this.height);
      ctx.font = `${this.width < 500 ? 5 : 7}px monospace`;
      ctx.textAlign = "center";
      let displacement = 0;
      for (const point of this.points) {
        if (!calm) advanceParticle(point, this.pointer, step);
        displacement +=
          Math.abs(point.x - point.homeX) + Math.abs(point.y - point.homeY);
        ctx.fillStyle =
          point.glyph % 7 === 0
            ? "#7cf6ef"
            : point.glyph % 3 === 0
              ? "#e8c4ff"
              : "#ac7cff";
        ctx.fillText(glyphs[point.glyph], point.x, point.y);
      }
      this.dirty = false;
      this.settled =
        !this.pointer.active && displacement < this.points.length * 0.03;
      if (this.settled) this.host.dataset.state = "settled";
    }
  }

  new ParticleSignature(document.querySelector(".giant-name"));
  const contactHost = document.createElement("div");
  document.querySelector(".contact-main").append(contactHost);
  new ParticleSignature(contactHost);
})();
