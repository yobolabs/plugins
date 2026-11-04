# First-time setup (once per machine)

Users of this plugin have no local context files and install nothing locally (Sean 2026-11-04). The only setup is
connecting Claude to the Remix knowledge base (one `claude mcp add`); everything else runs in the lab page. Run this
the first time the skill is used on a machine (`claude mcp list` has no `remix-context`).

## 1. The Remix KB MCP (read) — no key, sign in once

Sean 2026-11-04: "no one needs keys … The MCP is authenticated through OAuth." Run:

```bash
claude mcp add -s user --transport http --client-id cadra-claude-code --callback-port 33418 \
  remix-context https://app.cadraos.com/api/mcp/kb/88204510-bdff-47b3-bb81-daacf90b06fb
```

Then in Claude Code: `/mcp` → **remix-context** → **Authenticate** → sign in with your Cadra account → Allow access.
Check: `claude mcp list` shows `remix-context … Connected`; `remix-context` `search` for "how remix works" returns
`HOW-REMIX-WORKS.md`. Sign-in refused or the KB isn't visible → your Cadra account is not in the org that owns it: ask
Sean (one line). Use the name `remix-context` exactly (the skill calls it by that name). Never paste a key anywhere.

## 2. The team lab

Nothing to install. https://remix-lab.yobolabs.ai signs you in with Yobo Connect (team email domains only).
If it says your email is not a team email, sign in with your company account.
