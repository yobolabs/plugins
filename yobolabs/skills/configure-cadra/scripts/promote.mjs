/**
 * promote.mjs — `cadra agent promote` (p151): copy one proven release of an
 * agent from one environment to its twin agent in another, as ONE new release.
 *
 *   cadra agent promote --from dev:443@2227 --to prod:362                 # dry run → plan file
 *   cadra agent promote --from dev:443@2227 --to prod:362 --apply         # write one new release
 *   cadra agent promote ... --apply --deploy                              # also move the pointer
 *   cadra agent promote --from dev:443@2227 --to prod:362 --link          # show / propose twins
 *   cadra agent promote ... --link --apply                                # save exact-name twin matches
 *   cadra agent promote ... --link --apply --host app-dev.yobolabs.ai=app.yobolabs.ai   # + host map
 *
 * Refusals (the server decides; each needs ONE kind:id per flag, no wildcards):
 *   --overwrite kind:id   the target item changed since the last promote (or has no promote history)
 *   --drop kind:id        the target release pins an item the source does not have
 *   --shared-ok agent:id  another target agent not on pinned releases reads an object this writes
 * Flags repeat: --overwrite tool:511 --overwrite skill:371
 *
 * Environments: each side needs its own origin + key, never shared:
 *   CADRA_<ENV>_API_URL           e.g. CADRA_DEV_API_URL=https://app-dev.cadraos.com
 *   CADRA_<ENV>_BUILDER_API_KEY   key of the agent's org in that env (agents:read on the source;
 *                                 agents:read for a dry run (--link also needs tools:read,
 *                                 skills:read, roles:read), + agents:update to apply,
 *                                 + agents:deploy with --deploy, on the target)
 * The bundle travels through this CLI (p151 D1): the target never holds a source key.
 *
 * Every run writes the server's plan to --plan-out (default ./promote-plan-<from>-<to>-<time>.json),
 * so a §2 request can attach it (p151 C2).
 */
import { writeFileSync } from "node:fs";

const KIND_ID_RE = /^[a-z_]+:\d+$/;

function die(msg, code = 1) {
  console.error(msg);
  process.exit(code);
}

export function parsePromoteArgs(argv) {
  const res = { overwrite: [], drop: [], sharedOk: [], hosts: [], apply: false, deploy: false, link: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const val = () => {
      const v = argv[++i];
      if (v === undefined || v.startsWith("--")) die(`${a} needs a value`);
      return v;
    };
    if (a === "--from") res.from = val();
    else if (a === "--to") res.to = val();
    else if (a === "--apply") res.apply = true;
    else if (a === "--deploy") res.deploy = true;
    else if (a === "--link") res.link = true;
    else if (a === "--plan-out") res.planOut = val();
    else if (a === "--overwrite") res.overwrite.push(val());
    else if (a === "--drop") res.drop.push(val());
    else if (a === "--shared-ok") res.sharedOk.push(val());
    else if (a === "--host") {
      const [fromHost, toHost, extra] = val().split("=");
      if (!fromHost || !toHost || extra !== undefined) die("--host takes <sourceHost>=<targetHost>, e.g. app-dev.yobolabs.ai=app.yobolabs.ai");
      res.hosts.push({ fromHost, toHost });
    }
    else die(`unknown flag for agent promote: ${a}`);
  }
  for (const k of [...res.overwrite, ...res.drop, ...res.sharedOk])
    if (!KIND_ID_RE.test(k)) die(`flag value "${k}" must name ONE item as kind:id (e.g. tool:511); no wildcards or lists`);
  if (res.deploy && !res.apply) die("--deploy needs --apply");
  return res;
}

/** "dev:443@2227" → {env:"dev", agent:"443", release:"2227"}; release optional for --to. */
export function parseSide(raw, { needRelease }) {
  const m = /^([a-z][a-z0-9_-]*):([^@\s]+)(?:@(\d+))?$/i.exec(raw ?? "");
  if (!m) die(`expected <env>:<agentId|uuid>${needRelease ? "@<releaseId>" : ""}, got "${raw}"`);
  if (needRelease && !m[3]) die(`--from needs @<releaseId> (the sealed release to promote): "${raw}"`);
  if (!needRelease && m[3]) die(`--to takes no @release; the target release is new: "${raw}"`);
  return { env: m[1].toLowerCase(), agent: m[2], release: m[3] ? Number(m[3]) : null };
}

function client(env) {
  const E = env.toUpperCase().replace(/-/g, "_");
  const base = (process.env[`CADRA_${E}_API_URL`] || "").replace(/\/$/, "");
  const key = process.env[`CADRA_${E}_BUILDER_API_KEY`];
  if (!base || !key)
    die(`env "${env}" needs CADRA_${E}_API_URL and CADRA_${E}_BUILDER_API_KEY (one key per environment).`);
  return async function call(method, path, body) {
    let res;
    try {
      res = await fetch(`${base}/api/v1${path}`, {
        method,
        headers: { Authorization: `Bearer ${key}`, ...(body ? { "Content-Type": "application/json" } : {}) },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
    } catch (e) {
      die(`NETWORK (${env}): cannot reach ${base} — ${e.message}`);
    }
    const json = await res.json().catch(() => null);
    return { status: res.status, ok: res.ok && json?.success !== false, json, data: json && "data" in json ? json.data : json };
  };
}

function fail(env, r) {
  const err = r.json?.error || {};
  die(`HTTP ${r.status} (${env}) ${err.code || ""}: ${err.message || JSON.stringify(r.json)}${err.details ? `\n  details: ${JSON.stringify(err.details, null, 2)}` : ""}`);
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** The v1 item route takes a uuid; a numeric id is found by paging the org's agent list. */
async function uuidOf(call, env, ref) {
  if (UUID.test(ref)) return ref;
  if (!/^\d+$/.test(ref)) die(`(${env}) agent "${ref}": give a numeric id or a uuid`);
  for (let offset = 0; ; offset += 100) {
    const r = await call("GET", `/agents?limit=100&offset=${offset}`);
    if (!r.ok) fail(env, r);
    const rows = Array.isArray(r.data) ? r.data : r.data?.items ?? r.data?.agents ?? r.data?.data ?? [];
    const hit = rows.find((x) => String(x.id) === ref);
    if (hit?.uuid) return hit.uuid;
    if (rows.length < 100) die(`(${env}) agent ${ref} not found in this key's org`);
  }
}

async function resolveAgent(call, env, ref) {
  const uuid = await uuidOf(call, env, ref);
  const r = await call("GET", `/agents/${uuid}?includeRelations=false`);
  if (!r.ok) fail(env, r);
  const a = r.data?.agent ?? r.data;
  if (!a?.uuid) die(`(${env}) agent ${ref}: no uuid in the response`);
  return { id: a.id, uuid: a.uuid, name: a.name };
}

function summarise(plan) {
  const lines = [];
  const items = plan?.items ?? [];
  const by = {};
  for (const it of items) (by[it.outcome] ??= []).push(`${it.kind}:${it.targetSubjectId ?? it.sourceKey ?? "?"}`);
  for (const [k, v] of Object.entries(by)) lines.push(`  ${k.padEnd(12)} ${v.length}${k === "reuse" ? "" : `  ${v.join(" ")}`}`);
  for (const b of plan?.blockers ?? []) lines.push(`  REFUSED     ${b.code}  ${b.item}  — ${b.message}`);
  for (const n of plan?.info ?? []) lines.push(`  info        ${n.code}  ${n.item}  — ${n.message}`);
  if (plan?.releaseDiff) lines.push(`  release     ${JSON.stringify(plan.releaseDiff)}`);
  return lines.join("\n");
}

export async function runPromote(argv) {
  const o = parsePromoteArgs(argv);
  const from = parseSide(o.from, { needRelease: true });
  const to = parseSide(o.to, { needRelease: false });
  if (from.env === to.env && from.agent === to.agent) die("--from and --to are the same agent");
  const src = client(from.env);
  const dst = client(to.env);

  const srcAgent = await resolveAgent(src, from.env, from.agent);
  const dstAgent = await resolveAgent(dst, to.env, to.agent);

  const b = await src("GET", `/agents/${srcAgent.uuid}/releases/${from.release}/bundle`);
  if (!b.ok) fail(from.env, b);
  const bundle = b.data;

  if (o.link) return link({ o, to, dst, dstAgent, bundle });

  // The v1 agent read does not carry the deployed pointer. The dry run returns the target's
  // current pointer (plan.target.deployedVersionId); an apply names exactly that pointer, so a
  // move by anyone in between is refused (409 RELEASE_MOVED), never overwritten.
  let expectedFromId;
  if (o.apply) {
    const pre = await dst("POST", `/agents/${dstAgent.uuid}/promotions`, { bundle, dryRun: true, deploy: false, overwrite: o.overwrite, drop: o.drop, sharedOk: o.sharedOk });
    if (!pre.ok) fail(to.env, pre);
    const t = pre.data?.plan?.target ?? pre.data?.target;
    if (!t || !("deployedVersionId" in t)) die(`(${to.env}) the dry run did not return the target's deployed pointer; not applying`);
    expectedFromId = t.deployedVersionId;
  }
  const body = {
    bundle,
    dryRun: !o.apply,
    deploy: o.deploy,
    ...(o.apply ? { expectedFromId } : {}),
    overwrite: o.overwrite,
    drop: o.drop,
    sharedOk: o.sharedOk,
  };
  const r = await dst("POST", `/agents/${dstAgent.uuid}/promotions`, body);
  const plan = r.ok ? r.data?.plan ?? r.data ?? null : r.json?.error?.details ?? null;
  const file =
    o.planOut ?? `promote-plan-${from.env}-${from.agent}@${from.release}-${to.env}-${to.agent}-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(file, JSON.stringify({ from: o.from, to: o.to, request: { ...body, bundle: { bundleHash: bundle.bundleHash } }, status: r.status, result: r.json }, null, 2));

  const head = `${o.apply ? (o.deploy ? "APPLY+DEPLOY" : "APPLY") : "DRY RUN"}  ${from.env}:${srcAgent.name}@${from.release} → ${to.env}:${dstAgent.name}  (bundle ${String(bundle.bundleHash).slice(0, 12)})`;
  console.log(head);
  console.log(summarise(plan));
  console.log(`plan → ${file}`);
  if (!r.ok) {
    if (r.json?.error?.code === "PROMOTION_BLOCKED")
      die("refused: port each item to the source first, or name it with --overwrite / --drop / --shared-ok (one kind:id each).", 2);
    fail(to.env, r);
  }
  if (o.apply && r.data?.release) console.log(`release ${r.data.release.id} (v${r.data.release.version})${o.deploy ? " deployed" : " — not deployed; move the pointer with deploy-pointer"}`);
}

async function link({ o, to, dst, dstAgent, bundle }) {
  const t = await dst("GET", `/agents/${dstAgent.uuid}/twins?sourceEnv=${encodeURIComponent(bundle.sourceEnv)}`);
  if (!t.ok) fail(to.env, t);
  const twins = new Set((t.data?.twins ?? []).map((x) => `${x.kind}\u0000${x.sourceKey}`));
  const PIN_TWIN = { tool: "tool", skill: "skill", role_lock: "role", harness: "harness", team_harness: "harness", delegate: "agent" };
  const LIST = { tool: "/tools", skill: "/skills", role: "/roles", agent: "/agents" };
  const want = new Map();
  const add = (kind, key, name) => key && !twins.has(`${kind}\u0000${key}`) && !want.has(`${kind}\u0000${key}`) && want.set(`${kind}\u0000${key}`, { kind, sourceKey: key, name });
  add("agent", bundle.agent.uuid, bundle.agent.name);
  for (const p of bundle.pins) if (p.scope !== "platform") add(PIN_TWIN[p.kind], p.subjectUuid ?? String(p.subjectId), p.name);
  for (const r of [...(bundle.agent.envRefs ?? []), ...bundle.pins.flatMap((p) => p.envRefs ?? [])]) add(r.kind, r.sourceKey, r.name);

  const CREATABLE = new Set(["tool", "skill", "role"]);
  const proposals = [];
  const created = [];
  const unmatched = [];
  for (const w of want.values()) {
    if (w.kind === "agent" && w.sourceKey === bundle.agent.uuid) {
      proposals.push({ kind: "agent", sourceKey: w.sourceKey, targetId: dstAgent.id, name: dstAgent.name, how: "--to" });
      continue;
    }
    const path = LIST[w.kind];
    if (w.kind === "model_provider") {
      // Provider keys are name-keyed per org; propose the same name (a platform provider like
      // "cadra" is identical everywhere). A different prod key name is set by hand.
      proposals.push({ kind: w.kind, sourceKey: w.sourceKey, targetKey: w.sourceKey, name: w.name, how: "same provider name" });
      continue;
    }
    if (!path) {
      unmatched.push(w);
      continue;
    }
    const r = await dst("GET", `${path}?search=${encodeURIComponent(w.name)}&limit=50`);
    // A failed list (403 without tools:read / skills:read) must stop the run: read as "no
    // same-name row" it proposes creating a duplicate of every prod tool and skill.
    if (!r.ok) fail(to.env, r);
    const rows = Array.isArray(r.data) ? r.data : r.data?.items ?? r.data?.data ?? Object.values(r.data ?? {}).find(Array.isArray) ?? [];
    const exact = rows.filter((x) => (x.name ?? x.title) === w.name);
    if (exact.length === 1) proposals.push({ kind: w.kind, sourceKey: w.sourceKey, targetId: exact[0].id, name: w.name, how: "exact name" });
    else if (exact.length === 0 && CREATABLE.has(w.kind)) created.push(w);
    else unmatched.push({ ...w, candidates: exact.length });
  }
  console.log(`LINK  ${bundle.sourceEnv} → ${to.env}:${dstAgent.name}   twins present ${twins.size}, missing ${want.size}`);
  for (const p of proposals) console.log(`  match   ${p.kind}:${p.sourceKey} → ${p.targetId ?? p.targetKey}  (${p.how}: ${p.name})`);
  for (const c of created) console.log(`  new     ${c.kind}:${c.sourceKey}  "${c.name}" — no same-name target; the promote creates it and records the twin`);
  for (const u of unmatched) console.log(`  CONFIRM ${u.kind}:${u.sourceKey}  "${u.name}"${u.candidates ? `  (${u.candidates} same-name rows)` : ""} — set by hand: PUT /agents/{id}/twins`);
  if (!o.apply) return console.log("dry run: nothing saved (add --apply to save the matches above).");
  if (!proposals.length && !o.hosts.length) return console.log("nothing to save.");
  const r = await dst("PUT", `/agents/${dstAgent.uuid}/twins`, {
    sourceEnv: bundle.sourceEnv,
    twins: proposals.map(({ kind, sourceKey, targetId, targetKey }) => ({ kind, sourceKey, ...(targetKey ? { targetKey } : { targetId }) })),
    hostMaps: o.hosts,
  });
  if (!r.ok) fail(to.env, r);
  console.log(`saved ${proposals.length} twins, ${o.hosts.length} host maps.`);
}
