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

// A depth-sorted, swept 3D mesh: scroll travels along the serpent's coils.
(() => {
  const canvas = document.createElement('canvas');
  canvas.className = 'serpent-scene';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.append(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  let width = innerWidth, height = innerHeight, travel = scrollY * .001;
  let enabled = true, visible = true, last = 0;
  try { enabled = localStorage.getItem('arash-dragon') !== 'off'; } catch {}
  const toggle = document.createElement('button');
  toggle.id = 'dragon-toggle';
  toggle.type = 'button';
  function sync() {
    toggle.textContent = enabled ? 'Dragon: on' : 'Dragon: off';
    toggle.setAttribute('aria-pressed', String(enabled));
  }
  toggle.addEventListener('click', () => {
    enabled = !enabled;
    try { localStorage.setItem('arash-dragon', enabled ? 'on' : 'off'); } catch {}
    sync();
  });
  document.querySelector('.contact footer').append(toggle);
  sync();
  function resize() {
    width = innerWidth; height = innerHeight;
    const ratio = Math.min(devicePixelRatio || 1, 1.35);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }
  window.addEventListener('resize', resize);
  window.addEventListener('scroll', () => { visible = true; }, { passive: true });
  resize();

  const dot = (a, b) => a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
  const normalize = v => { const n=Math.hypot(...v)||1; return v.map(x=>x/n); };
  const cross = (a,b) => [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  function center(t, phase) {
    return [Math.sin(t*1.52+phase)*1.2+t*.25, t*.57+Math.sin(t*2.1+phase)*.24, Math.cos(t*1.52+phase)*.9];
  }
  addFrameTask(time => {
    if (!enabled || calmMotion() || !visible) {
      canvas.classList.remove('serpent-visible');
      return;
    }
    canvas.classList.add('serpent-visible');
    const dt=Math.min(50,time-last||32)/32; last=time;
    travel+=(scrollY*.0018-travel)*.065*dt;
    const phase=travel+time*.000055;
    const rings=width<700?100:160, sides=16;
    const angle=.35+Math.sin(time*.00008)*.12;
    const ca=Math.cos(angle),sa=Math.sin(angle);
    const scale=Math.min(width*.39,height*.48);
    function project(p) {
      const x=p[0]*ca+p[2]*sa, z=-p[0]*sa+p[2]*ca;
      const perspective=5/(5-z);
      return {x:width*.72+x*scale*perspective,y:height*.51+p[1]*scale*perspective,z};
    }
    const grid=[];
    for(let i=0;i<=rings;i++) {
      const t=-3.4+i/rings*6.8;
      const c=center(t,phase),next=center(t+.002,phase);
      const tangent=normalize(next.map((v,k)=>v-c[k]));
      const normal=normalize(cross(tangent,[0,0,1]));
      const binormal=cross(tangent,normal);
      const taper=.55+.45*Math.sin(Math.PI*i/rings);
      const radius=(.16+.035*Math.sin(t*3+phase))*taper;
      const ring=[];
      for(let j=0;j<sides;j++) {
        const a=j/sides*Math.PI*2;
        const ridge=1+.045*Math.sin(i*1.8+j*2.3);
        const radial=normal.map((v,k)=>v*Math.cos(a)+binormal[k]*Math.sin(a));
        const world=c.map((v,k)=>v+radial[k]*radius*ridge);
        ring.push({...project(world),light:Math.max(.05,dot(radial,normalize([-.5,-.7,1])))});
      }
      grid.push(ring);
    }
    const faces=[];
    for(let i=0;i<rings;i++) for(let j=0;j<sides;j++) {
      const k=(j+1)%sides, vertices=[grid[i][j],grid[i+1][j],grid[i+1][k],grid[i][k]];
      faces.push({vertices,z:vertices.reduce((s,p)=>s+p.z,0)/4,light:(vertices[0].light+vertices[2].light)/2,i,j});
    }
    faces.sort((a,b)=>a.z-b.z);
    ctx.clearRect(0,0,width,height);
    for(const face of faces) {
      const l=face.light;
      ctx.beginPath();
      face.vertices.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));
      ctx.closePath();
      ctx.fillStyle=`rgba(${Math.round(15+l*37)},${Math.round(10+l*20)},${Math.round(25+l*54)},.94)`;
      ctx.fill();
      ctx.strokeStyle=face.j % 4 === 0 ? `rgba(112,255,232,${.35+l*.5})` : `rgba(186,116,255,${.38+l*.5})`;
      ctx.lineWidth=.85;ctx.stroke();
      // Flecks follow the surface rather than floating above the mesh.
      if((face.i*7+face.j*13)%19===0) {
        const p=face.vertices[0];
        ctx.fillStyle=(face.i+face.j)%4===0?'#9affee':'#ddb3ff';
        ctx.fillRect(p.x,p.y,1.4+l*1.6,1.4+l*1.6);
      }
    }
    // A luminous second pass keeps the neon edges visible over the shaded mesh.
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.shadowBlur = 9;
    for (let side = 0; side < sides; side += 4) {
      ctx.strokeStyle = side % 8 === 0 ? '#67ffe2' : '#d16bff';
      ctx.shadowColor = ctx.strokeStyle;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      grid.forEach((ring, index) => index ? ctx.lineTo(ring[side].x, ring[side].y) : ctx.moveTo(ring[side].x, ring[side].y));
      ctx.stroke();
    }
    ctx.shadowBlur = 4;
    ctx.strokeStyle = '#bd79ff99';
    ctx.lineWidth = .7;
    for (let index = 0; index <= rings; index += 5) {
      ctx.beginPath();
      grid[index].forEach((point, i) => i ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y));
      ctx.closePath(); ctx.stroke();
    }
    ctx.restore();
  });
})();

