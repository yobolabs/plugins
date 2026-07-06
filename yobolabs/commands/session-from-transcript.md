---
name: session-from-transcript
description: Reconstruct a session file (in /session-update format) — or a quick recap — by mining a past Claude Code session's raw .jsonl transcript with jq. Use when a session was never logged, when /resume or /recall is blocked by the 1M-context billing gate, or when the user names a past session by title/uuid/path to write up. Also use when the user mentions "session from transcript", "reconstruct session", "mine transcript", "recover that session", or "recap that session".
model: sonnet
---

# Session From Transcript (raw .jsonl → /session-update file **or** quick recap)

Mine a past Claude Code session's raw `.jsonl` transcript with `jq`, then produce one of
two outputs:

- **Mode B — Full session file (THE DEFAULT)**: a structured session `.md` in the
  **`/session-update` format** (frontmatter + sections), **written to the project's
  configured `sessionsDir`** and provenance-stamped *"Reconstructed from transcript
  `<id>`"*. This is what the command name promises; produce it unless told otherwise.
- **Mode A — Quick recap (opt-in only)**: a tight readable summary, printed not saved.
  Use **only** when the user explicitly says "summarize", "recap", "just tell me",
  "don't write a file", or similar.

> Default to **Mode B** — write the file. A bare invocation like `/session-from-transcript
> <title>` means *create the session file*, not print a summary. Offer the recap only as
> the alternative.

Both modes share the transcript-mining steps (1–6). Mode B additionally resolves the
output location and writes the file (B0–B4).

## Sibling commands

This completes the session-lifecycle set: `/session-start` → `/session-update` →
`/session-end`, and `/session-from-transcript` to **reconstruct** one after the fact from
the raw transcript. Mode B writes to the same `sessionsDir` / `currentSessionFile` those
commands use (resolved in **B0**), so a reconstructed file is indistinguishable from a
live-logged one.

## Fastest path: the bundled extractor

`scripts/mine.sh` does the mining in one pass — header, titles, record counts, timespan,
compaction status, branch/cwd, typed prompts, assistant narrative (→ `/tmp/mine_assist.txt`),
commit ledger, files touched, specs, tool histogram, and a **subagent-transcript
inventory** (the sibling per-agent `.jsonl`s the main file does NOT contain, tiered
HIGH/low). Resolve its path first (`$CLAUDE_PLUGIN_ROOT` is set for this plugin's bash,
with fallbacks), then run it:

```bash
MINE="${CLAUDE_PLUGIN_ROOT:-}/scripts/mine.sh"
[ -f "$MINE" ] || MINE="$(find "$HOME/.claude/plugins" -path '*yobolabs*/scripts/mine.sh' 2>/dev/null | tail -1)"
[ -f "$MINE" ] || { echo "mine.sh not found — use the inline jq recipes below"; }

bash "$MINE" --list                                  # recent transcripts (id + title) for $PWD's repo
bash "$MINE" --title "MI-GTM 6-good" > /tmp/mine.txt  # resolve by TITLE (case/space/hyphen-insensitive)
bash "$MINE" 9d35a155-...-a8fa38b790df > /tmp/mine.txt # by session-uuid
bash "$MINE" /abs/path/to/<uuid>.jsonl > /tmp/mine.txt # by path
bash "$MINE" --latest > /tmp/mine.txt                # newest session
bash "$MINE" --subagent <.../subagents/agent-<id>.jsonl> > /tmp/mine_sub.txt  # Tier-2 deep-read of ONE subagent
```

A bare argument that is neither a path nor a uuid is treated as a **title query**
automatically. Then `Read /tmp/mine.txt` and `/tmp/mine_assist.txt`. If `mine.sh` can't be
located, use the inline recipes in each step below — they produce the same material.

## Why this comes up: the 1M-context billing gate

The error **"Usage credits required for 1M context · run /usage-credits to turn them on,
or /model to switch to standard context"** is a **billing-tier gate, not a token-count
problem**. It fires even on a small (<200k) conversation because the *1M-context tier
itself* is enabled — the message is about the tier, not how full the window is.

- **Fastest unblock:** `/model` → switch to standard 200k context. Clears it without credits.
- **Or:** `/usage-credits` to enable credits for the 1M tier.

When the gate blocks a `/resume`, fall back to reading the transcript off disk with this command.

## Step 1: Resolve the transcript target (title vs uuid vs path)

The user names the session in one of three ways. **A title/name is NOT a filename — it
lives *inside* the transcripts** (`custom-title.customTitle`, which the user sets and
which **wins**; else `ai-title.aiTitle`, auto). Never `ls`/glob for a file named after
the title.

| Input looks like | How to resolve |
|---|---|
| `.../<uuid>.jsonl` path | use it directly |
| a bare UUID (`9d35a155-…`) | `$PROJ/<uuid>.jsonl` |
| anything else — a **title/name** ("MI-GTM 6-good", "the session titled X") | search `customTitle`/`aiTitle` across `$PROJ/*.jsonl`, normalized (case/space/hyphen-insensitive) |

`mine.sh` does this automatically — pass the title, uuid, or path and it dispatches. Or
resolve inline (transcripts live at `$HOME/.claude/projects/<slugified-cwd>/<sessionId>.jsonl`;
the slug is the cwd with every `/` replaced by `-`):

```bash
PROJ="$HOME/.claude/projects/$(printf '%s' "$PWD" | sed 's#/#-#g')"
q="MI-GTM-6-good"; qn=$(printf '%s' "$q" | tr 'A-Z' 'a-z' | sed 's/[-_ ][-_ ]*/ /g; s/^ //; s/ $//')
for f in "$PROJ"/*.jsonl; do
  t=$(jq -r 'select(.type=="custom-title")|.customTitle//empty' "$f" 2>/dev/null | tail -1)
  [ -z "$t" ] && t=$(jq -r 'select(.type=="ai-title")|.aiTitle//empty' "$f" 2>/dev/null | tail -1)
  tn=$(printf '%s' "$t" | tr 'A-Z' 'a-z' | sed 's/[-_ ][-_ ]*/ /g; s/^ //; s/ $//')
  case "$tn" in *"$qn"*) echo "$(basename "$f")  ->  $t" ;; esac
done
```

If 0 match → `--list` the titles and ask. If >1 → show ids+titles and ask which. The
user's typed title may differ in spacing/hyphens from the stored `customTitle` (e.g. they
type `MI-GTM-6-good`, it's stored `MI-GTM 6-good`) — the normalized match handles that.
**The literal title string may also appear in conversation content** (the user typed it)
in *other* transcripts — match on the title records only, not a raw `grep` of the whole file.

> **The path in the prompt is the target.** A session often asks you to recap a *different*
> session (users reuse the prompt and swap the path). Don't assume it's the current one.

## Step 2: Inspect structure before extracting

```bash
f="$PROJ/<sessionId>.jsonl"; ls -lh "$f"; wc -l "$f"
jq -r '.type // .role // "unknown"' "$f" 2>/dev/null | sort | uniq -c | sort -rn
```

Record types — **only `user` and `assistant` carry the conversation**; the rest are
metadata, skip them:

| Type | What it is |
|---|---|
| `assistant` | model turns (text blocks + tool calls) |
| `user` | human prompts AND tool results AND slash-command expansions |
| `custom-title` | **user-set** session title in `.customTitle`; **wins over `ai-title`**; take the last |
| `ai-title` | auto-generated title in `.aiTitle` (many — dedupe, take last); fallback when no `custom-title` |
| `attachment` / `mode` / `system` / `last-prompt` / `queue-operation` / `file-history-snapshot` | session metadata (skip) |

`*.message.content` is **either a string or an array of blocks** — every recipe handles
both. Blocks have `.type` of `text`, `tool_use`, `tool_result`.

> **Sub-agent (Task/Agent-tool) turns are NOT in this file.** Newer harness versions
> persist each dispatched subagent's full transcript to a **sibling directory**
> `<projdir>/<sessionId>/subagents/agent-<id>.jsonl`. The main transcript keeps only each
> subagent's **returned summary** (as a `tool_result`). So a bare mine sees the
> *conclusions* but not the subagent's *process*. **Step 6** covers when and how to fold
> those in. (Older sessions predate this — no `subagents/` dir → nothing to fold.)

## Step 3: Extract the genuine human prompts (the intent spine)

**Discriminator caveat:** `.promptSource` (`typed`/`queued`) is the cleanest signal *when
present*, but it is **version-dependent and often absent**. Don't filter on it alone or
you'll silently drop real prompts. Use this robust filter — keep `typed`/`queued` **or**
records lacking the field, drop meta, tool-results, command/reminder bodies, and
compaction summaries:

```bash
jq -r '
  select(.type=="user")
  | select((.promptSource==null) or .promptSource=="typed" or .promptSource=="queued")
  | select((.isMeta // false)|not)
  | (.message.content) as $c
  | (if ($c|type)=="string" then $c
     elif ($c|type)=="array" then ($c[]|select(.type=="text")|.text)
     else empty end)
  | select(test("^\\s*<(command|local-command|system-reminder)")|not)
  | select(test("continued from a previous conversation")|not)
  | select(length>0)' "$f" 2>/dev/null
```

This yields the ordered list of what the user actually asked for — the backbone of both modes.

## Step 4: Extract the assistant narrative (what was done)

The assistant's **text blocks** (excluding tool calls) are the running "here's what I did"
narrative. Dump to a temp file — never read the multi-MB `.jsonl` into context:

```bash
jq -r 'select(.type=="assistant") | (.message.content) as $c |
  if ($c|type)=="array" then ($c[] | select(.type=="text") | .text) else empty end' \
  "$f" 2>/dev/null | grep -v '^[[:space:]]*$' > /tmp/assist_text.txt
wc -l /tmp/assist_text.txt
```

Then **Read** `/tmp/assist_text.txt` (it paginates large files cleanly).

## Step 5: Pull structured signals

```bash
# Commit hashes reported (ledger of what shipped):
grep -oE '`[0-9a-f]{7,8}`' /tmp/assist_text.txt | sort -u | tr -d '`' | tr '\n' ' '; echo
# Session span:
jq -r 'select(.type=="assistant" or .type=="user") | .timestamp // empty' "$f" | sed -n '1p;$p'
# Compacted? (continuation summary lives in USER records, not assistant text):
jq -r 'select(.type=="user")|.message.content|select(type=="string")' "$f" 2>/dev/null \
  | grep -c 'continued from a previous conversation'        # >0 ⇒ compacted
# Branch + cwd (frontmatter):
jq -r 'select(.gitBranch)|.gitBranch' "$f" | awk 'NF&&!s[$0]++'
jq -r 'select(.cwd)|.cwd' "$f" | awk '!s[$0]++'
# Files touched (apps_touched derive from these paths):
jq -r 'select(.type=="assistant")|.message.content[]?|select(.type=="tool_use" and (.name|test("Edit|Write|NotebookEdit")))|.input.file_path // empty' "$f" | sort -u
```

## Step 6: Subagent transcripts (the process the returns drop)

The main transcript keeps each dispatched subagent's **returned summary** but not its
**process** — the exact edits, discarded hypotheses, real test/command output. Those live
only in the sibling `subagents/` dir. `mine.sh` inventories them (Tier-1) and deep-reads
one (Tier-2):

```bash
# Tier-1 — already in the main mine output, "## SUBAGENT TRANSCRIPTS".
# Tier-2 — deep-read ONE (path from Tier-1). Writes /tmp/mine_sub.txt, then Read it:
bash "$MINE" --subagent "$PROJ/<sessionId>/subagents/agent-<id>.jsonl" > /tmp/mine_sub.txt
```
Inline (no mine.sh): `sdir="${f%.jsonl}/subagents"; ls "$sdir"/agent-*.jsonl` → per file, the
same jq recipes from Steps 4–5 apply (it's just another transcript).

**Tier heuristic** — `[HIGH]` = an implementer (Edit/Write ≥ 10) OR a
debug/regression/rollback/incident mission; `[low]` = review/spec/recon/deploy (its
deliverable is a doc already on disk).

**Decide by session shape — don't blanket-read all of them:**
- **Implementation / debugging / incident session** → **deep-read the `[HIGH]` ones.** Fold:
  FILES CHANGED → *Build state* (precise diff locus + commits per repo); discarded
  hypotheses / failed attempts → *Lessons Learned*; VERIFICATION (real test/tsc/deploy
  output) → *Build state* confidence; incident bash (reset/revert/reflog) → the data-loss
  or rollback note. **Provenance check**: if a subagent's return over-claimed vs what its
  transcript shows, prefer the transcript.
- **Review / spec / planning / research session** → the returns usually suffice. Skim
  Tier-1; deep-read only if a `[HIGH]` mission surprises you.
- **No `subagents/` dir** → nothing to fold; the main-file returns are complete.

Note in the provenance line how many subagents existed and how many you deep-read (e.g.
*"folded 4 of 17 [HIGH] subagents"*).

---

> **Pick the mode: default to B (write the file).** Only do Mode A if the user explicitly
> asked to summarize/recap.

## Mode A — Quick recap (opt-in only)

Do this **only** when the user explicitly said "summarize" / "recap" / "just tell me" /
"don't write a file". Write a tight summary grounded in the extracts (never invent).
Shape: **Header** (short id, date, span, compacted?) · **Goal** (opening typed prompt) ·
**What got done** (narrative + commit ledger; a table works well) · **Where it stopped**
(final assistant message + last timestamp; flag in-flight agents, blocked items,
uncommitted/unpushed state) · **User steering** (corrections/decisions from typed
prompts). Report as a recap, not a file dump. Offer to resume.

A session that ends on `API Error`, repeated "Continue from where you left off", or `No
response requested.` **died mid-flight** — say so and name what was unfinished.

## Mode B — Full session file (THE DEFAULT) — reconstruct a `/session-update` file

Produce a session `.md` in the project's format and **write it to disk**. This is the
default, durable, RAG-ingestable output.

### B0. Resolve the output location (same as the sibling session commands)

`$CLAUDE_PLUGIN_ROOT` may not be set for slash-command Bash, so resolve the claude-mem-pro
plugin root into `$CMPRO` first, then read the configured artifact paths:

```bash
CMPRO=$(node -e 'const fs=require("fs"),os=require("os"),p=require("path");const cfg=process.env.CLAUDE_CONFIG_DIR||p.join(os.homedir(),".claude");const C=[];if(process.env.CLAUDE_PLUGIN_ROOT)C.push(process.env.CLAUDE_PLUGIN_ROOT);try{for(const k of Object.values(JSON.parse(fs.readFileSync(p.join(cfg,"plugins/known_marketplaces.json"),"utf8")))){const s=(k.source&&k.source.path)||k.installLocation;if(s)C.push(p.join(s,"plugin"),s);}}catch(e){}try{const b=p.join(cfg,"plugins/cache/cafesean/claude-mem-pro");for(const v of fs.readdirSync(b))C.push(p.join(b,v,"plugin"),p.join(b,v));}catch(e){}C.push(p.join(cfg,"plugins/marketplaces/cafesean/plugin"));for(const c of C)if(fs.existsSync(p.join(c,"scripts/artifact-paths.cjs"))){process.stdout.write(c);break;}')
node "$CMPRO/scripts/artifact-paths.cjs" get
```

- If `configured: true` → use `sessionsDir` for the file and `currentSessionFile` for the
  tracker (both absolute).
- If `configured: false` OR the resolver finds nothing (claude-mem-pro not installed) →
  fall back to `<repo>/_ai/sessions/` (derive `<repo>` from the transcript's `.cwd`,
  Step 5), creating it if absent. Tell the user you used the fallback.

### B1. Filename

`YYYY-MM-DD-[tag]-kebab-description.md` inside the sessions dir. The **square brackets are
literal characters**. `[tag]` holds only the project/repo short-name (from `projectTags`
in the B0 config if present) — **never** a feature, topic, or descriptor (those go in the
`kebab-description`). Date = the transcript's first-message date (Step 5).

### B2. Frontmatter (match the sibling commands' schema exactly)

```yaml
---
title: "Specific outcome-oriented title — primary RAG search target"
date: YYYY-MM-DD
projects: [project-name]
branch: <gitBranch from Step 5>
status: completed                      # completed | in-progress | blocked | paused
type: feature                          # feature | bugfix | refactor | investigation | qa | migration
topics: []                             # from the /session-start TOPIC TAXONOMY
tags: []                               # additional semantic tags for RAG retrieval
last_updated: <ISO-8601 of last message>
sdk_touched: []
apps_touched: []                       # from files-touched repo roots (Step 5)
commits: ["<hash>", ...]               # the Step 5 commit ledger
related_sessions: []
specs: []                              # the Step 5 specs list, if any
---
```

### B3. Body sections

Open with a one-line **provenance** sentence, then the standard sections (same shape as
`/session-update`):

```markdown
# <Title>

Reconstructed from transcript `<short-id>` (<first→last UTC>, compacted N×; folded M of K subagent transcripts).

## Objective / What this session accomplished
(numbered, concrete outcomes — files, commits, decisions)

## Architecture Issues
(load-bearing decisions/inconsistencies worth keeping; include the question that drove each and the resolution)

## SDK Notes
(library/API patterns discovered, if any)

## Lessons Learned
(specific, actionable; each with Topics / Applies-to / Confidence / Evidence — see /session-update)

## User Steering & Corrections
(quote the user's exact redirects from the Step 3 typed prompts — this is training data)

## Next Steps
(what to pick up next; note uncommitted/unpushed state)
```

Populate from: *What this session accomplished* ← Step 4 narrative; *User Steering* ←
Step 3 typed prompts; *commits* ← Step 5 ledger; and for an implementation/debug/incident
session, enrich *Architecture Issues* / *Lessons Learned* from the Step 6 `[HIGH]`
subagent deep-reads. For the per-section field formats, follow `/session-update` — do not
reinvent them.

### B4. After writing

1. **Append** the new filename as a line to `currentSessionFile` (append — never
   overwrite; multiple sessions may be active). Create it if absent.
2. Tell the user the path written and that it's `/session-update`-format and RAG-ingestable.

## Critical rules

- **Default output is a written session file (Mode B).** A bare `/session-from-transcript
  <title>` means *create the session `.md` file* — do NOT stop at a printed recap. Only do
  Mode A when the user explicitly asks to summarize/recap.
- **A title/name is NOT a filename.** Search `customTitle` (user-set, wins) then `aiTitle`
  *inside* the transcripts, normalized for case/space/hyphen. Never glob the projects dir
  for a file named after the title, and don't trust a raw `grep` of the whole file (the
  title string also appears where the user typed it, in other sessions).
- **Never read the raw `.jsonl` into context.** Multi-MB / thousands of lines.
  `jq`-extract to `/tmp` (or use `mine.sh`), then Read the small extract.
- **Use the robust prompt filter** (Step 3) — `promptSource` alone misses real prompts
  when the field is absent.
- **Handle string-or-array `content`** in every recipe.
- **`grep -v 'system-reminder'`** / the `<command…>` filter on prompt extracts — the
  harness wraps prompts in reminders and expands slash commands inline.
- **A compaction marker is not data loss** — the continuation summary (in `user` records)
  is itself a dense recap; read it. In Mode B note "compacted N×".
- **Subagent process is NOT in the main file — it's in `<sessionId>/subagents/`.** For an
  implementation/debug/incident session, deep-read the `[HIGH]` subagents (Step 6) — else
  you lose the exact diff locus, discarded hypotheses, and real verification output. State
  the coverage (`folded M of K`) in the provenance line.
- **Ground every claim in an extract** — cite the commit hash; don't infer outcomes the
  transcript doesn't state. Mode B is reconstruction, not fiction.
- **Mode B writes to the configured `sessionsDir`** (B0) with literal `[tag]` brackets in
  the filename and appends to `currentSessionFile` — same as `/session-start`.
- **Transcript schema is undocumented and drifts** — verify field names against the live
  file (`jq 'keys'` on a sample record) before relying on them.
