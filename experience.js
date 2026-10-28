"use strict";
// Original interactions inspired by the reference's floating stage and scroll story.
const stage = document.querySelector("#hero-stage");
stage.insertAdjacentHTML(
  "beforeend",
  `<button class="floating-project float-care" data-featured="0" aria-label="Preview featured project Haven"><span class="floating-kicker">FEATURED BUILD / 01 <b>↗</b></span><span class="floating-art care-mini">✳<i></i></span><span class="floating-title">Care, connected.</span><span class="floating-description">Haven · human-centered software</span></button><button class="floating-project float-science" data-featured="1" aria-label="Preview featured project Qnova"><span class="floating-kicker">FROM THE EXPERIMENT LAB <b>↗</b></span><span class="floating-art science-mini"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span><span class="floating-title">Learn from the laws.</span><span class="floating-description">Qnova · physics meets AI</span></button>`,
);
document
  .querySelector(".hero-actions")
  .insertAdjacentHTML(
    "beforeend",
    '<button class="tour-trigger" id="project-tour"><span>▶</span> Take the project tour</button>',
  );
document
  .querySelectorAll("[data-featured]")
  .forEach((b) =>
    b.addEventListener("click", () =>
      document.querySelector(`[data-project="${b.dataset.featured}"]`).click(),
    ),
  );

document.body.insertAdjacentHTML(
  "beforeend",
  `<nav class="chapter-dock" aria-label="Quick chapter navigation"><a href="#home" aria-label="Home" class="dock-home active"><span>✳</span><small>Home</small></a><a href="#work"><span>▦</span><small>Work</small></a><a href="#about"><span>◎</span><small>Human</small></a><a href="#playground"><span>⌘</span><small>Play</small></a><a href="#process"><span>↝</span><small>Build</small></a><a href="#toolkit"><span>⚒</span><small>Toolkit</small></a><a href="#contact" class="dock-contact"><span>↗</span><small>Connect</small></a></nav><a class="floating-connect" href="#contact"><span class="live-dot"></span> Have an idea? <b>↗</b></a>`,
);
const dock = document.querySelector(".chapter-dock");
const dockLinks = [...dock.querySelectorAll("a")];
const chapterObserver = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((e) => e.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
    if (!visible.length) return;
    const id = visible[0].target.id;
    dockLinks.forEach((a) => {
      const active = a.hash === "#" + id;
      a.classList.toggle("active", active);
      if (active) a.setAttribute("aria-current", "location");
      else a.removeAttribute("aria-current");
    });
  },
  { rootMargin: "-15% 0px -55% 0px", threshold: 0 },
);
document
  .querySelectorAll("main>section[id]")
  .forEach((s) => chapterObserver.observe(s));
const finePointer = matchMedia("(hover:hover) and (pointer:fine)");
stage.addEventListener("pointermove", (e) => {
  if (
    !finePointer.matches ||
    document.body.classList.contains("reduced-motion") ||
    motionQuery.matches
  )
    return;
  const r = stage.getBoundingClientRect(),
    x = (e.clientX - r.left) / r.width - 0.5,
    y = (e.clientY - r.top) / r.height - 0.5;
  stage.style.setProperty("--parallax-x", `${x * 16}px`);
  stage.style.setProperty("--parallax-y", `${y * 12}px`);
});
stage.addEventListener("pointerleave", () => {
  stage.style.setProperty("--parallax-x", "0px");
  stage.style.setProperty("--parallax-y", "0px");
});
document.querySelectorAll(".project-art").forEach((art) => {
  art.addEventListener("pointermove", (e) => {
    if (
      !finePointer.matches ||
      document.body.classList.contains("reduced-motion") ||
      motionQuery.matches
    )
      return;
    const r = art.getBoundingClientRect();
    art.style.transform = `perspective(900px) rotateX(${((e.clientY - r.top) / r.height - 0.5) * -6}deg) rotateY(${((e.clientX - r.left) / r.width - 0.5) * 7}deg)`;
  });
  art.addEventListener("pointerleave", () => (art.style.transform = ""));
});

const steps = [
  {
    number: "01",
    label: "Find the human",
    title: "Start with a person.<br>Not a feature list.",
    copy: "Before opening an editor, I ask who this is for and what would make their day easier. Haven starts with the experience of daily care: routines, familiar people, and a calmer interface.",
    tags: "EMPATHY / CONTEXT / CLEAR PURPOSE",
    mark: "◎",
  },
  {
    number: "02",
    label: "Make it tangible",
    title: "A small experiment.<br>A real answer.",
    copy: "I turn a question into something I can interact with. A physics simulation, a care flow, or a notebook is a way to test an idea and find the gaps in my understanding.",
    tags: "PROTOTYPE / EXPERIMENT / LEARN",
    mark: "⌘",
  },
  {
    number: "03",
    label: "Refine & release",
    title: "Build. Test.<br>Make it better.",
    copy: "I work through the details: readable interfaces, useful interactions, keyboard controls, and a deployment people can open. Every release is a starting point for the next iteration.",
    tags: "ITERATION / ACCESSIBILITY / DEPLOYMENT",
    mark: "↗",
  },
];
document
  .querySelector("#toolkit")
  .insertAdjacentHTML(
    "beforebegin",
    `<section class="process-story section" id="process" aria-labelledby="process-title"><div class="process-sticky"><div class="section-meta"><span>THE BUILD PROCESS</span><span>SCROLL THROUGH THE WAY I THINK ↙</span></div><div class="process-layout"><div class="process-sidebar"><h2 id="process-title">From a spark.<br>To something <em>real.</em></h2><div class="process-tabs" role="group" aria-label="Explore my build process">${steps.map((s, i) => `<button data-step="${i}" class="${i === 0 ? "active" : ""}" aria-pressed="${i === 0}"><span>${s.number}</span>${s.label}<b>↗</b></button>`).join("")}</div><div class="process-meter"><span id="process-current">01</span><div><i></i></div><span>03</span></div></div><div class="process-frame"><span class="process-mark" aria-hidden="true">◎</span><span class="process-eyebrow">01 / FIND THE HUMAN</span><h3 id="process-headline">${steps[0].title}</h3><p id="process-copy">${steps[0].copy}</p><span id="process-tags">${steps[0].tags}</span></div></div></div></section>`,
  );
const story = document.querySelector("#process");
let currentStep = 0,
  storyFrame = 0;
function showStep(index) {
  if (currentStep === index) return;
  currentStep = index;
  const s = steps[index];
  document.querySelectorAll("[data-step]").forEach((b) => {
    const active = Number(b.dataset.step) === index;
    b.classList.toggle("active", active);
    b.setAttribute("aria-pressed", String(active));
  });
  document.querySelector("#process-current").textContent = s.number;
  document.querySelector(".process-eyebrow").textContent =
    s.number + " / " + s.label.toUpperCase();
  document.querySelector("#process-headline").innerHTML = s.title;
  document.querySelector("#process-copy").textContent = s.copy;
  document.querySelector("#process-tags").textContent = s.tags;
  document.querySelector(".process-mark").textContent = s.mark;
  const frame = document.querySelector(".process-frame");
  frame.classList.remove("step-enter");
  void frame.offsetWidth;
  frame.classList.add("step-enter");
}
function updateStory() {
  storyFrame = 0;
  const r = story.getBoundingClientRect();
  document
    .querySelector(".floating-connect")
    .classList.toggle("visible", scrollY > innerHeight * 0.8);
  if (
    innerWidth <= 700 ||
    motionQuery.matches ||
    document.body.classList.contains("reduced-motion")
  )
    return;
  const travel = Math.max(1, r.height - innerHeight);
  const progress = Math.max(0, Math.min(1, -r.top / travel));
  if (r.top < innerHeight && r.bottom > 0) {
    showStep(Math.min(2, Math.floor(progress * 3)));
    document.querySelector(".process-meter i").style.width =
      progress * 100 + "%";
  }
}
window.addEventListener(
  "scroll",
  () => {
    if (!storyFrame) storyFrame = requestAnimationFrame(updateStory);
  },
  { passive: true },
);
window.addEventListener("resize", updateStory);
document.querySelectorAll("[data-step]").forEach((b) =>
  b.addEventListener("click", () => {
    const i = Number(b.dataset.step);
    showStep(i);
    document.querySelector(".process-meter i").style.width =
      ((i + 1) / 3) * 100 + "%";
    if (
      innerWidth > 700 &&
      !motionQuery.matches &&
      !document.body.classList.contains("reduced-motion")
    ) {
      const top =
        scrollY +
        story.getBoundingClientRect().top +
        ((story.offsetHeight - innerHeight) * (i + 0.35)) / 3;
      window.scrollTo({ top, behavior: "instant" });
    }
  }),
);
chapterObserver.observe(story);

const tour = document.createElement("dialog");
tour.id = "tour-dialog";
tour.setAttribute("aria-labelledby", "tour-title");
tour.innerHTML =
  '<button class="dialog-close" aria-label="Close project tour">×</button><div id="tour-content"></div><div class="tour-controls"><button id="tour-previous" aria-label="Previous project">← Previous</button><span id="tour-count">01 / 04</span><button id="tour-next" aria-label="Next project">Next →</button></div>';
document.body.append(tour);
let tourIndex = 0;
function drawTour() {
  const p = projects[tourIndex];
  document.querySelector("#tour-content").innerHTML =
    `<span class="dialog-kicker">A QUICK TOUR / ${p.eyebrow}</span><div class="project-art ${p.art}-art tour-art">${artwork(p.art)}</div><h2 id="tour-title">${p.name}</h2><p>${p.summary}</p><p class="dialog-description">${p.description}</p><a class="tour-source" href="${p.code}" target="_blank" rel="noopener noreferrer">Explore source code ↗</a>`;
  document.querySelector("#tour-count").textContent = `0${tourIndex + 1} / 04`;
}
document.querySelector("#project-tour").addEventListener("click", () => {
  tourIndex = 0;
  drawTour();
  tour.showModal();
});
document.querySelector("#tour-next").addEventListener("click", () => {
  tourIndex = (tourIndex + 1) % projects.length;
  drawTour();
});
document.querySelector("#tour-previous").addEventListener("click", () => {
  tourIndex = (tourIndex + projects.length - 1) % projects.length;
  drawTour();
});
tour
  .querySelector(".dialog-close")
  .addEventListener("click", () => tour.close());
tour.addEventListener("click", (e) => {
  if (e.target === tour) {
    const r = tour.getBoundingClientRect();
    if (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    )
      tour.close();
  }
});

document
  .querySelector(".contact-main")
  .insertAdjacentHTML(
    "afterend",
    `<form class="brief-form" id="brief-form"><div><span class="index-label">HAVE SOMETHING IN MIND?</span><h3>Every build starts<br>with a conversation.</h3><p>Write a quick brief. Preview it here, then open a draft in your email app.</p></div><div class="brief-fields"><label>Your name<input name="name" autocomplete="name" required maxlength="100" placeholder="What should I call you?"></label><label>Let’s talk about<select name="type"><option>A collaboration</option>A hackathon</option>An internship opportunity</option>A project idea</option> <option>Something else</option></select></label><label class="brief-message">Your idea<textarea name="message" required maxlength="3000" rows="3" placeholder="The idea, the challenge, or just a hello…"></textarea></label><button class="button" type="submit">Preview email draft <span>↗</span></button><span class="brief-note">You review and send it in your email app.</span></div></form><dialog id="brief-preview" aria-labelledby="brief-title"><button class="dialog-close" aria-label="Close email preview">×</button><span class="dialog-kicker">YOUR MESSAGE / READY TO REVIEW</span><h2 id="brief-title">Start a conversation.</h2><p class="brief-to">To: js8252946@gmail.com</p><pre id="brief-body"></pre><a class="button accent-button" id="open-email">Open email draft ↗</a><p class="brief-note">This opens your email app. Nothing has been sent.</p></dialog>`,
  );
const briefPreview = document.querySelector("#brief-preview");
document.querySelector("#brief-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const values = new FormData(e.currentTarget),
    name = String(values.get("name")).trim(),
    message = String(values.get("message")).trim(),
    type = String(values.get("type"));
  if (!name || !message) return;
  const body = `Hi Arashdeep,\n\n${message}\n\n— ${name}`;
  document.querySelector("#brief-body").textContent = body;
  document.querySelector("#open-email").href =
    `mailto:js8252946@gmail.com?subject=${encodeURIComponent(type + " — " + name)}&body=${encodeURIComponent(body)}`;
  briefPreview.showModal();
});
briefPreview
  .querySelector("button")
  .addEventListener("click", () => briefPreview.close());
updateStory();
