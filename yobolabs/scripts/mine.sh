#!/usr/bin/env bash
# mine.sh — extract all raw material from a Claude Code .jsonl transcript in one pass,
# so an agent can synthesize a full /session-update-style file (default) OR a quick recap.
#
# Usage:
#   mine.sh <path-to-session.jsonl>      Mine a specific transcript
#   mine.sh <session-uuid> [repo-path]   Mine by session id (resolved in the repo's project dir)
#   mine.sh --title "<query>" [repo]     Resolve a session by its TITLE (custom-title/ai-title)
#                                        then mine it. Match is case/space/hyphen-insensitive.
#   mine.sh --latest [repo-path]         Mine the newest transcript for a repo (default $PWD)
#   mine.sh --list   [repo-path]         List recent transcripts (mtime, id, title)
#   mine.sh --subagent <agent.jsonl>     Tier-2 deep-read of ONE subagent transcript →
#                                        /tmp/mine_sub.txt (mission, files changed, verification,
#                                        internal narrative, final return). Path from the main
#                                        mine's "## SUBAGENT TRANSCRIPTS" section.
#
# A title is NOT a filename — it is stored INSIDE the transcript (custom-title.customTitle,
# set by the user, wins; else ai-title.aiTitle, auto). --title / --list search those.
#
# Prints a labelled bundle: header, title history, record counts, timespan, compaction
# status, branch/cwd, typed human prompts, assistant narrative, commit ledger, files
# touched, specs referenced, tool histogram, and a SUBAGENT TRANSCRIPTS inventory (sibling
# subagents/ dir — the per-agent .jsonl the main file does NOT contain). Pipe + Read it:
#   mine.sh <file> > /tmp/mine.txt
#
# Projects dir resolves: $CLAUDE_PROJECTS | $CLAUDE_CONFIG_DIR/projects | $HOME/.claude/projects
set -eu

resolve_projects() {
  for d in "${CLAUDE_PROJECTS:-}" "${CLAUDE_CONFIG_DIR:-}/projects" \
           "$HOME/.claude/projects"; do
    [ -n "$d" ] && [ -d "$d" ] && { echo "$d"; return 0; }
  done
  echo "ERROR: no Claude projects dir (set CLAUDE_PROJECTS)" >&2; return 1
}
proj_dir() {
  local p r; p="$(resolve_projects)"
  r="$(cd "${1:-$PWD}" 2>/dev/null && pwd || echo "${1:-$PWD}")"
  echo "$p/$(printf '%s' "$r" | sed 's#/#-#g')"
}

# The session's display title: latest custom-title (user-set) wins, else latest ai-title.
title_of() {
  local t
  t="$(jq -r 'select(.type=="custom-title")|.customTitle // empty' "$1" 2>/dev/null | tail -1)"
  [ -z "$t" ] && t="$(jq -r 'select(.type=="ai-title")|.aiTitle // empty' "$1" 2>/dev/null | tail -1)"
  printf '%s' "$t"
}
# Normalize for fuzzy title match: lowercase, collapse runs of [-_ ] to one space, trim.
norm() { printf '%s' "$1" | tr 'A-Z' 'a-z' | sed 's/[-_ ][-_ ]*/ /g; s/^ //; s/ $//'; }

# Echo "<file>\t<title>" for every transcript whose title contains the query (normalized).
resolve_title() {
  local dir q qn t; dir="$(proj_dir "${2:-$PWD}")"; q="$1"; qn="$(norm "$q")"
  for f in "$dir"/*.jsonl; do
    [ -e "$f" ] || continue
    t="$(title_of "$f")"; [ -z "$t" ] && continue
    case "$(norm "$t")" in *"$qn"*) printf '%s\t%s\n' "$f" "$t" ;; esac
  done
}

list_sessions() {
  local dir; dir="$(proj_dir "${1:-$PWD}")"
  echo "Project dir: $dir"; echo "------------------------------------------------"
  ls -t "$dir"/*.jsonl 2>/dev/null | head -25 | while read -r f; do
    local id mt t; id="$(basename "$f" .jsonl)"
    t="$(title_of "$f")"; mt="$(date -r "$f" '+%Y-%m-%d %H:%M' 2>/dev/null || echo '?')"
    printf '%s  %s  %s\n' "$mt" "$id" "${t:-<no title>}"
  done
}

mine() {
  local f="$1"
  [ -f "$f" ] || { echo "ERROR: not found: $f" >&2; return 1; }

  echo "=================================================================="
  echo "TRANSCRIPT: $f"
  echo "  id: $(basename "$f" .jsonl)   size: $(du -h "$f"|cut -f1)   lines: $(wc -l <"$f"|tr -d ' ')"
  echo "  title: $(title_of "$f")"
  echo "=================================================================="

  echo ""; echo "## TITLE HISTORY (custom-title wins; ai-title auto)"
  jq -r 'select(.type=="custom-title")|"custom: "+(.customTitle//"")' "$f" 2>/dev/null | awk 'NF&&!s[$0]++'
  jq -r 'select(.type=="ai-title")|"ai:     "+(.aiTitle//"")' "$f" 2>/dev/null | awk 'NF&&!s[$0]++'

  echo ""; echo "## RECORD TYPES"
  jq -r '.type // "?"' "$f" | sort | uniq -c | sort -rn

  echo ""; echo "## TIMESPAN (UTC, first→last)"
  jq -r 'select(.type=="assistant" or .type=="user")|.timestamp // empty' "$f" | sed -n '1p;$p'

  echo ""; echo "## COMPACTION"
  local nc
  nc=$(jq -r 'select(.type=="user")|.message.content|select(type=="string")' "$f" 2>/dev/null \
       | grep -c 'continued from a previous conversation' || true)
  echo "  continuation markers: ${nc:-0}  (>0 ⇒ session was compacted; pre-marker detail is summarized, not lost)"

  echo ""; echo "## BRANCH / CWD"
  jq -r 'select(.gitBranch)|.gitBranch' "$f" 2>/dev/null | awk 'NF&&!s[$0]++' | sed 's/^/  branch: /'
  jq -r 'select(.cwd)|.cwd' "$f" 2>/dev/null | awk '!s[$0]++' | sed 's/^/  cwd: /'

  echo ""; echo "## TYPED HUMAN PROMPTS (intent spine — robust to missing promptSource)"
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
    | select(length>0)
    | "• " + (if length>600 then .[:600]+" …" else . end)
  ' "$f" 2>/dev/null

  echo ""; echo "## ASSISTANT NARRATIVE → /tmp/mine_assist.txt (Read it; not inlined)"
  jq -r 'select(.type=="assistant")|.message.content|if type=="array" then (.[]|select(.type=="text")|.text) else empty end' \
    "$f" 2>/dev/null | grep -v '^[[:space:]]*$' > /tmp/mine_assist.txt || true
  echo "  lines: $(wc -l </tmp/mine_assist.txt 2>/dev/null | tr -d ' ')"

  echo ""; echo "## COMMIT LEDGER (short hashes mentioned in narrative)"
  grep -oE '`[0-9a-f]{7,8}`' /tmp/mine_assist.txt 2>/dev/null | tr -d '`' | sort -u | tr '\n' ' '; echo

  echo ""; echo "## FILES TOUCHED (Edit/Write/NotebookEdit tool inputs)"
  jq -r 'select(.type=="assistant")|.message.content[]?|select(.type=="tool_use" and (.name|test("Edit|Write|NotebookEdit")))|.input.file_path // empty' \
    "$f" 2>/dev/null | sort -u

  echo ""; echo "## SPECS REFERENCED"
  grep -oE '_context/[A-Za-z0-9_./-]+/_specs/[A-Za-z0-9_./-]+' "$f" 2>/dev/null | sort -u

  echo ""; echo "## TOOL HISTOGRAM"
  jq -r 'select(.type=="assistant")|.message.content[]?|select(.type=="tool_use")|.name' "$f" 2>/dev/null | sort | uniq -c | sort -rn

  echo ""; echo "## SUBAGENT TRANSCRIPTS (per-agent .jsonl, sibling dir — NOT in the main file)"
  # Sub-agent (Task/Agent-tool) turns are persisted separately at <transcript>/subagents/agent-*.jsonl.
  # The MAIN transcript keeps only each agent's RETURNED summary (as a tool_result); the agent's
  # internal steps — exact edits, discarded hypotheses, real test output, incident ground truth —
  # live ONLY here. Tier-1 inventory below; deep-read a [HIGH] one with:  mine.sh --subagent <file>
  local sdir="${f%.jsonl}/subagents"
  if [ -d "$sdir" ] && ls "$sdir"/agent-*.jsonl >/dev/null 2>&1; then
    echo "  dir: $sdir"
    echo "  ($(ls "$sdir"/agent-*.jsonl 2>/dev/null | wc -l | tr -d ' ') files, $(du -sh "$sdir" 2>/dev/null | cut -f1)) — [HIGH]=deep-read (implementer/debug/incident), [low]=return summary suffices"
    for x in "$sdir"/agent-*.jsonl; do
      [ -e "$x" ] || continue
      local ln edits bashes tools mission tier
      ln=$(wc -l <"$x" | tr -d ' ')
      edits=$(jq -r 'select(.type=="assistant")|.message.content[]?|select(.type=="tool_use" and (.name|test("Edit|Write|NotebookEdit")))|.name' "$x" 2>/dev/null | grep -c . || true)
      bashes=$(jq -r 'select(.type=="assistant")|.message.content[]?|select(.type=="tool_use" and .name=="Bash")|.name' "$x" 2>/dev/null | grep -c . || true)
      tools=$(jq -r 'select(.type=="assistant")|.message.content[]?|select(.type=="tool_use")|.name' "$x" 2>/dev/null | sort | uniq -c | sort -rn | awk '{printf "%s×%s ",$2,$1}')
      mission=$(jq -r 'select(.type=="user")|.message.content|if type=="string" then . elif type=="array" then (.[]|select(.type=="text")|.text) else empty end' "$x" 2>/dev/null | grep -v '^[[:space:]]*$' | head -1 | tr '\n' ' ' | cut -c1-90)
      # HIGH value = an implementer (many edits) OR a debug/incident/rollback mission — its process is worth reading.
      if [ "${edits:-0}" -ge 10 ] || printf '%s' "$mission" | grep -qiE 'debug|regression|rollback|revert|incident|urgent|root cause|evidence-first|fix .*(dev|prod|bug)'; then
        tier="HIGH"
      else
        tier="low "
      fi
      printf '  [%s] %-30s %5s ln | %s\n         ↳ %s\n' "$tier" "$(basename "$x")" "$ln" "${tools% }" "$mission"
    done
    echo "  deep-read a HIGH one:  $0 --subagent $sdir/<agent-id>.jsonl > /tmp/mine_sub.txt"
  else
    echo "  none (session predates per-subagent persistence, or spawned no Agent-tool subagents)"
  fi
}

# Tier-2: deep-read ONE subagent transcript — the process the main transcript's return summary drops.
# Writes /tmp/mine_sub.txt: mission, files changed (count/path), verification/key bash, full internal
# narrative, and the final return block. Read that file (small), don't inline the raw subagent .jsonl.
subagent_report() {
  local sf="$1" out="${2:-/tmp/mine_sub.txt}"
  [ -f "$sf" ] || { echo "ERROR: subagent transcript not found: $sf" >&2; return 1; }
  {
    echo "=================================================================="
    echo "SUBAGENT: $sf"
    echo "  lines: $(wc -l <"$sf" | tr -d ' ')   size: $(du -h "$sf" | cut -f1)"
    echo "=================================================================="
    echo ""; echo "## MISSION (task prompt handed to the subagent — first user text)"
    jq -r 'select(.type=="user")|.message.content|if type=="string" then . elif type=="array" then (.[]|select(.type=="text")|.text) else empty end' \
      "$sf" 2>/dev/null | grep -v '^[[:space:]]*$' | head -1
    echo ""; echo "## FILES CHANGED (Edit/Write/NotebookEdit — count per path; the precise diff locus)"
    jq -r 'select(.type=="assistant")|.message.content[]?|select(.type=="tool_use" and (.name|test("Edit|Write|NotebookEdit")))|.input.file_path // empty' \
      "$sf" 2>/dev/null | sort | uniq -c | sort -rn
    echo ""; echo "## VERIFICATION / KEY BASH (test/tsc/pnpm/vitest/git/deploy — evidence, not claims)"
    jq -r 'select(.type=="assistant")|.message.content[]?|select(.type=="tool_use" and .name=="Bash")|.input.command // empty' \
      "$sf" 2>/dev/null | grep -iE 'test|tsc|pnpm|vitest|jest|git (merge|push|revert|reset|log|status|cherry)|deploy|docker|curl|redis|narration' | head -50
    echo ""; echo "## INTERNAL NARRATIVE (the subagent's own reasoning — incl. discarded hypotheses)"
    jq -r 'select(.type=="assistant")|.message.content|if type=="array" then (.[]|select(.type=="text")|.text) else empty end' \
      "$sf" 2>/dev/null | grep -v '^[[:space:]]*$'
    echo ""; echo "## FINAL RETURN (last assistant text = what it reported back to the parent)"
    jq -r 'select(.type=="assistant")|.message.content|if type=="array" then (.[]|select(.type=="text")|.text) else empty end' \
      "$sf" 2>/dev/null | grep -v '^[[:space:]]*$' | tail -40
  } > "$out"
  echo "Wrote $out ($(wc -l <"$out" | tr -d ' ') lines) — Read it. Fold FILES CHANGED → Build state, discarded hypotheses → Lessons, VERIFICATION → confidence."
}

# Resolve a non-path, non-uuid argument (a title/name) to a file, then mine.
mine_by_title() {
  local q="$1" repo="${2:-$PWD}" hits n
  hits="$(resolve_title "$q" "$repo")"
  n="$(printf '%s' "$hits" | grep -c . || true)"
  if [ "${n:-0}" -eq 0 ]; then
    echo "No session title matches: \"$q\"  (searched custom-title + ai-title in $(proj_dir "$repo"))" >&2
    echo "Run:  mine.sh --list   to see available titles." >&2
    return 1
  elif [ "$n" -eq 1 ]; then
    mine "$(printf '%s' "$hits" | head -1 | cut -f1)"
  else
    echo "Multiple sessions match \"$q\" — disambiguate by id:" >&2
    printf '%s\n' "$hits" | while IFS="$(printf '\t')" read -r f t; do
      echo "  $(basename "$f" .jsonl)  —  $t" >&2
    done
    return 2
  fi
}

is_uuid() { printf '%s' "$1" | grep -qiE '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'; }

case "${1:-}" in
  --list)   list_sessions "${2:-$PWD}" ;;
  --title)  [ -n "${2:-}" ] || { echo "Usage: mine.sh --title \"<query>\" [repo]" >&2; exit 2; }
            mine_by_title "$2" "${3:-$PWD}" ;;
  --latest) f="$(ls -t "$(proj_dir "${2:-$PWD}")"/*.jsonl 2>/dev/null | head -1)"
            [ -n "$f" ] || { echo "ERROR: no transcripts found" >&2; exit 1; }; mine "$f" ;;
  --subagent) [ -n "${2:-}" ] || { echo "Usage: mine.sh --subagent <.../subagents/agent-<id>.jsonl> [outfile]" >&2; exit 2; }
            subagent_report "$2" "${3:-/tmp/mine_sub.txt}" ;;
  "" )      echo "Usage: mine.sh <session.jsonl|uuid> | --title \"<q>\" | --latest [repo] | --list [repo] | --subagent <agent.jsonl>" >&2; exit 2 ;;
  * )       if [ -f "$1" ]; then mine "$1"
            elif is_uuid "$1"; then mine "$(proj_dir "${2:-$PWD}")/$1.jsonl"
            else mine_by_title "$1" "${2:-$PWD}"; fi ;;   # not a path / uuid → treat as a title query
esac
