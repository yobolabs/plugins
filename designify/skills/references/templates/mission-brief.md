# Mission Brief — <campaign / creative need>

> Care level: **quick** (2 concepts, light crit) | **deep** (3 concepts, full crit). Status: <intake | resolved | in-loop>.
> Source: <ads-strategist creative-brief path — consumed verbatim, strategy is never re-derived here | interactive intake>.
> Mission dir: `_context/<project>/design/<slug>/`

## 1. Mission summary
- **Campaign + goal:** <the campaign this creative batch serves, and the one thing it must achieve>
- **Audience / segment:** <named segment + one line of who they actually are — not a demographic bracket>
- **Offer:** <what's actually on the table, in the words the audience will see>
- **Channels + placements:** <every placement gets its own per-asset section in the craft file — list them all now>
- **Brand kit:** <ref — resolved to a path in §2 before anything drafts>
- **Care level:** quick | deep — bounds are artifact counts, never schedule

## 2. Entity resolution — before anything drafts or renders
Nothing drafts until every row reads CONFIRMED. Wrong-brand, wrong-format, and wrong-campaign mistakes die here or not at all. Each row is mirrored as a one-line entry in the craft ledger.

| Entity | Resolved to | Source | Confirmed |
|---|---|---|---|
| Brand kit | <exact path / ref> | <who or where it came from> | ☐ |
| Campaign | <campaign id> | <system of record> | ☐ |
| Placement: <name> | <exact export spec: dims · file limit · safe zones · text rules> | <platform doc, verified current by recon> | ☐ |
| Placement: <name> | <…one row per placement…> | | ☐ |
| Output dir | `_context/<project>/design/<slug>/` | | ☐ |

## 3. M-rule manifest
This mission's constraints as numbered rules. The manifest travels with EVERY dispatch; every downstream artifact checks conformance rule by rule — batch drift kills consistency by asset 10, and unnumbered rules can't be checked.

| # | Class | Rule | Source |
|---|---|---|---|
| M1 | brand | <e.g. logo never over photography; palette refs from kit only> | <brand kit §> |
| M2 | legal-claims | <what may and may not be claimed about the offer> | <who said so> |
| M3 | platform-policy | <the platform rules this placement set triggers> | <policy doc, recon-verified> |
| M4 | accessibility | <contrast floor at text sizes; minimum type size at feed scale> | |
| M5 | localization | <language slots; what must survive translation> | |

Classes: brand · legal-claims · platform-policy · accessibility · localization. Add rows; never merge rules — one rule, one number, one check.

## 4. Recon hunt list
What `design-recon` must return for this mission (every claim tagged `checked` / `reasoned` / `guessing` / `dont-know`):
- Brand-kit facts: <what's unclear or unverified in the kit>
- Audience psychology for THIS segment: <the specific question, not "understand the audience">
- Existing-asset sweep: <where past winners / templates live — the reuse-gate input>
- Channel specs: <which placement specs need re-verification — platform docs drift>
- Trend + authenticity hunts: <what this audience is responding to and ratio-ing right now; comparable campaigns' reception>
- Past performance of similar creatives: <Looker lookup, when access exists>

Known `dont-know`s at intake: <list — each one is a hunt, not a shrug>

## 5. Open questions at intake
<what the merchant/team must answer before or during the loop, and what is assumed meanwhile>
