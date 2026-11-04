# First-time setup (once per machine)

Users of this plugin have no local context files and install nothing locally (Sean 2026-11-04). The only setup is
connecting Claude to the Remix knowledge base (one `claude mcp add`); everything else runs in the lab page. Run this
the first time the skill is used on a machine (`claude mcp list` has no `remix-context`).

## 1. The Remix KB MCP (read)

1. Sign in to Cadra (https://app.cadraos.com) with your team account → **Knowledge Bases** → **Remix context**.
   Not listed? You are not in the org that owns it: ask Sean to add you (one line, stop here).
2. Click **Connect**, create a personal key (name it after this machine; it expires after 90 days), open the
   **Claude Code** tab and copy the command. It has this shape:
   ```bash
   claude mcp add --transport http --scope user <server-name> <endpoint> --header "Authorization: Bearer <your key>"
   ```
3. Run it, but use the server name **`remix-context`** (the skill and its references call it by that name).
4. Check: `claude mcp list` shows `remix-context … Connected`. In a new session, `remix-context` `search`
   for "how remix works" returns `HOW-REMIX-WORKS.md`.

Never paste the key into a chat, a file in a repo or a learnings note. It lives only in your Claude config.

## 2. The team lab

Nothing to install. https://remix-lab.yobolabs.ai signs you in with Yobo Connect (team email domains only).
If it says your email is not a team email, sign in with your company account.
