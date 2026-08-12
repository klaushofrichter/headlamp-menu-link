import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('registerPluginSettings id', () => {
  it("matches package.json's name field", () => {
    // Headlamp matches a loaded plugin's name against the id passed to
    // registerPluginSettings to decide whether to show the custom settings
    // form at all - a mismatch fails silently (see the comment in
    // src/index.tsx). Guard against that regression here rather than only
    // finding out by clicking through the UI after a rename.
    const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8'));
    const source = readFileSync(join(__dirname, 'index.tsx'), 'utf8');
    expect(source).toContain(`registerPluginSettings('${pkg.name}'`);
  });
});
