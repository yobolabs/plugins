#!/usr/bin/env node
/**
 * lp.mjs — Landing Pages REST helper for the CadraOS/Slides microsites API.
 *
 * A thin, typed-ish wrapper over /api/v1/microsites so Claude doesn't hand-roll
 * curl. Handles auth, the { success, data } envelope, and clear errors.
 *
 * Setup (env):
 *   LANDING_PAGES_API_KEY   required — an sk_live_… key with microsite.* perms
 *   SLIDES_API_URL          base origin, default http://localhost:3100
 *                           (set to your prod/dev Slides origin, no trailing /)
 *
 * Usage:
 *   node lp.mjs list [--status draft|published|archived] [--search S] [--limit N] [--offset N]
 *   node lp.mjs get <id>                 # full record incl. Puck content
 *   node lp.mjs get-content <id>         # just the content JSON (pipe to a file)
 *   node lp.mjs create <name> [--description D] [--slug S]
 *   node lp.mjs set-content <id> <file.json>   # replace content with file's JSON
 *   node lp.mjs patch <id> <json|@file> # PATCH arbitrary fields (name, slug, status, …)
 *   node lp.mjs publish <id>
 *   node lp.mjs unpublish <id>
 *   node lp.mjs delete <id>
 *   node lp.mjs new-id <ComponentType>  # prints a "<Type>-<uuid>" id for authoring
 *
 * Exit code is non-zero on any HTTP error.
 */
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";

const KEY = process.env.LANDING_PAGES_API_KEY;
const BASE = (process.env.SLIDES_API_URL || "http://localhost:3100").replace(/\/$/, "");

function die(msg, code = 1) { console.error(msg); process.exit(code); }
function out(obj) { console.log(JSON.stringify(obj, null, 2)); }

// minimal flag parser: returns { _: [positional], status, search, limit, ... }
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
  if (!KEY) die("ERROR: set LANDING_PAGES_API_KEY (an sk_live_… key with microsite.* perms).");
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
    for (const k of ["status", "search", "limit", "offset"]) if (args[k] != null) q.set(k, args[k]);
    out(await api("GET", `/microsites${q.toString() ? `?${q}` : ""}`));
    break;
  }
  case "get":
    if (!id) die("usage: get <id>");
    out(await api("GET", `/microsites/${id}`));
    break;
  case "get-content":
    if (!id) die("usage: get-content <id>");
    out((await api("GET", `/microsites/${id}`)).content ?? {});
    break;
  case "create": {
    const name = args._[0];
    if (!name) die("usage: create <name> [--description D] [--slug S]");
    const body = { name };
    if (args.description) body.description = args.description;
    if (args.slug) body.slug = args.slug;
    out(await api("POST", "/microsites", body));
    break;
  }
  case "set-content": {
    const file = args._[1];
    if (!id || !file) die("usage: set-content <id> <file.json>");
    let content;
    try { content = JSON.parse(readFileSync(file, "utf8")); }
    catch (e) { die(`could not read/parse ${file}: ${e.message}`); }
    out(await api("PATCH", `/microsites/${id}`, { content }));
    break;
  }
  case "patch": {
    const raw = args._[1];
    if (!id || !raw) die('usage: patch <id> <json|@file>   e.g. patch <id> \'{"name":"New"}\'');
    let payload;
    try { payload = JSON.parse(raw.startsWith("@") ? readFileSync(raw.slice(1), "utf8") : raw); }
    catch (e) { die(`invalid JSON: ${e.message}`); }
    out(await api("PATCH", `/microsites/${id}`, payload));
    break;
  }
  case "publish":
    if (!id) die("usage: publish <id>");
    out(await api("POST", `/microsites/${id}/publish`));
    break;
  case "unpublish":
    if (!id) die("usage: unpublish <id>");
    out(await api("POST", `/microsites/${id}/unpublish`));
    break;
  case "delete":
    if (!id) die("usage: delete <id>");
    out(await api("DELETE", `/microsites/${id}`));
    break;
  case "new-id": {
    const type = args._[0];
    if (!type) die("usage: new-id <ComponentType>   e.g. new-id Heading");
    console.log(`${type}-${randomUUID()}`);
    break;
  }
  default:
    die(`Unknown command: ${cmd ?? "(none)"}\nRun with no args to see usage in the file header.`);
}
