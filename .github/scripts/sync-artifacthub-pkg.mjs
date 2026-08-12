#!/usr/bin/env node
// Updates artifacthub-pkg.yml's version, createdAt, archive-url, and
// archive-checksum fields to match a just-published release. Run by
// .github/workflows/release.yml after a new tag/release is created.
//
// Required env vars: VERSION, ARCHIVE_URL, CHECKSUM (bare hex, no "SHA256:"
// prefix), CREATED_AT (RFC3339, defaults to now if unset).

import { readFileSync, writeFileSync } from 'node:fs';

const { VERSION, ARCHIVE_URL, CHECKSUM } = process.env;
const CREATED_AT = process.env.CREATED_AT ?? new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');

for (const [name, value] of Object.entries({ VERSION, ARCHIVE_URL, CHECKSUM })) {
  if (!value) {
    console.error(`Missing required env var: ${name}`);
    process.exit(1);
  }
}

const path = 'artifacthub-pkg.yml';
const original = readFileSync(path, 'utf8');

const updated = original
  .replace(/^version:.*/m, `version: ${VERSION}`)
  .replace(/^createdAt:.*/m, `createdAt: "${CREATED_AT}"`)
  .replace(/^(\s*headlamp\/plugin\/archive-url:).*/m, `$1 "${ARCHIVE_URL}"`)
  .replace(/^(\s*headlamp\/plugin\/archive-checksum:).*/m, `$1 "SHA256:${CHECKSUM}"`);

if (updated === original) {
  console.error('No changes made - did the expected fields exist in artifacthub-pkg.yml?');
  process.exit(1);
}

writeFileSync(path, updated);
console.log(`Updated ${path}:\n${updated}`);
