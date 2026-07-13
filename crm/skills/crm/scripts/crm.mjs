#!/usr/bin/env node
/**
 * crm.mjs — Yobo CRM REST helper for the CRM API at /api/v1.
 *
 * A thin wrapper over the CRM REST API so Claude doesn't hand-roll curl.
 * Handles Bearer auth, the { success, data } envelope, query strings, and
 * clear errors. It is OpenAPI-driven: the live contract is always at
 * `GET {CRM_API_URL}/api/v1/docs` — run `crm.mjs docs` to fetch it.
 *
 * Setup (env):
 *   CRM_API_KEY   required — a `jetai_…` key minted in the CRM
 *                 (Settings → API Keys). Scoped to ONE org; every call only
 *                 sees/edits that org's data. Each verb needs the matching
 *                 permission (e.g. companies:read, deals:update).
 *   CRM_API_URL   base origin, no trailing slash. Default http://localhost:4100
 *                 (crm `pnpm dev` port). Set to your deployed CRM origin in prod.
 *
 * Generic verbs (path-based — cover EVERYTHING in the OpenAPI):
 *   node crm.mjs get   <path> [--k v ...]     # GET,   extra --flags become ?query
 *   node crm.mjs post  <path> <json|@file>    # POST
 *   node crm.mjs patch <path> <json|@file>    # PATCH
 *   node crm.mjs put   <path> <json|@file>    # PUT
 *   node crm.mjs del   <path>                 # DELETE
 *   node crm.mjs docs                         # fetch the OpenAPI spec
 *
 * Friendly entity aliases (path is <entity> e.g. companies|deals|leads|people|
 * tasks|notes|custom-fields|lifecycles|gtm-campaigns):
 *   node crm.mjs list   <entity> [--k v ...]  # GET  /<entity>?query
 *   node crm.mjs show   <entity> <uuid>       # GET  /<entity>/<uuid>
 *   node crm.mjs create <entity> <json|@file> # POST /<entity>
 *   node crm.mjs update <entity> <uuid> <json|@file>  # PATCH /<entity>/<uuid>
 *   node crm.mjs remove <entity> <uuid>       # DELETE /<entity>/<uuid>
 *
 * Special-cased (need a header / extra path):
 *   node crm.mjs move-deal   <uuid> <json|@file>          # POST /deals/<uuid>/move-stage
 *   node crm.mjs advance-lead <uuid> <json|@file> [--key K]
 *        # POST /leads/<uuid>/gtm-transition. Sends the REQUIRED Idempotency-Key
 *        # header (auto-generated UUID if --key omitted). Body = { from_lane,
 *        # to_lane, context_patch? }. Re-running with the SAME --key is a safe
 *        # replay (no second move).
 *
 * Exit code is non-zero on any HTTP error.
 */
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";

const KEY = process.env.CRM_API_KEY;
const BASE = (process.env.CRM_API_URL || "http://localhost:4100").replace(/\/$/, "");

const RESERVED = new Set(["key"]); // --flags that are NOT query params

function die(msg, code = 1) { console.error(msg); process.exit(code); }
function out(obj) { console.log(JSON.stringify(obj, null, 2)); }

// minimal flag parser: returns { _: [positional], <flag>: value, ... }
function parseArgs(argv) {
  const res = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) { res[a.slice(2)] = argv[++i]; }
    else res._.push(a);
  }
  return res;
}

// build a ?query string from --flags (skipping RESERVED ones)
function qsFrom(args) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(args)) {
    if (k === "_" || RESERVED.has(k) || v == null) continue;
    q.set(k, v);
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

// read a JSON body from a literal string or @file
function readBody(raw) {
  if (raw == null) die("missing JSON body (pass inline JSON or @file.json)");
  try { return JSON.parse(raw.startsWith("@") ? readFileSync(raw.slice(1), "utf8") : raw); }
  catch (e) { die(`invalid JSON body: ${e.message}`); }
}

async function api(method, path, { body, headers } = {}) {
  if (!KEY) die("ERROR: set CRM_API_KEY (a `jetai_…` key from CRM → Settings → API Keys).");
  let res;
  try {
    res = await fetch(`${BASE}/api/v1${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${KEY}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(headers || {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch (e) {
    die(`Could not reach CRM at ${BASE} — ${e?.cause?.code || e?.message || e}. Check CRM_API_URL / that the server is up.`);
  }
  const json = await res.json().catch(() => null);
  if (!res.ok || json?.success === false) {
    const err = json?.error || {};
    die(`HTTP ${res.status} ${err.code || ""}: ${err.message || JSON.stringify(json)}${err.details ? "\ndetails: " + JSON.stringify(err.details) : ""}`);
  }
  return json?.data ?? json;
}

const [, , cmd, ...rest] = process.argv;
const args = parseArgs(rest);
const p = args._; // positional

switch (cmd) {
  // ---- generic path-based verbs -------------------------------------------
  case "get":
    if (!p[0]) die("usage: get <path> [--k v ...]");
    out(await api("GET", `${p[0]}${qsFrom(args)}`));
    break;
  case "post":
    if (!p[0]) die("usage: post <path> <json|@file>");
    out(await api("POST", p[0], { body: readBody(p[1]) }));
    break;
  case "patch":
    if (!p[0]) die("usage: patch <path> <json|@file>");
    out(await api("PATCH", p[0], { body: readBody(p[1]) }));
    break;
  case "put":
    if (!p[0]) die("usage: put <path> <json|@file>");
    out(await api("PUT", p[0], { body: readBody(p[1]) }));
    break;
  case "del":
    if (!p[0]) die("usage: del <path>");
    out(await api("DELETE", p[0]));
    break;
  case "docs": {
    const res = await fetch(`${BASE}/api/v1/docs`);
    if (!res.ok) die(`HTTP ${res.status} fetching /api/v1/docs`);
    out(await res.json());
    break;
  }

  // ---- friendly entity aliases --------------------------------------------
  case "list":
    if (!p[0]) die("usage: list <entity> [--k v ...]");
    out(await api("GET", `/${p[0]}${qsFrom(args)}`));
    break;
  case "show":
    if (!p[0] || !p[1]) die("usage: show <entity> <uuid>");
    out(await api("GET", `/${p[0]}/${p[1]}`));
    break;
  case "create":
    if (!p[0] || !p[1]) die("usage: create <entity> <json|@file>");
    out(await api("POST", `/${p[0]}`, { body: readBody(p[1]) }));
    break;
  case "update":
    if (!p[0] || !p[1] || !p[2]) die("usage: update <entity> <uuid> <json|@file>");
    out(await api("PATCH", `/${p[0]}/${p[1]}`, { body: readBody(p[2]) }));
    break;
  case "remove":
    if (!p[0] || !p[1]) die("usage: remove <entity> <uuid>");
    out(await api("DELETE", `/${p[0]}/${p[1]}`));
    break;

  // ---- special-cased ops ---------------------------------------------------
  case "move-deal":
    if (!p[0] || !p[1]) die("usage: move-deal <uuid> <json|@file>");
    out(await api("POST", `/deals/${p[0]}/move-stage`, { body: readBody(p[1]) }));
    break;
  case "advance-lead": {
    if (!p[0] || !p[1]) die('usage: advance-lead <uuid> <json|@file> [--key K]   body: {"from_lane","to_lane","context_patch?"}');
    const idem = args.key || randomUUID();
    out(await api("POST", `/leads/${p[0]}/gtm-transition`, { body: readBody(p[1]), headers: { "Idempotency-Key": idem } }));
    break;
  }

  default:
    die(`Unknown command: ${cmd ?? "(none)"}\nRun with no args and read the file header for full usage, or \`crm.mjs docs\` for the live contract.`);
}
