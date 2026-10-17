/* Synthetiq Player local text module: Github Library.
 * Scope is intentionally pinned to one public repository. This adapter reads
 * repository metadata, lists paths, and retrieves text files; it does not run code.
 */
(() => {
  const OWNER = "jairpatino123-hub";
  const REPO = "Audius";
  const API_ROOT = `https://api.github.com/repos/${OWNER}/${REPO}`;
  const MAX_RESULTS = 30;
  const MAX_TEXT_CHARS = 180000;
  const cache = { tree: null, branch: null, repo: null };

  function getFetch() {
    if (typeof fetchv2 === "function") return fetchv2;
    if (typeof fetch === "function") return fetch;
    throw new Error("This runtime does not provide fetchv2 or fetch.");
  }

  async function requestJson(url) {
    const allowed = url === API_ROOT ||
      url.startsWith(`${API_ROOT}/git/trees/`) ||
      url.startsWith(`${API_ROOT}/contents/`);
    if (!allowed) throw new Error("Blocked request outside configured repository.");
    const f = getFetch();
    const response = await f(url, {
      method: "GET",
      headers: { "Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" }
    });
    if (!response || ("ok" in response && !response.ok)) {
      const status = response && response.status ? response.status : "unknown";
      throw new Error(`GitHub API request failed (${status}). The repository may be private, rate-limited, or unreachable.`);
    }
    let data;
    if (typeof response.json === "function") data = await response.json();
    else if (typeof response.body === "string") data = JSON.parse(response.body);
    else if (typeof response.text === "function") data = JSON.parse(await response.text());
    else throw new Error("GitHub API returned an unsupported response shape.");
    return data;
  }

  async function loadTree() {
    if (cache.tree) return cache.tree;
    if (!cache.repo) cache.repo = await requestJson(API_ROOT);
    const branch = cache.repo.default_branch;
    if (typeof branch !== "string" || !branch) throw new Error("Could not determine the repository's default branch.");
    cache.branch = branch;
    const treeData = await requestJson(`${API_ROOT}/git/trees/${encodeURIComponent(branch)}?recursive=1`);
    if (!treeData || !Array.isArray(treeData.tree)) throw new Error("GitHub returned an invalid repository tree.");
    cache.tree = treeData.tree.filter(item => item && item.type === "blob" && typeof item.path === "string");
    return cache.tree;
  }

  function titleFromPath(path) {
    const name = path.split("/").pop() || path;
    return name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim() || path;
  }

  function resultItem(path, index) {
    return {
      id: path,
      title: titleFromPath(path),
      name: titleFromPath(path),
      url: `https://github.com/${OWNER}/${REPO}/blob/HEAD/${path.split("/").map(encodeURIComponent).join("/")}`,
      path,
      index
    };
  }

  function decodeBase64(content) {
    const compact = String(content || "").replace(/\s/g, "");
    if (typeof atob === "function") {
      const binary = atob(compact);
      if (typeof TextDecoder === "function") {
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        return new TextDecoder("utf-8").decode(bytes);
      }
      try { return decodeURIComponent(escape(binary)); } catch (_) { return binary; }
    }
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let out = "", buffer = 0, bits = 0;
    for (const ch of compact) {
      if (ch === "=") break;
      const value = alphabet.indexOf(ch);
      if (value < 0) continue;
      buffer = (buffer << 6) | value;
      bits += 6;
      if (bits >= 8) { bits -= 8; out += String.fromCharCode((buffer >> bits) & 255); }
    }
    try { return decodeURIComponent(escape(out)); } catch (_) { return out; }
  }

  async function readFile(path) {
    if (typeof path !== "string" || !path || path.startsWith("/") || path.split("/").includes("..")) {
      throw new Error("Invalid repository file path.");
    }
    const url = `${API_ROOT}/contents/${path.split("/").map(encodeURIComponent).join("/")}`;
    const file = await requestJson(url);
    if (!file || file.type !== "file" || typeof file.content !== "string") {
      throw new Error("The selected item is not a readable text file.");
    }
    const text = decodeBase64(file.content);
    if (!text || !text.trim()) throw new Error("The selected file is empty or could not be decoded.");
    return { text: text.slice(0, MAX_TEXT_CHARS), truncated: text.length > MAX_TEXT_CHARS, size: text.length, sha: file.sha, path: file.path || path };
  }

  function headings(text) {
    const lines = String(text).split(/\r?\n/);
    const found = [];
    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(/^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/);
      if (match) found.push({ id: `heading-${found.length}`, title: match[2].trim(), level: match[1].length, line: i });
    }
    return found;
  }

  async function searchResults(query) {
    const q = String(query || "").trim().toLowerCase();
    const tree = await loadTree();
    const files = tree.filter(item => {
      const p = item.path.toLowerCase();
      if (q) return p.includes(q);
      return /\.(md|txt|rst|json|ya?ml|toml|ini|csv|log|xml)$/i.test(item.path) || /(^|\/)(readme|license|changelog)(\.|$)/i.test(item.path);
    }).slice(0, MAX_RESULTS);
    return files.map((item, i) => resultItem(item.path, i));
  }

  async function extractDetails(item) {
    const path = typeof item === "string" ? item : item && (item.path || item.id);
    if (!path) throw new Error("Select a repository file first.");
    const file = await readFile(path);
    const chapterList = headings(file.text).map(h => ({ id: h.id, title: h.title, name: h.title, level: h.level }));
    return {
      id: path,
      title: titleFromPath(path),
      name: titleFromPath(path),
      path,
      url: `https://github.com/${OWNER}/${REPO}/blob/HEAD/${path.split("/").map(encodeURIComponent).join("/")}`,
      description: `${file.size} characters${file.truncated ? " (display limited)" : ""}`,
      chapters: chapterList,
      chapterCount: chapterList.length,
      text: file.text.slice(0, 12000),
      truncated: file.truncated
    };
  }

  async function extractChapters(item) {
    const path = typeof item === "string" ? item : item && (item.path || item.id);
    if (!path) throw new Error("Select a repository file first.");
    const file = await readFile(path);
    const hs = headings(file.text);
    if (!hs.length) return [{ id: "full-text", title: "Full text", name: "Full text", index: 0 }];
    return hs.map((h, i) => ({ id: h.id, title: h.title, name: h.title, level: h.level, index: i }));
  }

  async function extractText(item, chapter) {
    const path = typeof item === "string" ? item : item && (item.path || item.id);
    if (!path) throw new Error("Select a repository file first.");
    const file = await readFile(path);
    const hs = headings(file.text);
    const chapterId = typeof chapter === "string" ? chapter : chapter && (chapter.id || chapter.chapterId);
    let output = file.text;
    if (chapterId && chapterId !== "full-text") {
      const start = hs.findIndex(h => h.id === chapterId);
      if (start >= 0) {
        const end = hs.findIndex((h, i) => i > start && h.level <= hs[start].level);
        const from = hs[start].line;
        const to = end >= 0 ? hs[end].line : file.text.split(/\r?\n/).length;
        output = file.text.split(/\r?\n/).slice(from, to).join("\n");
      }
    }
    return { title: titleFromPath(path), name: titleFromPath(path), path, text: output.slice(0, MAX_TEXT_CHARS), truncated: file.truncated || output.length > MAX_TEXT_CHARS, sourceUrl: `https://github.com/${OWNER}/${REPO}/blob/HEAD/${path.split("/").map(encodeURIComponent).join("/")}` };
  }

  globalThis.searchResults = searchResults;
  globalThis.extractDetails = extractDetails;
  globalThis.extractChapters = extractChapters;
  globalThis.extractText = extractText;
  globalThis.homeSections = async () => [{ title: "Repository files", query: "" }];
  globalThis.discoveryHome = async () => ({ title: "Github Library", sections: [{ title: "Repository files", items: await searchResults("") }] });
})();