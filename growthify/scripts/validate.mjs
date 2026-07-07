#!/usr/bin/env node
/**
 * growthify structural validator.
 *
 * growthify is a docs-only Claude Code plugin (method assets, no runtime).
 * There is no bundler and no `tsc` surface — STRUCTURAL VALIDATION IS THE BUILD
 * (spec §6.7). This script is dev tooling only: Node >= 18, ZERO dependencies
 * (no YAML lib — frontmatter is parsed with regex). Run it from the plugin root.
 *
 * Usage:
 *   node scripts/validate.mjs [--scope <scope>] [--allow-empty]
 *
 *   --scope <scope>   One of: manifest | skills | agents | lenses | cases |
 *                     privacy | all.  Default: all.
 *
 *   --allow-empty     Phased-build flag. For the skills / agents / lenses / cases
 *                     scopes, an ABSENT target (no SKILL.md yet, no agent files
 *                     yet, no lens packs yet, no case entries yet) is downgraded
 *                     from a hard FAILURE to a WARNING, so the scaffold passes
 *                     before the authored knowledge lands. Content that IS
 *                     present but malformed (bad frontmatter, missing section,
 *                     missing citation field, dangling reference) still
 *                     hard-fails even with this flag.
 *                     The `manifest` and `privacy` scopes are ALWAYS hard —
 *                     --allow-empty never relaxes them, so there are no vacuous
 *                     passes on the contracts that actually matter.
 *
 * Exit code: 0 = pass (warnings permitted), nonzero = one or more failures.
 * Every failure is printed on its own line, prefixed `FAIL `.
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const SCOPES = ['manifest', 'skills', 'agents', 'lenses', 'cases', 'privacy', 'all'];

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const pluginRoot = path.resolve(scriptDir, '..');           // growthify/
const repoRoot = path.resolve(pluginRoot, '..');            // yobo-plugins/ (plugin root's parent)
const manifestPath = path.join(pluginRoot, '.claude-plugin', 'plugin.json');
const marketplacePath = path.join(repoRoot, '.claude-plugin', 'marketplace.json');
const banlistPath = path.join(scriptDir, 'privacy-banlist.txt');

const failures = [];
const warnings = [];

// ---------------------------------------------------------------- arg parsing
let scope = 'all';
let allowEmpty = false;
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--allow-empty') allowEmpty = true;
  else if (a === '--scope') scope = argv[++i];
  else if (a.startsWith('--scope=')) scope = a.slice('--scope='.length);
  else if (a === '--help' || a === '-h') printUsageAndExit();
  else { console.error(`Unknown argument: ${a}`); process.exit(2); }
}
if (!scope || !SCOPES.includes(scope)) {
  console.error(`Invalid --scope "${scope}". Valid scopes: ${SCOPES.join(', ')}`);
  process.exit(2);
}

// ------------------------------------------------------------------- helpers
function rel(p) {
  const r = path.relative(pluginRoot, p);
  return r === '' ? p : r;
}

/** Record an ABSENT-target problem: a hard failure normally, a warning under --allow-empty. */
function absent(msg) {
  if (allowEmpty) warnings.push(msg + ' (downgraded to warning: --allow-empty)');
  else failures.push(msg);
}

/** Parse leading-`---` YAML frontmatter without a YAML lib. Returns lowercased-key map or null. */
function parseFrontmatter(text) {
  const m = text.match(/^﻿?---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/);
  if (!m) return null;
  const fields = {};
  for (const line of m[1].split(/\r?\n/)) {
    const fm = line.match(/^([A-Za-z0-9_-]+)[ \t]*:[ \t]*(.*)$/);
    if (fm) {
      const v = fm[2].trim().replace(/^["']|["']$/g, '').trim();
      fields[fm[1].toLowerCase()] = v;
    }
  }
  return fields;
}

/** Recursively collect *.md files under dir, skipping dot-directories. */
function findMdFiles(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    if (name.startsWith('.')) continue;
    const full = path.join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) findMdFiles(full, out);
    else if (name.endsWith('.md')) out.push(full);
  }
  return out;
}

function listMd(dir, exclude = []) {
  if (!existsSync(dir)) return [];
  const skip = new Set(exclude.map((e) => e.toLowerCase()));
  return readdirSync(dir).filter((f) => f.endsWith('.md') && !skip.has(f.toLowerCase()));
}

function loadBanlist() {
  if (!existsSync(banlistPath)) return [];
  const out = [];
  for (let line of readFileSync(banlistPath, 'utf8').split(/\r?\n/)) {
    line = line.trim();
    if (!line || line.startsWith('#')) continue;
    line = line.replace(/^["']|["']$/g, '').trim();
    if (line) out.push(line);
  }
  return out;
}

// -------------------------------------------------------------------- scopes

function checkManifest() {
  if (!existsSync(manifestPath)) {
    failures.push(`manifest: ${rel(manifestPath)} not found`);
    return;
  }
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  } catch (e) {
    failures.push(`manifest: ${rel(manifestPath)} does not parse as JSON — ${e.message}`);
    return;
  }
  for (const f of ['name', 'description', 'version']) {
    if (manifest[f] === undefined || manifest[f] === null || String(manifest[f]).trim() === '')
      failures.push(`manifest: required field "${f}" missing or empty in plugin.json`);
  }
  if (!Array.isArray(manifest.keywords) || manifest.keywords.length === 0)
    failures.push(`manifest: "keywords" must be a non-empty array`);
  if (
    !manifest.author ||
    typeof manifest.author !== 'object' ||
    Array.isArray(manifest.author) ||
    !manifest.author.name ||
    String(manifest.author.name).trim() === ''
  )
    failures.push(`manifest: "author.name" missing — author must be an object with a non-empty name`);

  // marketplace cross-check (resolved relative to the plugin root's parent, per spec §2.0)
  if (!existsSync(marketplacePath)) {
    failures.push(`manifest: marketplace file ${rel(marketplacePath)} not found`);
    return;
  }
  let mp;
  try {
    mp = JSON.parse(readFileSync(marketplacePath, 'utf8'));
  } catch (e) {
    failures.push(`manifest: ${rel(marketplacePath)} does not parse as JSON — ${e.message}`);
    return;
  }
  const entry = Array.isArray(mp.plugins) ? mp.plugins.find((p) => p && p.name === 'growthify') : null;
  if (!entry) {
    failures.push(`manifest: no "growthify" entry in ${rel(marketplacePath)} plugins[]`);
    return;
  }
  if (entry.version !== manifest.version)
    failures.push(
      `manifest: version mismatch — marketplace growthify entry "${entry.version}" !== plugin.json "${manifest.version}"`,
    );
}

function checkSkills() {
  const expected = ['growthify', 'simulate'];
  for (const skill of expected) {
    const skillDir = path.join(pluginRoot, 'skills', skill);
    const skillMd = path.join(skillDir, 'SKILL.md');
    if (!existsSync(skillMd)) {
      absent(`skills: ${rel(skillMd)} missing`);
      continue;
    }
    const text = readFileSync(skillMd, 'utf8');
    const fm = parseFrontmatter(text);
    if (!fm) {
      failures.push(`skills: ${rel(skillMd)} has no valid YAML frontmatter`);
    } else {
      if (!fm.name) failures.push(`skills: ${rel(skillMd)} frontmatter missing non-empty "name"`);
      if (!fm.description) failures.push(`skills: ${rel(skillMd)} frontmatter missing non-empty "description"`);
    }
    // Every referenced ../references/<...> or agents/<...> path must resolve on disk.
    const pathRe = /(\.\.\/references\/[A-Za-z0-9._/-]+|agents\/[A-Za-z0-9._/-]+)/g;
    const seen = new Set();
    let m;
    while ((m = pathRe.exec(text)) !== null) {
      const ref = m[1].replace(/[^A-Za-z0-9]+$/, ''); // strip trailing punctuation/backticks
      if (!ref || seen.has(ref)) continue;
      seen.add(ref);
      const base = ref.startsWith('../') ? skillDir : pluginRoot;
      const resolved = path.resolve(base, ref);
      if (!existsSync(resolved))
        failures.push(`skills: ${rel(skillMd)} references "${ref}" which does not resolve on disk`);
    }
  }
}

function checkAgents() {
  const agentsDir = path.join(pluginRoot, 'agents');
  const expected = ['growth-recon.md', 'growth-lens.md', 'growth-judge.md'];
  const files = existsSync(agentsDir) ? readdirSync(agentsDir).filter((f) => f.endsWith('.md')) : [];

  for (const e of expected) {
    if (!files.includes(e)) absent(`agents: expected agent file agents/${e} missing`);
  }

  // INV-1: exactly ONE generator agent file (growth-lens.md).
  const lensCount = files.filter((f) => f === 'growth-lens.md').length;
  if (lensCount > 1)
    failures.push(`agents: INV-1 violated — exactly one growth-lens.md required, found ${lensCount}`);

  for (const f of files) {
    const fm = parseFrontmatter(readFileSync(path.join(agentsDir, f), 'utf8'));
    if (!fm) {
      failures.push(`agents: agents/${f} has no valid YAML frontmatter`);
      continue;
    }
    if (!fm.name) failures.push(`agents: agents/${f} frontmatter missing non-empty "name"`);
    if (!fm.description) failures.push(`agents: agents/${f} frontmatter missing non-empty "description"`);
  }
}

function checkLenses() {
  const lensesDir = path.join(pluginRoot, 'skills', 'references', 'lenses');
  const sections = [
    '## Scope',
    '## Core models',
    '## Mechanism inventory',
    '## Signature questions',
    '## Metric-family mapping',
    '## Case pointers',
    '## Anti-patterns',
  ];
  const files = listMd(lensesDir, ['_skeleton.md']);
  if (files.length === 0) {
    absent(`lenses: no lens packs found under ${rel(lensesDir)}`);
    return;
  }
  for (const f of files) {
    const text = readFileSync(path.join(lensesDir, f), 'utf8');
    for (const s of sections) {
      if (!text.includes(s))
        failures.push(`lenses: skills/references/lenses/${f} missing required section "${s}"`);
    }
  }
}

function checkCases() {
  const casesDir = path.join(pluginRoot, 'skills', 'references', 'case-library');
  const files = listMd(casesDir, ['README.md']);
  if (files.length === 0) {
    absent(`cases: no case entries found under ${rel(casesDir)}`);
    return;
  }
  // Required §2.5 field labels. Space in a label matches any of space/underscore/hyphen.
  const labels = ['id', 'mechanism', 'lens', 'context class', 'source', 'outcome', 'confidence', 'caveats', 'privacy check'];
  for (const f of files) {
    const text = readFileSync(path.join(casesDir, f), 'utf8');
    for (const label of labels) {
      const pat = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '[\\s_-]+');
      const re = new RegExp(`(^|\\n)[\\s>*_#-]*${pat}[\\s_-]*:`, 'i');
      if (!re.test(text))
        failures.push(`cases: skills/references/case-library/${f} missing required field "${label}"`);
    }
    // source must carry a date and a URL-or-publication (§2.5)
    const hasDate = /\b(19|20)\d{2}\b/.test(text) || /\b\d{4}-\d{2}-\d{2}\b/.test(text);
    if (!hasDate)
      failures.push(`cases: skills/references/case-library/${f} source missing a date`);
    const hasUrl = /https?:\/\/\S+/i.test(text);
    const sourceLine = text.match(/(^|\n)[\s>*_#-]*source[\s_-]*:[ \t]*(.*)/i);
    const sourceValue = sourceLine ? sourceLine[2].trim() : '';
    if (!hasUrl && sourceValue === '')
      failures.push(`cases: skills/references/case-library/${f} source missing a URL or publication`);
  }
}

function checkPrivacy() {
  const banned = loadBanlist();
  const timeRes = [/\b(\d+\s*)?(weeks?|days?|hours?|wks|hrs)\b/i, /timebox/i, /week\s*\d/i];
  const currencyRe = /\$\s?\d{3,}/;
  for (const file of findMdFiles(pluginRoot)) {
    const lines = readFileSync(file, 'utf8').split(/\r?\n/);
    lines.forEach((line, idx) => {
      if (line.includes('validator:allow')) return; // documented escape hatch
      const ln = idx + 1;
      const at = `${rel(file)}:${ln}`;
      for (const re of timeRes) {
        if (re.test(line)) {
          failures.push(`privacy: ${at} time-estimate lexicon — "${line.trim()}"`);
          break;
        }
      }
      if (currencyRe.test(line)) failures.push(`privacy: ${at} currency-amount pattern — "${line.trim()}"`);
      for (const term of banned) {
        if (line.toLowerCase().includes(term.toLowerCase()))
          failures.push(`privacy: ${at} banned identifier "${term}" — "${line.trim()}"`);
      }
    });
  }
}

const RUNNERS = {
  manifest: checkManifest,
  skills: checkSkills,
  agents: checkAgents,
  lenses: checkLenses,
  cases: checkCases,
  privacy: checkPrivacy,
};

// ---------------------------------------------------------------------- main
const toRun = scope === 'all' ? ['manifest', 'skills', 'agents', 'lenses', 'cases', 'privacy'] : [scope];
for (const s of toRun) RUNNERS[s]();

for (const w of warnings) console.log(`WARN  ${w}`);
for (const f of failures) console.log(`FAIL  ${f}`);

const tag = `scope "${scope}"${allowEmpty ? ' --allow-empty' : ''}`;
if (failures.length > 0) {
  console.log(`\n${failures.length} failure(s) — ${tag}`);
  process.exit(1);
}
console.log(`PASS  ${tag}${warnings.length ? ` — ${warnings.length} warning(s)` : ''}`);
process.exit(0);

function printUsageAndExit() {
  const header = readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n');
  const start = header.indexOf(' * Usage:');
  const end = header.indexOf(' */');
  console.log(header.slice(start === -1 ? 1 : start, end === -1 ? header.length : end).map((l) => l.replace(/^ \* ?/, '')).join('\n'));
  process.exit(0);
}
