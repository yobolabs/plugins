#!/usr/bin/env node
// mockify structural validator — dev tooling, zero dependencies, Node >=18.
// Ported from designify/scripts/validate.mjs; same contract:
//   node scripts/validate.mjs [--scope manifest|skills|agents|packs|traps|rubrics|templates|privacy|all] [--pre-registration]
// Run from the plugin root; exit 0 = pass, nonzero = fail.
// Failures print one per line as `FAIL <scope>: <message>`; a scope summary follows.
// The plugin is docs-only — this script is the build gate, not a runtime.

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join, relative } from 'node:path';

const PLUGIN_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// ---- Structural invariants: the exact named authored files (design.md §3) ----
const AGENTS = ['mock-recon', 'mock-director', 'mock-critic', 'mock-judge'];
const SKILLS = ['mockify', 'grading'];
const PACKS = ['visual-hierarchy', 'ui-typography', 'color-tokens-a11y', 'layout-responsive', 'interaction-states', 'ux-flow-ia'];
const TRAPS = ['ai-slop-ui', 'design-system-drift', 'state-blindness', 'responsive-failures', 'flow-friction'];
const RUBRICS = ['usability', 'craft', 'implementability', 'concept-selection', 'verdict-integrity'];
const TEMPLATES = ['mission-brief', 'concept-card', 'spec-file', 'crit-report', 'mock-ledger'];

// Pack skeleton headings — all seven required per pack (designify SS2.4, kept verbatim).
const PACK_SECTIONS = [
  'Scope',
  'Core craft principles',
  'Directive inventory',
  'Signature questions',
  'Placement / asset-class mapping',
  'Exemplar pointers',
  'Trap cross-references',
];

// Trap entry fields — all eight required per entry (designify SS2.5, kept verbatim).
const TRAP_FIELDS = ['id', 'anti-pattern', 'markers', 'why-it-fails', 'negative-prompt', 'severity', 'provenance-class', 'privacy-check'];

// Spec-file sections (design.md §9 spec-file.md) — all eight, in template order.
const SPEC_FILE_SECTIONS = [
  'Mission summary',
  'M-rules',
  'Chosen direction',
  'Flow map',
  'Per-screen sections',
  'New-component requests',
  'Open questions',
  'Feedback hook',
];

// Canonical honesty-tag vocabulary (family-normative). ASCII only.
const CANONICAL_TOKENS = ['checked', 'reasoned', 'guessing', 'dont-know'];

// Time-estimate lexicon ban (INV-4). Word-boundaried; validator:allow exempts a line.
const TIME_LEXICON = /\b(weeks?|days?|hours?|wks|hrs|timebox(?:ed|es|ing)?)\b/i;
// Week-numbered phase ban (e.g. "Week 3", "Weeks 2-5") — schedule framing.
const WEEK_PHASE = /\bweeks?\s+\d/i;
// Effort/time column ban for rubric table headers (INV-4).
const RUBRIC_COLUMN_BAN = /\b(effort|time|duration|eta|weeks?|days?|hours?|wks|hrs|timebox)\b/i;

// ---- Verdict-integrity rule headings. The designify base64 byte-fidelity
// fixture is replaced by a heading-presence check: the port keeps the six rule
// headings + the adjacent-fraud section, but domain nouns may differ. ----
const VERDICT_INTEGRITY_HEADINGS = [
  'R1 — Steelman gate',
  'R2 — No unearned praise',
  'R3 — Closed verdict vocabulary',
  'R4 — Concession symmetry',
  'R5 — Attack quality floor',
  'R6 — Drift audit',
  'Adjacent fraud',
];

// --------------------------------- helpers ---------------------------------

function read(path) {
  return readFileSync(path, 'utf8');
}

function listMd(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => f.endsWith('.md'));
}

// YAML frontmatter must open the file and carry name + description keys.
function frontmatterFields(content) {
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const body = m[1];
  const fields = {};
  for (const line of body.split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (kv) fields[kv[1].toLowerCase()] = kv[2].trim();
  }
  return fields;
}

const norm = (s) => s.toLowerCase().replace(/\s*\/\s*/g, '/').replace(/\s+/g, ' ').trim();

// True if some markdown heading line contains `text` (whitespace/slash-normalized).
function hasHeading(content, text) {
  const target = norm(text);
  for (const line of content.split(/\r?\n/)) {
    const h = line.match(/^#{1,6}\s+(.*)$/);
    if (h && norm(h[1]).includes(target)) return true;
  }
  return false;
}

// Count "field:" labels: start-of-line, optional bullet, optional **bold**, then colon.
function countFieldLabel(content, field) {
  const esc = field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp('(?:^|\\n)\\s*(?:[-*]\\s*)?\\*{0,2}' + esc + '\\*{0,2}\\s*:', 'gi');
  return (content.match(re) || []).length;
}

// Recursively collect *.md files under a root, skipping VCS/dep dirs.
function walkMd(root, acc = []) {
  for (const entry of readdirSync(root)) {
    if (entry === '.git' || entry === 'node_modules') continue;
    const p = join(root, entry);
    const st = statSync(p);
    if (st.isDirectory()) walkMd(p, acc);
    else if (entry.endsWith('.md')) acc.push(p);
  }
  return acc;
}

// Named-set diff for a flat directory of `<name>.md` files.
function namedSet(dir, expected) {
  const present = new Set(listMd(dir).map((f) => f.replace(/\.md$/, '')));
  const missing = expected.filter((n) => !present.has(n));
  const unexpected = [...present].filter((n) => !expected.includes(n));
  return { missing, unexpected };
}

// --------------------------------- scopes ----------------------------------

function scopeManifest(opts) {
  const fails = [];
  const skips = [];
  const manifestPath = join(PLUGIN_ROOT, '.claude-plugin', 'plugin.json');
  if (!existsSync(manifestPath)) return { fails: ['manifest: .claude-plugin/plugin.json not found'], skips };
  let manifest;
  try {
    manifest = JSON.parse(read(manifestPath));
  } catch (e) {
    return { fails: [`manifest: plugin.json does not parse — ${e.message}`], skips };
  }
  if (typeof manifest.name !== 'string' || !manifest.name) fails.push('manifest: missing/invalid field "name"');
  if (typeof manifest.description !== 'string' || !manifest.description) fails.push('manifest: missing/invalid field "description"');
  if (typeof manifest.version !== 'string' || !manifest.version) fails.push('manifest: missing/invalid field "version"');
  if (!manifest.author || typeof manifest.author !== 'object' || typeof manifest.author.name !== 'string' || !manifest.author.name) {
    fails.push('manifest: "author" must be an object with a string "name"');
  }
  if (!Array.isArray(manifest.keywords) || manifest.keywords.length === 0) fails.push('manifest: "keywords" must be a non-empty array');

  // Version-sync against the marketplace entry.
  const marketplacePath = resolve(PLUGIN_ROOT, '..', '.claude-plugin', 'marketplace.json');
  if (!existsSync(marketplacePath)) {
    fails.push(`manifest: marketplace.json not found at ${relative(PLUGIN_ROOT, marketplacePath)}`);
  } else {
    let market;
    try {
      market = JSON.parse(read(marketplacePath));
    } catch (e) {
      return { fails: [...fails, `manifest: marketplace.json does not parse — ${e.message}`], skips };
    }
    const entries = Array.isArray(market.plugins) ? market.plugins : [];
    const entry = entries.find((p) => p && (p.name === 'mockify' || p.source === './mockify'));
    if (!entry) {
      const msg = 'marketplace.json has no mockify entry';
      if (opts.preRegistration) skips.push(`manifest: ${msg} — tolerated by --pre-registration`);
      else fails.push(`manifest: ${msg}`);
    } else if (entry.version !== manifest.version) {
      fails.push(`manifest: version mismatch — plugin.json ${JSON.stringify(manifest.version)} vs marketplace entry ${JSON.stringify(entry.version)}`);
    }
  }
  return { fails, skips };
}

function scopeSkills() {
  const fails = [];
  const skillsRoot = join(PLUGIN_ROOT, 'skills');
  // Unexpected-skill diff (fixes the known designify validator gap): the skills
  // dir may hold exactly the named skills plus the shared references tree.
  if (existsSync(skillsRoot)) {
    const expectedDirs = new Set([...SKILLS, 'references']);
    for (const entry of readdirSync(skillsRoot)) {
      const p = join(skillsRoot, entry);
      if (!statSync(p).isDirectory()) continue;
      if (!expectedDirs.has(entry)) fails.push(`skills: unexpected skill dir skills/${entry} (v1 pins exactly: ${SKILLS.join(', ')} + references)`);
    }
  }
  for (const name of SKILLS) {
    const skillMd = join(skillsRoot, name, 'SKILL.md');
    if (!existsSync(skillMd)) {
      fails.push(`skills: expected skills/${name}/SKILL.md not found`);
      continue;
    }
    const content = read(skillMd);
    const fm = frontmatterFields(content);
    if (!fm) fails.push(`skills: skills/${name}/SKILL.md has no YAML frontmatter`);
    else {
      if (!fm.name) fails.push(`skills: skills/${name}/SKILL.md frontmatter missing "name"`);
      if (!fm.description) fails.push(`skills: skills/${name}/SKILL.md frontmatter missing "description"`);
    }
    // Every referenced relative path must resolve on disk.
    const skillDir = dirname(skillMd);
    const refs = new Set();
    for (const m of content.matchAll(/\.\.\/references\/[A-Za-z0-9._/-]+/g)) refs.add(m[0]);
    for (const m of content.matchAll(/(?<![A-Za-z0-9._/-])agents\/[A-Za-z0-9._/-]+/g)) refs.add(m[0]);
    for (const ref of refs) {
      const fromSkill = resolve(skillDir, ref);
      const fromRoot = resolve(PLUGIN_ROOT, ref);
      if (!existsSync(fromSkill) && !existsSync(fromRoot)) {
        fails.push(`skills: skills/${name}/SKILL.md references "${ref}" which resolves to no file on disk`);
      }
    }
  }
  return { fails, skips: [] };
}

function scopeAgents() {
  const fails = [];
  const dir = join(PLUGIN_ROOT, 'agents');
  const { missing, unexpected } = namedSet(dir, AGENTS);
  for (const n of missing) fails.push(`agents: expected agents/${n}.md not found`);
  for (const n of unexpected) fails.push(`agents: unexpected agents/${n}.md (exactly the four named agents, one generator)`);
  for (const name of AGENTS) {
    const p = join(dir, `${name}.md`);
    if (!existsSync(p)) continue;
    const content = read(p);
    const fm = frontmatterFields(content);
    if (!fm) fails.push(`agents: agents/${name}.md has no YAML frontmatter`);
    else {
      if (!fm.name) fails.push(`agents: agents/${name}.md frontmatter missing "name"`);
      if (!fm.description) fails.push(`agents: agents/${name}.md frontmatter missing "description"`);
    }
  }
  // mock-recon must declare exactly the four canonical honesty tokens.
  const reconPath = join(dir, 'mock-recon.md');
  if (existsSync(reconPath)) {
    const content = read(reconPath);
    for (const tok of CANONICAL_TOKENS) {
      if (!new RegExp('\\b' + tok.replace('-', '\\-') + '\\b').test(content)) {
        fails.push(`agents: mock-recon.md does not declare canonical token "${tok}"`);
      }
    }
    // Variant spellings in a tag context fail. The ASCII rule forbids apostrophe/spaced
    // forms as tokens; a display-prose "don't know" (apostrophe + space) is left alone.
    if (/don['’]t-know/i.test(content)) fails.push('agents: mock-recon.md uses the apostrophe variant "don\'t-know" — canonical token is ASCII "dont-know"');
    if (/\bdont know\b/i.test(content)) fails.push('agents: mock-recon.md uses the spaced variant "dont know" — canonical token is ASCII "dont-know"');
    // Foreign (growthify) vocabulary used as a tag enumeration (joined by / or |).
    if (/\b(verified|inferred|assumed|unknown)\b\s*[/|]\s*\b(verified|inferred|assumed|unknown)\b/i.test(content)) {
      fails.push('agents: mock-recon.md declares the growthify vocabulary (verified/inferred/assumed/unknown) as a tag enumeration — mockify uses checked/reasoned/guessing/dont-know');
    }
  }
  return { fails, skips: [] };
}

function scopePacks() {
  const fails = [];
  const dir = join(PLUGIN_ROOT, 'skills', 'references', 'packs');
  const { missing, unexpected } = namedSet(dir, PACKS);
  for (const n of missing) fails.push(`packs: expected skills/references/packs/${n}.md not found`);
  for (const n of unexpected) fails.push(`packs: unexpected pack skills/references/packs/${n}.md (design.md §6 pins exactly six)`);
  for (const name of PACKS) {
    const p = join(dir, `${name}.md`);
    if (!existsSync(p)) continue;
    const content = read(p);
    for (const section of PACK_SECTIONS) {
      if (!hasHeading(content, section)) fails.push(`packs: ${name}.md missing skeleton section heading "${section}"`);
    }
  }
  return { fails, skips: [] };
}

function scopeTraps() {
  const fails = [];
  const dir = join(PLUGIN_ROOT, 'skills', 'references', 'traps');
  const { missing, unexpected } = namedSet(dir, TRAPS);
  for (const n of missing) fails.push(`traps: expected skills/references/traps/${n}.md not found`);
  for (const n of unexpected) fails.push(`traps: unexpected trap skills/references/traps/${n}.md (design.md §7 pins exactly five)`);
  for (const name of TRAPS) {
    const p = join(dir, `${name}.md`);
    if (!existsSync(p)) continue;
    const content = read(p);
    const entryCount = countFieldLabel(content, 'id');
    if (entryCount < 1) {
      fails.push(`traps: ${name}.md has no entries (no "id:" field found)`);
      continue;
    }
    for (const field of TRAP_FIELDS) {
      if (field === 'id') continue;
      const c = countFieldLabel(content, field);
      if (c !== entryCount) {
        fails.push(`traps: ${name}.md field "${field}" appears ${c}x but has ${entryCount} entr${entryCount === 1 ? 'y' : 'ies'} — every entry needs all eight fields`);
      }
    }
  }
  return { fails, skips: [] };
}

function scopeRubrics() {
  const fails = [];
  const dir = join(PLUGIN_ROOT, 'skills', 'references', 'rubrics');
  const { missing, unexpected } = namedSet(dir, RUBRICS);
  for (const n of missing) fails.push(`rubrics: expected skills/references/rubrics/${n}.md not found`);
  for (const n of unexpected) fails.push(`rubrics: unexpected rubric skills/references/rubrics/${n}.md (design.md §8 pins exactly five)`);

  const viPath = join(dir, 'verdict-integrity.md');
  if (existsSync(viPath)) {
    const content = read(viPath);
    for (const heading of VERDICT_INTEGRITY_HEADINGS) {
      if (!hasHeading(content, heading)) {
        fails.push(`rubrics: verdict-integrity.md missing rule heading "${heading}" (near-verbatim port required)`);
      }
    }
    if (!content.includes('## Mockify application map')) {
      fails.push('rubrics: verdict-integrity.md missing the "## Mockify application map" separator section');
    }
  }
  // No effort/time columns in any rubric table header (INV-4).
  for (const name of RUBRICS) {
    const p = join(dir, `${name}.md`);
    if (!existsSync(p)) continue;
    const lines = read(p).split(/\r?\n/);
    for (let i = 0; i < lines.length - 1; i++) {
      const header = lines[i];
      const sep = lines[i + 1];
      if (/\|/.test(header) && /^\s*\|?\s*:?-{2,}/.test(sep) && /-{2,}\s*\|/.test(sep)) {
        for (const cell of header.split('|')) {
          if (RUBRIC_COLUMN_BAN.test(cell) && !/validator:allow/.test(header)) {
            fails.push(`rubrics: ${name}.md has an effort/time table column "${cell.trim()}" (INV-4)`);
          }
        }
      }
    }
  }
  return { fails, skips: [] };
}

function scopeTemplates() {
  const fails = [];
  const dir = join(PLUGIN_ROOT, 'skills', 'references', 'templates');
  const { missing, unexpected } = namedSet(dir, TEMPLATES);
  for (const n of missing) fails.push(`templates: expected skills/references/templates/${n}.md not found`);
  for (const n of unexpected) fails.push(`templates: unexpected template skills/references/templates/${n}.md (design.md §9 pins exactly five)`);

  const specPath = join(dir, 'spec-file.md');
  if (existsSync(specPath)) {
    const content = read(specPath);
    for (const section of SPEC_FILE_SECTIONS) {
      if (!hasHeading(content, section)) fails.push(`templates: spec-file.md missing section "${section}"`);
    }
    if (!/component map/i.test(content)) fails.push('templates: spec-file.md missing a per-screen component-map block (grep)');
    if (!/states?\s+matrix/i.test(content)) fails.push('templates: spec-file.md missing a per-screen states-matrix block (grep)');
    if (!/responsive/i.test(content)) fails.push('templates: spec-file.md missing a per-screen responsive spec block (grep)');
    if (!/avoid[-\s]?list/i.test(content)) fails.push('templates: spec-file.md missing a per-screen avoid-list block (grep)');
  }
  const critPath = join(dir, 'crit-report.md');
  if (existsSync(critPath) && !/severity/i.test(read(critPath))) {
    fails.push('templates: crit-report.md missing a severity field (grep)');
  }
  const ledgerPath = join(dir, 'mock-ledger.md');
  if (existsSync(ledgerPath) && !/entity[-\s]?resolution/i.test(read(ledgerPath))) {
    fails.push('templates: mock-ledger.md missing an entity-resolution table (grep)');
  }
  return { fails, skips: [] };
}

function scopePrivacy() {
  const fails = [];
  // Load the banlist: each non-comment, non-blank line is a case-insensitive regex.
  const banPatterns = [];
  const banlistPath = join(PLUGIN_ROOT, 'scripts', 'privacy-banlist.txt');
  if (existsSync(banlistPath)) {
    for (const raw of read(banlistPath).split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || line.startsWith('#')) continue;
      try {
        banPatterns.push(new RegExp(line, 'i'));
      } catch (e) {
        fails.push(`privacy: banlist pattern /${line}/ does not compile — ${e.message}`);
      }
    }
  }
  for (const file of walkMd(PLUGIN_ROOT)) {
    const rel = relative(PLUGIN_ROOT, file);
    const lines = read(file).split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('validator:allow')) continue;
      if (TIME_LEXICON.test(line) || WEEK_PHASE.test(line)) {
        fails.push(`privacy: ${rel}:${i + 1} time-estimate lexicon — ${line.trim()}`);
      }
      for (const re of banPatterns) {
        if (re.test(line)) {
          fails.push(`privacy: ${rel}:${i + 1} banlist match /${re.source}/ — ${line.trim()}`);
        }
      }
    }
  }
  return { fails, skips: [] };
}

// --------------------------------- driver ----------------------------------

const SCOPES = {
  manifest: scopeManifest,
  skills: scopeSkills,
  agents: scopeAgents,
  packs: scopePacks,
  traps: scopeTraps,
  rubrics: scopeRubrics,
  templates: scopeTemplates,
  privacy: scopePrivacy,
};
const ORDER = Object.keys(SCOPES);

function parseArgs(argv) {
  const opts = { scope: 'all', preRegistration: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--pre-registration') opts.preRegistration = true;
    else if (a === '--scope') opts.scope = argv[++i];
    else if (a.startsWith('--scope=')) opts.scope = a.slice('--scope='.length);
    else if (a === '--help' || a === '-h') opts.help = true;
    else {
      console.error(`unknown argument: ${a}`);
      process.exit(2);
    }
  }
  return opts;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    console.log('Usage: node scripts/validate.mjs [--scope manifest|skills|agents|packs|traps|rubrics|templates|privacy|all] [--pre-registration]');
    process.exit(0);
  }
  const requested = opts.scope === 'all' ? ORDER : [opts.scope];
  if (opts.scope !== 'all' && !SCOPES[opts.scope]) {
    console.error(`unknown scope: ${opts.scope} (valid: ${ORDER.join('|')}|all)`);
    process.exit(2);
  }

  const summary = [];
  const allFails = [];
  const allSkips = [];
  for (const scope of requested) {
    const { fails, skips } = SCOPES[scope](opts);
    for (const f of fails) allFails.push(f);
    for (const s of skips) allSkips.push(s);
    summary.push({ scope, fails: fails.length, skips: skips.length });
  }

  for (const s of allSkips) console.log(`SKIP ${s}`);
  for (const f of allFails) console.log(`FAIL ${f}`);

  console.log('');
  console.log(`Scope summary (${opts.scope}${opts.preRegistration ? ', --pre-registration' : ''}):`);
  const w = Math.max(...summary.map((s) => s.scope.length));
  for (const s of summary) {
    const status = s.fails ? `FAIL (${s.fails})` : s.skips ? `PASS (${s.skips} skipped)` : 'PASS';
    console.log(`  ${s.scope.padEnd(w)}  ${status}`);
  }

  process.exit(allFails.length ? 1 : 0);
}

main();
