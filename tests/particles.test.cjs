const test = require("node:test");
const assert = require("node:assert/strict");
const { advanceParticle } = require("../particles.js");

const point = () => ({
  x: 0,
  y: 0,
  homeX: 0,
  homeY: 0,
  vx: 0,
  vy: 0,
  phase: 1,
});
test("a nearby pointer repels particles without producing NaN at the exact center", () => {
  const p = point();
  advanceParticle(p, { active: true, x: 0, y: 0, radius: 85 });
  assert.ok(Number.isFinite(p.x) && Number.isFinite(p.y));
  assert.ok(Math.hypot(p.x, p.y) > 0);
});
test("scattered particles reform their original lettering after the pointer leaves", () => {
  const p = { ...point(), x: 120, y: -80, vx: 9, vy: -3 };
  for (let i = 0; i < 240; i++) advanceParticle(p, { active: false });
  assert.ok(Math.hypot(p.x, p.y) < 0.001);
});
test("long frame gaps do not destabilize the spring", () => {
  const p = { ...point(), x: 90, y: -50 };
  for (let i = 0; i < 240; i++) advanceParticle(p, { active: false }, 500);
  assert.ok(Number.isFinite(p.x) && Math.hypot(p.x, p.y) < 0.001);
});
