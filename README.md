# Audius and Github Library — Synthetiq modules

This repository contains two separate Synthetiq modules:

- **Audius Music** — experimental music source using the Audius API. Package validation is automated; real playback still needs testing in Synthetiq Player on iOS.
- **Github Library** — a text module that lists files and reads text from this public GitHub repository.

## Audius Music module

- `module.json` — music-module manifest at the ZIP root.
- `index.js` — local handlers for track search, trending/home, and stream URL resolution.

The build validates the manifest, checks JavaScript syntax, and creates `Audius-Music-Synthetiq.zip` with exactly `module.json` and `index.js` at the archive root. In Synthetiq, use the **Audius-Music-Synthetiq** artifact, not the Github Library artifact.

The module uses the public Audius API. Availability, region/provider restrictions, redirects, and Synthetiq's playback runtime can still affect playback. The automated build does not certify live playback.

## Github Library module

- `github-v1/github-v1.json` — Synthetiq v3 text-module manifest.
- `github-v1/index.js` — file-path search, file details, Markdown headings, and file text handlers.

The Github Library adapter is intentionally scoped to this repository. Search matches file paths, not GitHub code contents, and it does not execute repository code.

## Build and download

Open [GitHub Actions](https://github.com/jairpatino123-hub/Audius/actions/workflows/package-github-library.yml), open the latest successful **Package Synthetiq modules** run, and download the **Audius-Music-Synthetiq** artifact to install the music module. GitHub downloads artifacts as an outer ZIP; extract that artifact ZIP once to obtain `Audius-Music-Synthetiq.zip`, then import the inner module ZIP into Synthetiq.

The workflow validates the module manifests, JavaScript syntax, and ZIP integrity. It does **not** verify installation or live playback in Synthetiq Player on iOS.
