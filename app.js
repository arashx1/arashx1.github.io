"use strict";
// All canvas and scroll effects share one capped frame loop.
const frameTasks = [];
function addFrameTask(task) {
  frameTasks.push(task);
}
let animationFrame = 0;
let frameTime = 0;
function renderFrame(time) {
  if (time - frameTime >= 30) {
    frameTime = time;
    for (const task of frameTasks) task(time);
  }
  animationFrame = requestAnimationFrame(renderFrame);
}
function resumeFrames() {
  cancelAnimationFrame(animationFrame);
  if (!document.hidden) animationFrame = requestAnimationFrame(renderFrame);
}
document.addEventListener("visibilitychange", resumeFrames);
document.addEventListener("DOMContentLoaded", resumeFrames, { once: true });

const projects = [
  {
    name: "Haven",
    category: "product",
    eyebrow: "01 / HUMAN-CENTERED PRODUCT",
    year: "CARE, CONNECTED",
    summary: "A calmer everyday. A little more independence.",
    description:
      "A care companion that brings daily routines, familiar faces, memories, and shared family care into a calm interface. Built with adjustable text size, reduced-motion support, reminders, and trusted-helper invitations. This is an organizational aid; it is not an emergency or clinical service.",
    stack: "React · TypeScript · Vite · PostgreSQL",
    code: "https://github.com/arashx1/haven",
    live: "https://haven-arash15.vercel.app/",
    art: "haven",
  },
  {
    name: "Qnova",
    category: "science",
    eyebrow: "02 / PHYSICS × MACHINE LEARNING",
    year: "LEARNING FROM THE LAWS",
    summary: "What if a neural network could learn the laws of heat?",
    description:
      "An interactive studio exploring a physics-informed neural network for two-dimensional heat diffusion. The experiment uses the heat equation as a learning constraint, exploring the intersection of physical systems and machine learning. Built during the Qnova Hackathon.",
    stack: "Python · Physics-informed neural networks · Heat diffusion",
    code: "https://github.com/guragam-singh/Qnova-Hackathon",
    live: "https://qnova-hackathon.vercel.app/",
    art: "qnova",
  },
  {
    name: "Quantum explorations",
    category: "science",
    eyebrow: "03 / QISKIT FALL FEST 2026",
    year: "BEYOND THE CLASSICAL",
    summary: "Superposition, uncertainty, and a different way to think.",
    description:
      "A collection of Qiskit experiments spanning single-qubit superposition, measurement uncertainty, sequential Stern–Gerlach measurements, and Bell inequality tests. The repository includes simulation work and experiments with IBM Quantum backends, using educational templates from IBM Quantum Learning.",
    stack: "Python · Qiskit · Aer · Jupyter",
    code: "https://github.com/arashx1/qiskit-fall-fest-2026",
    art: "quantum",
  },
  {
    name: "Forensic Nexus",
    category: "product",
    eyebrow: "04 / INVESTIGATION WORKSPACE",
    year: "PROTOTYPE / OPEN SOURCE",
    summary: "Bring scattered evidence into a clearer picture.",
    description:
      "An open-source AI forensics and OSINT prototype exploring case organization, evidence collection, and analysis in a unified workspace. An experiment in making complex investigation workflows more approachable.",
    stack: "Next.js · Python · FastAPI · PostgreSQL",
    code: "https://github.com/arashx1/forensic-nexus",
    art: "forensic",
  },
];
function artwork(type) {
  if (type === "haven")
    return '<div class="art-object"><div class="haven-orb"><span>✳</span></div><div class="art-word">haven.</div></div>';
  if (type === "qnova")
    return (
      '<div class="art-object wave-grid">' +
      Array.from(
        { length: 34 },
        (_, i) =>
          `<i style="--height:${45 + Math.sin(i * 0.16) * 105}px;--offset:${Math.sin(i * 0.22) * 28}px"></i>`,
      ).join("") +
      '</div><span class="art-word">Qnova</span>'
    );
  if (type === "quantum")
    return '<div class="art-object quantum-object"><span></span></div><span class="quantum-label">|ψ⟩</span>';
  return (
    '<div class="art-object fingerprint">' +
    Array.from(
      { length: 12 },
      (_, i) => `<i style="--inset:${i * 6}px"></i>`,
    ).join("") +
    '<span class="scan-line"></span></div><span class="art-word">NEXUS</span>'
  );
}
document.querySelector("#projects").innerHTML = projects
  .map(
    (p, i) =>
      `<article class="project" data-category="${p.category}"><button class="project-open" data-project="${i}" aria-label="Explore ${p.name}"><div class="project-art ${p.art}-art"><span class="project-number">EXPERIMENT / 00${i + 1}</span><span class="art-corner">↗</span>${artwork(p.art)}<span class="art-caption">${p.year}</span><span class="art-small">ARASH / 26</span></div><div class="project-meta"><span>${p.eyebrow}</span><span>↗ VIEW PROJECT</span></div><div class="project-title"><h3>${p.name}</h3><span>↗</span></div><p class="project-summary">${p.summary}</p><span class="project-tags">${p.stack}</span></button></article>`,
  )
  .join("");
const dialog = document.querySelector("#project-dialog");
document.querySelectorAll("[data-project]").forEach((button) =>
  button.addEventListener("click", () => {
    const p = projects[Number(button.dataset.project)];
    document.querySelector("#dialog-content").innerHTML =
      `<span class="dialog-kicker">${p.eyebrow}</span><h2 id="dialog-title">${p.name}</h2><p>${p.summary}</p><p class="dialog-description">${p.description}</p><p class="dialog-stack">${p.stack}</p><div class="dialog-links">${p.live ? `<a href="${p.live}" target="_blank" rel="noopener noreferrer">Visit project ↗</a>` : ""}<a href="${p.code}" target="_blank" rel="noopener noreferrer">Source on GitHub ↗</a></div>`;
    dialog.showModal();
  }),
);
document
  .querySelector(".dialog-close")
  .addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (e) => {
  if (e.target === dialog) {
    const r = dialog.getBoundingClientRect();
    if (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    )
      dialog.close();
  }
});
document.querySelectorAll("[data-filter]").forEach((button) =>
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-filter]").forEach((b) => {
      b.classList.toggle("active", b === button);
      b.setAttribute("aria-pressed", String(b === button));
    });
    document
      .querySelectorAll("[data-category]")
      .forEach(
        (card) =>
          (card.hidden =
            button.dataset.filter !== "all" &&
            card.dataset.category !== button.dataset.filter),
      );
  }),
);
document.querySelector("#copy-email").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText("js8252946@gmail.com");
    document.querySelector("#copy-status").textContent =
      "Copied. Let’s make something happen.";
  } catch {
    document.querySelector("#copy-status").textContent =
      "Email me at js8252946@gmail.com";
  }
});
function updateTime() {
  document.querySelector("#local-time").textContent =
    new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date()) + " IST";
}
updateTime();
setInterval(updateTime, 60000);
window.addEventListener(
  "scroll",
  () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    document.querySelector(".scroll-progress").style.width =
      (max > 0 ? (scrollY / max) * 100 : 0) + "%";
  },
  { passive: true },
);
// Each sculpture is a projected, depth-sorted 3D point cloud. No image or remote runtime is needed.
const TAU = Math.PI * 2;
const dimensions = [
  {
    tag: "EMPATHY → INTERFACES",
    title: "Technology should<br>feel a little more human.",
    copy: "Haven grew from a simple question: how can software make daily care feel calmer? The connected ring represents routines, memories, and people supporting one another.",
    link: "https://github.com/arashx1/haven",
    label: "Explore Haven ↗",
    code: "FORM_01 / TORUS",
    caption: "HUMAN-CENTERED / CONNECTING THE DOTS",
  },
  {
    tag: "PHYSICS → POSSIBILITY",
    title: "Learn the rules.<br>Then explore the edges.",
    copy: "From heat diffusion in Qnova to quantum measurements in Qiskit, I’m drawn to systems you can understand by experimenting. This folded waveform turns mathematical structure into something you can explore.",
    link: "https://github.com/arashx1/qiskit-fall-fest-2026",
    label: "Explore the quantum notebooks ↗",
    code: "FORM_02 / HARMONIC",
    caption: "SCIENCE-DRIVEN / FINDING THE PATTERN",
  },
  {
    tag: "CURIOSITY → CONNECTIONS",
    title: "Different problems.<br>The same curious mind.",
    copy: "Care tools. Digital investigations. Scientific experiments. I like finding connections between worlds. This open sphere is a reminder that every new perspective makes the picture a little bigger.",
    link: "https://github.com/arashx1",
    label: "Explore all my experiments ↗",
    code: "FORM_03 / SPHERE",
    caption: "ALWAYS EXPLORING / OPEN TO POSSIBILITY",
  },
];
let mode = 0,
  energy = 0.5,
  paused = false;
const motionQuery = matchMedia("(prefers-reduced-motion: reduce)");
let reduced = motionQuery.matches;
try {
  const saved = localStorage.getItem("arash-motion");
  if (saved === "reduced") reduced = true;
} catch {}
class Sculpture {
  constructor(canvas, hero = false) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.hero = hero;
    this.angle = 0.25;
    this.tilt = -0.35;
    this.drag = false;
    this.visible = true;
    this.points = [];
    this.target = [];
    this.width = 0;
    this.height = 0;
    this.last = 0;
    this.dirty = true;
    if (!this.ctx) {
      canvas.setAttribute(
        "aria-label",
        "Sculpture unavailable. Use the dimension buttons to explore the stories.",
      );
      return;
    }
    const count = hero ? 2200 : 1700;
    for (let i = 0; i < count; i++) this.points.push([0, 0, 0]);
    this.setMode(0, true);
    new ResizeObserver(() => this.resize()).observe(canvas);
    if ("IntersectionObserver" in window)
      new IntersectionObserver(
        (entries) => {
          this.visible = entries[0].isIntersecting;
          if (this.visible) this.dirty = true;
        },
        { rootMargin: "100px" },
      ).observe(canvas);
    canvas.addEventListener("pointerdown", (e) => {
      this.drag = true;
      this.dragMoved = false;
      this.px = e.clientX;
      this.py = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener("pointermove", (e) => {
      if (!this.drag) return;
      const dx = e.clientX - this.px,
        dy = e.clientY - this.py;
      if (Math.abs(dx) + Math.abs(dy) > 2) this.dragMoved = true;
      this.angle += dx * 0.008;
      this.tilt = Math.max(-1.4, Math.min(1.4, this.tilt + dy * 0.006));
      this.px = e.clientX;
      this.py = e.clientY;
      this.dirty = true;
    });
    canvas.addEventListener("pointerup", () => {
      if (this.drag && !this.dragMoved && hero) setMode((mode + 1) % 3);
      this.drag = false;
    });
    canvas.addEventListener("pointercancel", () => {
      this.drag = false;
    });
    canvas.addEventListener("keydown", (e) => {
      if (
        ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(e.key)
      ) {
        e.preventDefault();
        if (e.key === " ") setMode((mode + 1) % 3);
        else if (e.key === "ArrowLeft") this.angle -= 0.15;
        else if (e.key === "ArrowRight") this.angle += 0.15;
        else this.tilt += e.key === "ArrowUp" ? -0.1 : 0.1;
        this.dirty = true;
      }
    });
    this.resize();
  }
  setMode(next, immediate = false) {
    this.target = this.points.map((_, i) => {
      const u = ((i % 80) / 80) * TAU,
        v = (Math.floor(i / 80) / (this.points.length / 80)) * TAU;
      if (next === 0) {
        const r = 1.05 + 0.43 * Math.cos(v);
        return [r * Math.cos(u), 0.43 * Math.sin(v), r * Math.sin(u)];
      }
      if (next === 1) {
        const r = 0.95 + 0.28 * Math.cos(3 * u) + 0.17 * Math.sin(v);
        return [
          r * Math.cos(u),
          0.65 * Math.sin(2 * u) + 0.22 * Math.cos(v),
          r * Math.sin(u),
        ];
      }
      const y = 1 - (2 * (i + 0.5)) / this.points.length,
        r = Math.sqrt(1 - y * y),
        theta = i * 2.399963;
      return [1.25 * r * Math.cos(theta), 1.25 * y, 1.25 * r * Math.sin(theta)];
    });
    if (immediate || reduced) this.points = this.target.map((p) => [...p]);
    this.morphing = !immediate && !reduced;
    this.dirty = true;
  }
  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    const dpr = Math.min(devicePixelRatio || 1, 1.75);
    this.canvas.width = Math.round(rect.width * dpr);
    this.canvas.height = Math.round(rect.height * dpr);
    this.ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.dirty = true;
  }
  reset() {
    this.angle = 0.25;
    this.tilt = -0.35;
    this.dirty = true;
  }
  render(time) {
    if (!this.ctx || !this.visible || !this.width || document.hidden) return;
    const dt = Math.min(time - this.last || 16, 50);
    this.last = time;
    if (!reduced && !paused && !this.drag) {
      this.angle += dt * 0.00012 * (0.35 + energy);
      this.dirty = true;
    }
    if (!this.dirty && !this.morphing) return;
    const { ctx, width: w, height: h } = this;
    ctx.clearRect(0, 0, w, h);
    let moving = false;
    for (let i = 0; i < this.points.length; i++) {
      const p = this.points[i],
        t = this.target[i];
      for (let k = 0; k < 3; k++) {
        const diff = t[k] - p[k];
        if (Math.abs(diff) > 0.001) {
          p[k] += diff * (reduced ? 1 : Math.min(dt * 0.004, 1));
          moving = true;
        }
      }
    }
    this.morphing = moving;
    const cx = w * 0.5,
      cy = h * (this.hero ? 0.47 : 0.5),
      scale = Math.min(w * 0.3, h * 0.34);
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, scale * 1.65);
    glow.addColorStop(0, "rgba(155,86,255,0.12)");
    glow.addColorStop(1, "rgba(155,86,255,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
    ctx.save();
    ctx.translate(cx, cy + scale * 0.99);
    ctx.scale(1, 0.16);
    const shadow = ctx.createRadialGradient(0, 0, 0, 0, 0, scale * 1.3);
    shadow.addColorStop(0, "rgba(124,92,255,.14)");
    shadow.addColorStop(1, "rgba(124,92,255,0)");
    ctx.fillStyle = shadow;
    ctx.beginPath();
    ctx.arc(0, 0, scale * 1.3, 0, TAU);
    ctx.fill();
    ctx.restore();
    const ca = Math.cos(this.angle),
      sa = Math.sin(this.angle),
      ct = Math.cos(this.tilt),
      st = Math.sin(this.tilt);
    const projected = this.points
      .map((p, i) => {
        const x = p[0] * ca - p[2] * sa,
          z = p[0] * sa + p[2] * ca,
          y = p[1] * ct - z * st,
          depth = p[1] * st + z * ct;
        const perspective = 4.8 / (4.8 - depth);
        return {
          x: cx + x * scale * perspective,
          y: cy + y * scale * perspective,
          z: depth,
          size: perspective * (this.hero ? 1.15 : 1.05),
          i,
        };
      })
      .sort((a, b) => a.z - b.z);
    for (const p of projected) {
      const bright = Math.max(0.1, Math.min(1, (p.z + 1.8) / 3.2));
      const sparkle = p.i % 29 === 0;
      const r = sparkle ? 124 : Math.round(93 + 105 * bright),
        g = sparkle ? 246 : Math.round(45 + 108 * bright),
        b = sparkle ? 239 : 255;
      ctx.fillStyle = `rgba(${r},${g},${b},${0.23 + bright * 0.75})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (sparkle ? 1.5 : 1), 0, TAU);
      ctx.fill();
    }
    this.dirty = false;
  }
}
const heroSculpture = new Sculpture(document.querySelector("#engine"), true);
const labSculpture = new Sculpture(document.querySelector("#lab-canvas"));
function setMode(next) {
  mode = next;
  heroSculpture.setMode(next);
  labSculpture.setMode(next);
  const d = dimensions[next];
  document.querySelectorAll("[data-mode]").forEach((b) => {
    const active = Number(b.dataset.mode) === next;
    b.classList.toggle("active", active);
    b.setAttribute("aria-pressed", String(active));
  });
  document.querySelector("#dimension-tag").textContent = d.tag;
  document.querySelector("#dimension-title").innerHTML = d.title;
  document.querySelector("#dimension-copy").textContent = d.copy;
  const link = document.querySelector("#dimension-link");
  link.href = d.link;
  link.textContent = d.label;
  document.querySelector("#shape-code").textContent = d.code;
  document.querySelector("#engine-caption").textContent = d.caption;
}
document
  .querySelectorAll("[data-mode]")
  .forEach((b) =>
    b.addEventListener("click", () => setMode(Number(b.dataset.mode))),
  );
document
  .querySelector("#hero-morph")
  .addEventListener("click", () => setMode((mode + 1) % 3));
document.querySelector("#energy").addEventListener("input", (e) => {
  energy = Number(e.target.value) / 100;
  document.querySelector("#energy-output").value = e.target.value + "%";
});
document.querySelector("#pause-engine").addEventListener("click", (e) => {
  paused = !paused;
  e.currentTarget.setAttribute("aria-pressed", String(paused));
  e.currentTarget.textContent = paused
    ? "▷ Resume rotation"
    : "Ⅱ Pause rotation";
});
document.querySelector("#reset-engine").addEventListener("click", () => {
  heroSculpture.reset();
  labSculpture.reset();
  energy = 0.5;
  document.querySelector("#energy").value = 50;
  document.querySelector("#energy-output").value = "50%";
  setMode(0);
});
function syncMotion() {
  document.body.classList.toggle("reduced-motion", reduced);
  const b = document.querySelector("#motion-toggle");
  b.setAttribute("aria-pressed", String(reduced));
  b.textContent = reduced ? "Motion: reduced" : "Motion: on";
  heroSculpture.dirty = true;
  labSculpture.dirty = true;
}
document.querySelector("#motion-toggle").addEventListener("click", () => {
  reduced = !reduced;
  syncMotion();
  try {
    localStorage.setItem("arash-motion", reduced ? "reduced" : "full");
  } catch {}
});
motionQuery.addEventListener("change", (e) => {
  reduced = e.matches;
  syncMotion();
});
syncMotion();
addFrameTask((time) => {
  heroSculpture.render(time);
  labSculpture.render(time);
});
