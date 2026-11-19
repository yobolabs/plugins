#!/usr/bin/env node
// UserPromptSubmit hook: push the Remix KB into context on every remix prompt.
//
// A session that promises "I'll search the KB first" does not. This hook does the
// search itself: when the prompt or the session's cwd is remix work, it queries the
// Remix knowledge base over Cadra's REST KB query route and injects the top hits as
// additionalContext, so no agent step can skip it.
//
// Credentials: none here. The request goes through the local keyproxy route, which
// adds the key. Override with REMIX_KB_BASE (route origin) and REMIX_KB_IDS (comma
// list of KB uuids). REMIX_KB_HOOK=0 turns it off, =1 forces it on for any prompt.
//
// Fail open: any error, non-2xx or the 1.5 s deadline -> exit 0, no output.
// Latency and outcome go to ~/.claude/logs/remix-kb-push.log (never the prompt text).

import { appendFileSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const T0 = Date.now();
const DEADLINE_MS = 1500; // total budget, stdin to stdout
const QUERY_MAX_CHARS = 500;
const SHOW_HITS = 3;
const FETCH_TOP_K = 8; // fetch more, keep 3 distinct documents
const BASE = (process.env.REMIX_KB_BASE || 'http://127.0.0.1:8787/cadra-prod-yobo').replace(/\/+$/, '');
const KB_IDS = (process.env.REMIX_KB_IDS || '88204510-bdff-47b3-bb81-daacf90b06fb')
  .split(',').map((s) => s.trim()).filter(Boolean);
const LOG_DIR = join(homedir(), '.claude', 'logs');
const LOG_FILE = join(LOG_DIR, 'remix-kb-push.log');

const TRIGGER = /\b(remix\w*|templates?|storyboards?|needs|teardowns?|briefs?|line[- ]?drawings?|sheets?|ready[- ]?ads?)\b/i;

function log(outcome, extra = '') {
  try {
    mkdirSync(LOG_DIR, { recursive: true });
    appendFileSync(LOG_FILE, `${new Date().toISOString()}\t${Date.now() - T0}ms\t${outcome}${extra ? `\t${extra}` : ''}\n`);
  } catch { /* logging never breaks the hook */ }
}

// Hard stop: whatever is in flight, the hook ends inside the budget with no output.
const killer = setTimeout(() => { log('timeout'); process.exit(0); }, DEADLINE_MS);

function done(outcome, extra, output) {
  clearTimeout(killer);
  log(outcome, extra);
  if (output) process.stdout.write(output);
  process.exit(0);
}

function readStdin() {
  return new Promise((resolve) => {
    let buf = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (c) => { buf += c; });
    process.stdin.on('end', () => resolve(buf));
    process.stdin.on('error', () => resolve(buf));
  });
}

function isRemix(prompt, cwd) {
  if (process.env.REMIX_KB_HOOK === '1') return true;
  if (TRIGGER.test(prompt)) return true;
  const places = [cwd, process.env.CLAUDE_PROJECT_DIR, process.env.PWD];
  if (places.some((p) => p && /remix/i.test(p))) return true;
  return Object.keys(process.env).some((k) => /REMIX/i.test(k) && k !== 'REMIX_KB_HOOK' && !k.startsWith('REMIX_KB_'));
}

function snippet(text) {
  const lines = String(text || '')
    .split('\n')
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter((l) => l && !/^\|?\s*[-:|\s]+\|?$/.test(l)); // drop table rulers / blank
  return lines.slice(0, 2).map((l) => (l.length > 180 ? `${l.slice(0, 177)}...` : l));
}

async function query(kb, q, signal) {
  const res = await fetch(`${BASE}/api/v1/knowledge-bases/${kb}/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: q, topK: FETCH_TOP_K }),
    signal,
  });
  if (!res.ok) throw new Error(`http_${res.status}`);
  const body = await res.json();
  return (body && body.data && Array.isArray(body.data.hits)) ? body.data.hits : [];
}

async function main() {
  if (process.env.REMIX_KB_HOOK === '0') return done('off');
  let input = {};
  try { input = JSON.parse(await readStdin() || '{}'); } catch { return done('bad_input'); }
  const prompt = String(input.prompt || '').trim();
  if (!prompt) return done('empty');
  if (!isRemix(prompt, input.cwd)) return done('skip');

  const q = prompt.slice(0, QUERY_MAX_CHARS);
  const signal = AbortSignal.timeout(Math.max(50, DEADLINE_MS - (Date.now() - T0) - 50));
  let hits;
  try {
    const results = await Promise.all(KB_IDS.map((kb) => query(kb, q, signal)));
    hits = results.flat().sort((a, b) => (b.score || 0) - (a.score || 0));
  } catch (e) {
    return done('error', e && e.name === 'TimeoutError' ? 'fetch_timeout' : String((e && e.message) || 'fetch').slice(0, 40));
  }

  const seen = new Set();
  const top = [];
  for (const h of hits) {
    const key = h.sourcePath || h.documentUuid;
    if (seen.has(key)) continue;
    seen.add(key);
    top.push(h);
    if (top.length === SHOW_HITS) break;
  }
  if (!top.length) return done('no_hits', `q=${q.length}`);

  const parts = ['Remix KB (auto, read before answering):'];
  top.forEach((h, i) => {
    const trail = Array.isArray(h.headingTrail) && h.headingTrail.length ? h.headingTrail.join(' > ') : '';
    parts.push(`${i + 1}. ${trail ? `${trail} | ` : ''}${h.sourcePath || '(no path)'}`);
    parts.push(`   uri: ${h.resourceUri || '-'}  rev: ${String(h.revision || '-').slice(0, 12)}${h.startLine ? `  lines ${h.startLine}-${h.endLine}` : ''}`);
    for (const l of snippet(h.text)) parts.push(`   > ${l}`);
  });
  parts.push('Read the full doc with the remix-context read_document tool before relying on a hit; cite uri + rev.');

  const out = JSON.stringify({
    hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext: parts.join('\n') },
  });
  return done('hit', `n=${top.length} q=${q.length}`, out);
}

main().catch(() => done('error', 'uncaught'));
