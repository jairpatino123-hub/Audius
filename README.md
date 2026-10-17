# Audius — Synthetiq experimental module

This repository contains an experimental Audius music-source adapter for Synthetiq Player.

## Files
- `module.json` — Synthetiq manifest, including module identity fields.
- `index.js` — local JavaScript adapter.
- `docs/VALIDATION.md` — test results and known limitations.
- `dist/Audius-Synthetiq-Experimental.zip` — flat import package.

## Status: improved, still experimental

Static checks and mocked contract tests pass for search-result mapping, stream URL construction, the `fetchv2` transport path, and ZIP structure. The live Audius API could not be reached from the available test environment because DNS resolution failed. Real iPhone import and playback remain unverified.

## Fixes in version 0.1.1
- Added the module identity and identity-number fields used by Synthetiq's catalogue.
- Changed playback export to `extractStreamUrl`, matching the published Synthetiq module pattern.
- Returned ordinary track arrays/stream objects instead of the previous `{ok, data: JSON.stringify(...)}` wrapper.
- Added support for Synthetiq's `fetchv2` transport as well as standard `fetch`.
- Filtered tracks marked unstreamable using either `isStreamable` or `is_streamable`.

## Remaining checks
- Live Audius search and trending API responses
- Import acceptance in Synthetiq Player 9.0.81+261 on iOS
- Whether the app follows Audius stream redirects and decodes the returned audio
- Seeking, background playback, and specific-track availability

Audius does not guarantee every recording is present or streamable. Keep your current working source as a fallback until the module passes device testing.

## Install
Use the ZIP only if your Synthetiq build supports importing a local module ZIP. If import fails, save the exact error message. Do not replace your working source based on this experimental adapter.
