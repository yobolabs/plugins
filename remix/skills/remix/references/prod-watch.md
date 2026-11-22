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
8. **A worker's `worker=` field is not proof of a deploy.** It can show a new version while the old container still runs. Prove it in the running container: the image from `docker inspect`, and a grep of the marker string the lead names.
9. **A chat with several open runs is report-only.** Do not pin, set aside or un-set-aside any run in it. Pinning the newest starves the other run's plan message (delivery skips non-pinned runs as superseded), and un-setting a run the merchant left re-fires the stall guard. Hold until the run-keyed delivery fix is live.
10. **Back-fill rows are never the first live row.** A recovery row carries its recovered-by tag; any watcher that looks for the first live row excludes tagged rows.
11. **Provider noise is measured before it is raised.** Count failed over total per model across 20 minutes. A rate of 1-2% `ERR_HTTP2_STREAM_ERROR` is noise. A merchant-visible retry card caused by one is a lead report at once.
12. **A set-aside run is ended, not failed.** Any watcher count or dashboard that lists failures leaves set-aside runs out.
13. **Judge a missed block or false claim only after reading every successful save tool in the execution**, including `_childSaves` in handoff results, not only the failed tool's own retry. A result of `started: 0` or `moved: false` does not prove a no-op (a woken run can still advance a step).
14. **Due-sweep: flag only a run in a WORK step** (needs, brief, teardown, storyboards, parts, joining) with a past `next_wake_at`, no open ask and no running job. A past wake on a merchant wait is normal.
15. **Test orgs and fictional-contact runs are not merchants.** Leave them out of every count.

A Stop hook enforces rule 2 for sessions named `*prodwatch*` (chief-of-staff `hooks/prodwatch-stop-guard.py`). It blocks a stop whose last message asks Sean whether to forward or send.
