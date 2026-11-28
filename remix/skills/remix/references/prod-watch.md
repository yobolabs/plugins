# Prod watch — the standing role

The prod-watch session tracks every real prod remix run. The detail (stall, staff recovery, worker deploy) is in `engineering.md` § Prod watch. This file holds the rules that govern the role.

## Rules

1. **Every anomaly goes to the remix lead the moment it is seen.** An anomaly is a stuck, duplicate, empty or broken message, a failure, or a timeout on a real prod run. Send run id, org, times in UTC with `Z`, and what the merchant saw. Never ask the owner whether to forward.
2. **The watcher never ends a turn with a question to the owner.** It acts, then reports.
3. **Times are labelled.** Write every time in UTC (`Z`) or local (`+08`), never mixed.
4. **Fictional test numbers are excluded from every prod measure.** The ranges are `+44 7700 9xx` and `+1 555 01xx`.
5. **The watcher model is opus.** Judgment work does not run on sonnet or haiku.
6. **First step of every watcher session:** load `remix:remix`, then read this file.
7. **A fix for a bug that stuck a merchant is not done until that merchant moves on.** Once the fix is live (checked in the container, not by tag), the watcher at once: (a) rescues every run stuck by that bug through the fixed code path (close stale asks, send the right next message, same idempotency key); (b) proves the fix on an owner-run test org (<org-id>) by driving the real press handler; (c) sweeps for other runs stuck by the same bug. A merchant tap is never the proof. Money still moves only on the merchant's own tap; a paid go is never pressed for them.
8. **A worker's `worker=` field is not proof of a deploy.** It can show a new version while the old container still runs. Prove it in the running container: the image from `docker inspect`, and a grep of the marker string the lead names.
9. **A chat with several open runs is report-only.** Do not pin, set aside or un-set-aside any run in it. Pinning the newest starves the other run's plan message (delivery skips non-pinned runs as superseded), and un-setting a run the merchant left re-fires the stall guard. Hold until the run-keyed delivery fix is live.
10. **Back-fill rows are never the first live row.** A recovery row carries its recovered-by tag; any watcher that looks for the first live row excludes tagged rows.
11. **Provider noise is measured before it is raised.** Count failed over total per model across 20 minutes. A rate of 1-2% `ERR_HTTP2_STREAM_ERROR` is noise. A merchant-visible retry card caused by one is a lead report at once.
12. **A set-aside run is ended, not failed.** Any watcher count or dashboard that lists failures leaves set-aside runs out.
13. **Judge a missed block or false claim only after reading every successful save tool in the execution**, including `_childSaves` in handoff results, not only the failed tool's own retry. A result of `started: 0` or `moved: false` does not prove a no-op (a woken run can still advance a step).
14. **Due-sweep: flag only a run in a WORK step** (needs, brief, teardown, storyboards, parts, joining) with a past `next_wake_at`, no open ask and no running job. A past wake on a merchant wait is normal.
15. **Test orgs and fictional-contact runs are not merchants.** Leave them out of every count.

A Stop hook enforces rule 2 for sessions named `*prodwatch*` (chief-of-staff `hooks/prodwatch-stop-guard.py`). It blocks a stop whose last message asks the owner whether to forward or send.

## Prod watch traps

- Read helpers that pass SQL inside JS strings lose backslashes: `'\s'` arrives as `'s'`. Write POSIX classes (`[[:space:]]+`) in those queries, and read back the text you are checking.
- The watch runner runs `one/<watcher>.sh`. A same-name file one folder up is a dead copy: edit only the `one/` file, back it up first, and prove the edit against a real alert before calling it fixed.
- Before acting on a "no delivery" or "nothing in 5 min" alert on a web-pane run, read the run's web focus and how its last agent turn ended. A recent web focus plus a tool-ended turn means the ask is in the pane, not lost.
- A rescue that posts a prepared ask on a WhatsApp-led run must first clear the web-surface hold, or the post lands on the web only. Check every rescue by its messaging delivery row, never by the send status.
- Execution log shape: tool rows are `type='tool_result'` with the title `Tool Result: <tool> - SUCCESS|FAILED`; their payload is in `metadata` and `content` is empty. Assistant text is `type='message'` (there is no `text` or `llm_response` type). A block event has `metadata->>'event' = 'root_claim_blocked'` with `cause` and `tool`; it fires only when the root's own tool failed and the root then claims success.
- `ad_video_jobs` has no `updated_at` column. `remix_deliveries` carries `message_ids` (an array), `state` (delivered, provider_accepted, failed, skipped) and `reason`.

## Takeover: check the prodwatch job first

- On takeover, run `launchctl list | grep remix-prodwatch` before trusting a quiet `alerts.log`. No pid means not running: `launchctl bootstrap gui/$(id -u) <plist>`, and keep the plist linked in `~/Library/LaunchAgents` so it loads after a reboot. A silent log with the job down hides every prod stall.
