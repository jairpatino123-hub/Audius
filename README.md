# Audius and Github Library — Synthetiq modules

This repository contains two separate Synthetiq modules:

- **Audius music adapter** — experimental; live API and iOS playback are not yet verified.
- **Github Library** — a text module that lists files and reads text from this repository's public GitHub repository.

## Github Library module

Module files:
- `github-v1/github-v1.json` — Synthetiq v3 manifest.
- `github-v1/index.js` — text handlers for file-path search, details, Markdown headings, and file text.
- `.github/workflows/package-github-library.yml` — validates the module and builds a ZIP artifact.

The Github Library adapter is intentionally scoped to the public repository `jairpatino123-hub/Audius`. Search matches file paths, not GitHub code contents. It does not execute repository code. GitHub API rate limits and Synthetiq runtime/network restrictions may affect operation.

## Build the import ZIP

Open **Actions → Package Github Library module → Run workflow**. After it succeeds, open the workflow run and download the `Github-Library-Synthetiq` artifact. The artifact contains the module folder and its manifest.

The workflow validates JSON, JavaScript syntax, and ZIP integrity. It does **not** verify import or live functionality in Synthetiq Player on iOS.

## Existing Audius module

The existing Audius music adapter remains experimental. Its live API and real iPhone playback remain unverified; keep a working music source as a fallback until device testing passes.
