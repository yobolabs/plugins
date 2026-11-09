// `cadra agent diff`: mapper, hashing, ignored fields, rows, and the CLI against two stub origins
// started in this process (no network beyond localhost). Run from the repo root:
//   node --test yobolabs/tests/*.test.mjs
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  buildRows, bundleText, canonical, exitCodeOf, extractObjects, fieldDiff, functionKeysNamed, functionObject,
  descriptorObject, hostRules, mapObjects, normalise, uuidNameRule, parseDiffArgs, parseDiffSide, sha256, summarise,
} from "../skills/configure-cadra/scripts/diff.mjs";

const CLI = fileURLToPath(new URL("../skills/configure-cadra/scripts/cadra.mjs", import.meta.url));
const U = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

// ---- fixture bundles ------------------------------------------------------------------------------

function bundle({ env = "dev", orgId = 36, agentId = 443, releaseId = 2311, version = 77, instruction = "You are the Remix root.", extra = {} } = {}) {
  return {
    format: "cadra.agent-bundle/v1", sourceEnv: env, sourceOrgId: orgId,
    agent: {
      id: agentId, uuid: U(1), name: "Remix root", envRefs: [{ kind: "model_provider", sourceKey: "cadra", name: "cadra" }], snapshot: {},
      fields: { name: "Remix root", systemInstruction: instruction, modelProvider: "cadra", modelId: "anthropic/claude-x", temperature: 0.2, guardrailProfileId: 9 + orgId, harnessId: 5 + orgId, taskTypes: ["a"] },
    },
    release: { id: releaseId, version, sealedAt: `2026-11-0${orgId % 9}T00:00:00Z` },
    channelProfile: { messages: { hello: "Hi" } },
    pins: [
      {
        kind: "tool", source: "native", subjectId: 500 + orgId, subjectUuid: U(10), name: "remix_tool", versionId: 900 + orgId, scope: "org",
        contentHash: `h${orgId}`, envRefs: [], content: { name: "remix_tool", description: "Remix tool", connectorId: orgId, endpoints: [{ url: `https://app-${env === "dev" ? "dev." : ""}yobolabs.ai/api/remix`, method: "POST" }], credentialRef: { $ref: "secret", name: "remix key" } },
      },
      {
        kind: "skill", source: "native", subjectId: 600 + orgId, subjectUuid: U(11), name: "Remix skill", versionId: 700 + orgId, scope: "org", contentHash: "x", envRefs: [],
        content: { name: "Remix skill", instructions: "Do the remix.", version: orgId, files_manifest: [{ path: "storyboard.md", sha256: "a".repeat(64), kind: "text", chars: 10, ...extra.manifest }] },
      },
      {
        kind: "role_lock", source: "wear", subjectId: 30 + orgId, subjectUuid: U(12), name: "Remix Storyboard", versionId: 40 + orgId, scope: "org", contentHash: "x", envRefs: [],
        content: {
          lock: { method: { promptVersionRef: `pv_${U(20 + orgId)}` }, toolId: 7 + orgId, modelId: "m1" }, version: 3 + orgId, canonicalHash: `c${orgId}`,
          prompts: { [`pv_${U(20 + orgId)}`]: { title: "Storyboard method", content: "Draw it.", systemPrompt: null, variables: [] } },
        },
      },
      { kind: "delegate", source: "agent", subjectId: 1, subjectUuid: U(99), name: "delegate", versionId: 1, scope: "org", contentHash: "x", envRefs: [], content: { delegateAgentUuid: U(99) } },
    ],
    delegates: [],
    bundleHash: `bundle${orgId}`,
  };
}

const rowsOf = (a, b, opts = {}) => buildRows(mapObjects(extractObjects(a), extractObjects(b), opts.twins), { rules: opts.rules ?? hostRules() });

// ---- hashing + ignored fields -----------------------------------------------------------------

test("canonical hashing ignores key order", () => {
  assert.equal(sha256({ b: 1, a: { d: [1, 2], c: null } }), sha256({ a: { c: null, d: [1, 2] }, b: 1 }));
  assert.notEqual(sha256({ a: 1 }), sha256({ a: 2 }));
});

test("ids, uuids, timestamps, credential/provider ids are dropped; modelId is kept; top-level version dropped", () => {
  const n = normalise({
    id: 1, uuid: "u", orgId: 3, createdAt: "t", sealedAt: "t", connectorId: 4, authCredentialId: 5, providerId: 6, guardrailProfileIds: [1], knowledgeBaseUuids: ["k"],
    modelId: "gpt", fallbackModelId: "g2", version: 9, nested: { version: "v1", toolId: 3, keep: "x" }, envRefs: [{}], canonicalHash: "h",
  });
  assert.deepEqual(n, { modelId: "gpt", fallbackModelId: "g2", nested: { version: "v1", keep: "x" } });
});

test("hosts: x-dev hosts read as prod, own origins are one token, --host pairs map", () => {
  const rules = hostRules({ originA: "http://localhost:3000", originB: "https://app-dev.cadraos.com", hosts: [{ fromHost: "old.example", toHost: "new.example" }] });
  const n = normalise({ u: "https://app-dev.yobolabs.ai/x and http://localhost:3000/y and https://app-dev.cadraos.com/z old.example" }, rules);
  assert.equal(n.u, "https://app.yobolabs.ai/x and http://<origin>/y and https://<origin>/z new.example");
});

// ---- extraction -------------------------------------------------------------------------------

test("a bundle becomes agent, channel profile, tool, skill, skill file, role lock and prompt rows (delegate pins are not rows)", () => {
  const objs = extractObjects(bundle());
  assert.deepEqual(objs.map((o) => o.kind).sort(), ["agent", "channel_profile", "prompt_version", "role_lock", "skill", "skill_file", "tool"]);
  const lock = objs.find((o) => o.kind === "role_lock");
  assert.match(JSON.stringify(lock.content.lock), /pv:Storyboard method/); // env-specific pv uuid replaced by the prompt title
  assert.doesNotMatch(JSON.stringify(lock.content.lock), /pv_0000/);
  assert.equal(objs.find((o) => o.kind === "skill_file").name, "Remix skill/storyboard.md");
  assert.equal(objs.find((o) => o.kind === "agent").ref, "443@2311");
});

// ---- mapper -----------------------------------------------------------------------------------

test("mapper: same uuid first, then twin map, then exact name; anchors pair regardless of name", () => {
  const mk = (kind, name, keys, anchor = false) => ({ kind, name, ref: "1@1", keys, anchor, scope: "org", content: {} });
  const A = [mk("agent", "Root A", [U(1)], true), mk("tool", "t-uuid", [U(5), "11"]), mk("tool", "t-twin", [U(6), "12"]), mk("tool", "same name", [U(7), "13"]), mk("tool", "only A", [U(8), "14"])];
  const B = [mk("agent", "Root B", [U(2)], true), mk("tool", "renamed", [U(5), "21"]), mk("tool", "twin target", [U(9), "22"]), mk("tool", "same name", [U(10), "23"]), mk("tool", "only B", [U(11), "24"])];
  const pairs = mapObjects(A, B, { ab: [{ kind: "tool", sourceKey: U(6), targetId: 22 }] });
  const via = Object.fromEntries(pairs.filter((p) => p.a && p.b).map((p) => [p.a.name, `${p.b.name}:${p.via}`]));
  assert.deepEqual(via, { "Root A": "Root B:root", "t-uuid": "renamed:uuid", "t-twin": "twin target:twin", "same name": "same name:name" });
  assert.equal(pairs.filter((p) => !p.b).map((p) => p.a.name).join(), "only A");
  assert.equal(pairs.filter((p) => !p.a).map((p) => p.b.name).join(), "only B");
});

test("mapper: twins stored on A (reverse direction) also pair", () => {
  const mk = (name, keys) => ({ kind: "skill", name, ref: "1@1", keys, anchor: false, scope: "org", content: {} });
  const pairs = mapObjects([mk("a1", [U(1), "31"])], [mk("b1", [U(2), "32"])], { ba: [{ kind: "skill", sourceKey: U(2), targetId: 31 }] });
  assert.equal(pairs.length, 1);
  assert.equal(pairs[0].via, "twin");
});

test("mapper: one-to-one, a duplicate name pairs once", () => {
  const mk = (keys) => ({ kind: "tool", name: "dup", ref: "1@1", keys, anchor: false, scope: "org", content: {} });
  const pairs = mapObjects([mk([U(1)]), mk([U(2)])], [mk([U(3)])]);
  assert.equal(pairs.filter((p) => p.a && p.b).length, 1);
  assert.equal(pairs.length, 2);
});

// ---- rows -------------------------------------------------------------------------------------

test("two dev copies with different ids/orgs/timestamps/hosts are all 'same'", () => {
  const rows = rowsOf(bundle({ env: "dev", orgId: 36, agentId: 443, releaseId: 2311, version: 77 }), bundle({ env: "dev", orgId: 4, agentId: 362, releaseId: 2315, version: 12 }));
  assert.deepEqual(rows.map((r) => r.status), rows.map(() => "same"));
  assert.equal(exitCodeOf(rows, []), 0);
  assert.ok(rows.every((r) => r.a.sha256 === r.b.sha256));
});

test("a changed system instruction and a changed skill file differ; everything else stays same", () => {
  const a = bundle({ instruction: "You are the Remix root." });
  const b = bundle({ instruction: "You are the Remix root.\nSplit the storyboard first.", extra: { manifest: { sha256: "b".repeat(64) } } });
  const rows = rowsOf(a, b);
  const differs = rows.filter((r) => r.status === "differs").map((r) => `${r.kind}:${r.name}`);
  assert.deepEqual(differs.sort(), ["agent:Remix root", "skill_file:Remix skill/storyboard.md"]);
  assert.equal(exitCodeOf(rows, []), 1);
  const agent = rows.find((r) => r.kind === "agent");
  const f = fieldDiff(agent._na, agent._nb);
  assert.deepEqual(f.map((d) => d.path), ["systemInstruction"]);
  assert.match(f[0].b, /Split the storyboard/);
});

test("a prompt-version text change shows on the prompt row, not on the role lock row", () => {
  const a = bundle();
  const b = bundle();
  b.pins.find((p) => p.kind === "role_lock").content.prompts[`pv_${U(56)}`].content = "Draw it, then split it.";
  const rows = rowsOf(a, b);
  assert.equal(rows.find((r) => r.kind === "prompt_version").status, "differs");
  assert.equal(rows.find((r) => r.kind === "role_lock").status, "same");
});

test("an object only on one side is missing-A / missing-B; local-only prompts do not hide differences", () => {
  const a = bundle();
  const b = bundle();
  b.pins = b.pins.filter((p) => p.kind !== "tool");
  a.pins.push({ kind: "tool", source: "native", subjectId: 9, subjectUuid: U(77), name: "extra", versionId: 1, scope: "org", contentHash: "x", envRefs: [], content: { name: "extra" } });
  const rows = rowsOf(a, b);
  assert.deepEqual(rows.filter((r) => r.status === "missing-B").map((r) => r.name).sort(), ["extra", "remix_tool"]);
  const only = rowsOf(b, a);
  assert.deepEqual(only.filter((r) => r.status === "missing-A").map((r) => r.name).sort(), ["extra", "remix_tool"]);
  assert.deepEqual(summarise(rows), { same: rows.length - 2, differs: 0, missingA: 0, missingB: 2 });
});

test("exit code: 0 same, 1 any differ, 2 incomplete compare with no difference", () => {
  const same = [{ status: "same" }];
  assert.equal(exitCodeOf(same, []), 0);
  assert.equal(exitCodeOf(same, [{ message: "x", incomplete: true }]), 2);
  assert.equal(exitCodeOf([{ status: "differs" }], [{ incomplete: true }]), 1);
  assert.equal(exitCodeOf(same, [{ message: "twin", incomplete: false }]), 0);
});

test("array diff: an item removed lists that item, it does not shift every index", () => {
  const d = fieldDiff({ tools: ["a", "b", "c", "d"] }, { tools: ["a", "c", "d"] });
  assert.deepEqual(d, [{ path: "tools[-]", a: "b", b: undefined }]);
  const e = fieldDiff({ t: [{ x: 1 }] }, { t: [{ x: 1 }, { x: 2 }] });
  assert.deepEqual(e, [{ path: "t[+]", a: undefined, b: { x: 2 } }]);
  assert.deepEqual(fieldDiff({ t: [{ x: 1 }] }, { t: [{ x: 2 }] }).map((x) => x.path), ["t[0].x"]);
});

test("a uuid naming a tool, skill, role or agent of the bundle reads as its name; role-lock version labels are not compared", () => {
  const mkB = (toolUuid, rolePv) => {
    const b = bundle();
    b.pins[0].subjectUuid = toolUuid;
    const lock = b.pins.find((p) => p.kind === "role_lock");
    lock.content.lock = { toolSlugs: [toolUuid], version: `v${rolePv}`, skills: [{ version: `v${rolePv}` }], note: `hand off (role=${U(12)})` };
    lock.content.prompts = {};
    return b;
  };
  const a = mkB(U(41), 1);
  const b = mkB(U(42), 9);
  const rows = buildRows(mapObjects(extractObjects(a), extractObjects(b)), { rulesA: [uuidNameRule(a)], rulesB: [uuidNameRule(b)] });
  assert.equal(rows.find((r) => r.kind === "role_lock").status, "same");
  const c = mkB(U(43), 1);
  c.pins[0].name = "other_tool";
  const rows2 = buildRows(mapObjects(extractObjects(a), extractObjects(c)), { rulesA: [uuidNameRule(a)], rulesB: [uuidNameRule(c)] });
  assert.equal(rows2.find((r) => r.kind === "role_lock").status, "differs"); // a different tool in the lock is seen
});

// ---- AI functions -----------------------------------------------------------------------------

test("function keys: whole-token mentions plus every remix_* key", () => {
  const text = bundleText(bundle({ instruction: "Call function remix_editor then image_gen_v2; not image_gen_v22x." }));
  const keys = functionKeysNamed(text, new Set(["remix_editor", "remix_other", "image_gen_v2", "image_gen", "unrelated"]));
  assert.deepEqual(keys, ["image_gen_v2", "remix_editor", "remix_other"]);
});

test("a function row hashes the golden version content, system prompt, variables, schema, model and params", () => {
  const item = (id, ver, over = {}) => ({ id, uuid: U(id), functionKey: "remix_editor", goldenVersionId: 1 });
  const version = (n, over = {}) => ({ versionNumber: n, title: "Remix editor", outputKind: "json", modelId: "m", modelParams: { t: 0 }, outputSchema: { type: "object" }, content: "text", systemPrompt: "sys", variables: [{ name: "x" }], ...over });
  const a = functionObject(item(2156), version(3031));
  const same = functionObject(item(3000), version(3023));
  const split = functionObject(item(3000), version(3023, { content: "text\nsplit rule" }));
  const rules = hostRules();
  assert.equal(sha256(normalise(a.content, rules)), sha256(normalise(same.content, rules)));
  assert.notEqual(sha256(normalise(a.content, rules)), sha256(normalise(split.content, rules)));
  assert.equal(a.ref, "2156@v3031");
  const rows = buildRows(mapObjects([a], [split]), { rules });
  assert.equal(rows[0].status, "differs");
  assert.deepEqual(fieldDiff(rows[0]._na, rows[0]._nb).map((d) => d.path), ["content"]);
});

// ---- args -------------------------------------------------------------------------------------

test("args: sides with and without @release, flags", () => {
  const o = parseDiffArgs(["local:443@2315", "dev:443", "--fields", "--json", "--function", "k1", "--host", "a=b", "--no-functions"]);
  assert.deepEqual(o.sides, ["local:443@2315", "dev:443"]);
  assert.deepEqual([o.fields, o.json, o.noFunctions, o.functions, o.hosts], [true, true, true, ["k1"], [{ fromHost: "a", toHost: "b" }]]);
  assert.deepEqual(parseDiffSide("Local:443@2315"), { env: "local", agent: "443", release: 2315 });
  assert.deepEqual(parseDiffSide("dev:" + U(1)), { env: "dev", agent: U(1), release: null });
});

// ---- the CLI against two stub origins ---------------------------------------------------------

const stubs = [];
const origins = {};

function stub({ agentId, orgId, env, releaseId, pointer, bundleOver, functions, noPrompts }) {
  const b = bundle({ env, orgId, agentId, releaseId, ...bundleOver });
  const server = createServer((req, res) => {
    const url = new URL(req.url, "http://stub");
    const json = (data, status = 200) => {
      res.statusCode = status;
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify(status < 300 ? { success: true, data } : { success: false, error: { code: "X", message: "no" } }));
    };
    if (req.headers.authorization !== "Bearer k") return json(null, 401);
    const p = url.pathname;
    if (p === "/api/v1/agents") return json({ items: [{ id: agentId, uuid: U(1) }] });
    if (p === `/api/v1/agents/${U(1)}`) return json({ id: agentId, uuid: U(1), name: "Remix root", ...(pointer ? { deployedVersionId: pointer } : {}) });
    if (p === `/api/v1/agents/${U(1)}/releases/${releaseId}/bundle`) return json(b);
    if (p === `/api/v1/agents/${U(1)}/twins`) return json({ twins: [] });
    if (p === "/api/v1/ai-functions") return json({ functions: (functions ?? []).map((f) => ({ functionKey: f.key, title: f.key, description: null, outputKind: "json", liveVersion: f.live ?? 4, parameters: [{ name: "x", type: "text", required: true }], outputSchema: {} })) });
    if (p === "/api/v1/prompts" && noPrompts) return json(null, 403);
    if (p === "/api/v1/prompts") return json({ items: functions.map((f) => ({ id: f.id, uuid: U(f.id), functionKey: f.key, goldenVersionId: f.id * 10 })), total: functions.length });
    const m = /^\/api\/v1\/prompts\/(.+)\/versions$/.exec(p);
    if (m) {
      const f = functions.find((x) => U(x.id) === m[1]);
      return json({ versions: [{ id: f.id * 10, versionNumber: f.version, title: f.key, outputKind: "json", modelId: "m", modelParams: {}, outputSchema: {}, content: f.content, systemPrompt: "s", variables: [] }] });
    }
    return json(null, 404);
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => {
    stubs.push(server);
    resolve(`http://127.0.0.1:${server.address().port}`);
  }));
}

before(async () => {
  origins.a = await stub({ agentId: 443, orgId: 36, env: "dev", releaseId: 2315, pointer: 2315, functions: [{ id: 3, key: "remix_editor", version: 3031, content: "rule" }] });
  origins.b = await stub({ agentId: 362, orgId: 4, env: "dev", releaseId: 2311, pointer: 2311, functions: [{ id: 5, key: "remix_editor", version: 3023, content: "rule" }] });
  origins.c = await stub({ agentId: 362, orgId: 4, env: "dev", releaseId: 2311, pointer: 2311, bundleOver: { instruction: "changed" }, functions: [{ id: 5, key: "remix_editor", version: 3023, content: "rule\nsplit" }] });
  origins.e = await stub({ agentId: 443, orgId: 36, env: "dev", releaseId: 2315, pointer: 2315, noPrompts: true, functions: [{ id: 3, key: "remix_editor", version: 3031, live: 4, content: "x" }] });
  origins.f = await stub({ agentId: 362, orgId: 4, env: "dev", releaseId: 2311, pointer: 2311, noPrompts: true, functions: [{ id: 5, key: "remix_editor", version: 3023, live: 4, content: "y" }] });
  origins.d = await stub({ agentId: 362, orgId: 4, env: "dev", releaseId: 2311, pointer: null, functions: [] });
});
after(() => stubs.forEach((s) => s.close()));

function cli(args, env) {
  return new Promise((resolve) => {
    execFile(process.execPath, [CLI, "agent", "diff", ...args], { env: { ...process.env, ...env } }, (err, stdout, stderr) => resolve({ code: err ? err.code : 0, stdout, stderr }));
  });
}
const envs = (a, b) => ({ CADRA_AAA_API_URL: origins[a], CADRA_AAA_BUILDER_API_KEY: "k", CADRA_BBB_API_URL: origins[b], CADRA_BBB_BUILDER_API_KEY: "k" });

test("CLI: identical content across two origins, default release = pointer, exit 0, function row present", async () => {
  const r = await cli(["aaa:443", "bbb:362"], envs("a", "b"));
  assert.equal(r.code, 0, r.stderr + r.stdout);
  assert.match(r.stdout, /DIFF  aaa:Remix root@2315  vs  bbb:Remix root@2311/);
  assert.match(r.stdout, /ai_function\s+remix_editor\s+3@v3031\s+5@v3023/);
  assert.doesNotMatch(r.stdout, /differs\s*$/m);
  assert.match(r.stdout, /0 differ, 0 only in B, 0 only in A/);
});

test("CLI: a changed instruction and function text exit 1; --fields shows the field; --json is parseable", async () => {
  const r = await cli(["aaa:443@2315", "bbb:362@2311", "--fields"], envs("a", "c"));
  assert.equal(r.code, 1, r.stderr);
  assert.match(r.stdout, /agent\s+Remix root.*differs/);
  assert.match(r.stdout, /systemInstruction/);
  assert.match(r.stdout, /B-only: split/);
  const j = await cli(["aaa:443", "bbb:362", "--json", "--fields"], envs("a", "c"));
  const doc = JSON.parse(j.stdout);
  assert.equal(doc.exitCode, 1);
  assert.equal(doc.summary.differs, 2);
  assert.ok(doc.ignored.names.includes("orgId"));
  assert.deepEqual(doc.rows.find((x) => x.kind === "ai_function").fields.map((f) => f.path), ["content"]);
});

test("CLI: no pointer on the server and no @release stops with an instruction (exit 2)", async () => {
  const r = await cli(["aaa:443", "bbb:362"], envs("a", "d"));
  assert.equal(r.code, 2);
  assert.match(r.stderr, /does not return the deploy pointer/);
});

test("CLI: a function that exists on one side only is missing-A, and --no-functions skips them", async () => {
  const ok = await cli(["aaa:443@2315", "bbb:362@2311"], envs("a", "d"));
  assert.equal(ok.code, 1);
  assert.match(ok.stdout, /ai_function\s+remix_editor\s+3@v3031\s+-\s+\S+\s+-\s+missing-B/);
  const skip = await cli(["aaa:443@2315", "bbb:362@2311", "--no-functions"], envs("a", "d"));
  assert.equal(skip.code, 0);
  assert.doesNotMatch(skip.stdout, /ai_function/);
});

test("CLI: the table prints one row per object (visual check of the columns)", async () => {
  const r = await cli(["aaa:443@2315", "bbb:362@2311", "--fields"], envs("a", "c"));
  if (process.env.SHOW_TABLE) console.log(r.stdout);
  assert.match(r.stdout, /^kind\s+name\s+A id@ver\s+B id@ver\s+sha A\s+sha B\s+status$/m);
});

test("CLI: a key without prompt:read falls back to the public descriptor on both sides and says what was not compared (exit 2 when nothing else differs)", async () => {
  const r = await cli(["aaa:443@2315", "bbb:362@2311"], envs("e", "f"));
  assert.equal(r.code, 2, r.stdout + r.stderr);
  assert.match(r.stdout, /ai_function\s+remix_editor\s+fn@v4\s+fn@v4\s+\S+\s+\S+\s+same/);
  assert.match(r.stdout, /warning: AI functions compared by public descriptor only/);
  assert.equal((r.stdout.match(/warning: AI functions/g) ?? []).length, 1);
});

test("descriptor object: parameters and output schema are what is hashed", () => {
  const d = { functionKey: "k", title: "T", description: null, outputKind: "json", liveVersion: 4, parameters: [{ name: "x" }], outputSchema: { type: "object" } };
  assert.equal(sha256(descriptorObject(d).content), sha256(descriptorObject({ ...d, liveVersion: 9 }).content)); // version number is shown, not hashed
  assert.notEqual(sha256(descriptorObject(d).content), sha256(descriptorObject({ ...d, outputSchema: { type: "array" } }).content));
});

test("CLI: --changes hides the same rows but the summary still counts them", async () => {
  const r = await cli(["aaa:443@2315", "bbb:362@2311", "--changes"], envs("a", "c"));
  assert.equal(r.code, 1);
  assert.doesNotMatch(r.stdout, /channel_profile/);
  assert.match(r.stdout, /agent\s+Remix root.*differs/);
  assert.match(r.stdout, /6 same, 2 differ/);
});

test("CLI: --help lists the ignored fields", async () => {
  const r = await cli(["--help"], {});
  assert.equal(r.code, 0);
  assert.match(r.stdout, /Ignored fields/);
  assert.match(r.stdout, /orgId/);
});
