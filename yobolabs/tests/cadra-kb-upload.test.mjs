// `cadra kb upload` against a stub CadraOS origin started in this process (no network).
// Run from the repo root: node --test yobolabs/tests/*.test.mjs
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { execFile } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";

const CLI = fileURLToPath(new URL("../skills/configure-cadra/scripts/cadra.mjs", import.meta.url));
const KB = "11111111-2222-4333-8444-555555555555";
const KB_ARCHIVE = "66666666-7777-4888-8999-000000000000";
const DOC = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";

let server, origin, root;
let uploads = [];
let inFlight = 0,
  maxInFlight = 0,
  delayMs = 0;

before(async () => {
  server = createServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = Buffer.concat(chunks);
    res.setHeader("content-type", "application/json");
    const url = new URL(req.url, "http://stub");
    if (req.method === "GET" && url.pathname === "/api/v1/knowledge-bases") {
      return res.end(
        JSON.stringify({
          success: true,
          data: { items: [{ uuid: KB, name: "Team Docs" }, { uuid: KB_ARCHIVE, name: "Team Docs Archive" }] },
        })
      );
    }
    const match = url.pathname.match(/^\/api\/v1\/knowledge-bases\/([^/]+)\/documents$/);
    if (req.method !== "POST" || !match) {
      res.statusCode = 404;
      return res.end("{}");
    }
    inFlight++;
    maxInFlight = Math.max(maxInFlight, inFlight);
    const form = await new Response(body, { headers: { "content-type": req.headers["content-type"] } }).formData();
    const file = form.get("file");
    const record = {
      kb: match[1],
      authorization: req.headers.authorization,
      contentType: req.headers["content-type"],
      fileName: file.name,
      fileText: await file.text(),
      fields: Object.fromEntries([...form.entries()].filter(([k]) => k !== "file")),
    };
    uploads.push(record);
    await new Promise((r) => setTimeout(r, delayMs));
    inFlight--;
    if (record.fileName.startsWith("fail")) {
      res.statusCode = 403;
      return res.end(JSON.stringify({ error: "permission_denied" }));
    }
    if (record.fileName.startsWith("legacy")) {
      res.statusCode = 403;
      return res.end(
        JSON.stringify({
          success: false,
          error: { code: "INSUFFICIENT_PERMISSIONS", message: "x", details: { required: ["knowledgeBase:document_upload"] } },
        })
      );
    }
    res.statusCode = 202;
    res.end(
      JSON.stringify({
        success: true,
        data: { documentUuid: record.fields.documentUuid ?? randomUUID(), generation: randomUUID(), status: "queued" },
      })
    );
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  origin = `http://127.0.0.1:${server.address().port}`;

  root = mkdtempSync(join(tmpdir(), "cadra-kb-upload-"));
  const docs = join(root, "docs");
  mkdirSync(join(docs, "sub"), { recursive: true });
  mkdirSync(join(docs, ".obsidian"));
  mkdirSync(join(docs, "node_modules"));
  writeFileSync(join(docs, "b.md"), "# B\n");
  writeFileSync(join(docs, "a.txt"), "alpha\n");
  writeFileSync(join(docs, "image.png"), "not text");
  writeFileSync(join(docs, "big.log"), Buffer.alloc(4 * 1024 * 1024 + 1, 97));
  writeFileSync(join(docs, ".obsidian", "app.json"), "{}");
  writeFileSync(join(docs, "node_modules", "pkg.md"), "# pkg\n");
  writeFileSync(join(docs, "sub", "c.json"), "{}\n");
  writeFileSync(join(docs, "sub", "d.yaml"), "d: 1\n");
  writeFileSync(join(root, "single.csv"), "a,b\n1,2\n");
  writeFileSync(join(root, "fail.md"), "# nope\n");
  writeFileSync(join(root, "legacy.md"), "# old origin\n");
  const many = join(root, "many");
  mkdirSync(many);
  for (let i = 0; i < 9; i++) writeFileSync(join(many, `f${i}.md`), `# ${i}\n`);
});

after(() => {
  server.close();
  rmSync(root, { recursive: true, force: true });
});

function cadra(args, { key = "sk-cad-test" } = {}) {
  uploads = [];
  const env = { ...process.env, CADRA_API_URL: origin };
  delete env.CADRA_BUILDER_API_KEY;
  if (key) env.CADRA_BUILDER_API_KEY = key;
  return new Promise((resolve) => {
    execFile(process.execPath, [CLI, ...args], { env }, (error, stdout, stderr) =>
      resolve({ code: error ? error.code : 0, stdout, stderr })
    );
  });
}

test("a directory uploads its text files, name-sorted, with source_path relative to its parent", async () => {
  const { code, stdout, stderr } = await cadra(["kb", "upload", KB, join(root, "docs")]);
  assert.equal(code, 0, stderr);
  assert.deepEqual(
    uploads.map((u) => u.fields.source_path).sort(),
    ["docs/a.txt", "docs/b.md", "docs/sub/c.json", "docs/sub/d.yaml"]
  );
  for (const u of uploads) {
    assert.equal(u.kb, KB);
    assert.equal(u.authorization, "Bearer sk-cad-test");
    assert.match(u.contentType, /^multipart\/form-data; boundary=/);
    assert.equal(u.fields.archived, undefined);
    assert.equal(u.fields.documentUuid, undefined);
  }
  assert.equal(uploads.find((u) => u.fileName === "c.json").fileText, "{}\n");
  assert.equal(stdout.trim().split("\n").filter((l) => l.startsWith("✓ ")).length, 4);
  assert.match(stdout, /✓ docs\/sub\/d\.yaml → [0-9a-f-]{36}/);
  for (const skipped of ["docs/image.png", "docs/big.log", "docs/.obsidian", "docs/node_modules"])
    assert.match(stderr, new RegExp(`- skip ${skipped.replace(".", "\\.")}`));
  assert.match(stderr, /4\/4 uploaded/);
});

test("a single file keeps its base name as source_path, and --archived sends archived=true", async () => {
  const { code } = await cadra(["kb", "upload", KB, join(root, "single.csv"), "--archived"]);
  assert.equal(code, 0);
  assert.equal(uploads.length, 1);
  assert.deepEqual(uploads[0].fields, { source_path: "single.csv", archived: "true" });
  assert.equal(uploads[0].fileName, "single.csv");
  assert.equal(uploads[0].fileText, "a,b\n1,2\n");
});

test("--replace sends documentUuid for exactly one file", async () => {
  const ok = await cadra(["kb", "upload", KB, join(root, "single.csv"), "--replace", DOC]);
  assert.equal(ok.code, 0);
  assert.equal(uploads[0].fields.documentUuid, DOC);
  assert.match(ok.stdout, new RegExp(`✓ single\\.csv → ${DOC}`));

  const many = await cadra(["kb", "upload", KB, join(root, "docs"), "--replace", DOC]);
  assert.notEqual(many.code, 0);
  assert.match(many.stderr, /--replace overwrites one document, but 4 files were given/);
  assert.equal(uploads.length, 0);

  const bad = await cadra(["kb", "upload", KB, join(root, "single.csv"), "--replace", "doc-1"]);
  assert.notEqual(bad.code, 0);
  assert.equal(uploads.length, 0);
});

test("--dry-run prints the plan, sends nothing, and needs no key for a uuid", async () => {
  const { code, stdout } = await cadra(["kb", "upload", KB, join(root, "docs"), "--dry-run"], { key: null });
  assert.equal(code, 0);
  assert.equal(uploads.length, 0);
  const plan = JSON.parse(stdout);
  assert.equal(plan.dryRun, true);
  assert.equal(plan.url, `${origin}/api/v1/knowledge-bases/${KB}/documents`);
  assert.deepEqual(
    plan.files.map((f) => f.source_path),
    ["docs/a.txt", "docs/b.md", "docs/sub/c.json", "docs/sub/d.yaml"]
  );
});

test("a failed file prints its error code, the rest still upload, and the exit is non-zero", async () => {
  const { code, stdout, stderr } = await cadra(["kb", "upload", KB, join(root, "single.csv"), join(root, "fail.md")]);
  assert.equal(code, 1);
  assert.equal(uploads.length, 2);
  assert.match(stdout, /✓ single\.csv → /);
  assert.match(stdout, /✗ fail\.md → permission_denied \(403\)/);
  assert.match(stderr, /1\/2 uploaded/);
  assert.match(stderr, /hint: permission_denied — the key's creator must be an active member/);
});

test("an origin still on the pre-p76 JSON contract is named as such", async () => {
  const { code, stdout, stderr } = await cadra(["kb", "upload", KB, join(root, "legacy.md")]);
  assert.equal(code, 1);
  assert.match(stdout, /✗ legacy\.md → INSUFFICIENT_PERMISSIONS \(403\)/);
  assert.match(stderr, /predates API-key upload/);
});

test("uploads run at most four at a time", async () => {
  delayMs = 50;
  maxInFlight = 0;
  try {
    const { code } = await cadra(["kb", "upload", KB, join(root, "many")]);
    assert.equal(code, 0);
    assert.equal(uploads.length, 9);
    assert.equal(maxInFlight, 4);
  } finally {
    delayMs = 0;
  }
});

test("a knowledge base name resolves through find: an exact name wins, an ambiguous one refuses", async () => {
  const exact = await cadra(["kb", "upload", "team docs", join(root, "single.csv")]);
  assert.equal(exact.code, 0, exact.stderr);
  assert.equal(uploads[0].kb, KB);

  const ambiguous = await cadra(["kb", "upload", "team", join(root, "single.csv")]);
  assert.notEqual(ambiguous.code, 0);
  assert.match(ambiguous.stderr, /ambiguous: 2 knowledge bases match "team"/);
  assert.equal(uploads.length, 0);
});

test("nothing uploadable, a missing path, and a non-kb entity all refuse without sending", async () => {
  for (const args of [
    ["kb", "upload", KB, join(root, "docs", "image.png")],
    ["kb", "upload", KB, join(root, "missing.md")],
    ["kb", "upload", KB],
    ["agent", "upload", KB, join(root, "single.csv")],
  ]) {
    const { code } = await cadra(args);
    assert.notEqual(code, 0, args.join(" "));
    assert.equal(uploads.length, 0);
  }
});
