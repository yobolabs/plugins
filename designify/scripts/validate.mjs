#!/usr/bin/env node
// designify structural validator — dev tooling, zero dependencies, Node >=18.
// Contract (specs SS2.0): run from the plugin root; exit 0 = pass, nonzero = fail.
//   node scripts/validate.mjs [--scope manifest|skills|agents|packs|traps|rubrics|templates|privacy|all] [--pre-registration]
// Failures print one per line as `FAIL <scope>: <message>`; a scope summary follows.
// The plugin is docs-only — this script is the build gate, not a runtime.

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join, relative } from 'node:path';

const PLUGIN_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// ---- Structural invariants: the exact named authored files (specs SS2.1) ----
const AGENTS = ['design-recon', 'design-director', 'design-critic', 'design-judge'];
const SKILLS = ['designify', 'execute', 'simulate', 'grading'];
const PACKS = ['visual-hierarchy', 'typography', 'color-contrast', 'channel-grammar', 'conversion-craft', 'authenticity'];
const TRAPS = ['ai-artifacts', 'cliche-inauthentic', 'hierarchy-failures', 'channel-violations', 'brand-drift'];
const RUBRICS = ['authenticity', 'craft', 'conversion', 'concept-selection', 'verdict-integrity'];
const TEMPLATES = ['mission-brief', 'concept-card', 'craft-file', 'crit-report', 'craft-ledger'];

// Pack skeleton headings (specs SS2.4) — all seven required per pack.
const PACK_SECTIONS = [
  'Scope',
  'Core craft principles',
  'Directive inventory',
  'Signature questions',
  'Placement / asset-class mapping',
  'Exemplar pointers',
  'Trap cross-references',
];

// Trap entry fields (specs SS2.5) — all eight required per entry.
const TRAP_FIELDS = ['id', 'anti-pattern', 'markers', 'why-it-fails', 'negative-prompt', 'severity', 'provenance-class', 'privacy-check'];

// Craft-file sections (specs Part 5) — all eight, order authored by STORY-002.
const CRAFT_FILE_SECTIONS = [
  'Mission summary',
  'M-rules',
  'Chosen direction',
  'Authenticity guardrails',
  'Per-asset sections',
  'Batch discipline',
  'Open questions',
  'Feedback hook',
];

// Canonical honesty-tag vocabulary (specs SS2.2, normative). ASCII only.
const CANONICAL_TOKENS = ['checked', 'reasoned', 'guessing', 'dont-know'];

// Time-estimate lexicon ban (specs SS6.2). Word-boundaried; validator:allow exempts a line.
const TIME_LEXICON = /\b(weeks?|days?|hours?|wks|hrs|timebox(?:ed|es|ing)?)\b/i;
// Week-numbered phase ban (e.g. "Week 3", "Weeks 2-5") — schedule framing.
const WEEK_PHASE = /\bweeks?\s+\d/i;
// Effort/time column ban for rubric table headers (specs SS6.2).
const RUBRIC_COLUMN_BAN = /\b(effort|time|duration|eta|weeks?|days?|hours?|wks|hrs|timebox)\b/i;

// ---- The verdict-integrity fixture (specs Appendix B.1), base64-embedded to
// guarantee byte-fidelity (em-dash / curly-quote / >= are preserved exactly) and
// so the build never depends on resolving the live spar path. rubrics/verdict-
// integrity.md MUST begin with these exact bytes (specs SS2.0 rubrics scope). ----
const VERDICT_INTEGRITY_FIXTURE_B64 =
  'IyBWZXJkaWN0LUludGVncml0eSBSdWJyaWMg4oCUIHRoZSBhbnRpLXN5Y29waGFuY3kgbGF3CgpCaW5kcyBldmVyeSBzdGFuY2UgaW4gYm90aCBtb2Rlcy4gVGhlIGp1ZGdlIHNjb3JlcyB0cmFuc2NyaXB0cyBhbmQgZHJhZnRzIGFnYWluc3QgQUxMIFNJWCBydWxlczsgdGhlIHRhcmdldCBpcyAqKjAgdmlvbGF0aW9ucyoqLiBFYWNoIHJ1bGUgaXMgYW4gZW5mb3JjZWFibGUgY2hlY2s6IHdoYXQgdG8gdmVyaWZ5LCBob3cgdG8gZGV0ZWN0IGEgdmlvbGF0aW9uLCB3aGF0IGNvdW50cyBhcyBhIHBhc3MuIFZpb2xhdGlvbnMgYXJlIHJlcG9ydGVkIGJ5IHJ1bGUgbnVtYmVyIHdpdGggdGhlIG9mZmVuZGluZyBsaW5lIHF1b3RlZC4KCiMjIFIxIOKAlCBTdGVlbG1hbiBnYXRlCi0gKipDaGVjazoqKiBubyBhdHRhY2sgZXhpc3RzIGJlZm9yZSB0aGUgdXNlciBjb25maXJtZWQgdGhlIHN0ZWVsbWFuIGZhaXIuCi0gKipEZXRlY3Q6KiogaW4gc3Bhci1zdGF0ZS5tZCwgdGhlIGBTdGVlbG1hbjogY29uZmlybWVkYCBsaW5lIG11c3QgcHJlY2VkZSB0aGUgcm91bmQncyBmaXJzdCBhdHRhY2s7IGluIG1pc3Npb24gbW9kZSwgdGhlIHN0ZWVsbWFuIGJsb2NrIG11c3QgcHJlY2VkZSB0aGUgZmlyc3QgcGVyLW1vdmUgcmVhY3Rpb24uCi0gKipWaW9sYXRpb246KiogYW55IGF0dGFjayBsb2dnZWQgYmVmb3JlIGNvbmZpcm1hdGlvbjsgYSBzdGVlbG1hbiB0aGF0IHdlYWtlbnMgdGhlIHBvc2l0aW9uIChzdHJhdy1tYW4gcmVzaWR1ZSkgY291bnRzIGV2ZW4gaWYgY29uZmlybWVkIOKAlCBzcG90LWNoZWNrIHRoYXQgdGhlIHN0ZWVsbWFuIGFkZHMgZXZpZGVuY2UgcmF0aGVyIHRoYW4gZHJvcHBpbmcgaXQuCgojIyBSMiDigJQgTm8gdW5lYXJuZWQgcHJhaXNlCi0gKipDaGVjazoqKiBldmVyeSBwb3NpdGl2ZSBzdGF0ZW1lbnQgY2l0ZXMgdGhlIGV2aWRlbmNlIHRoYXQgZWFybmVkIGl0LgotICoqRGV0ZWN0OioqIHNjYW4gZm9yIHByYWlzZSBhZGplY3RpdmVzICgiZ3JlYXQiLCAic3Ryb25nIiwgInNvbGlkIiwgInNtYXJ0IiwgImltcHJlc3NpdmUiKSDigJQgZWFjaCBtdXN0IGJlIGF0dGFjaGVkIHRvIGl0cyBlYXJuaW5nIGNpdGF0aW9uICgic3Ryb25nOiB0aGUgcGlsb3QgY29udmVydGVkIDQwJSwgZmFjdCBGMyIpLiAiR3JlYXQgaWRlYSwgYnV04oCmIiBmaWxsZXIgaXMgdGhlIHNpZ25hdHVyZSB2aW9sYXRpb24uCi0gKipQYXNzOioqIHplcm8gdW5jaXRlZCBwb3NpdGl2ZXMuIFNpbGVuY2UgYWJvdXQgcXVhbGl0eSBpcyBhbHdheXMgYWxsb3dlZDsgZmxhdHRlcnkgbmV2ZXIgaXMuCgojIyBSMyDigJQgQ2xvc2VkIHZlcmRpY3Qgdm9jYWJ1bGFyeQotICoqQ2hlY2s6KiogcGVyIGF0dGFjayBzdXJmYWNlLCBleGFjdGx5IG9uZSBvZiAqKnN1cnZpdmVzIC8gd291bmRlZCAvIGRlYWQqKiwgYW5kIGV2ZXJ5IHZlcmRpY3QgbmFtZXMgaXRzIGZsaXAgY29uZGl0aW9uLgotICoqRGV0ZWN0OioqIHNjYW4gdmVyZGljdHMgZm9yIG9wZW4gdm9jYWJ1bGFyeSDigJQgImludGVyZXN0aW5nIiwgIndvcnRoIGNvbnNpZGVyaW5nIiwgImhhcyBtZXJpdCIsICJmb29kIGZvciB0aG91Z2h0IiwgImxhcmdlbHkgaG9sZHMiIOKAlCBlYWNoIGlzIGEgdmlvbGF0aW9uLiBBIHZlcmRpY3Qgd2l0aG91dCBhIGZsaXAgY29uZGl0aW9uIGlzIGEgdmlvbGF0aW9uIGV2ZW4gaW4gdGhlIGNvcnJlY3Qgdm9jYWJ1bGFyeS4KLSAqKkRlZ3JhZGVkLW1vZGUgZXh0ZW5zaW9uOioqIGBkZWFkYCBpc3N1ZWQgb24gYHVucmVzZWFyY2hlZGAgZXZpZGVuY2UgaXMgYSB2aW9sYXRpb247IHRoZSBjYXAgaXMgIndvdW5kZWQsIHBlbmRpbmcgdmVyaWZpY2F0aW9uIChodW50OiBYKSIuCgojIyBSNCDigJQgQ29uY2Vzc2lvbiBzeW1tZXRyeQotICoqQ2hlY2s6KiogcmVmdXRlZCBhdHRhY2tzIGFyZSBkZWNsYXJlZCBkZWFkIGV4cGxpY2l0bHksIGFuZCBjb25jZWRlZCBncm91bmQgc3RheXMgY29uY2VkZWQuCi0gKipEZXRlY3Q6KiogYSB1c2VyIGNvdW50ZXIgZm9sbG93ZWQgYnkgdGhlIGF0dGFjayBzaWxlbnRseSBkaXNhcHBlYXJpbmcgKG5vIGV4cGxpY2l0ICJBMi4zIGRlYWQg4oCUIGRlZmVhdGVkIGJ5IOKApiIpIGlzIGEgdmlvbGF0aW9uOyBhbnkgYXR0YWNrIHJlLXJhaXNlZCBvbiBjb25jZWRlZCBncm91bmQgaXMgYSB2aW9sYXRpb247IGEgZnVsbCBzcGFyIGluIHdoaWNoIHJlZC10ZWFtIG5ldmVyIGxvc2VzIGEgc2luZ2xlIHBvaW50IGlzIGZsYWdnZWQgYXMgcHJvYmFibGUgdGhlYXRlciBmb3IgbWFudWFsIHJldmlldy4KLSAqKldoeSBpdCdzIGxhdzoqKiBhIHNwYXJyaW5nIHBhcnRuZXIgdGhhdCBuZXZlciBsb3NlcyBhIHBvaW50IGlzbid0IHJpZ29yb3VzIOKAlCBpdCdzIHBlcmZvcm1pbmcgcmlnb3IuCgojIyBSNSDigJQgQXR0YWNrIHF1YWxpdHkgZmxvb3IKLSAqKkNoZWNrOioqIGV2ZXJ5IGF0dGFjayBpcyBhdHRyaWJ1dGVkIChwZXJzb25hIG9yIHN0YW5jZSkgKyBldmlkZW5jZS1jbGFzc2VkIChiYXNlIHJhdGUgLyBpbmNlbnRpdmUgLyBwcmVjZWRlbnQgLyBsb2dpYykgKyBmYWxzaWZpYWJsZSAoc3RhdGVzIHRoZSBvYnNlcnZhdGlvbiB0aGF0IHdvdWxkIGtpbGwgaXQpLgotICoqRGV0ZWN0OioqIGFueSBhdHRhY2sgbWlzc2luZyBvbmUgb2YgdGhlIHRocmVlIGlzIGZpbGxlciDigJQgdGhlIGp1ZGdlIHN0cmlrZXMgaXQgYW5kIGNvdW50cyBpdCBhZ2FpbnN0IHRoZSDiiaUgOTAlIGZsb29yIHJhdGUgKHN1Y2Nlc3MubWQgUzIpLiBVbmZhbHNpZmlhYmxlIHBlc3NpbWlzbSAoInNvbWV0aGluZyBjb3VsZCBnbyB3cm9uZyIpIGlzIHRoZSBzaWduYXR1cmUgdmlvbGF0aW9uLgoKIyMgUjYg4oCUIERyaWZ0IGF1ZGl0Ci0gKipDaGVjazoqKiBubyBzb2Z0ZW5pbmcgYWNyb3NzIHJvdW5kcyB3aXRob3V0IGNhdXNlLgotICoqRGV0ZWN0OioqIHBlci1yb3VuZCBtZXRyaWNzIG92ZXIgdGhlIHRyYW5zY3JpcHQg4oCUIGZsb29yLXBhc3MgcmF0ZSwgdmVyZGljdCBkaXN0cmlidXRpb24sIHByYWlzZS13aXRob3V0LWNpdGF0aW9uIGNvdW50LCBoZWRnZSBkZW5zaXR5LiBWaW9sYXRpb25zOiBhIHZlcmRpY3QgaW1wcm92aW5nIHJvdW5kLW92ZXItcm91bmQgd2l0aCBOTyBuZXcgZXZpZGVuY2UgYW5kIE5PIGFtZW5kbWVudCAoYWdyZWVtZW50IGNyZWVwKTsgYXR0YWNrIHNoYXJwbmVzcyBkZWNheWluZyB3aGlsZSB0aGUgcG9zaXRpb24gaXMgdW5jaGFuZ2VkOyBjb25zZWN1dGl2ZSByb3VuZHMgd2hlcmUgbm90aGluZyBkaWVzIG9uIGVpdGhlciBzaWRlLgotICoqUGFzczoqKiBldmVyeSB2ZXJkaWN0IGNoYW5nZSBpbiB0aGUgdHJhbnNjcmlwdCBpcyB0cmFjZWFibGUgdG8gYSBzcGVjaWZpYyBjb3VudGVyLCBhbWVuZG1lbnQsIG9yIGh1bnQgcmVzdWx0LgoKIyMgQWRqYWNlbnQgZnJhdWQgKGF1ZGl0ZWQgaW4gdGhlIHNhbWUgcGFzcywgc2NvcmVkIHVuZGVyIGp1ZGdlIGRpbWVuc2lvbiAyKQoKKipEZXB0aCB0aGVhdGVyKiog4oCUIGNsYWltZWQgb3JkZXIgPiB3YWxrZWQgb3JkZXI6IGNvbnNlcXVlbmNlIGZpbmRpbmdzIHJlbnVtYmVyZWQgdG8gbG9vayBkZWVwLCBvciAib3JkZXIgNCIgY2hhaW5zIHdob3NlIGludGVybWVkaWF0ZSBzdGVwcyBhcmUgbWlzc2luZy4gTm90IG9uZSBvZiB0aGUgc2l4IHJ1bGVzLCBidXQgdGhlIGp1ZGdlJ3MgIzEgZnJhdWQgdGFyZ2V0OyB6ZXJvIHRvbGVyYW5jZSBpbiB0aGUgY2FsaWJyYXRpb24gZ2F0ZS4K';
const VERDICT_INTEGRITY_FIXTURE = Buffer.from(VERDICT_INTEGRITY_FIXTURE_B64, 'base64').toString('utf8');

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

// Compare `content` against the fixture as a byte-exact prefix; report first diff.
function fixturePrefixDiff(content) {
  if (content.startsWith(VERDICT_INTEGRITY_FIXTURE)) return null;
  const a = Buffer.from(VERDICT_INTEGRITY_FIXTURE, 'utf8');
  const b = Buffer.from(content, 'utf8');
  const n = Math.min(a.length, b.length);
  let i = 0;
  while (i < n && a[i] === b[i]) i++;
  if (b.length < a.length && i === b.length) {
    return `file is shorter than the fixture (${b.length} < ${a.length} bytes); truncated at byte ${i}`;
  }
  const exp = a[i] === undefined ? 'EOF' : JSON.stringify(String.fromCharCode(a[i]));
  const got = b[i] === undefined ? 'EOF' : JSON.stringify(String.fromCharCode(b[i]));
  return `diverges from the Appendix B.1 fixture at byte ${i} (expected ${exp}, got ${got})`;
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

  // Version-sync against the marketplace entry (specs SS2.0). Entry lands in STORY-009.
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
    const entry = entries.find((p) => p && (p.name === 'designify' || p.source === './designify'));
    if (!entry) {
      const msg = 'marketplace.json has no designify entry (registered in STORY-009)';
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
  for (const n of unexpected) fails.push(`agents: unexpected agents/${n}.md (INV-1: exactly the four named agents, one generator)`);
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
  // design-recon must declare exactly the four canonical honesty tokens (specs SS2.2).
  const reconPath = join(dir, 'design-recon.md');
  if (existsSync(reconPath)) {
    const content = read(reconPath);
    for (const tok of CANONICAL_TOKENS) {
      if (!new RegExp('\\b' + tok.replace('-', '\\-') + '\\b').test(content)) {
        fails.push(`agents: design-recon.md does not declare canonical token "${tok}"`);
      }
    }
    // Variant spellings in a tag context fail. The ASCII rule forbids apostrophe/spaced
    // forms as tokens; a display-prose "don't know" (apostrophe + space) is left alone.
    if (/don['’]t-know/i.test(content)) fails.push('agents: design-recon.md uses the apostrophe variant "don\'t-know" — canonical token is ASCII "dont-know"');
    if (/\bdont know\b/i.test(content)) fails.push('agents: design-recon.md uses the spaced variant "dont know" — canonical token is ASCII "dont-know"');
    // Foreign (growthify) vocabulary used as a tag enumeration (joined by / or |).
    if (/\b(verified|inferred|assumed|unknown)\b\s*[/|]\s*\b(verified|inferred|assumed|unknown)\b/i.test(content)) {
      fails.push('agents: design-recon.md declares the growthify vocabulary (verified/inferred/assumed/unknown) as a tag enumeration — designify uses checked/reasoned/guessing/dont-know');
    }
  }
  return { fails, skips: [] };
}

function scopePacks() {
  const fails = [];
  const dir = join(PLUGIN_ROOT, 'skills', 'references', 'packs');
  const { missing, unexpected } = namedSet(dir, PACKS);
  for (const n of missing) fails.push(`packs: expected skills/references/packs/${n}.md not found`);
  for (const n of unexpected) fails.push(`packs: unexpected pack skills/references/packs/${n}.md (specs SS2.1 pins exactly six)`);
  for (const name of PACKS) {
    const p = join(dir, `${name}.md`);
    if (!existsSync(p)) continue;
    const content = read(p);
    for (const section of PACK_SECTIONS) {
      if (!hasHeading(content, section)) fails.push(`packs: ${name}.md missing skeleton section heading "${section}" (specs SS2.4)`);
    }
  }
  return { fails, skips: [] };
}

function scopeTraps() {
  const fails = [];
  const dir = join(PLUGIN_ROOT, 'skills', 'references', 'traps');
  const { missing, unexpected } = namedSet(dir, TRAPS);
  for (const n of missing) fails.push(`traps: expected skills/references/traps/${n}.md not found`);
  for (const n of unexpected) fails.push(`traps: unexpected trap skills/references/traps/${n}.md (specs SS2.1 pins exactly five)`);
  for (const name of TRAPS) {
    const p = join(dir, `${name}.md`);
    if (!existsSync(p)) continue;
    const content = read(p);
    const entryCount = countFieldLabel(content, 'id');
    if (entryCount < 1) {
      fails.push(`traps: ${name}.md has no entries (no "id:" field found; specs SS2.5)`);
      continue;
    }
    for (const field of TRAP_FIELDS) {
      if (field === 'id') continue;
      const c = countFieldLabel(content, field);
      if (c !== entryCount) {
        fails.push(`traps: ${name}.md field "${field}" appears ${c}x but has ${entryCount} ent"${entryCount === 1 ? 'y' : 'ies'}" — every entry needs all eight SS2.5 fields`);
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
  for (const n of unexpected) fails.push(`rubrics: unexpected rubric skills/references/rubrics/${n}.md (specs SS2.1 pins exactly five)`);

  const viPath = join(dir, 'verdict-integrity.md');
  if (existsSync(viPath)) {
    const content = read(viPath);
    const diff = fixturePrefixDiff(content);
    if (diff) fails.push(`rubrics: verdict-integrity.md must begin byte-for-byte with the Appendix B.1 fixture — ${diff}`);
    if (!content.includes('## Designify application map')) {
      fails.push('rubrics: verdict-integrity.md missing the "## Designify application map" separator section (specs SS2.0)');
    }
  }
  // No effort/time columns in any rubric table header (specs SS6.2).
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
            fails.push(`rubrics: ${name}.md has an effort/time table column "${cell.trim()}" (specs SS6.2)`);
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
  for (const n of unexpected) fails.push(`templates: unexpected template skills/references/templates/${n}.md (specs SS2.1 pins exactly five)`);

  const craftPath = join(dir, 'craft-file.md');
  if (existsSync(craftPath)) {
    const content = read(craftPath);
    for (const section of CRAFT_FILE_SECTIONS) {
      if (!hasHeading(content, section)) fails.push(`templates: craft-file.md missing Part 5 section "${section}"`);
    }
    if (!/positive[-\s]?prompt/i.test(content)) fails.push('templates: craft-file.md missing a per-asset positive-prompt block (grep)');
    if (!/negative[-\s]?prompts?|avoid[-\s]?list/i.test(content)) fails.push('templates: craft-file.md missing a per-asset negative-prompts/avoid-list block (D4, grep)');
  }
  const critPath = join(dir, 'crit-report.md');
  if (existsSync(critPath) && !/severity/i.test(read(critPath))) {
    fails.push('templates: crit-report.md missing a severity field (grep)');
  }
  const ledgerPath = join(dir, 'craft-ledger.md');
  if (existsSync(ledgerPath) && !/entity[-\s]?resolution/i.test(read(ledgerPath))) {
    fails.push('templates: craft-ledger.md missing an entity-resolution table (grep)');
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
