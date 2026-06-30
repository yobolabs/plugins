// Batch-render overlay compositions to transparent ProRes 4444 .mov files.
//
//   node render-overlays.mjs manifest.json
//
// manifest.json: [{ "id": "kinetic-hook", "out": "/abs/path/hook.mov", "props": {...} }, ...]
// `id` is a composition id (intro | kinetic-hook | callout | cta); `props` matches its
// zod schema (src/schema.ts). Output is alpha ProRes (yuva444) ready to import into CapCut.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const manifestPath = process.argv[2];
if (!manifestPath) {
  console.error("usage: node render-overlays.mjs <manifest.json>");
  process.exit(2);
}
const items = JSON.parse(readFileSync(manifestPath, "utf8"));
const scratch = mkdtempSync(join(tmpdir(), "overlay-props-"));

for (const item of items) {
  const propsFile = join(scratch, `${item.id}-${Math.abs(hash(item.out))}.json`);
  writeFileSync(propsFile, JSON.stringify(item.props ?? {}));
  execFileSync(
    "npx",
    ["remotion", "render", item.id, item.out, `--props=${propsFile}`, "--log=error"],
    { stdio: "inherit", cwd: here },
  );
  console.log("rendered", item.out);
}

function hash(s) {
  let h = 0;
  for (let i = 0; i < String(s).length; i++) h = (Math.imul(31, h) + String(s).charCodeAt(i)) | 0;
  return h;
}
