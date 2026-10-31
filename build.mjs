import { mkdir, copyFile, rm } from "node:fs/promises";
await mkdir("dist", { recursive: true });
// Remove only the known artifacts superseded by the consolidated source.
for (const file of ["enhancements.js", "enhancements.css", "motion.css"]) {
  await rm(`dist/${file}`, { force: true });
}
const assets = [
  "index.html",
  "style.css",
  "app.js",
  "experience.js",
  "motion.js",
  "particles.js",
  "scene.js",
  "creature-3d.js",
  "dragon.glb",
  "DRAGON-LICENSE.txt",
  "three.module.js",
  "icon.svg",
  "THREE-LICENSE.txt",
];
for (const file of assets) await copyFile(file, `dist/${file}`);
console.log("Static portfolio built in dist/");
