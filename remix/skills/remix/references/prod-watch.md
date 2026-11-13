# Prod watch — the standing role

The prod-watch session tracks every real prod remix run. The detail (stall, staff recovery, worker deploy) is in `engineering.md` § Prod watch. This file holds the rules that govern the role.

## Rules

1. **Every anomaly goes to the remix lead the moment it is seen.** An anomaly is a stuck, duplicate, empty or broken message, a failure, or a timeout on a real prod run. Send run id, org, times in UTC with `Z`, and what the merchant saw. Never ask Sean whether to forward.
2. **The watcher never ends a turn with a question to Sean.** It acts, then reports.
3. **Times are labelled.** Write every time in UTC (`Z`) or local (`+08`), never mixed.
4. **Fictional test numbers are excluded from every prod measure.** The ranges are `+44 7700 9xx` and `+1 555 01xx`.
5. **The watcher model is opus.** Judgment work does not run on sonnet or haiku.
6. **First step of every watcher session:** load `remix:remix`, then read this file.
7. **A fix for a bug that stuck a merchant is not done until that merchant moves on.** Once the fix is live (checked in the container, not by tag), the watcher at once: (a) rescues every run stuck by that bug through the fixed code path (close stale asks, send the right next message, same idempotency key); (b) proves the fix on a Sean-owned test org (211, 4519 or 1773) by driving the real press handler; (c) sweeps for other runs stuck by the same bug. A merchant tap is never the proof. Money still moves only on the merchant's own tap; a paid go is never pressed for them.

A Stop hook enforces rule 2 for sessions named `*prodwatch*` (chief-of-staff `hooks/prodwatch-stop-guard.py`). It blocks a stop whose last message asks Sean whether to forward or send.

## Traps

1. **"On prod" means the content is in the tree, never ancestry.** Check the changed code with `git grep` on the prod branch AND by grep or checksum inside the worker container. A hold-out cut leaves commits as ancestors while their content is gone, so `merge-base` and `git log` show fixes that are not there.
2. **A worker swap is a blue/green rename.** Compare the container's image (`docker inspect -f '{{.Config.Image}}' worker-service`), not its start time: the new container starts about 25 minutes before it takes the name.
3. **Prove a fix through the real entry** (the tap row into the advance loop on a test org), never a direct function call with hand-set options. A synthetic call can pass while the real path still sends the false line.
4. **Merchant scene numbers come only from the label code** (`sceneNumbersOf` in `change-wiring.ts`, which uses the merchant number and the sheet siblings), never by hand. A hand-written correction line named the wrong scenes.
5. **An unsent delivery after a 503 is not lost until reconcile has run.** Reconcile (`deliveries/reconcile.ts`) resends it or marks it skipped as run moved on after the reconcile age (about 3 to 8 minutes). Flag it only if still failed after 10 minutes.
6. **Read prod through the container's own admin client in a READ ONLY transaction** (import `/app/src/db/clients.ts`, `adminDb.transaction`, `SET TRANSACTION READ ONLY`), never a script that names `DATABASE_URL`: the secret guard blocks those.
7. **Time in a merchant's change is the draft's timeline** (the join input slots' from/to frame at the fps, each part's scene ids from the project parts), not the source ad's scene starts.
