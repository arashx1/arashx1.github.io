const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

test('every local stylesheet and script is present and packaged by the build', () => {
  const build = fs.readFileSync(path.join(root, 'build.mjs'), 'utf8');
  const assets = [...html.matchAll(/(?:src|href)="([^"#]+\.(?:js|css|svg))"/g)].map(match => match[1]);
  for (const asset of assets) {
    assert.ok(fs.existsSync(path.join(root, asset)), `Missing ${asset}`);
    assert.ok(build.includes(`"${asset}"`) || build.includes(`'${asset}'`), `Unpackaged ${asset}`);
  }
});

test('all original navigation anchors target an existing section', () => {
  const ids = new Set([...html.matchAll(/id="([^"]+)"/g)].map(match => match[1]));
  for (const [, target] of html.matchAll(/href="#([^"]+)"/g)) {
    assert.ok(ids.has(target), `Broken anchor #${target}`);
  }
});

test('superseded styling and interaction files are no longer loaded', () => {
  assert.equal((html.match(/rel="stylesheet"/g) || []).length, 1);
  assert.ok(!html.includes('enhancements.js') && !html.includes('motion.css'));
  assert.ok(!fs.existsSync(path.join(root, 'enhancements.js')));
});
