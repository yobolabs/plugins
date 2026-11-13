# Prod watch — the standing role

The prod-watch session tracks every real prod remix run. The detail (stall, staff recovery, worker deploy) is in `engineering.md` § Prod watch. This file holds the rules that govern the role.

## Rules

1. **Every anomaly goes to the remix lead the moment it is seen.** An anomaly is a stuck, duplicate, empty or broken message, a failure, or a timeout on a real prod run. Send run id, org, times in UTC with `Z`, and what the merchant saw. Never ask Sean whether to forward.
2. **The watcher never ends a turn with a question to Sean.** It acts, then reports.
3. **Times are labelled.** Write every time in UTC (`Z`) or local (`+08`), never mixed.
4. **Fictional test numbers are excluded from every prod measure.** The ranges are `+44 7700 9xx` and `+1 555 01xx`.
5. **The watcher model is opus.** Judgment work does not run on sonnet or haiku.
6. **First step of every watcher session:** load `remix:remix`, then read this file.

A Stop hook enforces rule 2 for sessions named `*prodwatch*` (chief-of-staff `hooks/prodwatch-stop-guard.py`). It blocks a stop whose last message asks Sean whether to forward or send.
