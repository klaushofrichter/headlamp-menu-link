# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-purpose [Headlamp](https://github.com/kubernetes-sigs/headlamp) plugin
(`@klaushofrichter/link`) that adds one configurable external link to Headlamp's
sidebar. The whole plugin is two source files under `src/`. It is an independent
community plugin, not part of the official `headlamp-k8s/plugins` catalog.

## Commands

Everything goes through `@kinvolk/headlamp-plugin`, which wraps the underlying
toolchain (vite/vitest/eslint/prettier/tsc) — there is no local vite or vitest
config to edit.

```bash
npm install
npm start        # watch-mode build against a running Headlamp instance
npm run format   # prettier (headlamp-k8s config)
npm run lint     # eslint; `npm run lint-fix` to autofix
npm run tsc      # typecheck
npm run test     # vitest
npm run build    # -> dist/main.js
npm run package  # bundles dist/main.js + package.json into *.tar.gz, prints SHA256
```

Tests are vitest; args pass through, e.g. `npm run test -- src/settings.test.tsx`.

Before a release, run the full Headlamp readiness sequence in order:
`format`, `lint`, `tsc`, `test`, `build`, `package`.

## Architecture

`src/index.tsx` is the plugin bootstrap and runs once at Headlamp startup:

- `registerSidebarEntry` with a `url` starting with `http` makes Headlamp render
  a plain external `<a target="_blank">` — no route or component needed.
- Config is read **once**, at bootstrap (`store.get()`), so settings changes only
  reach the sidebar after a page reload. This mirrors Headlamp's official
  `change-logo` example plugin and is intentional, not a bug to fix.
- `registerPluginSettings('@klaushofrichter/link', ...)` — **this id must exactly
  match `package.json`'s `name`**. Headlamp matches the loaded plugin's name
  against it to decide whether to render the settings form; a mismatch fails
  *silently* (plugin loads, sidebar works, settings page is blank). `src/index.test.ts`
  guards this by grepping the source against `package.json`. If you rename the
  package, update this call too.

`src/settings.tsx` owns the config contract: `DEFAULT_TEXT`, `DEFAULT_URL`, and
`store = new ConfigStore<PluginConfig>('link')`. The settings UI is a
`NameValueTable` of debounced auto-save `TextField`s (1s delay) that write the
whole config object back through `store.set()`. `index.tsx` imports the store and
defaults from here, so this file is the single source of truth for both.

This design deliberately tracks Headlamp's `change-logo` example plugin
(`plugins/examples/change-logo` in the Headlamp repo) — when changing the
settings/ConfigStore pattern, check what that plugin does first.

## Branches and releases

- `main` — everyday development. Protected by required status checks only
  (`Lint, typecheck, test, build` + `Analyze (javascript-typescript)`), with
  `strict: false` and `enforce_admins: false` — so PRs need green CI, but
  maintainers can still push directly. `strict` is off on purpose: requiring
  branches be up-to-date would invalidate every sibling PR on each merge and
  force serial Dependabot rebases.
- `release` — protected; PR-only, requires passing CI (lint, tsc, test, build) and CodeQL.

`.github/workflows/dependabot-auto-merge.yml` enables GitHub's native auto-merge
on Dependabot PRs whose highest semver change is patch or minor; majors fall
through to manual review. It runs on `pull_request_target` (a Dependabot-triggered
`pull_request` gets a read-only token) and **must never gain a checkout step** —
not checking out PR code is what makes that trigger safe. It depends on `main`'s
required checks existing: with nothing to wait for, GitHub refuses to enable
auto-merge at all.

Merging a PR into `release` triggers `.github/workflows/release.yml`, which builds,
packages, tags `v<package.json version>`, publishes a GitHub release with the tarball,
then opens a follow-up bot PR syncing `artifacthub-pkg.yml` (version, `createdAt`,
archive URL, checksum) via `.github/scripts/sync-artifacthub-pkg.mjs`.

Consequences to keep in mind:

- **Bump `package.json`'s `version` as part of a release PR.** If the tag already
  exists the entire release job skips silently.
- Don't hand-edit `artifacthub-pkg.yml`'s version/URL/checksum — the bot PR does it.
  Its four fields are matched by line-anchored regex in the sync script, so keep
  `version:`, `createdAt:`, `headlamp/plugin/archive-url:` and
  `headlamp/plugin/archive-checksum:` on their own lines.
- The tarball filename is derived from `package.json`'s `name` with scope
  sanitization (`@klaushofrichter/link` → `klaushofrichter-link-<version>.tar.gz`).
  Scripts and docs use a `*.tar.gz` glob rather than hardcoding it — keep it that way.
