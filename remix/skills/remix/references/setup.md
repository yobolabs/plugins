# First-time setup (once per machine)

Users of this plugin have no local context files and install nothing locally (Sean 2026-11-04). The only setup is
connecting Claude to the Remix knowledge base (one `claude mcp add`); everything else runs in the lab page. Run this
the first time the skill is used (the Remix knowledge base tools are missing).

A path named in this skill (`_context/…`, `yobo:ad-studio-video` `references/…`, `REVIEW.md` §…) is the document's
source path in the KB: `search` for it and `read_document`, never try to open it as a file (users have no repo).

## 1. The Remix KB connection (read) — no key, sign in once

Sean 2026-11-04: "no one needs keys … The MCP is authenticated through OAuth" · "Nobody uses terminal. Everyone's
using claude app." In the **Claude app** (desktop or claude.ai):

1. Settings → **Connectors** → **Add custom connector**.
2. Name: `Remix context`. URL: `https://app.cadraos.com/api/mcp/kb/88204510-bdff-47b3-bb81-daacf90b06fb`.
3. **Advanced settings** → OAuth Client ID: `cadra-claude` (Cadra's pre-registered client for the Claude app,
   `cadra-web/src/extensions/knowledge-bases/client-instructions.ts`).
4. **Add** → **Connect** → sign in with your Cadra account → allow access.

Check: ask Claude to search the Remix knowledge base for "how remix works"; it should cite `HOW-REMIX-WORKS.md`.
Sign-in refused or no results → your Cadra account is not in the org that owns it: ask Sean (one line).
Claude Code in a terminal (rare): `claude mcp add -s user --transport http --client-id cadra-claude-code
--callback-port 33418 remix-context <the URL above>`, then `/mcp` → Authenticate. Never paste a key anywhere.

## 2. The team lab

Nothing to install. https://remix-lab.yobolabs.ai signs you in with Yobo Connect (team email domains only).
If it says your email is not a team email, sign in with your company account.
