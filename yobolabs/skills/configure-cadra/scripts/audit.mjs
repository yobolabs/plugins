#!/usr/bin/env node
/**
 * audit.mjs — structural audit of an org's CadraOS agents, roles, tools and teams.
 *
 * Reads only. Never writes. Answers "is this configuration sound?" — the question
 * `cadra <entity> list` cannot.
 *
 * The routing checks MIRROR cadra-web's own publish-time lint
 * (src/extensions/agents/lib/routing-mitigation.ts) so a finding here is the same
 * finding the platform reports: identical section markers, identical stopword list,
 * identical Jaccard threshold (0.5), identical text canonicalization. Where this file
 * diverges from that module, that module wins — re-mirror it.
 *
 * Usage:
 *   node audit.mjs [--json] [--limit N] [--only <check,check>] [--budget-tokens N]
 *
 *   --json            machine-readable report instead of the text one
 *   --limit N         records fetched per entity (default 100)
 *   --only a,b        run only the named checks (see CHECKS below)
 *   --budget-tokens N static-prompt budget per agent in tokens (default 5000)
 *
 * Env: CADRA_BUILDER_API_KEY, CADRA_API_URL — same as cadra.mjs.
 *
 * Exit code: 0 if no ERROR-severity findings, 1 otherwise. WARN never fails the run,
 * so this is safe as a CI gate.
 */
import { readFileSync } from "node:fs";

const KEY = process.env.CADRA_BUILDER_API_KEY;
const BASE = (process.env.CADRA_API_URL || "http://localhost:3000").replace(/\/$/, "");

const CHECKS = [
  "role-description",   // when-to-use + NOT-for discipline (platform gate)
  "role-overlap",       // pairwise when-to-use similarity — routing confusion
  "role-spawnable",     // roles that will never appear in the spawn menu
  "prompt-budget",      // static prompt + tool surface vs the latency budget
  "tool-legibility",    // can the model tell when to call this tool?
  "agent-capability",   // agents that cannot do anything
  "duplicate-names",    // two records the model must disambiguate by name
  "model-resolvable",   // agent's provider actually configured in this org
];

// ---------------------------------------------------------------------------
// args
// ---------------------------------------------------------------------------
const argv = process.argv.slice(2);
const flag = (n, d) => {
  const i = argv.indexOf(`--${n}`);
  return i === -1 ? d : argv[i + 1];
};
const has = (n) => argv.includes(`--${n}`);

const LIMIT = Number(flag("limit", 100));
const BUDGET_TOKENS = Number(flag("budget-tokens", 5000));
const ONLY = flag("only", null)?.split(",").map((s) => s.trim()).filter(Boolean) ?? null;
const JSON_OUT = has("json");

if (has("help") || has("h")) {
  console.log(readFileSync(new URL(import.meta.url).pathname, "utf8").split("*/")[0].replace(/^#![^\n]*\n/, ""));
  console.log("Checks: " + CHECKS.join(", "));
  process.exit(0);
}

const enabled = (name) => !ONLY || ONLY.includes(name);

// ---------------------------------------------------------------------------
// api
// ---------------------------------------------------------------------------
async function api(path) {
  if (!KEY) {
    console.error("ERROR: CADRA_BUILDER_API_KEY is not set.");
    process.exit(1);
  }
  const res = await fetch(`${BASE}/api/v1${path}`, {
    headers: { Authorization: `Bearer ${KEY}` },
  }).catch((e) => {
    console.error(`NETWORK: cannot reach ${BASE} — ${e.message}`);
    process.exit(1);
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || json?.success === false) return null; // absent route / no permission — degrade
  return json && "data" in json ? json.data : json;
}

function itemsOf(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  for (const v of Object.values(payload)) if (Array.isArray(v)) return v;
  return [];
}

// ---------------------------------------------------------------------------
// findings
// ---------------------------------------------------------------------------
const findings = [];
const add = (severity, check, subject, message, fix) =>
  findings.push({ severity, check, subject, message, fix });

// ---------------------------------------------------------------------------
// MIRRORED FROM cadra-web routing-mitigation.ts — keep byte-aligned
// ---------------------------------------------------------------------------
const WHEN_MARKER = /(?:when to use|use when|use this role when|use for)\s*:?\s*/i;
const NOTFOR_MARKER = /(?:not for|do not use|never use|avoid using|not to be used(?: for)?)\s*:?\s*/i;
const OVERLAP_SIMILARITY_THRESHOLD = 0.5;
const OVERLAP_STOPWORDS = new Set([
  "the", "and", "for", "our", "with", "from", "that", "this", "when", "not",
  "use", "into", "your", "you", "are", "all", "any", "role",
]);

function canonicalizeText(text) {
  return String(text ?? "")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/g, ""))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function sectionAfter(text, marker, until) {
  const m = marker.exec(text);
  if (!m) return null;
  const rest = text.slice(m.index + m[0].length);
  const stop = until ? until.exec(rest) : null;
  const body = (stop ? rest.slice(0, stop.index) : rest).trim();
  return body.length ? body : null;
}

function parseRoleDescription(description) {
  const text = description ?? "";
  return {
    whenToUse: sectionAfter(text, WHEN_MARKER, NOTFOR_MARKER),
    notFor: sectionAfter(text, NOTFOR_MARKER, null),
  };
}

function overlapTokens(text) {
  return new Set(
    canonicalizeText(text)
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((t) => t.length >= 3 && !OVERLAP_STOPWORDS.has(t))
  );
}

function jaccard(a, b) {
  if (a.size === 0 && b.size === 0) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter += 1;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

/** Crude but stable token estimate. Good enough to spot a budget blow-out. */
const estTokens = (s) => Math.ceil(String(s ?? "").length / 4);

// ---------------------------------------------------------------------------
// checks
// ---------------------------------------------------------------------------
function checkRoleDescriptions(roles) {
  for (const r of roles) {
    const { whenToUse, notFor } = parseRoleDescription(r.description);
    const missing = [];
    if (!whenToUse) missing.push("when-to-use");
    if (!notFor) missing.push("NOT-for");
    if (missing.length) {
      add(
        "ERROR",
        "role-description",
        `role/${r.name}`,
        `description is missing: ${missing.join(" + ")}`,
        'Write "When to use: <the cases this role owns>. Not for: <the neighbouring cases it must decline>." Without both, the platform\'s publish gate fails and the router has nothing to discriminate on.'
      );
    }
  }
}

function checkRoleOverlap(roles) {
  const parsed = roles.map((r) => ({
    name: r.name,
    tokens: overlapTokens(parseRoleDescription(r.description).whenToUse ?? ""),
  }));
  for (let i = 0; i < parsed.length; i += 1) {
    for (let j = i + 1; j < parsed.length; j += 1) {
      const sim = jaccard(parsed[i].tokens, parsed[j].tokens);
      if (sim >= OVERLAP_SIMILARITY_THRESHOLD) {
        add(
          "ERROR",
          "role-overlap",
          `role/${parsed[i].name} ↔ role/${parsed[j].name}`,
          `when-to-use similarity ${sim.toFixed(2)} ≥ ${OVERLAP_SIMILARITY_THRESHOLD}`,
          "Reword so each names cases the other explicitly declines. Two roles the router cannot tell apart is the single most common cause of a mega-agent picking the wrong one."
        );
      }
    }
  }
}

function checkRoleSpawnable(roles) {
  for (const r of roles) {
    if (r.agentType !== "ROLE") {
      add(
        "WARN",
        "role-spawnable",
        `role/${r.name}`,
        `agentType is "${r.agentType}" — this is a starter config, not a product role`,
        'Set agentType:"ROLE" if a team should be able to spawn it. SPECIALIST/ORCHESTRATOR rows never appear in the role library or the spawn menu.'
      );
    }
  }
}

function checkPromptBudget(agents, toolsById) {
  for (const a of agents) {
    const instructionTokens = estTokens(a.systemInstruction);
    const grantedTools = Array.isArray(a.tools) ? a.tools : [];
    const toolTokens = grantedTools.reduce((sum, t) => {
      const tool = t.tool ?? toolsById.get(t.toolId) ?? {};
      return sum + estTokens(tool.description) + estTokens(tool.agentInstructions) + 40;
    }, 0);
    const total = instructionTokens + toolTokens;

    if (total > BUDGET_TOKENS) {
      add(
        total > BUDGET_TOKENS * 2 ? "ERROR" : "WARN",
        "prompt-budget",
        `agent/${a.name}`,
        `static surface ≈ ${total} tokens (instruction ${instructionTokens} + ${grantedTools.length} tools ≈ ${toolTokens}) vs budget ${BUDGET_TOKENS}`,
        "Move capability behind spawned roles instead of granting every tool to one agent. The static prefix is sent on every call; past the budget you pay it in latency on each turn and in routing accuracy as the tool list grows."
      );
    }
  }
}

function checkToolLegibility(tools) {
  for (const t of tools) {
    if (!t.description && !t.agentInstructions) {
      add(
        "ERROR",
        "tool-legibility",
        `tool/${t.name}`,
        "has neither description nor agentInstructions",
        "The model chooses tools from these strings alone. A tool with no prose is a tool that never gets called, or gets called at random."
      );
      continue;
    }
    if (!t.agentInstructions) {
      add(
        "WARN",
        "tool-legibility",
        `tool/${t.name}`,
        "no agentInstructions (call-time policy)",
        "State when to call it, when NOT to, and what to do when it errors. This is the tool-level equivalent of a role's NOT-for section."
      );
    }
  }
}

function checkAgentCapability(agents) {
  for (const a of agents) {
    const tools = Array.isArray(a.tools) ? a.tools.length : 0;
    const skills = Array.isArray(a.skills) ? a.skills.length : 0;
    if (tools === 0 && skills === 0 && a.agentType !== "ORCHESTRATOR") {
      add(
        "WARN",
        "agent-capability",
        `agent/${a.name}`,
        "specialist with no tools and no skills",
        "It can only talk. Grant capability, convert it to a role, or delete it."
      );
    }
    if (!a.systemInstruction) {
      add(
        "ERROR",
        "agent-capability",
        `agent/${a.name}`,
        "no systemInstruction",
        "Undefined behaviour — the agent has no brief at all."
      );
    }
  }
}

function checkDuplicateNames(kind, records, nameField = "name") {
  const seen = new Map();
  for (const r of records) {
    const key = String(r[nameField] ?? "").trim().toLowerCase();
    if (!key) continue;
    seen.set(key, (seen.get(key) ?? 0) + 1);
  }
  for (const [name, count] of seen) {
    if (count > 1) {
      add(
        "WARN",
        "duplicate-names",
        `${kind}/${name}`,
        `${count} records share this name`,
        "Ambiguous for both the model and `apply` (which refuses rather than guess). Rename."
      );
    }
  }
}

/**
 * KNOWN BLIND SPOT — read before trusting a clean result here.
 *
 * `/api/v1/providers` returns no org-scope field (no orgId, no scope), so this
 * check cannot tell an ORG-SCOPED provider from a PLATFORM-WIDE one. It catches
 * only the loud case: a provider available nowhere.
 *
 * It CANNOT catch the quiet one — an agent that resolves solely through the
 * platform-wide key. Such an agent runs today, but on the platform's key rather
 * than the org's: usage bills to the platform, and it stops the day that
 * fallback closes. No agent should be in that state.
 *
 * The in-app assistant's `audit_configuration` reads the provider rows directly,
 * so it DOES report that case (as an error, skipping the assistant itself, which
 * is the one sanctioned consumer of the platform key). For provider verdicts,
 * that audit is authoritative and this one is a subset.
 */
function checkModelResolvable(agents, providers) {
  if (!providers.length) return; // no providers:read — cannot judge
  const known = new Set(
    providers.flatMap((p) => [p.type, p.name, p.slug].filter(Boolean).map((s) => String(s).toLowerCase()))
  );
  for (const a of agents) {
    const p = String(a.modelProvider ?? "").toLowerCase();
    if (p && !known.has(p)) {
      add(
        "ERROR",
        "model-resolvable",
        `agent/${a.name}`,
        `modelProvider "${a.modelProvider}" matches no provider available to this org`,
        'At run time this resolves to no API key — the execution can stick at "running" with 0 iterations rather than failing loudly. NOTE: a clean result here does NOT prove every agent is on your own key; this API cannot see platform-wide providers. Ask the in-app assistant to "audit my agents" for that.'
      );
    }
  }
}

// ---------------------------------------------------------------------------
// run
// ---------------------------------------------------------------------------
const [agentsRaw, rolesRaw, toolsRaw, teamsRaw, providersRaw] = await Promise.all([
  api(`/agents?limit=${LIMIT}`),
  api(`/roles?limit=${LIMIT}`),
  api(`/tools?limit=${LIMIT}`),
  api(`/teams?limit=${LIMIT}`),
  api(`/providers?limit=${LIMIT}`),
]);

const agentSummaries = itemsOf(agentsRaw);
const roles = itemsOf(rolesRaw);
const tools = itemsOf(toolsRaw);
const teams = itemsOf(teamsRaw);
const providers = itemsOf(providersRaw);

if (rolesRaw == null) {
  add(
    "WARN",
    "role-description",
    "api/roles",
    "/api/v1/roles is unavailable on this origin",
    "Role checks were skipped. The origin predates the roles REST routes — see SKILL.md → Server requirements."
  );
}

// List payloads are summaries; the per-agent grants live on the full record.
const agents = [];
for (const s of agentSummaries) {
  const full = await api(`/agents/${s.uuid ?? s.id}`);
  agents.push(full?.agent ?? full ?? s);
}
const toolsById = new Map(tools.map((t) => [t.id, t]));

if (enabled("role-description")) checkRoleDescriptions(roles);
if (enabled("role-overlap")) checkRoleOverlap(roles);
if (enabled("role-spawnable")) checkRoleSpawnable(roles);
if (enabled("prompt-budget")) checkPromptBudget(agents, toolsById);
if (enabled("tool-legibility")) checkToolLegibility(tools);
if (enabled("agent-capability")) checkAgentCapability(agents);
if (enabled("duplicate-names")) {
  checkDuplicateNames("agent", agents);
  checkDuplicateNames("role", roles);
  checkDuplicateNames("tool", tools);
}
if (enabled("model-resolvable")) checkModelResolvable(agents, providers);

// ---------------------------------------------------------------------------
// report
// ---------------------------------------------------------------------------
const errors = findings.filter((f) => f.severity === "ERROR");
const warns = findings.filter((f) => f.severity === "WARN");

if (JSON_OUT) {
  console.log(
    JSON.stringify(
      {
        origin: BASE,
        counts: { agents: agents.length, roles: roles.length, tools: tools.length, teams: teams.length },
        summary: { errors: errors.length, warnings: warns.length },
        findings,
      },
      null,
      2
    )
  );
} else {
  console.log(`CadraOS configuration audit — ${BASE}`);
  console.log(
    `scanned: ${agents.length} agents · ${roles.length} roles · ${tools.length} tools · ${teams.length} teams\n`
  );
  if (!findings.length) console.log("No findings.");
  for (const group of CHECKS) {
    const hits = findings.filter((f) => f.check === group);
    if (!hits.length) continue;
    const errs = hits.filter((h) => h.severity === "ERROR").length;
    console.log(`── ${group} — ${errs} error(s), ${hits.length - errs} warning(s)`);
    // The fix is a property of the CHECK, not of each row. Print the distinct
    // fixes once; repeating them per subject buries the subject list.
    for (const fix of [...new Set(hits.map((h) => h.fix))]) console.log(`   → ${fix}`);
    console.log("");
    for (const f of hits) console.log(`   [${f.severity}] ${f.subject} — ${f.message}`);
    console.log("");
  }
  console.log(`${errors.length} error(s), ${warns.length} warning(s)`);
}

process.exit(errors.length ? 1 : 0);
