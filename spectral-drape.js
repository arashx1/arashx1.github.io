const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const root = document.createElement('div');
root.className = 'spectral-drape';
root.setAttribute('aria-hidden', 'true');
const canvas = document.createElement('canvas');
root.append(canvas);
document.body.prepend(root);

const context = canvas.getContext('2d', { alpha: true });
const pointer = { x: 0.52, y: 0.42, targetX: 0.52, targetY: 0.42 };
const ripples = [];
let dots = [];
let width = 0;
let height = 0;
let pixelRatio = 1;
let frame = 0;
let last = 0;

function resize() {
  const bounds = root.getBoundingClientRect();
  width = Math.max(1, bounds.width);
  height = Math.max(1, bounds.height);
  pixelRatio = Math.min(window.devicePixelRatio || 1, 1.6);
  canvas.width = width * pixelRatio;
  canvas.height = height * pixelRatio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  const columns = Math.min(66, Math.max(34, Math.floor(width / 25)));
  const rows = Math.min(38, Math.max(20, Math.floor(height / 26)));
  dots = Array.from({ length: columns * rows }, (_, index) => ({
    column: index % columns,
    row: Math.floor(index / columns),
    columns,
    rows,
    phase: Math.random() * Math.PI * 2,
    seed: Math.random(),
  }));
}

function draw(time) {
  const delta = Math.min(48, time - last || 16);
  last = time;
  pointer.x += (pointer.targetX - pointer.x) * 0.055;
  pointer.y += (pointer.targetY - pointer.y) * 0.055;
  context.clearRect(0, 0, width, height);
  const drift = reducedMotion.matches ? 0 : time * 0.00055;
  const centerX = width * (0.5 + (pointer.x - 0.5) * 0.08);
  const centerY = height * (0.42 + (pointer.y - 0.5) * 0.06);

  for (const dot of dots) {
    const u = dot.column / Math.max(1, dot.columns - 1);
    const v = dot.row / Math.max(1, dot.rows - 1);
    const wave = Math.sin(u * 11.5 + drift * 1.8 + dot.phase) * 0.16;
    const fold = Math.sin(u * 5.8 - drift * 1.1 + v * 5.2) * 0.12;
    const lift = Math.cos(u * 8.6 + v * 4.2 + drift) * 0.07;
    const x = u * width + (wave + fold) * width * 0.11 + (v - 0.5) * width * 0.05;
    const y = v * height + lift * height * 0.7 + Math.sin(u * 4 + drift) * height * 0.06;
    const depth = 0.62 + (Math.sin(u * 7 - v * 4 + drift) + 1) * 0.19;
    const distance = Math.hypot(x - centerX, y - centerY) / Math.max(width, height);
    const alpha = Math.max(0.07, (1 - distance * 1.15) * depth * 0.62);
    const size = 0.95 + depth * 1.55 + Math.sin(time * 0.0015 + dot.seed * 8) * 0.28;
    const highlight = Math.max(0, 1 - distance * 3.2);
    const red = Math.round(112 + highlight * 90);
    context.fillStyle = `rgba(${red}, ${Math.round(62 + highlight * 72)}, 210, ${alpha})`;
    context.beginPath();
    context.arc(x, y, size, 0, Math.PI * 2);
    context.fill();
  }

  for (let index = ripples.length - 1; index >= 0; index -= 1) {
    const ripple = ripples[index];
    ripple.radius += delta * 0.22;
    ripple.alpha *= 0.965;
    context.strokeStyle = `rgba(209, 162, 255, ${ripple.alpha})`;
    context.lineWidth = 1;
    context.beginPath();
    context.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
    context.stroke();
    if (ripple.alpha < 0.02) ripples.splice(index, 1);
  }
  frame = requestAnimationFrame(draw);
}

window.addEventListener('resize', resize, { passive: true });
window.addEventListener('pointermove', (event) => {
  pointer.targetX = event.clientX / Math.max(1, width);
  pointer.targetY = event.clientY / Math.max(1, height);
}, { passive: true });
window.addEventListener('pointerdown', (event) => {
  ripples.push({ x: event.clientX, y: event.clientY, radius: 8, alpha: 0.34 });
  if (ripples.length > 4) ripples.shift();
}, { passive: true });
window.addEventListener('pagehide', () => cancelAnimationFrame(frame));

resize();
frame = requestAnimationFrame(draw);
