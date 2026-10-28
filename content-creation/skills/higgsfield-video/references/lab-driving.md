# Driving the Remix lab yourself

Back to [SKILL.md](../SKILL.md). Read when the merchant (Sean) asks you to "do it yourself" in the lab: set the ad
up, apply the plan, run the swaps, instead of giving him clicks.

## The one rule: NEVER attach to the merchant's own Chrome

Chrome's own remote debugging (chrome://inspect, port 9222, `DevToolsActivePort` in his Chrome profile folder) shows
an **"Allow remote debugging?" pop-up on top of his work for every connection**. Approval does not stick. On
2026-10-28 it was stopped twice in one evening: first a 20 s status poll, then per-step scripts AND a "single"
long-lived bridge — each still popped it again and again. Sean: STOP, and remember it.

- **Drive your OWN browser tab** (cmux: `browser-tab.sh`, your own profile) on the same lab server
  (`http://127.0.0.1:<lab port>/remix-lab.html`). He can watch it in the BROWSERS pane. Paste the dev key into it
  yourself (vault → page, never printed). His tab's saved state (readings, swaps) is not in yours; the source copy
  and agent plan/picks files are on the server and load in any tab.
- **Read progress without any browser**: Cadra `GET /api/v1/executions?pageSize=40` and Higgsfield
  `GET /requests/<id>/status` (see `review.md`).
- If something truly needs HIS tab, ask him in one line first; he clicks, you read results from the API.

## Evaluate in your own tab

```sh
C="cmux browser --surface $S"         # S from browser-tab.sh
$C goto http://127.0.0.1:51908/remix-lab.html
$C eval '<js expression>'              # same expressions as the table below
```

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
