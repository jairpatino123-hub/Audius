# Audius and Github Library — Synthetiq modules

This repository contains two separate Synthetiq modules:

- **Audius Music** — experimental music source using the Audius API.
- **Github Library** — a text module that lists files and reads text from this public GitHub repository.

## Audius Music module

- `module.json` — music-module manifest at the ZIP root.
- `index.js` — local handlers for track search, trending/home, and stream URL resolution.

### Download and install

**Direct module ZIP:** [Download Audius-Music-Synthetiq.zip](https://github.com/jairpatino123-hub/Audius/releases/download/audius-v0.1.1/Audius-Music-Synthetiq.zip)

The file above is the module ZIP itself, published as a GitHub Release asset. You do not need to download and extract a separate Actions-artifact ZIP. In Synthetiq, import the downloaded ZIP directly.

### Automated checks

Every workflow run:
1. Validates the module manifest and JavaScript syntax.
2. Performs a live Audius API search and checks that a returned track's stream endpoint responds or redirects.
3. Builds a ZIP containing exactly `module.json` and `index.js` at the archive root, then tests ZIP integrity.
4. Publishes or refreshes the module ZIP on the GitHub Release and uploads a workflow artifact.

Open [GitHub Actions](https://github.com/jairpatino123-hub/Audius/actions/workflows/package-github-library.yml) to see the latest check results.

**Important:** A successful API smoke test confirms the public search and stream endpoint respond at build time; it does not prove that Synthetiq Player on iOS can play every track. Actual in-app playback still needs testing.

## Github Library module

- `github-v1/github-v1.json` — Synthetiq v3 text-module manifest.
- `github-v1/index.js` — file-path search, file details, Markdown headings, and file text handlers.

The Github Library adapter is intentionally scoped to this repository. Search matches file paths, not GitHub code contents, and it does not execute repository code.

## Build

The GitHub Actions workflow packages both modules, validates their manifests and ZIP integrity, and runs a live Audius API smoke test before publishing the Audius module asset. Download the Audius module directly from the Releases link above.
