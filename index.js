(() => {
  'use strict';
  const API = 'https://api.audius.co/v1';
  const APP_NAME = 'SynthetiqMusic';
  const MAX_RESULTS = 24;
  function apiUrl(path, params) {
    const query = Object.keys(params || {}).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(String(params[k]))).join('&');
    return API + path + (query ? '?' + query + '&' : '?') + 'app_name=' + encodeURIComponent(APP_NAME);
  }
  // Synthetiq's module runtime may provide fetchv2 rather than browser fetch.
  async function getJson(url) {
    if (!/^https:\/\//i.test(url)) throw new Error('Refusing non-HTTPS Audius URL.');
    let response;
    if (typeof fetchv2 === 'function') {
      response = await fetchv2(url, { Accept: 'application/json' }, 'GET', null, { followRedirects: true });
      if (!response || !(response.ok || (response.status >= 200 && response.status < 300))) {
        throw new Error('Audius HTTP ' + Number((response && response.status) || 0));
      }
      if (typeof response.text === 'function') {
        try { const body = await response.text(); if (body) return JSON.parse(body); } catch (_) {}
      } else if (typeof response.body === 'string' && response.body) {
        try { return JSON.parse(response.body); } catch (_) {}
      }
      if (typeof response.json === 'function') return await response.json();
      if (response.json && typeof response.json === 'object') return response.json;
      throw new Error('Audius returned an unreadable JSON response.');
    }
    if (typeof fetch !== 'function') throw new Error('No HTTP transport available (fetchv2/fetch missing).');
    response = await fetch(url, { method: 'GET', headers: { Accept: 'application/json' }, redirect: 'follow' });
    if (!response || !response.ok) throw new Error('Audius HTTP ' + Number((response && response.status) || 0));
    return await response.json();
  }
  function imageUrl(artwork) {
    if (!artwork) return '';
    if (typeof artwork === 'string') return artwork;
    return artwork['1000x1000'] || artwork['480x480'] || artwork['150x150'] || artwork['100x100'] || '';
  }
  function toTrack(raw) {
    if (!raw || raw.id == null || raw.isStreamable === false || raw.is_streamable === false) return null;
    const id = String(raw.id).trim(), title = String(raw.title || '').trim();
    if (!id || !title) return null;
    const user = raw.user || {}, duration = Number(raw.duration), href = 'audius:song:' + id;
    return { id: href, href, type: 'track', title,
      artist: String(user.name || user.handle || raw.artist || 'Unknown Artist').trim(),
      album: raw.genre || '', image: imageUrl(raw.artwork || raw.artwork_url),
      durationSeconds: Number.isFinite(duration) && duration > 0 ? duration : undefined,
      isrc: raw.isrc || undefined };
  }
  function extractId(trackId) {
    const value = String(trackId || '').trim();
    const match = value.match(/^(?:audius:song:|audius:|track:)?([A-Za-z0-9_-]{1,128})$/);
    return match ? match[1] : '';
  }
  async function searchResults(query, page) {
    const term = String(query || '').trim();
    if (!term) return [];
    const pageIndex = Math.max(0, Math.min(50, Math.floor(Number(page) || 0)));
    const payload = await getJson(apiUrl('/tracks/search', { query: term, limit: MAX_RESULTS, offset: pageIndex * MAX_RESULTS }));
    if (!payload || !Array.isArray(payload.data)) throw new Error('Audius search returned an unexpected response.');
    return payload.data.map(toTrack).filter(Boolean).slice(0, MAX_RESULTS);
  }
  async function extractStreamUrl(trackId, quality, bypassCache) {
    const id = extractId(trackId);
    if (!id) throw new Error('Invalid Audius track ID; search for the track again.');
    const url = apiUrl('/tracks/' + encodeURIComponent(id) + '/stream', {});
    return { url, stream: url, streamType: 'mp3',
      headers: { Accept: 'audio/mpeg, audio/*;q=0.9, */*;q=0.8' }, quality: quality || 'high' };
  }
  async function homeSections(page) {
    if (Number(page) > 0) return [];
    const payload = await getJson(apiUrl('/tracks/trending', { limit: 12 }));
    if (!payload || !Array.isArray(payload.data)) throw new Error('Audius trending returned an unexpected response.');
    const items = payload.data.map(toTrack).filter(Boolean).slice(0, 12);
    return items.length ? [{ id: 'audius-trending', title: 'Trending on Audius', type: 'track', items }] : [];
  }
  async function discoveryHome() {
    const sections = await homeSections(0);
    return { sections: sections.map(section => ({ id: section.id, title: section.title, style: 'poster', items: section.items })) };
  }
  globalThis.searchResults = searchResults;
  globalThis.extractStreamUrl = extractStreamUrl;
  globalThis.homeSections = homeSections;
  globalThis.discoveryHome = discoveryHome;
})();