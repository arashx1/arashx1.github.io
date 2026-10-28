"use strict";

// A page-wide scene and a spring cursor, both on the existing shared renderer.
const sceneCanvas = document.createElement("canvas");
sceneCanvas.id = "scene-field";
sceneCanvas.setAttribute("aria-hidden", "true");
document.body.append(sceneCanvas);
const sceneContext = sceneCanvas.getContext("2d");
const cursor = document.createElement("div");
cursor.className = "live-cursor";
cursor.setAttribute("aria-hidden", "true");
cursor.innerHTML = "<span></span>";
document.body.append(cursor);

const scenePointer = { x: innerWidth / 2, y: innerHeight / 2, active: false };
const cursorSpring = {
  x: innerWidth / 2,
  y: innerHeight / 2,
  width: 22,
  height: 22,
};
const motes = Array.from({ length: innerWidth < 700 ? 36 : 72 }, (_, i) => ({
  x: ((i * 0.618034) % 1) * innerWidth,
  y: ((i * 0.381966 + 0.13) % 1) * innerHeight,
  depth: 0.25 + (i % 7) / 9,
  phase: i * 2.399963,
}));
let cursorTarget = null;
let sceneWidth = innerWidth;
let sceneHeight = innerHeight;
let lastSceneTime = 0;
let fieldCleared = false;
let scrollImpulse = 0;
let lastSceneScroll = scrollY;

function sizeScene() {
  sceneWidth = innerWidth;
  sceneHeight = innerHeight;
  const ratio = Math.min(devicePixelRatio || 1, 1.5);
  sceneCanvas.width = Math.round(sceneWidth * ratio);
  sceneCanvas.height = Math.round(sceneHeight * ratio);
  sceneContext?.setTransform(ratio, 0, 0, ratio, 0, 0);
}
sizeScene();
window.addEventListener("resize", sizeScene);
window.addEventListener(
  "scroll",
  () => {
    scrollImpulse = Math.max(
      -24,
      Math.min(24, (scrollY - lastSceneScroll) * 0.12),
    );
    lastSceneScroll = scrollY;
  },
  { passive: true },
);

document.addEventListener(
  "pointermove",
  (event) => {
    scenePointer.x = event.clientX;
    scenePointer.y = event.clientY;
    scenePointer.active = event.pointerType !== "touch";
    cursorTarget = event.target.closest(
      "a,button,summary,canvas,input,textarea,select",
    );
    if (!pointerFine.matches || calmMotion()) return;
    document.body.classList.add("cursor-ready");
    cursor.classList.add("cursor-visible");
    const isCanvas = cursorTarget?.tagName === "CANVAS";
    const isProject = cursorTarget?.matches(".project-open,.floating-project");
    const isField = cursorTarget?.matches("input,textarea,select");
    cursor.querySelector("span").textContent = isCanvas
      ? "DRAG"
      : isProject
        ? "VIEW ↗"
        : isField
          ? "TYPE"
          : "";
    cursor.classList.toggle(
      "cursor-labeled",
      Boolean(isCanvas || isProject || isField),
    );
  },
  { passive: true },
);
document.addEventListener("pointerdown", () =>
  cursor.classList.add("cursor-down"),
);
document.addEventListener("pointerup", () =>
  cursor.classList.remove("cursor-down"),
);
function hideCursor() {
  scenePointer.active = false;
  cursor.classList.remove("cursor-visible");
  document.body.classList.remove("cursor-ready");
}
document.addEventListener("pointerleave", hideCursor);
document.addEventListener("keydown", (event) => {
  if (event.key === "Tab") hideCursor();
});
window.addEventListener("blur", hideCursor);

function renderScene(time) {
  const calm = calmMotion();
  if (calm) {
    hideCursor();
    if (!fieldCleared) sceneContext?.clearRect(0, 0, sceneWidth, sceneHeight);
    fieldCleared = true;
    return;
  }
  fieldCleared = false;
  const delta = Math.min(50, time - lastSceneTime || 32) / 32;
  lastSceneTime = time;
  scrollImpulse *= 0.92;

  if (pointerFine.matches && scenePointer.active) {
    let x = scenePointer.x,
      y = scenePointer.y,
      width = 22,
      height = 22;
    const snap = cursorTarget?.matches(
      ".header a,.hero-actions a,.hero-actions button,.chapter-dock a,.signature-controls button",
    );
    if (snap) {
      const rect = cursorTarget.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
      width = rect.width + 12;
      height = rect.height + 12;
    } else if (cursor.classList.contains("cursor-labeled")) {
      width = 64;
      height = 64;
    }
    const smoothing = 1 - Math.pow(0.7, delta);
    cursorSpring.x += (x - cursorSpring.x) * smoothing;
    cursorSpring.y += (y - cursorSpring.y) * smoothing;
    cursorSpring.width += (width - cursorSpring.width) * smoothing;
    cursorSpring.height += (height - cursorSpring.height) * smoothing;
    cursor.style.transform = `translate3d(${cursorSpring.x - cursorSpring.width / 2}px,${cursorSpring.y - cursorSpring.height / 2}px,0)`;
    cursor.style.width = cursorSpring.width + "px";
    cursor.style.height = cursorSpring.height + "px";
    cursor.classList.toggle("cursor-snapped", Boolean(snap));
    const px = scenePointer.x / sceneWidth - 0.5;
    const py = scenePointer.y / sceneHeight - 0.5;
    document
      .querySelector(".hero-body")
      .style.setProperty("--scene-look-x", `${px * 18}px`);
    document
      .querySelector(".hero-body")
      .style.setProperty("--scene-look-y", `${py * 12}px`);
  }
  if (!sceneContext) return;
  const ctx = sceneContext;
  ctx.clearRect(0, 0, sceneWidth, sceneHeight);
  let connections = 0;
  for (const mote of motes) {
    mote.x += (0.15 + mote.depth * 0.28) * delta;
    mote.y -= (0.1 + mote.depth * 0.16 + scrollImpulse * mote.depth) * delta;
    if (mote.x > sceneWidth + 10) mote.x = -10;
    if (mote.y < -10) mote.y = sceneHeight + 10;
    if (mote.y > sceneHeight + 10) mote.y = -10;
    const drift = Math.sin(time * 0.0003 + mote.phase) * 8;
    const distance = Math.hypot(
      mote.x - scenePointer.x,
      mote.y - scenePointer.y,
    );
    ctx.fillStyle = `rgba(196,172,255,${0.12 + mote.depth * 0.25})`;
    ctx.beginPath();
    ctx.arc(mote.x + drift, mote.y, 0.65 + mote.depth * 0.6, 0, Math.PI * 2);
    ctx.fill();
    if (scenePointer.active && distance < 145 && connections++ < 12) {
      ctx.strokeStyle = `rgba(172,132,245,${(1 - distance / 145) * 0.13})`;
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(mote.x + drift, mote.y);
      ctx.lineTo(scenePointer.x, scenePointer.y);
      ctx.stroke();
    }
  }
}
addFrameTask(renderScene);

// A slow opening sequence plus responsive individual headline letters.
const title = document.querySelector("#hero-title");
const titleWalker = document.createTreeWalker(title, NodeFilter.SHOW_TEXT);
const textNodes = [];
while (titleWalker.nextNode()) textNodes.push(titleWalker.currentNode);
let letterIndex = 0;
for (const node of textNodes) {
  if (!node.textContent.trim()) continue;
  const fragment = document.createDocumentFragment();
  for (const letter of node.textContent) {
    if (/\s/.test(letter)) {
      fragment.append(document.createTextNode(letter));
      continue;
    }
    const span = document.createElement("span");
    span.className = "scene-letter";
    span.style.setProperty("--letter-order", letterIndex++);
    span.textContent = letter;
    fragment.append(span);
  }
  node.replaceWith(fragment);
}
document
  .querySelectorAll(".section-meta")
  .forEach((meta) => meta.classList.add("scene-metadata"));
