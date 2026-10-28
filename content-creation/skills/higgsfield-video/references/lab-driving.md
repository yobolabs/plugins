# Driving the merchant's open Remix lab tab

Back to [SKILL.md](../SKILL.md). Read when the merchant (Sean) asks you to "do it yourself" in the lab page that is
open in HIS Chrome — set the ad up, apply the plan, run the swaps — instead of giving him clicks.

## The one rule: ONE connection for the whole job

Chrome's own remote debugging (chrome://inspect → port 9222, `DevToolsActivePort` in the Chrome profile folder)
shows an **"Allow remote debugging?" pop-up on every new websocket**. Approval does not stick across connections.
A script run per step, or a 20 s status poll that reconnects, pops it again and again on top of his page
(2026-10-28: the chief had to stop a worker for this).

- Write ONE long-lived script (Node, global `WebSocket`) that opens one websocket, does set-up + clicks + polling,
  then detaches and exits. Tell the merchant to click **Allow** once.
- Poll progress on that same socket, or with no browser at all: Cadra `GET /api/v1/executions?pageSize=40` and
  Higgsfield `GET /requests/<id>/status` (see `review.md`).
- Never `browser-use`/a new daemon per call on his Chrome. Your own tests go to your own headless Chrome on another
  port.

## Attach and evaluate

```js
const port = fs.readFileSync(`${HOME}/Library/Application Support/Google/Chrome/DevToolsActivePort`, 'utf8').trim().split('\n');
const ws = new WebSocket('ws://127.0.0.1:' + port[0] + port[1]);           // browser-level socket
// Target.getTargets → the page whose url matches /127\.0\.0\.1:<lab port>\/remix-lab/
// Target.attachToTarget {targetId, flatten:true} → sessionId; then Runtime.evaluate {expression, awaitPromise, returnByValue}
```

`/json/version` on 9222 answers 404 for this kind of debugging; read the port file instead.

## Drive through the DOM only

The lab's state (`scenes`, `drawSwap`, `promptEl`…) lives in closure variables, not globals. Click buttons and set
inputs, then wait on visible text.

| Step | Do | Wait for |
|---|---|---|
| Reload | `location.reload()` | footer note `v7.NN` |
| The ad | `#link` = source URL + `change` event (cached copy is free) | `#linkStatus`, `#anNote` |
| What happens | `#next` (cached reading) | `#bdStatus` "Using the reading…" |
| Your stuff | `#next`, click `#picksBtn` (agent picks; also fills `#prompt`) | `#picksNote` "Added", `#next` enabled |
| Character | `#next` (beat rewrite, a cent), then "Skip · use my photos" (`#next`) | `[data-s="4"]` visible |
| Scenes | `#planBtn` (agent plan) | `#planNote` |
| Purpose (v7.84+) | runs by itself; button "Check what each scene is for" | `.sctop .note` "Checked N scenes" |
| Re-theme | "Use this idea" in each `.purpose` block | card note "Moved…" |
| Swaps (paid) | per `#scenes .scard`: button `/^Put my /` then `/^Yes$/` | no "…" left in card notes |
| Approve / Redo | buttons `/^Approve$/`, `/^Redo/` | — |

Other ids: `#useAd` (send the ad's own shot), `#mode`, `#vmodel`, `#aspect`, `#mp4Btn`, `#mp4Note`, `#ovRows`.
Card index = card order, which changes after Move up/down.

## Traps

- **A reload wipes** photos, picks, swaps and approvals. Only the key, readings and the source copy survive (browser
  storage); the agent plan's `sw` URLs restore approved swaps. Ask before reloading a tab with paid work in it.
- Paid steps (swaps, redraws, videos) only when the merchant asked for that run.
- Flare prompts fail over 5,000 characters.
- The still-photo picker is single-select, and ticking it means "use my photo as it is".
- A plan scene with several products shows one tick but holds all of them.
- The person picture only goes to scenes whose words name a person.
