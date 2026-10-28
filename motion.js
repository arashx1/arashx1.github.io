"use strict";
const calmMotion = () => reduced || motionQuery.matches;
const pointerFine = matchMedia("(hover:hover) and (pointer:fine)");
// One delegated effect system also covers buttons created inside dialogs.
function prepareSurfaces(root = document) {
  root
    .querySelectorAll("button,a,summary")
    .forEach((el) => el.classList.add("motion-surface"));
}
prepareSurfaces();
// Give both logo instances a small wave without changing their accessible names.
document.querySelectorAll(".wordmark").forEach((logo) => {
  const text = [...logo.childNodes].find(
    (node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim(),
  );
  if (!text) return;
  const letters = document.createElement("span");
  letters.className = "logo-letters";
  letters.setAttribute("aria-hidden", "true");
  letters.innerHTML = [...text.textContent.trim()]
    .map((letter, index) => `<b style="--logo-index:${index}">${letter}</b>`)
    .join("");
  logo.setAttribute("aria-label", "Arash home");
  text.replaceWith(letters);
});
new MutationObserver((records) => {
  for (const r of records)
    for (const node of r.addedNodes)
      if (node.nodeType === 1) {
        if (node.matches("button,a,summary"))
          node.classList.add("motion-surface");
        prepareSurfaces(node);
      }
}).observe(document.body, { childList: true, subtree: true });
let hoveredSurface = null,
  pointerFrame = 0,
  latestPointer = null;
document.addEventListener(
  "pointermove",
  (e) => {
    if (!pointerFine.matches) return;
    latestPointer = { x: e.clientX, y: e.clientY, target: e.target };
    if (pointerFrame) return;
    pointerFrame = requestAnimationFrame(() => {
      pointerFrame = 0;
      const { x, y, target } = latestPointer;
      const el = target.closest(".motion-surface");
      if (hoveredSurface && hoveredSurface !== el) {
        hoveredSurface.classList.remove("pointer-lit");
        hoveredSurface.style.removeProperty("translate");
      }
      hoveredSurface = el;
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--pointer-x", `${x - r.left}px`);
      el.style.setProperty("--pointer-y", `${y - r.top}px`);
      el.classList.add("pointer-lit");
      if (
        !calmMotion() &&
        el.matches(".accent-button,.tour-trigger,.contact-link")
      )
        el.style.translate = `${((x - r.left) / r.width - 0.5) * 5}px ${((y - r.top) / r.height - 0.5) * 5}px`;
    });
  },
  { passive: true },
);
document.addEventListener("pointerout", (e) => {
  const el = e.target.closest(".motion-surface");
  if (el && !el.contains(e.relatedTarget)) {
    el.classList.remove("pointer-lit");
    el.style.removeProperty("translate");
  }
});
document.addEventListener("click", (e) => {
  const el = e.target.closest(".motion-surface");
  if (!el || calmMotion()) return;
  el.classList.remove("button-tapped");
  void el.offsetWidth;
  el.classList.add("button-tapped");
});

// Two exact-width copies produce a seamless ribbon. Scroll velocity adds momentum.
const ribbon = document.querySelector(".ticker");
const ribbonWords = [
  "CURIOUS BY NATURE",
  "BUILDER BY CHOICE",
  "IDEAS INTO INTERFACES",
  "LEARN. BUILD. REPEAT.",
];
const ribbonGroup = ribbonWords
  .map(
    (w) =>
      `<span class="ribbon-word">${w}</span><span class="ribbon-star">✳</span>`,
  )
  .join("");
ribbon.innerHTML = `<div class="ribbon-track"><div class="ribbon-group">${ribbonGroup}</div><div class="ribbon-group">${ribbonGroup}</div></div>`;
ribbon.insertAdjacentHTML(
  "afterend",
  '<div class="ribbon-controls"><span>IDEAS IN MOTION / KEEP EXPLORING ↓</span><button id="ribbon-pause" aria-pressed="false">Ⅱ Pause strip</button></div>',
);
let ribbonPaused = false,
  ribbonOffset = 0,
  ribbonWidth = 1,
  ribbonVisible = true,
  ribbonHover = false;
const ribbonPause = document.querySelector("#ribbon-pause");
function syncRibbon() {
  const stopped = ribbonPaused || calmMotion();
  ribbonPause.setAttribute("aria-pressed", String(stopped));
  ribbonPause.textContent = stopped ? "▷ Play strip" : "Ⅱ Pause strip";
}
ribbonPause.addEventListener("click", () => {
  if (calmMotion()) {
    ribbonPause.textContent = "Motion is reduced · use footer to enable";
    return;
  }
  ribbonPaused = !ribbonPaused;
  syncRibbon();
});
ribbon.addEventListener("pointerenter", () => (ribbonHover = true));
ribbon.addEventListener("pointerleave", () => (ribbonHover = false));
new ResizeObserver(() => {
  ribbonWidth =
    ribbon.querySelector(".ribbon-group").getBoundingClientRect().width || 1;
  ribbonOffset %= ribbonWidth;
}).observe(ribbon.querySelector(".ribbon-group"));
new IntersectionObserver((e) => (ribbonVisible = e[0].isIntersecting), {
  rootMargin: "150px",
}).observe(ribbon);
new MutationObserver(syncRibbon).observe(document.body, {
  attributes: true,
  attributeFilter: ["class"],
});
syncRibbon();

// Staggered arrivals and modest scroll depth across every content chapter.
const animatedSections = [...document.querySelectorAll("main>section")];
const sectionVisibility = new Set();
const sectionObserver = new IntersectionObserver(
  (entries) =>
    entries.forEach((e) => {
      if (e.isIntersecting) {
        sectionVisibility.add(e.target);
        e.target.classList.add("chapter-arrived");
      } else {
        sectionVisibility.delete(e.target);
        e.target.classList.remove("chapter-arrived");
      }
    }),
  { threshold: 0.05 },
);
animatedSections.forEach((section) => {
  section.classList.add("motion-chapter");
  sectionObserver.observe(section);
});
document
  .querySelectorAll(
    ".section-heading,.about-layout,.play-heading,.lab,.toolkit-layout,.contact-main,.brief-form,.project,.skill-rows>div,.identity-card",
  )
  .forEach((el, i) => {
    el.classList.add("motion-arrival");
    el.style.setProperty("--arrival-delay", `${(i % 3) * 65}ms`);
  });
const arrivalObserver = new IntersectionObserver(
  (entries) =>
    entries.forEach((e) =>
      e.target.classList.toggle("has-arrived", e.isIntersecting),
    ),
  { threshold: 0.08 },
);
document
  .querySelectorAll(".motion-arrival")
  .forEach((el) => arrivalObserver.observe(el));
let previousScroll = scrollY,
  scrollMomentum = 0,
  lastMotionTime = 0;
window.addEventListener(
  "scroll",
  () => {
    scrollMomentum = Math.min(650, Math.abs(scrollY - previousScroll) * 9);
    previousScroll = scrollY;
  },
  { passive: true },
);
function motionFrame(t) {
  const dt = Math.min(40, t - lastMotionTime || 16) / 1000;
  lastMotionTime = t;
  if (!document.hidden) {
    scrollMomentum *= 0.94;
    const calm = calmMotion();
    if (!calm && ribbonVisible && !ribbonPaused) {
      ribbonOffset =
        (ribbonOffset + dt * (ribbonHover ? 18 : 50 + scrollMomentum * 0.28)) %
        ribbonWidth;
      ribbon.querySelector(".ribbon-track").style.transform =
        `translate3d(${-ribbonOffset}px,0,0)`;
      ribbon.style.setProperty("--star-turn", `${ribbonOffset * 0.18}deg`);
    }
    for (const section of sectionVisibility) {
      const rect = section.getBoundingClientRect();
      const progress = Math.max(
        -1,
        Math.min(1, (innerHeight * 0.45 - rect.top) / innerHeight),
      );
      section.style.setProperty(
        "--chapter-depth",
        calm ? "0px" : `${progress * -12}px`,
      );
    }
  }
}
addFrameTask(motionFrame);

// A small personal canvas: real interests, draggable notes, keyboard movement.
document
  .querySelector(".about-layout")
  .insertAdjacentHTML(
    "afterend",
    `<div class="personal-studio"><div class="studio-header"><div><span>THE PERSONAL CANVAS</span><h3>A few pieces of my world.</h3></div><button id="reset-notes">↺ Reset notes</button></div><div class="curiosity-board" aria-label="Interactive board of Arash’s interests"><span class="board-grid-label">ARASH / A MIND IN PROGRESS</span><div class="board-center" aria-hidden="true">a<span>✳</span></div><button class="studio-note note-care" data-note="0" aria-label="Care and connection note. Drag or use arrow keys to move."><small>THE HUMAN SIDE</small><strong>Build for<br>someone.</strong><span>Empathy before features. ↗</span></button><button class="studio-note note-science" data-note="1" aria-label="Science and curiosity note. Drag or use arrow keys to move."><small>THE SCIENCE SIDE</small><strong>Ask a better<br>“what if?”</strong><span>Physics. Quantum. Possibility.</span></button><button class="studio-note note-build" data-note="2" aria-label="Building and learning note. Drag or use arrow keys to move."><small>THE BUILDER SIDE</small><strong>Make it.<br>Understand it.</strong><span>Learning happens in the doing.</span></button><span class="board-hint">DRAG A NOTE · ARROW KEYS TO MOVE · HOME TO RESET</span></div><div class="studio-notes"><details open><summary>What I’m exploring <span>NOW / 2026</span></summary><p>Accessible products, physics-informed learning, quantum experiments, and this interactive portfolio for the AWS Student Builder Challenge.</p></details><details><summary>How I build <span>+</span></summary><p>I use AI-assisted development alongside hands-on interface decisions, experiments, testing, and iteration. My project repositories show what I’m working on.</p></details><details><summary>What I’m open to <span>+</span></summary><p>Hackathons, internships, and thoughtful collaborations. Have a problem worth working on? <a href="#contact">Let’s talk ↗</a></p></details></div></div>`,
  );
const board = document.querySelector(".curiosity-board");
const noteOffsets = new Map();
let activeNote = null;
function moveNote(note, x, y) {
  const initialX = note.offsetLeft,
    initialY = note.offsetTop;
  const padding = 8;
  const maxX = board.clientWidth - note.offsetWidth - padding,
    minX = -initialX + padding,
    maxY = board.clientHeight - note.offsetHeight - 35,
    minY = -initialY + padding;
  const nx = Math.max(minX, Math.min(maxX - initialX, x)),
    ny = Math.max(minY, Math.min(maxY - initialY, y));
  noteOffsets.set(note, { x: nx, y: ny });
  note.style.setProperty("--note-x", nx + "px");
  note.style.setProperty("--note-y", ny + "px");
}
document.querySelectorAll(".studio-note").forEach((note) => {
  noteOffsets.set(note, { x: 0, y: 0 });
  note.addEventListener("pointerdown", (e) => {
    const p = noteOffsets.get(note);
    activeNote = { note, x: e.clientX, y: e.clientY, ox: p.x, oy: p.y };
    note.setPointerCapture(e.pointerId);
    note.classList.add("note-grabbed");
  });
  note.addEventListener("pointermove", (e) => {
    if (activeNote?.note !== note) return;
    moveNote(
      note,
      activeNote.ox + e.clientX - activeNote.x,
      activeNote.oy + e.clientY - activeNote.y,
    );
  });
  const release = () => {
    note.classList.remove("note-grabbed");
    activeNote = null;
  };
  note.addEventListener("pointerup", release);
  note.addEventListener("pointercancel", release);
  note.addEventListener("keydown", (e) => {
    if (
      !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home"].includes(
        e.key,
      )
    )
      return;
    e.preventDefault();
    if (e.key === "Home") {
      moveNote(note, 0, 0);
      return;
    }
    const p = noteOffsets.get(note),
      step = e.shiftKey ? 30 : 10;
    moveNote(
      note,
      p.x + (e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0),
      p.y + (e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0),
    );
  });
});
function resetNotes() {
  document
    .querySelectorAll(".studio-note")
    .forEach((note) => moveNote(note, 0, 0));
}
document.querySelector("#reset-notes").addEventListener("click", resetNotes);
window.addEventListener("resize", resetNotes);

prepareSurfaces();
