#!/usr/bin/env node
/**
 * app.mjs — Slides Apps (prototypes) REST helper for /api/v1/prototypes.
 *
 * A thin wrapper over /api/v1/prototypes so Claude doesn't hand-roll curl.
 * Handles auth, the { success, data } envelope, and clear errors.
 *
 * Setup (env):
 *   APPS_API_KEY     required — an sk_live_… key with prototype.* perms
 *   SLIDES_API_URL   base origin, default http://localhost:3100
 *                    (set to your prod/dev Slides origin, no trailing /)
 *
 * Usage:
 *   node app.mjs list [--status draft|published|archived] [--search S] [--site <uuid>] [--limit N] [--offset N]
 *   node app.mjs get <id>              # full record incl. html source + settings
 *   node app.mjs get-source <id>       # just the html blob to stdout (pipe to a file)
 *   node app.mjs create <name> [--language html|jsx|css|javascript|python|json|sql] [--description D] [--slug S] [--site <uuid>]
 *   node app.mjs set-source <id> <file>  # replace the html blob with file contents
 *   node app.mjs patch <id> <json|@file> # PATCH arbitrary fields (name, slug, status, language, description)
 *   node app.mjs publish <id>
 *   node app.mjs unpublish <id>
 *   node app.mjs delete <id>
 *
 * Exit code is non-zero on any HTTP error or missing key.
 */
import { readFileSync } from "node:fs";

const KEY = process.env.APPS_API_KEY;
const BASE = (process.env.SLIDES_API_URL || "http://localhost:3100").replace(/\/$/, "");

function die(msg, code = 1) { console.error(msg); process.exit(code); }
function out(obj) { console.log(JSON.stringify(obj, null, 2)); }

// minimal flag parser: returns { _: [positional], status, search, site, limit, ... }
function parseArgs(argv) {
  const res = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) { res[a.slice(2)] = argv[++i]; }
    else res._.push(a);
  }
  return res;
}

async function api(method, path, body) {
  if (!KEY) die("ERROR: set APPS_API_KEY (an sk_live_… key with prototype.* perms).");
  const res = await fetch(`${BASE}/api/v1${path}`, {
    method,
    headers: { Authorization: `Bearer ${KEY}`, ...(body ? { "Content-Type": "application/json" } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || json?.success === false) {
    const err = json?.error || {};
    die(`HTTP ${res.status} ${err.code || ""}: ${err.message || JSON.stringify(json)}`);
  }
  return json.data;
}

const [, , cmd, ...rest] = process.argv;
const args = parseArgs(rest);
const id = args._[0];

switch (cmd) {
  case "list": {
    const q = new URLSearchParams();
    if (args.status != null) q.set("status", args.status);
    if (args.search != null) q.set("search", args.search);
    if (args.site != null) q.set("siteId", args.site);
    if (args.limit != null) q.set("limit", args.limit);
    if (args.offset != null) q.set("offset", args.offset);
    out(await api("GET", `/prototypes${q.toString() ? `?${q}` : ""}`));
    break;
  }
  case "get":
    if (!id) die("usage: get <id>");
    out(await api("GET", `/prototypes/${id}`));
    break;
  case "get-source":
    if (!id) die("usage: get-source <id>");
    // print raw html blob to stdout — pipe to a file for editing
    process.stdout.write((await api("GET", `/prototypes/${id}`)).html ?? "");
    break;
  case "create": {
    const name = args._[0];
    if (!name) die("usage: create <name> [--language html|jsx|...] [--description D] [--slug S] [--site <uuid>]");
    const body = { name };
    if (args.language) body.language = args.language;
    if (args.description) body.description = args.description;
    if (args.slug) body.slug = args.slug;
    if (args.site) body.siteId = args.site;
    out(await api("POST", "/prototypes", body));
    break;
  }
  case "set-source": {
    const file = args._[1];
    if (!id || !file) die("usage: set-source <id> <file>");
    let html;
    try { html = readFileSync(file, "utf8"); }
    catch (e) { die(`could not read ${file}: ${e.message}`); }
    out(await api("PATCH", `/prototypes/${id}`, { html }));
    break;
  }
  case "patch": {
    const raw = args._[1];
    if (!id || !raw) die('usage: patch <id> <json|@file>   e.g. patch <id> \'{"name":"New"}\'');
    let payload;
    try { payload = JSON.parse(raw.startsWith("@") ? readFileSync(raw.slice(1), "utf8") : raw); }
    catch (e) { die(`invalid JSON: ${e.message}`); }
    out(await api("PATCH", `/prototypes/${id}`, payload));
    break;
  }
  case "publish":
    if (!id) die("usage: publish <id>");
    out(await api("POST", `/prototypes/${id}/publish`));
    break;
  case "unpublish":
    if (!id) die("usage: unpublish <id>");
    out(await api("POST", `/prototypes/${id}/unpublish`));
    break;
  case "delete":
    if (!id) die("usage: delete <id>");
    out(await api("DELETE", `/prototypes/${id}`));
    break;
  default:
    die(`Unknown command: ${cmd ?? "(none)"}\nRun with no args to see usage in the file header.`);
}
