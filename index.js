(() => {
  'use strict';

  // Experimental adapter for Synthetiq's local JS source contract.
  // Audius is an independent catalog; availability of individual recordings varies.
  const API = 'https://api.audius.co/v1';
  const APP_NAME = 'SynthetiqMusic';
  const MAX_RESULTS = 24;
  let active = false;

  function ok(data) { return { ok: true, data: JSON.stringify(data) }; }
  function fail(message) { return { ok: false, error: { message: String(message || 'Audius is temporarily unavailable.') } }; }
  function apiUrl(path, params) {
    const query = Object.keys(params || {}).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(String(params[k]))).join('&');
    return API + path + (query ? '?' + query + '&' : '?') + 'app_name=' + encodeURIComponent(APP_NAME);
  }
  async function getJson(url) {
    if (!/^https:\/\//i.test(url)) return null;
    try {
      const res = await fetch(url, { method: 'GET', headers: { Accept: 'application/json' }, timeoutMs: 8000 });
      if (!res || !res.ok) return null;
      return await res.json();
    } catch (_) { return null; }
  }
  function imageUrl(artwork) {
    if (!artwork) return undefined;
    if (typeof artwork === 'string') return artwork;
    return artwork['1000x1000'] || artwork['480x480'] || artwork['150x150'] || artwork['100x100'] || undefined;
  }
  function toTrack(raw) {
    if (!raw || raw.id === undefined || raw.id === null || raw.isStreamable === false) return null;
    const id = String(raw.id).trim();
    const title = String(raw.title || '').trim();
    if (!id || !title) return null;
    const artist = String(raw.user && (raw.user.name || raw.user.handle) || 'Unknown Artist').trim();
    const duration = Number(raw.duration);
    return {
      id: 'audius:song:' + id,
      href: 'audius:song:' + id,
      type: 'track',
      title,
      artist,
      album: raw.genre || undefined,
      image: imageUrl(raw.artwork),
      durationSeconds: Number.isFinite(duration) && duration > 0 ? duration : undefined,
      isrc: raw.isrc || undefined
    };
  }
  function extractId(trackId) {
    const value = String(trackId || '').trim();
    const match = value.match(/^(?:audius:song:|audius:|track:)?([A-Za-z0-9_-]{1,128})$/);
    return match ? match[1] : '';
  }
  async function runSearch(query, page) {
    const term = String(query || '').trim();
    if (!term) return ok([]);
    if (active) return fail('Audius search is busy. Try again.');
    active = true;
    try {
      const p = Math.max(0, Math.min(50, Math.floor(Number(page) || 0)));
      const payload = await getJson(apiUrl('/tracks/search', { query: term, limit: MAX_RESULTS, offset: p * MAX_RESULTS }));
      const rows = payload && Array.isArray(payload.data) ? payload.data : null;
      if (!rows) return fail('Audius search returned an unexpected response.');
      return ok(rows.map(toTrack).filter(Boolean).slice(0, MAX_RESULTS));
    } finally { active = false; }
  }
  async function searchResults(query, page) { return runSearch(query, page); }
  async function extractAudioUrl(trackId, quality) {
    const id = extractId(trackId);
    if (!id) return fail('This is not a valid Audius track ID. Search for the track again.');
    // Audius documents this endpoint as the track stream route. The player must
    // follow its redirect on-device; this package cannot guarantee every track is streamable.
    const streamUrl = apiUrl('/tracks/' + encodeURIComponent(id) + '/stream', {});
    return ok({ url: streamUrl, headers: {}, mimeType: 'audio/mpeg', extension: 'mp3', quality: quality || 'high' });
  }
  async function homeSections(page) {
    if (Number(page) > 0) return ok([]);
    const payload = await getJson(apiUrl('/tracks/trending', { limit: 12 }));
    const rows = payload && Array.isArray(payload.data) ? payload.data : null;
    if (!rows) return fail('Audius trending tracks are temporarily unavailable.');
    const items = rows.map(toTrack).filter(Boolean).slice(0, 12);
    return items.length ? ok([{ title: 'Trending on Audius', type: 'track', items }]) : ok([]);
  }
  globalThis.searchResults = searchResults;
  globalThis.extractAudioUrl = extractAudioUrl;
  globalThis.homeSections = homeSections;
})();
