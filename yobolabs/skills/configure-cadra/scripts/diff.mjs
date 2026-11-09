/**
 * diff.mjs — `cadra agent diff` (read-only): compare one agent release in one
 * environment against its twin in another, object by object.
 *
 *   cadra agent diff dev:443@2311 local:443@2315            # table; exit 0 = all same, 1 = any differ
 *   cadra agent diff dev:443 prod:362 --fields              # + field-level diff under each differing row
 *   cadra agent diff dev:443@2311 local:443@2315 --json     # machine form (a release gate)
 *
 * Release: `@<releaseId>` per side; left off, the side's deploy-pointer release (read from the
 * agent when the server returns it; else the CLI stops and asks for @<releaseId>).
 *
 * Environments: each side needs its own origin + key, like promote:
 *   CADRA_<ENV>_API_URL, CADRA_<ENV>_BUILDER_API_KEY   (agents:read; prompt:read for AI functions;
 *   --link style twin lookup also reads GET /agents/{id}/twins, so agents:read covers it)
 *
 * What is fetched (nothing is written, on either side):
 *   - each side's release bundle (GET /agents/{id}/releases/{id}/bundle, the route promote uses)
 *   - AI functions: (prompt:read) every function key a bundle names (any string in a skill, tool, role or the agent),
 *     every `remix_*` function, and every --function KEY, as the golden version (content, system
 *     prompt, variables, output schema, model, params) via GET /prompts and /prompts/{id}/versions
 *   - skill files: the bundle's skill version carries a manifest (path, sha256); each file is a row
 *
 * Mapping A <-> B, per kind: same uuid, then the twin map (GET /agents/{id}/twins), then exact name.
 * Hash = sha256 of the canonical JSON of the object AFTER the ignored fields are removed.
 */
import { createHash } from "node:crypto";
import { client, fail, uuidOf } from "./promote.mjs";

// ---------------------------------------------------------------------------
// What legitimately differs per environment and is therefore NOT compared
// ---------------------------------------------------------------------------

/** Exact field names dropped everywhere. */
export const IGNORED_FIELD_NAMES = [
  "id", "uuid", "orgId", "org_id", "sourceOrgId", "agentId", "teamId", "userId",
  "createdAt", "updatedAt", "sealedAt", "appliedAt", "createdBy", "updatedBy", "appliedBy", "actorUserId",
  "contentHash", "canonicalHash", "bundleHash", "envRefs",
];
/** Field-name patterns dropped everywhere: ids and uuids (any `...Id`, `...Uuid`, `..._id`), timestamps (`...At`, `..._at`). */
export const IGNORED_FIELD_PATTERNS = [/(Id|Ids|Uuid|Uuids)$/, /(_id|_ids|_uuid|_uuids)$/, /(At|_at)$/];
/** Looks like an id but is content: a model name. Compared. */
const KEEP_FIELD = /(^|[a-z])(modelId|ModelId)$/;
/** Dropped only at the top level of an object's content (counters, not content). */
export const IGNORED_TOP_LEVEL = ["version"];

const ignoredKey = (key, depth) =>
  IGNORED_FIELD_NAMES.includes(key) ||
  (depth === 0 && IGNORED_TOP_LEVEL.includes(key)) ||
  (!KEEP_FIELD.test(key) && IGNORED_FIELD_PATTERNS.some((re) => re.test(key)));

/** Hosts that differ per env: `x-dev.yobolabs.ai` / `x-dev.cadraos.com` read as the prod host; each side's own origin is one token. */
const DEV_HOST_RE = /\b([a-z][a-z0-9]*)-dev\.(yobolabs\.ai|cadraos\.com)\b/gi;

export function hostRules({ originA, originB, hosts = [] } = {}) {
  const rules = [];
  for (const { fromHost, toHost } of hosts) rules.push((s) => s.split(fromHost).join(toHost));
  for (const o of [originA, originB]) {
    const host = hostOf(o);
    if (host) rules.push((s) => s.split(host).join("<origin>"));
  }
  rules.push((s) => s.replace(DEV_HOST_RE, "$1.$2"));
  return rules;
}

function hostOf(origin) {
  if (!origin) return null;
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(origin)) return String(origin).replace(/\/.*$/, "") || null;
  try {
    return new URL(origin).host;
  } catch {
    return String(origin).replace(/^https?:\/\//, "").replace(/\/.*$/, "") || null;
  }
}

// ---------------------------------------------------------------------------
// Canonical JSON, hashing, normalising
// ---------------------------------------------------------------------------

export function canonical(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "null";
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  return `{${Object.keys(value)
    .filter((k) => value[k] !== undefined)
    .sort()
    .map((k) => `${JSON.stringify(k)}:${canonical(value[k])}`)
    .join(",")}}`;
}

export const sha256 = (value) => createHash("sha256").update(canonical(value)).digest("hex");

/** Remove ignored fields and rewrite per-env hosts in every string. Pure; the input is not changed. */
export function normalise(value, rules = [], depth = 0) {
  if (typeof value === "string") return rules.reduce((s, r) => r(s), value);
  if (Array.isArray(value)) return value.map((v) => normalise(v, rules, depth + 1));
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) if (!ignoredKey(k, depth)) out[k] = normalise(v, rules, depth + 1);
    return out;
  }
  return value;
}

// ---------------------------------------------------------------------------
// Local-from-dev host aliasing
// ---------------------------------------------------------------------------

const LOOPBACK = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i;
const URL_VALUE = /^(https?:\/\/[^\/\s?#]+)([\s\S]*)$/;

/** Is this origin (or bare host) a loopback address? */
export const isLoopbackOrigin = (origin) => {
  const host = hostOf(origin);
  return !!host && LOOPBACK.test(host);
};

function leaves(value, path = "", out = new Map()) {
  if (typeof value === "string") out.set(path, value);
  else if (Array.isArray(value)) value.forEach((v, i) => leaves(v, `${path}[${i}]`, out));
  else if (value && typeof value === "object") for (const [k, v] of Object.entries(value)) leaves(v, path ? `${path}.${k}` : k, out);
  return out;
}

/**
 * Local-from-dev: a tool on the local side calls http://127.0.0.1:<port>, its twin on the other side calls the deployed host.
 * Learn the pairing from the mapped pairs themselves: at the same field path, a url value on each side with the same rest
 * after the origin votes `localOrigin -> otherOrigin`. A local origin with exactly one such partner becomes an alias;
 * one with two (or none) is left alone, so a tool that really points somewhere else still shows as differs.
 * `localSide` is "a" or "b". `skipHosts` (explicit --host) always win.
 */
export function deriveHostAliases(pairs, localSide, skipHosts = []) {
  const votes = new Map();
  for (const { a, b } of pairs) {
    if (!a || !b) continue;
    const [local, other] = localSide === "a" ? [a, b] : [b, a];
    const lo = leaves(local.content);
    const ot = leaves(other.content);
    for (const [path, lv] of lo) {
      const ov = ot.get(path);
      if (ov === undefined || ov === lv) continue;
      const lm = URL_VALUE.exec(lv);
      const om = URL_VALUE.exec(ov);
      if (!lm || !om || lm[2] !== om[2] || lm[1] === om[1] || !isLoopbackOrigin(lm[1])) continue;
      if (skipHosts.some((h) => lm[1].includes(h))) continue;
      const m = votes.get(lm[1]) ?? new Map();
      m.set(om[1], (m.get(om[1]) ?? 0) + 1);
      votes.set(lm[1], m);
    }
  }
  const aliases = [];
  for (const [from, m] of votes) if (m.size === 1) aliases.push({ from, to: [...m.keys()][0], count: [...m.values()][0] });
  return aliases;
}

export const aliasRule = (aliases) => (str) => aliases.reduce((acc, { from, to }) => acc.split(from).join(to), str);

// ---------------------------------------------------------------------------
// Bundle -> comparable objects
// ---------------------------------------------------------------------------

/** Order of kinds in the output. */
export const KIND_ORDER = ["agent", "channel_profile", "harness", "team_harness", "role_lock", "prompt_version", "skill", "skill_file", "tool", "ai_function"];
/** Pin / object kind -> the kind the server's twin map uses. */
export const TWIN_KIND = { tool: "tool", skill: "skill", role_lock: "role", harness: "harness", team_harness: "harness", agent: "agent" };

const PV_REF = /pv_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g;

/** Remove the named keys at any depth (role-lock version labels are counters per env, not content). */
function dropKeys(value, keys) {
  if (Array.isArray(value)) return value.map((v) => dropKeys(v, keys));
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).filter(([k]) => !keys.includes(k)).map(([k, v]) => [k, dropKeys(v, keys)]));
  return value;
}

/**
 * Flatten a bundle (and its delegates') into comparable objects:
 * { kind, name, ref ("id@version"), keys (uuid / id strings), anchor, scope, content (raw, un-normalised) }.
 * `content` still carries ids; `normalise` + `sha256` are applied by the caller.
 */
export function extractObjects(bundle) {
  const out = [];
  const seen = new Set();
  const add = (o) => {
    const dedupe = `${o.kind}|${o.keys[0] ?? o.name}|${o.ref}`;
    if (seen.has(dedupe)) return;
    seen.add(dedupe);
    out.push(o);
  };
  const walk = (b, root) => {
    const rel = b.release ?? {};
    add({
      kind: "agent", name: b.agent.name, ref: `${b.agent.id}@${rel.id}`, keys: [b.agent.uuid].filter(Boolean),
      anchor: root, scope: "org", content: b.agent.fields ?? {},
    });
    if (b.channelProfile != null)
      add({ kind: "channel_profile", name: `channel profile: ${b.agent.name}`, ref: `${b.agent.id}@${rel.id}`, keys: [], anchor: root, scope: "org", content: b.channelProfile });
    for (const pin of b.pins ?? []) {
      if (pin.kind === "delegate") continue;
      const base = {
        name: pin.name || String(pin.subjectId),
        ref: `${pin.subjectId}@${pin.versionId}`,
        keys: [pin.subjectUuid, String(pin.subjectId)].filter(Boolean),
        anchor: false,
        scope: pin.scope ?? "org",
      };
      const content = pin.content ?? {};
      if (pin.kind === "role_lock") {
        const prompts = content.prompts ?? {};
        const titleOf = (ref) => prompts[ref]?.title ?? ref;
        const lock = dropKeys(JSON.parse(JSON.stringify(content.lock ?? {}).replace(PV_REF, (ref) => `pv:${titleOf(ref)}`)), ["version"]);
        add({ ...base, kind: "role_lock", content: { ...content, lock, prompts: undefined } });
        for (const [ref, pv] of Object.entries(prompts)) {
          add({
            kind: "prompt_version", name: pv.title ?? ref, ref: ref.slice(0, 11), keys: [ref.replace(/^pv_/, "")], anchor: false, scope: pin.scope ?? "org",
            content: { title: pv.title, content: pv.content, systemPrompt: pv.systemPrompt, variables: pv.variables },
          });
        }
      } else if (pin.kind === "skill") {
        const { files_manifest: manifest, filesManifest, ...rest } = content;
        add({ ...base, kind: "skill", content: rest });
        for (const f of manifest ?? filesManifest ?? [])
          add({ kind: "skill_file", name: `${base.name}/${f.path}`, ref: `${pin.subjectId}@${pin.versionId}`, keys: [], anchor: false, scope: base.scope, content: f });
      } else {
        add({ ...base, kind: pin.kind, content });
      }
    }
    for (const d of b.delegates ?? []) walk(d, false);
  };
  walk(bundle, true);
  return out;
}

const UUID_ANYWHERE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

/**
 * Per-side text rule: a uuid that names an object of THIS bundle (a tool, skill, role, agent) is replaced by
 * `{kind:name}`, so a role lock's tool list and "role=<uuid>" lines compare across environments.
 */
export function uuidNameRule(bundle) {
  const names = new Map();
  const BARE_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const walk = (b) => {
    if (b.agent?.uuid) names.set(b.agent.uuid.toLowerCase(), `agent:${b.agent.name}`);
    for (const p of b.pins ?? []) if (p.subjectUuid) names.set(p.subjectUuid.toLowerCase(), `${p.kind === "role_lock" ? "role" : p.kind}:${p.name}`);
    for (const d of b.delegates ?? []) walk(d);
  };
  walk(bundle);
  // Role-only skills and tools are not pins, but a role lock names each one twice: by uuid (`slug`) and by the
  // prompt version that holds its text (`promptVersionRef`, whose title is the same in every env). The uuid reads as that title.
  const lockRefs = (b) => {
    for (const p of b.pins ?? []) {
      if (p.kind !== "role_lock") continue;
      const lock = p.content?.lock ?? {};
      const prompts = p.content?.prompts ?? {};
      for (const entry of [...(lock.skills ?? []), ...(lock.toolDescriptions ?? [])]) {
        const ref = entry?.promptVersionRef;
        if (typeof entry?.slug !== "string" || !BARE_UUID.test(entry.slug) || typeof ref !== "string") continue;
        const label = prompts[ref]?.title ?? ref;
        if (!names.has(entry.slug.toLowerCase())) names.set(entry.slug.toLowerCase(), `ref:${label}`);
      }
    }
    for (const d of b.delegates ?? []) lockRefs(d);
  };
  lockRefs(bundle);
  return (s) => s.replace(UUID_ANYWHERE, (u) => (names.has(u.toLowerCase()) ? `{${names.get(u.toLowerCase())}}` : u));
}

/** Every string anywhere in a bundle's agent fields and pin contents, newline-joined (for function-key scanning). */
export function bundleText(bundle) {
  const parts = [];
  const visit = (v) => {
    if (typeof v === "string") parts.push(v);
    else if (Array.isArray(v)) v.forEach(visit);
    else if (v && typeof v === "object") Object.values(v).forEach(visit);
  };
  visit(bundle.agent?.fields);
  for (const p of bundle.pins ?? []) visit(p.content);
  for (const d of bundle.delegates ?? []) parts.push(bundleText(d));
  return parts.join("\n");
}

/** Which of `knownKeys` the text names (whole-token match), plus every `remix_*` key. */
export function functionKeysNamed(text, knownKeys) {
  const named = new Set();
  for (const key of knownKeys) {
    if (key.startsWith("remix_")) {
      named.add(key);
      continue;
    }
    const esc = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (new RegExp(`(?<![A-Za-z0-9_])${esc}(?![A-Za-z0-9_])`).test(text)) named.add(key);
  }
  return [...named].sort();
}

export function functionObject(item, version) {
  return {
    kind: "ai_function", name: item.functionKey, ref: `${item.id}@v${version?.versionNumber ?? "?"}`,
    keys: [item.uuid].filter(Boolean), anchor: false, scope: "org",
    content: version
      ? {
          title: version.title ?? item.title, outputKind: version.outputKind, modelId: version.modelId, modelParams: version.modelParams,
          outputSchema: version.outputSchema, content: version.content, systemPrompt: version.systemPrompt, variables: version.variables,
        }
      : { missingGoldenVersion: true },
  };
}

// ---------------------------------------------------------------------------
// Mapping A <-> B
// ---------------------------------------------------------------------------

/**
 * Pair objects of A with objects of B, within a kind: anchors (root agent, its channel profile) first,
 * then same uuid, then the twin map, then exact name (one-to-one, in order).
 * twins: [{ kind, sourceKey, targetId }] - `ab`: twins stored on B (sourceKey is an A key, targetId a B id),
 * `ba`: twins stored on A (sourceKey is a B key, targetId an A id).
 * Returns [{ a, b, via }] with a or b null for an unmatched object.
 */
export function mapObjects(aObjs, bObjs, { ab = [], ba = [] } = {}) {
  const pairs = [];
  const usedB = new Set();
  const usedA = new Set();
  const pair = (a, b, via) => {
    usedA.add(a);
    usedB.add(b);
    pairs.push({ a, b, via });
  };
  const free = (list, used, kind) => list.filter((o) => o.kind === kind && !used.has(o));
  const kinds = [...new Set([...aObjs, ...bObjs].map((o) => o.kind))];
  for (const kind of kinds) {
    for (const a of free(aObjs, usedA, kind).filter((o) => o.anchor)) {
      const b = free(bObjs, usedB, kind).find((o) => o.anchor);
      if (b) pair(a, b, "root");
    }
    for (const a of free(aObjs, usedA, kind)) {
      const b = free(bObjs, usedB, kind).find((o) => a.keys.some((k) => !/^\d+$/.test(k) && o.keys.includes(k)));
      if (b) pair(a, b, "uuid");
    }
    const tk = TWIN_KIND[kind];
    if (tk) {
      for (const a of free(aObjs, usedA, kind)) {
        const hit = free(bObjs, usedB, kind).find((b) =>
          ab.some((t) => t.kind === tk && a.keys.includes(String(t.sourceKey)) && b.keys.includes(String(t.targetId))) ||
          ba.some((t) => t.kind === tk && b.keys.includes(String(t.sourceKey)) && a.keys.includes(String(t.targetId))));
        if (hit) pair(a, hit, "twin");
      }
    }
    for (const a of free(aObjs, usedA, kind)) {
      const b = free(bObjs, usedB, kind).find((o) => o.name === a.name);
      if (b) pair(a, b, "name");
    }
  }
  for (const a of aObjs) if (!usedA.has(a)) pairs.push({ a, b: null, via: null });
  for (const b of bObjs) if (!usedB.has(b)) pairs.push({ a: null, b, via: null });
  return pairs;
}

// ---------------------------------------------------------------------------
// Rows
// ---------------------------------------------------------------------------

export function buildRows(pairs, { rules = [], rulesA = rules, rulesB = rules } = {}) {
  const rows = pairs.map(({ a, b, via }) => {
    const na = a ? normalise(a.content, rulesA) : null;
    const nb = b ? normalise(b.content, rulesB) : null;
    const shaA = a ? sha256(na) : null;
    const shaB = b ? sha256(nb) : null;
    const status = !a ? "missing-A" : !b ? "missing-B" : shaA === shaB ? "same" : "differs";
    return {
      kind: (a ?? b).kind,
      name: (a ?? b).name,
      a: a ? { ref: a.ref, sha256: shaA } : null,
      b: b ? { ref: b.ref, sha256: shaB } : null,
      status,
      via,
      scope: (a ?? b).scope,
      _na: na,
      _nb: nb,
    };
  });
  rows.sort((x, y) => {
    const k = KIND_ORDER.indexOf(x.kind) - KIND_ORDER.indexOf(y.kind);
    return k || (x.name < y.name ? -1 : x.name > y.name ? 1 : 0);
  });
  return rows;
}

/** Leaf-level differences between two normalised values: [{ path, a, b }] (a / b undefined = absent). */
export function fieldDiff(a, b, path = "") {
  const plain = (v) => v !== null && typeof v === "object";
  if (Array.isArray(a) && Array.isArray(b) && a.length !== b.length) {
    // An item added or removed: list the items only on one side instead of shifting every index.
    const ca = a.map(canonical);
    const cb = b.map(canonical);
    const left = (from, other) => { const rest = [...other]; return from.filter((c) => { const i = rest.indexOf(c); if (i >= 0) { rest.splice(i, 1); return false; } return true; }); };
    const onlyA = new Set(left(ca, cb));
    const onlyB = new Set(left(cb, ca));
    return [
      ...a.filter((_, i) => onlyA.has(ca[i])).map((v) => ({ path: `${path}[-]`, a: v, b: undefined })),
      ...b.filter((_, i) => onlyB.has(cb[i])).map((v) => ({ path: `${path}[+]`, a: undefined, b: v })),
    ];
  }
  if (plain(a) && plain(b) && Array.isArray(a) === Array.isArray(b)) {
    const keys = Array.isArray(a) ? [...Array(Math.max(a.length, b.length)).keys()] : [...new Set([...Object.keys(a), ...Object.keys(b)])].sort();
    return keys.flatMap((k) => fieldDiff(a[k], b[k], Array.isArray(a) ? `${path}[${k}]` : path ? `${path}.${k}` : String(k)));
  }
  return canonical(a) === canonical(b) ? [] : [{ path: path || "(value)", a, b }];
}

export function summarise(rows) {
  const n = { same: 0, differs: 0, missingA: 0, missingB: 0 };
  for (const r of rows) n[r.status === "missing-A" ? "missingA" : r.status === "missing-B" ? "missingB" : r.status]++;
  return n;
}

/** 0 = every row same and the compare was complete; 1 = something differs or is missing; 2 = the compare was incomplete. */
export function exitCodeOf(rows, warnings) {
  if (rows.some((r) => r.status !== "same")) return 1;
  return warnings.some((w) => w.incomplete) ? 2 : 0;
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function die(msg, code = 2) {
  console.error(msg);
  process.exit(code);
}

export const DIFF_HELP = `cadra agent diff <envA>:<agent>[@release] <envB>:<agent>[@release] [--json] [--fields] [--changes] [--function KEY]... [--no-functions] [--host a=b]...

Read-only. Compares the release bundles of two agents (any two environments), their AI functions and skill files.
  <agent>      numeric id or uuid in that environment's org
  @release     the sealed release id; omitted = the side's deploy-pointer release
  --fields     field-level diff under every differing row
  --changes    hide the rows that are the same (the summary line still counts them)
  --json       one JSON document (rows, summary, warnings) instead of the table
  --function   also compare this AI function key (repeat). Compared by default: every key a skill, tool, role or the
               agent names, and every remix_* function
  --no-functions   skip AI functions. A full function compare (prompt text, system prompt, model, params) needs prompt:read;
               without it the public descriptor is compared on both sides (title, description, output kind, parameters,
               output schema) and the run exits 2 with a warning naming what was not compared
  --host a=b   treat host a as host b in text (repeat); explicit --host always wins. Built in:
               - x-dev.yobolabs.ai / x-dev.cadraos.com read as the prod host
               - each side's own CADRA_<ENV>_API_URL host is one token
               - local-from-dev: when one side is "local" (env name local, or a loopback origin against a deployed one), a
                 tool url on http://127.0.0.1:<port> or localhost:<port> equals the other side's host. The pairing is learned
                 from the mapped objects (same field, same path after the host); a local host that pairs with two different
                 hosts is left alone and shows as differs. Each alias used is printed ("host alias: ...")
               - uuids inside role locks and text read as the object's name (tool, skill, role, agent; a role-only skill
                 or tool reads as the title of its prompt version), so env uuids do not differ
Env: CADRA_<ENV>_API_URL and CADRA_<ENV>_BUILDER_API_KEY per side (same as promote).
Mapping, per kind: same uuid, then the twin map, then exact name.
Row: kind, name, A id@version, B id@version, sha256 A, sha256 B, same | differs | missing-A | missing-B.
Exit: 0 all same, 1 any differ or missing, 2 compare incomplete or error.

Ignored fields (they differ per environment by design; never compared):
  names     ${IGNORED_FIELD_NAMES.join(", ")}
  patterns  any name ending in Id / Ids / Uuid / Uuids / _id / _uuid (credential, provider, connector, harness,
            guardrail, tool ids), any name ending in At / _at (timestamps); modelId (a model name) IS compared
  top level ${IGNORED_TOP_LEVEL.join(", ")} (version counters; shown in the id@version columns)
  text      hosts (see --host)`;

export function parseDiffArgs(argv) {
  const res = { sides: [], json: false, fields: false, changes: false, functions: [], noFunctions: false, hosts: [], help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const val = () => {
      const v = argv[++i];
      if (v === undefined || v.startsWith("--")) die(`${a} needs a value`);
      return v;
    };
    if (a === "--json") res.json = true;
    else if (a === "--fields") res.fields = true;
    else if (a === "--changes") res.changes = true;
    else if (a === "--no-functions") res.noFunctions = true;
    else if (a === "--help" || a === "-h") res.help = true;
    else if (a === "--function") res.functions.push(val());
    else if (a === "--host") {
      const [fromHost, toHost, extra] = val().split("=");
      if (!fromHost || !toHost || extra !== undefined) die("--host takes <hostA>=<hostB>, e.g. app-dev.yobolabs.ai=app.yobolabs.ai");
      res.hosts.push({ fromHost, toHost });
    } else if (a.startsWith("--")) die(`unknown flag for agent diff: ${a}`);
    else res.sides.push(a);
  }
  return res;
}

/** "dev:443@2311" -> {env, agent, release}; release null = the deploy pointer. */
export function parseDiffSide(raw) {
  const m = /^([a-z][a-z0-9_-]*):([^@\s]+)(?:@(\d+))?$/i.exec(raw ?? "");
  if (!m) die(`expected <env>:<agentId|uuid>[@<releaseId>], got "${raw}"`);
  return { env: m[1].toLowerCase(), agent: m[2], release: m[3] ? Number(m[3]) : null };
}

const POINTER_KEYS = ["deployedVersionId", "deployed_version_id", "deployedReleaseId", "liveReleaseId"];

async function loadSide(side, call) {
  const uuid = await uuidOf(call, side.env, side.agent);
  const r = await call("GET", `/agents/${uuid}?includeRelations=false`);
  if (!r.ok) fail(side.env, r);
  const agent = r.data?.agent ?? r.data;
  let release = side.release;
  if (release == null) {
    const key = POINTER_KEYS.find((k) => agent?.[k] != null);
    if (!key)
      die(`(${side.env}) agent ${side.agent}: this server does not return the deploy pointer on GET /agents/{id}. Give the release: ${side.env}:${side.agent}@<releaseId> (the Releases tab shows the live one).`);
    release = Number(agent[key]);
  }
  const b = await call("GET", `/agents/${uuid}/releases/${release}/bundle`);
  if (!b.ok) fail(side.env, b);
  return { uuid, release, bundle: b.data };
}

async function loadTwins(call, uuid, sourceEnv, warnings, label) {
  const t = await call("GET", `/agents/${uuid}/twins?sourceEnv=${encodeURIComponent(sourceEnv)}`);
  if (!t.ok) {
    warnings.push({ message: `twin map unavailable on ${label} (HTTP ${t.status}); mapping uses uuid and name only`, incomplete: false });
    return [];
  }
  return t.data?.twins ?? [];
}

const pagesOf = (r) => (Array.isArray(r.data) ? r.data : r.data?.items ?? r.data?.data ?? []);

/** The discovery index (`ai_function:read`): descriptors only (parameters, output kind, live version, output schema), never prompt text. */
async function listDescriptors(call, env) {
  const r = await call("GET", "/ai-functions");
  if (!r.ok) return null;
  return r.data?.functions ?? [];
}

/** A function compared from its public descriptor alone (when a key cannot read prompts). */
export function descriptorObject(d) {
  return {
    kind: "ai_function", name: d.functionKey, ref: `fn@v${d.liveVersion}`, keys: [], anchor: false, scope: "org",
    content: { title: d.title, description: d.description, outputKind: d.outputKind, parameters: d.parameters, outputSchema: d.outputSchema ?? null, descriptorOnly: true },
  };
}

/** All of an env's AI-function prompts: [{ id, uuid, functionKey, goldenVersionId, title }]; null when unreadable. */
async function listFunctions(call, env) {
  const items = [];
  for (let page = 1; ; page++) {
    const r = await call("GET", `/prompts?page=${page}&pageSize=100`);
    if (!r.ok) return null;
    const rows = pagesOf(r);
    items.push(...rows.filter((x) => x.functionKey));
    if (rows.length < 100) break;
  }
  return items;
}

async function goldenVersion(call, env, item, warnings) {
  const r = await call("GET", `/prompts/${item.uuid}/versions`);
  if (!r.ok) {
    warnings.push({ message: `function ${item.functionKey} (${env}): versions unreadable, HTTP ${r.status}`, incomplete: true });
    return null;
  }
  const versions = r.data?.versions ?? [];
  return versions.find((v) => v.id === item.goldenVersionId) ?? null;
}

function clip(v, n = 110) {
  const s = v === undefined ? "(absent)" : typeof v === "string" ? JSON.stringify(v) : canonical(v);
  return s.length > n ? `${s.slice(0, n)}… (${s.length} chars)` : s;
}

function lineDiff(a, b, max = 6) {
  const la = String(a).split("\n");
  const lb = String(b).split("\n");
  const sa = new Set(la);
  const sb = new Set(lb);
  const out = [];
  const only = (lines, other, sign) => {
    const mine = lines.filter((l) => !other.has(l) && l.trim());
    for (const l of mine.slice(0, max)) out.push(`      ${sign} ${l.length > 140 ? `${l.slice(0, 140)}…` : l}`);
    if (mine.length > max) out.push(`      ${sign} … ${mine.length - max} more line(s)`);
  };
  only(la, sb, "A-only:");
  only(lb, sa, "B-only:");
  return out;
}

function printTable(head, rows, fields, warnings, summary, changesOnly, aliases = []) {
  console.log(head);
  if (changesOnly) rows = rows.filter((r) => r.status !== "same");
  const w = (k, min) => Math.max(min, ...rows.map((r) => String(k(r)).length));
  const cols = [
    ["kind", (r) => r.kind], ["name", (r) => r.name], ["A id@ver", (r) => r.a?.ref ?? "-"], ["B id@ver", (r) => r.b?.ref ?? "-"],
    ["sha A", (r) => r.a?.sha256.slice(0, 12) ?? "-"], ["sha B", (r) => r.b?.sha256.slice(0, 12) ?? "-"], ["status", (r) => r.status],
  ];
  const widths = cols.map(([h, k]) => Math.min(w(k, h.length), h === "name" ? 54 : 40));
  const fmt = (cells) => cells.map((c, i) => String(c).slice(0, widths[i]).padEnd(widths[i])).join("  ").trimEnd();
  console.log(fmt(cols.map(([h]) => h)));
  for (const r of rows) {
    console.log(fmt(cols.map(([, k]) => k(r))));
    if (fields && r.status === "differs")
      for (const d of r.fields ?? []) {
        console.log(`    ${d.path}`);
        if (typeof d.a === "string" && typeof d.b === "string" && (d.a.includes("\n") || d.b.includes("\n"))) {
          console.log(`      (${d.a.length} chars vs ${d.b.length} chars)`);
          for (const l of lineDiff(d.a, d.b)) console.log(l);
        } else {
          console.log(`      A: ${clip(d.a)}`);
          console.log(`      B: ${clip(d.b)}`);
        }
      }
  }
  for (const al of aliases) console.log(`host alias: ${al.from} = ${al.to}  (${al.count} value${al.count === 1 ? "" : "s"})`);
  for (const m of warnings) console.log(`warning: ${m.message}`);
  console.log(`${summary.same} same, ${summary.differs} differ, ${summary.missingA} only in B, ${summary.missingB} only in A`);
}

export async function runDiff(argv) {
  const o = parseDiffArgs(argv);
  if (o.help) {
    console.log(DIFF_HELP);
    return 0;
  }
  if (o.sides.length !== 2) die(`agent diff needs two sides: <envA>:<agent>[@release] <envB>:<agent>[@release]\n\n${DIFF_HELP}`);
  const A = parseDiffSide(o.sides[0]);
  const B = parseDiffSide(o.sides[1]);
  const callA = client(A.env);
  const callB = client(B.env);
  const warnings = [];
  const [sa, sb] = await Promise.all([loadSide(A, callA), loadSide(B, callB)]);

  const originOf = (env) => process.env[`CADRA_${env.toUpperCase().replace(/-/g, "_")}_API_URL`];
  const rules = hostRules({ originA: originOf(A.env), originB: originOf(B.env), hosts: o.hosts });

  const [twinsAB, twinsBA] = await Promise.all([
    loadTwins(callB, sb.uuid, sa.bundle.sourceEnv, warnings, B.env),
    loadTwins(callA, sa.uuid, sb.bundle.sourceEnv, warnings, A.env),
  ]);

  const objsA = extractObjects(sa.bundle);
  const objsB = extractObjects(sb.bundle);

  if (!o.noFunctions) {
    const [fa, fb] = await Promise.all([listFunctions(callA, A.env), listFunctions(callB, B.env)]);
    const text = `${bundleText(sa.bundle)}\n${bundleText(sb.bundle)}`;
    if (fa && fb) {
      const known = new Set([...fa, ...fb].map((x) => x.functionKey));
      const wanted = new Set([...functionKeysNamed(text, known), ...o.functions]);
      for (const [items, call, env, objs] of [[fa, callA, A.env, objsA], [fb, callB, B.env, objsB]]) {
        for (const key of [...wanted].sort()) {
          const item = items.find((x) => x.functionKey === key);
          if (item) objs.push(functionObject(item, await goldenVersion(call, env, item, warnings)));
        }
      }
    } else {
      // A key without prompt:read cannot read prompt text. Compare what the public descriptor shows, on BOTH sides.
      const [da, db] = await Promise.all([listDescriptors(callA, A.env), listDescriptors(callB, B.env)]);
      if (!da || !db) {
        warnings.push({ message: "AI functions not compared: neither GET /prompts (prompt:read) nor GET /ai-functions (ai_function:read) is readable on both sides", incomplete: true });
      } else {
        const known = new Set([...da, ...db].map((x) => x.functionKey));
        const wanted = new Set([...functionKeysNamed(text, known), ...o.functions]);
        for (const [list, objs] of [[da, objsA], [db, objsB]])
          for (const key of [...wanted].sort()) {
            const d = list.find((x) => x.functionKey === key);
            if (d) objs.push(descriptorObject(d));
          }
        warnings.push({
          message: `AI functions compared by public descriptor only (title, description, output kind, parameters, output schema, live version number): the key lacks prompt:read, so prompt text, system prompt, model and params are NOT compared. Mint a key that can read prompts for a full compare.`,
          incomplete: true,
        });
      }
    }
  }

  const pairs = mapObjects(objsA, objsB, { ab: twinsAB, ba: twinsBA });
  const oA = originOf(A.env);
  const oB = originOf(B.env);
  const localA = A.env === "local" || (isLoopbackOrigin(oA) && !isLoopbackOrigin(oB));
  const localB = B.env === "local" || (isLoopbackOrigin(oB) && !isLoopbackOrigin(oA));
  const localSide = localA !== localB ? (localA ? "a" : "b") : null;
  const aliases = localSide ? deriveHostAliases(pairs, localSide, o.hosts.map((h) => h.fromHost)) : [];
  const aliasRules = aliases.length ? [aliasRule(aliases)] : [];
  const sideRules = (own, bundleOf, isLocal) => [...rules.slice(0, o.hosts.length), ...(isLocal ? aliasRules : []), ...rules.slice(o.hosts.length), uuidNameRule(bundleOf)];
  const rows = buildRows(pairs, { rulesA: sideRules(rules, sa.bundle, localSide === "a"), rulesB: sideRules(rules, sb.bundle, localSide === "b") });
  for (const r of rows) if (r.status === "differs") r.fields = fieldDiff(r._na, r._nb);
  const summary = summarise(rows);
  const clean = rows.map(({ _na, _nb, ...r }) => (o.fields || o.json ? r : { ...r, fields: undefined }));
  const head = `DIFF  ${A.env}:${sa.bundle.agent.name}@${sa.release}  vs  ${B.env}:${sb.bundle.agent.name}@${sb.release}  (bundles ${String(sa.bundle.bundleHash).slice(0, 10)} / ${String(sb.bundle.bundleHash).slice(0, 10)})`;
  const code = exitCodeOf(rows, warnings);
  if (o.json) {
    console.log(JSON.stringify({
      a: { env: A.env, agent: sa.bundle.agent.name, release: sa.release, bundleHash: sa.bundle.bundleHash },
      b: { env: B.env, agent: sb.bundle.agent.name, release: sb.release, bundleHash: sb.bundle.bundleHash },
      hostAliases: aliases,
      rows: clean.filter((r) => !o.changes || r.status !== "same").map((r) => (o.fields ? r : { ...r, fields: undefined })), summary, warnings, exitCode: code,
      ignored: { names: IGNORED_FIELD_NAMES, patterns: IGNORED_FIELD_PATTERNS.map(String), topLevel: IGNORED_TOP_LEVEL },
    }, null, 2));
  } else {
    printTable(head, clean, o.fields, warnings, summary, o.changes, aliases);
  }
  return code;
}
