import test from 'node:test';
import assert from 'node:assert/strict';
import { htmlToEditorJson } from './htmlToEditorJson.js';

test('htmlToEditorJson converts basic HTML into editor-ready JSON', () => {
  const result = htmlToEditorJson(`
    <section class="hero">
      <h1>Welcome</h1>
      <p>Start building today.</p>
      <a href="/pricing">Pricing</a>
      <img src="/logo.png" alt="Logo" />
    </section>
  `);

  assert.ok(Array.isArray(result));
  assert.equal(result[0].type, '__body');
  assert.ok(result[0].content.length >= 1);

  const heading = result[0].content.find((el) => el.type === 'heading');
  const link = result[0].content.find((el) => el.type === 'link');
  const image = result[0].content.find((el) => el.type === 'image');

  assert.ok(heading);
  assert.equal(heading.content.innerText, 'Welcome');
  assert.ok(link);
  assert.equal(link.content.href, '/pricing');
  assert.ok(image);
  assert.equal(image.content.src, '/logo.png');
});
