# Domain Packs — schema & contracts

Packs are the compounding asset: expertise earned per mission, persisted, reused. Two locations:

- **Runtime packs** — `SPAR_HOME/domains/<domain>/` (private; the ONLY distill target).
- **Starter packs** — this directory (`decision-science/`, `negotiation/`, `business-strategy/`): seeds + format exemplars. **Human-reviewed commits only — never a distill target.** Recon reads BOTH when both exist; on conflicting entries the newer wins.

## Directory layout (per domain)

```
<domain>/
  brief.md          # distilled durable knowledge (not mission-specific)
  failure-modes.md  # signal → cause → countermove, sourced from real cases
  base-rates.md     # with sources + dates (staleness visible)
  personas.md       # reusable cast
  questions.md      # battery entries that proved sharp
  sources.md        # where good info lives for this domain
```

## File frontmatter (every pack file, YAML — required)

```yaml
---
domain: negotiation          # kebab-case, = directory name
updated: 2026-07-06
half_life: 1y                # domain-set: how long facts stay trustworthy
missions: 3                  # count of missions that have fed this pack
---
```

## Entry fields (every entry, no exceptions)

- `date:` — when verified
- `source:` — URL / artifact path / mission slug
- `grade:` — A = primary data · B = practitioner writeup · C = secondary/unverified
- failure-modes entries additionally: the full **signal → cause → countermove** triple

**Entries missing any required field are INVALID — recon skips and flags them.** No hypotheticals in failure-modes: an entry without a real case behind it gets deleted.

### Entry format

```markdown
### <id> <one-line name>
- date: 2026-07-06
- source: <url | artifact path | mission-slug>
- grade: B
- signal: <what the human observes>        # failure-modes only
- cause: <the actual mechanism>            # failure-modes only
- countermove: <what worked>               # failure-modes only

<content — the claim / base rate + reference class / persona block / question>
```

Persona entries carry the four persona fields (stance / incentives / attacks-first / signature question); base-rate entries name their reference class.

## Writeback contract (the distill step — spar/mission close)

1. **Propose entries as a DIFF** shown to the user — redaction rules applied first (specs §3.3): strip counterparty names, financial figures, mission-identifying specifics unless the user opts in per item. Never persist: credentials/secrets, third-party personal data, verbatim private-conversation quotes, anything marked `off-record`.
2. **On confirm** (ONE confirm per mission, not per entry): merge — new entries appended; conflicting entries resolved newest-wins with the older entry preserved under a `superseded:` note, never silently deleted.
3. **Bump** `updated` + `missions` in the frontmatter.
4. **Write atomically** — temp file + rename.

Target is always `SPAR_HOME/domains/<domain>/` — create the directory on first distill. Nothing is ever written into the plugin.

## Staleness rule

Any **load-bearing** entry older than the pack's `half_life` must be re-verified by recon before red-team may use it as a guaranteed reaction. Entries recon can't re-verify are demoted to grade C and tagged `stale` (the tag lives on the entry: `- grade: C (stale, was B — failed re-verify 2026-07-06)`).

## Consumption map

- **recon** — loads, validates schema, runs the staleness pass, folds entries into the domain brief.
- **red-team** — failure-modes matches + base-rate violations = guaranteed reactions (cite the entry id).
- **scout** — questions.md + personas.md as generative prompts; reveals feed new entries.
- **distill** — writes back per the contract above.
