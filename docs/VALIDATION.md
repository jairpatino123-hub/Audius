# Validation status

## Completed locally
- JavaScript syntax check passed with Node.js.
- Mocked contract test passed for mapping track metadata and constructing an Audius stream URL.
- ZIP package was built flat with `module.json` and `index.js` (no enclosing folder).

## Not verified
- Live Audius API availability from the test environment; outbound API access was unavailable, so no conclusion can be made about Audius uptime.
- Import into Synthetiq Player on a physical iPhone.
- Redirect following and actual audio decoding/playback.
- Seeking, background playback, and per-track availability.

## Important compatibility risk
The manifest is a candidate and has not been validated against Synthetiq's full import schema. In particular, additional identity fields may be required. Treat import compatibility as unconfirmed.

## Module contract overview
The script exposes:
- `globalThis.searchResults(query, page)`
- `globalThis.extractAudioUrl(trackId, quality)`
- `globalThis.homeSections(page)`

Functions return Synthetiq-style `{ok, data}` or `{ok, error}` results. The adapter filters results explicitly marked non-streamable. Audius may not have every song, and a stream URL alone does not prove playback will succeed in the app.

## Safety / fallback
Do not remove or overwrite any existing working source until this adapter passes import and playback tests on the target device.
