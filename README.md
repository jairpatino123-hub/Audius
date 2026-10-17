# Audius — Synthetiq experimental module

This repository contains an experimental Audius music-source adapter for Synthetiq Player.

## Files
- `module.json` — Synthetiq module manifest.
- `index.js` — local JavaScript source adapter.
- `docs/VALIDATION.md` — testing status, install notes, and known limitations.
- `Audius-Synthetiq-Experimental.zip` — distributable ZIP (if added as a repository artifact).

## Current status: experimental, not verified on-device

Local JavaScript syntax and mocked contract behavior passed during preparation. The mock used a fake response and **does not prove that the live Audius API or Synthetiq iOS playback works**.

Not yet verified:
- Live Audius search/trending API calls from Synthetiq
- Import acceptance by Synthetiq Player 9.0.81+261 on iOS
- Redirect handling, full-track playback, seeking, and background playback
- Availability of any specific recording

Audius' catalogue is not universal; some recordings may be missing or not streamable. Keep your current working music source as a fallback.

## Module behavior
- Searches Audius tracks and maps results to a Synthetiq-style track object.
- Shows a Trending on Audius home section.
- Resolves selected track IDs using Audius' `/tracks/{id}/stream` endpoint.
- Does not embed API credentials or enable offline downloads.

## Installation
Use only if your Synthetiq build supports importing a local module ZIP. If import fails, preserve the exact error message; do not replace your current source or catalogue entry based on this experimental adapter.

See [docs/VALIDATION.md](docs/VALIDATION.md) for detailed status.
