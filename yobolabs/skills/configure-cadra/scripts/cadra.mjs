#!/usr/bin/env node
/**
 * cadra.mjs — CadraOS builder REST helper.
 *
 * A thin, harness-agnostic wrapper over the CadraOS public v1 API. Runs the same
 * from Claude Code, Codex, a terminal, or CI — it is plain Node with no deps.
 *
 * Entities (alias → /api/v1 path):
 *   agent        → /agents            (+ deploy, skills, tools)
 *   role         → /roles             (reusable agent starter configs / product roles)
 *   skill        → /skills
 *   tool         → /tools
 *   team         → /teams
 *   board        → /board-configs     (agentic boards; draft → publish)
 *   kb           → /knowledge-bases   (+ documents, query)
 *   prompt       → /prompts
 *   guardrail    → /guardrails
 *   model        → /models
 *   provider     → /providers
 *   rule         → /rules
 *   project      → /projects
 *   workflow     → /workflows
 *   channel      → /channels
 *   remote-agent → /remote-agents
 *   decision-table → /decision-tables
 *   webhook      → /webhooks
 *   execution    → /executions
 *   artifact     → /artifacts
 *
 * Setup (env):
 *   CADRA_BUILDER_API_KEY   required — API key with the entity's *:read/create/
 *                           update/delete (+ publish/deploy) permissions
 *   CADRA_API_URL           base origin, default http://localhost:3000
 *                           (no trailing slash; the cadra-web origin)
 *
 * Usage:
 *   node cadra.mjs <command> [args]            # global commands
 *   node cadra.mjs <entity> <command> [args]   # entity commands
 *
 * Global commands:
 *   ping                        # verify key + origin reachable, print org scope
 *   entities                    # list entity aliases and their paths
 *   schema <entity> [create|update]
 *                               # print the LIVE field contract from the server's
 *                               # OpenAPI. Use this instead of guessing fields.
 *   docs                        # print the OpenAPI URL
 *
 * Entity commands (all entities):
 *   list [--search S] [--limit N] [--offset N] [--k v ...]
 *   get <id>
 *   find <name>                 # resolve a name → id/uuid (substring, case-insensitive)
 *   create <json|@file>
 *   update <id> <json|@file>    # partial update. The helper picks PUT or PATCH per
 *                               # entity — the public API is not consistent, and the
 *                               # wrong verb returns a bare 405 with no body.
 *   delete <id>
 *   apply <@file|@dir>          # IDEMPOTENT upsert by name (prompts: by `title`):
 *                               # update if a record with that exact name exists,
 *                               # else create. Accepts one file, a directory of
 *                               # .json files, or a JSON array. This is how you keep
 *                               # agent/tool/role definitions in git.
 *   export [id] [--out FILE]    # dump one record, or all of them, as apply-able JSON
 *
 * Entity-specific:
 *   agent  deploy <id>          # publish + activate — the full "make it runnable"
 *                               # step. REQUIRED before a board/team can use it.
 *   agent  publish <id>         # visibility flip only (draft → deployed)
 *   agent  activate <id>        # activate only; 412s unless already published
 *   agent  set-tools  <id> <json|@file>   # { "tools":  [{ "toolId": 1 }] }  REPLACES
 *   agent  set-skills <id> <json|@file>   # { "skills": [{ "skillId": 1 }] } REPLACES
 *   agent  runs <id>            # recent executions
 *   board  draft <id> <json|@file>   # PATCH the draft definition (replaces it)
 *   board  publish <id>              # draft → published (Conductor runs published only)
 *   kb     docs  <id>
 *   kb     query <id> <json|@file>
 *
 * Flags:
 *   --dry-run     print what would be sent, send nothing (create/update/apply/delete)
 *   --quiet       suppress the per-record apply log
 *
 * Exit code is non-zero on any HTTP or validation error.
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const KEY = process.env.CADRA_BUILDER_API_KEY;
const BASE = (process.env.CADRA_API_URL || "http://localhost:3000").replace(/\/$/, "");

/**
 * entity alias → { path, actions, nameField?, updateMethod?, noUpdate?, noDelete? }
 *
 * `actions`      maps an extra verb to [httpMethod, urlSuffix, wantsBody].
 * `nameField`    the human-identity field `find`/`apply` key on (default "name";
 *                prompts use "title" — not every entity has `name`).
 * `updateMethod` the verb the ITEM route actually implements. Most of the public
 *                v1 API uses **PUT**; only a few use PATCH. Sending the wrong one
 *                returns a bare 405 with no body, so this table is load-bearing.
 * `noUpdate`/`noDelete` — the item route genuinely does not implement it.
 */
const ENTITIES = {
  agent: {
    path: "/agents",
    actions: {
      // draft → deployed. `publish` is the visibility flip that makes the agent
      // runnable; `activate` (the server's misnamed `/deploy` route) only works
      // AFTER that. `cadra agent deploy` runs both — see the dispatch below.
      publish: ["POST", "/publish", false],
      activate: ["POST", "/deploy", false],
      // Both REPLACE the whole assignment list.
      "set-tools": ["POST", "/tools", true],
      "set-skills": ["POST", "/skills", true],
      runs: ["GET", "/runs", false],
    },
  },
  role: { path: "/roles", actions: {}, updateMethod: "PATCH" },
  skill: { path: "/skills", actions: {} },
  tool: { path: "/tools", actions: {} },
  team: { path: "/teams", actions: {} },
  board: {
    path: "/board-configs",
    // The board item route implements GET only — edits go through the draft, and
    // there is no REST delete.
    noUpdate: "edit the lifecycle with `board draft <id> <json>`, then `board publish <id>`",
    noDelete: "delete boards in the app",
    actions: {
      draft: ["PATCH", "/draft", true],
      publish: ["POST", "/publish", false],
    },
  },
  kb: {
    path: "/knowledge-bases",
    actions: {
      docs: ["GET", "/documents", false],
      query: ["POST", "/query", true],
    },
  },
  prompt: { path: "/prompts", actions: {}, nameField: "title" },
  guardrail: { path: "/guardrails", actions: {} },
  model: { path: "/models", actions: {} },
  provider: { path: "/providers", actions: {} },
  rule: { path: "/rules", actions: {} },
  project: { path: "/projects", actions: {} },
  workflow: { path: "/workflows", actions: {} },
  channel: { path: "/channels", actions: {}, updateMethod: "PATCH" },
  "remote-agent": { path: "/remote-agents", actions: {}, updateMethod: "PATCH" },
  "decision-table": { path: "/decision-tables", actions: {} },
  webhook: { path: "/webhooks", actions: {} },
  execution: { path: "/executions", actions: {} },
  artifact: { path: "/artifacts", actions: {} },
};

function die(msg, code = 1) {
  console.error(msg);
  process.exit(code);
}
function out(obj) {
  // `null` is what a --dry-run write returns; it has already printed its preview.
  if (obj === null || obj === undefined) return;
  if (Array.isArray(obj) && obj.every((v) => v === null)) return;
  console.log(typeof obj === "string" ? obj : JSON.stringify(obj, null, 2));
}
function log(msg) {
  if (!FLAGS.quiet) console.error(msg);
}

function parseArgs(argv) {
  const res = { _: [], flags: {} };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run" || a === "--quiet") res.flags[a.slice(2).replace("-r", "R")] = true;
    else if (a.startsWith("--")) res[a.slice(2)] = argv[++i];
    else res._.push(a);
  }
  return res;
}

function readJson(raw, what = "a JSON string or @file") {
  if (raw == null) die(`expected ${what}`);
  try {
    return JSON.parse(raw.startsWith("@") ? readFileSync(raw.slice(1), "utf8") : raw);
  } catch (e) {
    die(`invalid JSON: ${e.message}`);
  }
}

/** Expand `@file`, `@dir`, or an inline JSON array into a flat array of records. */
function readRecords(raw) {
  if (raw == null) die("expected @file, @dir, or an inline JSON array");
  if (raw.startsWith("@")) {
    const p = raw.slice(1);
    if (statSync(p).isDirectory()) {
      const files = readdirSync(p).filter((f) => f.endsWith(".json")).sort();
      if (!files.length) die(`no .json files in ${p}`);
      return files.flatMap((f) => {
        const parsed = JSON.parse(readFileSync(join(p, f), "utf8"));
        return Array.isArray(parsed) ? parsed : [parsed];
      });
    }
  }
  const parsed = readJson(raw);
  return Array.isArray(parsed) ? parsed : [parsed];
}

async function api(method, path, body) {
  if (!KEY) {
    die(
      "ERROR: CADRA_BUILDER_API_KEY is not set.\n" +
        "  In CadraOS: profile menu → API Keys → create a key with the perms you need.\n" +
        "  export CADRA_BUILDER_API_KEY=<api-key>\n" +
        `  export CADRA_API_URL=${BASE}`
    );
  }
  if (FLAGS.dryRun && method !== "GET") {
    out({ dryRun: true, method, url: `${BASE}/api/v1${path}`, body: body ?? null });
    return null;
  }
  let res;
  try {
    res = await fetch(`${BASE}/api/v1${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${KEY}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch (e) {
    die(`NETWORK: cannot reach ${BASE} — ${e.message}\nIs CADRA_API_URL right and the app running?`);
  }
  const json = await res.json().catch(() => null);
  if (!res.ok || json?.success === false) {
    const err = json?.error || {};
    // Surface Zod field errors — the #1 cause of a 400 is a guessed field name.
    const details = err.details ? `\n  details: ${JSON.stringify(err.details, null, 2)}` : "";
    const hint =
      res.status === 400
        ? `\n  hint: run \`cadra schema <entity> create\` for the live field contract.`
        : res.status === 403
          ? `\n  hint: the API key lacks this verb's permission — mint a key that has it.`
          : res.status === 409
            ? `\n  hint: duplicate name in this org — pick another name.`
            : res.status === 405
              ? `\n  hint: this route does not implement ${method} (405s come back with an empty body).\n        Most v1 item routes are PUT, a few are PATCH — see references/entities.md.`
              : "";
    die(`HTTP ${res.status} ${err.code || ""}: ${err.message || JSON.stringify(json)}${details}${hint}`);
  }
  // Public v1 uses { success, data }; a few routes return raw — tolerate both.
  return json && "data" in json ? json.data : json;
}

/** List payloads differ per entity ({items}, {configs}, {agents}, a bare array…). */
function itemsOf(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  for (const v of Object.values(payload)) if (Array.isArray(v)) return v;
  return [];
}

const idOf = (rec) => rec?.uuid ?? rec?.id;

async function findByName(base, name, { exact = false, field = "name" } = {}) {
  const payload = await api("GET", `${base}?search=${encodeURIComponent(name)}&limit=50`);
  const needle = name.toLowerCase();
  const items = itemsOf(payload);
  // `search` is a server-side hint only; some entities ignore it, so filter locally too.
  return items.filter((r) => {
    const v = String(r?.[field] ?? "").toLowerCase();
    return exact ? v === needle : v.includes(needle);
  });
}

// ---------------------------------------------------------------------------
// OpenAPI-backed `schema` — never guess a field name again
// ---------------------------------------------------------------------------

let SPEC_CACHE = null;
async function spec() {
  if (SPEC_CACHE) return SPEC_CACHE;
  const res = await fetch(`${BASE}/api/v1/docs`).catch((e) => die(`cannot fetch OpenAPI: ${e.message}`));
  if (!res.ok) die(`cannot fetch OpenAPI: HTTP ${res.status} from ${BASE}/api/v1/docs`);
  SPEC_CACHE = await res.json();
  return SPEC_CACHE;
}

function deref(node, doc, depth = 0) {
  if (!node || typeof node !== "object" || depth > 8) return node;
  if (node.$ref) {
    const parts = node.$ref.replace(/^#\//, "").split("/");
    let cur = doc;
    for (const p of parts) cur = cur?.[p];
    return deref(cur, doc, depth + 1);
  }
  if (Array.isArray(node)) return node.map((n) => deref(n, doc, depth + 1));
  const copy = {};
  for (const [k, v] of Object.entries(node)) copy[k] = deref(v, doc, depth + 1);
  return copy;
}

function describe(schema, required = []) {
  if (!schema?.properties) return "  (no documented properties — POST once and read the 400 details)";
  const req = new Set(schema.required || required || []);
  return Object.entries(schema.properties)
    .map(([k, v]) => {
      const t = v.enum ? v.enum.map((e) => JSON.stringify(e)).join(" | ") : (v.type || "any");
      const flag = req.has(k) ? "REQUIRED" : "optional";
      const def = v.default !== undefined ? ` default=${JSON.stringify(v.default)}` : "";
      const desc = v.description ? ` — ${String(v.description).split("\n")[0]}` : "";
      return `  ${k.padEnd(28)} ${flag.padEnd(9)} ${t}${def}${desc}`;
    })
    .join("\n");
}

async function printSchema(entityKey, which = "create") {
  const ent = ENTITIES[entityKey];
  if (!ent) die(`unknown entity: ${entityKey}\nRun \`cadra entities\`.`);
  const doc = await spec();
  const collection = doc.paths?.[ent.path];
  const item = doc.paths?.[`${ent.path}/{id}`] || doc.paths?.[`${ent.path}/{uuid}`];
  const op = which === "update" ? item?.patch || item?.put : collection?.post;
  if (!op) {
    die(
      `No documented ${which} operation for ${ent.path} in the server's OpenAPI.\n` +
        `Try: cadra ${entityKey} get <id>   (an existing record shows the real field names).`
    );
  }
  const body = deref(op.requestBody?.content?.["application/json"]?.schema, doc);
  console.log(`${which.toUpperCase()} ${ent.path}   (${op.summary || ""})`);
  console.log(describe(body));
}

// ---------------------------------------------------------------------------
// dispatch
// ---------------------------------------------------------------------------

const [, , first, second, ...rest] = process.argv;
const argv = parseArgs([second, ...rest].filter((v) => v !== undefined));
const FLAGS = argv.flags || {};

// --- global commands ---------------------------------------------------------
if (!first || first === "help" || first === "--help" || first === "-h") {
  console.log(readFileSync(new URL(import.meta.url).pathname, "utf8").split("*/")[0].replace(/^#![^\n]*\n/, ""));
  process.exit(0);
}

if (first === "docs") {
  console.log(`${BASE}/api/v1/docs`);
  process.exit(0);
}

if (first === "entities") {
  for (const [k, v] of Object.entries(ENTITIES)) {
    const extra = Object.keys(v.actions);
    console.log(`  ${k.padEnd(16)} ${v.path.padEnd(20)} ${extra.length ? `+ ${extra.join(", ")}` : ""}`);
  }
  process.exit(0);
}

if (first === "schema") {
  await printSchema(second, rest[0] || "create");
  process.exit(0);
}

if (first === "ping") {
  const data = await api("GET", "/agents?limit=1");
  const n = itemsOf(data).length;
  console.log(`OK  ${BASE}  key accepted  (agents:read works; ${n ? "org has agents" : "no agents visible yet"})`);
  process.exit(0);
}

// --- entity commands ---------------------------------------------------------
const ent = ENTITIES[first];
if (!ent) {
  die(
    `Unknown entity or command: ${first}\n` +
      `Entities: ${Object.keys(ENTITIES).join(" | ")}\n` +
      `Global:   ping | entities | schema <entity> | docs | help`
  );
}
const base = ent.path;
const NAME_FIELD = ent.nameField || "name";
// Most public v1 item routes implement PUT; a handful implement PATCH. Getting
// this wrong yields a bare 405 with an empty body.
const UPDATE_METHOD = ent.updateMethod || "PUT";
const cmd = second;
const positional = argv._.slice(1); // argv._[0] is the command
const id = positional[0];

function listQuery() {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(argv)) {
    if (k === "_" || k === "flags" || v == null) continue;
    q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

switch (cmd) {
  case "list":
    out(await api("GET", `${base}${listQuery()}`));
    break;

  case "get":
    if (!id) die(`usage: ${first} get <id>`);
    out(await api("GET", `${base}/${id}`));
    break;

  case "find": {
    if (!id) die(`usage: ${first} find <${NAME_FIELD}>`);
    const hits = await findByName(base, id, { field: NAME_FIELD });
    if (!hits.length) die(`no ${first} matching "${id}"`);
    out(
      hits.map((r) => ({
        id: idOf(r),
        [NAME_FIELD]: r[NAME_FIELD],
        status: r.status ?? r.visibility ?? r.isActive,
      }))
    );
    break;
  }

  case "create":
    out(await api("POST", base, readJson(positional[0])));
    break;

  case "update":
  case "patch":
    if (ent.noUpdate) die(`${first} has no update endpoint — ${ent.noUpdate}`);
    if (!id) die(`usage: ${first} update <id> <json|@file>`);
    out(await api(UPDATE_METHOD, `${base}/${id}`, readJson(positional[1])));
    break;

  case "delete":
    if (ent.noDelete) die(`${first} has no delete endpoint — ${ent.noDelete}`);
    if (!id) die(`usage: ${first} delete <id>`);
    out(await api("DELETE", `${base}/${id}`));
    break;

  case "apply": {
    const records = readRecords(positional[0]);
    const results = [];
    for (const rec of records) {
      const label = rec?.[NAME_FIELD];
      if (!label) {
        die(`apply requires a "${NAME_FIELD}" on every ${first} record — got ${JSON.stringify(rec).slice(0, 120)}`);
      }
      const hits = await findByName(base, label, { exact: true, field: NAME_FIELD });
      if (hits.length > 1) {
        die(`ambiguous: ${hits.length} ${first}s already called "${label}" — resolve by hand`);
      }
      if (hits.length === 1) {
        if (ent.noUpdate) die(`${first} "${label}" exists but has no update endpoint — ${ent.noUpdate}`);
        const existingId = idOf(hits[0]);
        log(`~ update ${first} "${label}" (${existingId})`);
        results.push(await api(UPDATE_METHOD, `${base}/${existingId}`, rec));
      } else {
        log(`+ create ${first} "${label}"`);
        results.push(await api("POST", base, rec));
      }
    }
    out(results.length === 1 ? results[0] : results);
    break;
  }

  case "export": {
    const payload = id ? await api("GET", `${base}/${id}`) : await api("GET", `${base}?limit=100`);
    const data = id ? payload : itemsOf(payload);
    const text = JSON.stringify(data, null, 2);
    if (argv.out) {
      writeFileSync(argv.out, text + "\n");
      log(`wrote ${argv.out}`);
    } else out(text);
    break;
  }

  // `deploy` is the composite the UI button performs: flip visibility, then
  // activate. Calling only one of them leaves the agent un-runnable, which is the
  // most common "why won't my agent run" report.
  case "deploy": {
    if (first !== "agent") die("deploy is agent-only");
    if (!id) die("usage: agent deploy <id>");
    await api("POST", `${base}/${id}/publish`);
    out(await api("POST", `${base}/${id}/deploy`));
    break;
  }

  default: {
    const action = ent.actions[cmd];
    if (!action) {
      die(
        `Unknown command: ${cmd ?? "(none)"} for ${first}\n` +
          `Commands: list | get | find | create | update | delete | apply | export` +
          (Object.keys(ent.actions).length ? ` | ${Object.keys(ent.actions).join(" | ")}` : "")
      );
    }
    const [method, suffix, wantsBody] = action;
    if (!id) die(`usage: ${first} ${cmd} <id>${wantsBody ? " <json|@file>" : ""}`);
    out(await api(method, `${base}/${id}${suffix}`, wantsBody ? readJson(positional[1]) : undefined));
  }
}
