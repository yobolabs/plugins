# Social & Viral — lens pack

## Scope
Growth through users' networks: viral loops, invites, sharing surfaces, social proof at scale, status and identity mechanics, community effects. Sees the product as something that spreads person-to-person. Ignores paid acquisition, SEO, and in-funnel persuasion (friction-cro owns the landing). Its jurisdiction: mechanics where one user's action puts the product in front of another human.

## Core models

**Viral loop accounting: k = i × c.** k-factor = invites sent per user (i) × conversion per invite (c). k > 1 = self-sustaining growth (rare, short-lived); k = 0.3–0.7 = a powerful acquisition-cost multiplier on every other channel (the realistic target). Operational discipline: measure i and c separately — they fail differently. Low i = the share moment is buried or shameful; low c = the invite lands without context or value. Cycle time matters as much as k: a loop that completes in a session compounds faster than one that takes a season at the same k.

**Loop taxonomy — pick the loop the PRODUCT is shaped for:**
- *Inherent/collaborative* — the product is better/only-works with others (docs, chats, payments, bookings shared with a counterpart). Strongest loops; the invite IS usage.
- *Artifact/content* — usage produces shareable output (designs, reports, results pages, links) that carries the product's signature into new networks. The artifact must be worth sharing on its own merits.
- *Incentivized* — referral economics (co-owned with incentives-game-theory; this lens owns placement, framing, and the share moment).
- *Broadcast/status* — usage is publicly visible (profiles, leaderboards, badges, "top X%" cards) and viewers convert out of curiosity or aspiration.
Diagnosis use: forcing an incentivized loop onto an inherently collaborative product wastes its strongest asset; forcing broadcast onto a private-use product embarrasses users.

**Invite-landing rule.** The invitee must land on the shared artifact/value itself, never a signup wall. The landing experience decides whether the loop compounds or dies; an invite that dumps the recipient at a signup form burns the referral.

**Social proof at scale (descriptive norms).** People do what they believe people-like-them do. Scale mechanics: visible counts, activity streams, "popular in your industry", momentum framing. The similarity constraint binds hard: proof from unlike users doesn't transfer. All numbers real (fabrication = dark pattern, and audiences increasingly check).

**Status, identity & the audience.** Sharing is identity work — people share what makes them look smart, successful, generous, early. Design question: *what does sharing this say about the sharer to THEIR audience?* If the honest answer is "I'm being farmed for referrals", the loop is dead regardless of incentive. Status mechanics (badges, ranks, streaks-made-public, "top contributor") work when the status is scarce, earned, and legible to outsiders.

**Population-size precondition.** Comparative and broadcast mechanics (leaderboards, ranks, activity-comparison) require a population of motivational size. Intra-org / small-cohort populations are usually too small for a leaderboard's motivational shape — kill or re-scope comparative mechanics when the comparison set is tiny.

## Mechanism inventory

### Collaborative-core invites
- **What:** make the multiplayer act the default path — share-to-edit, split-the-bill, book-for-two, team workspaces — so inviting is how the product is used, not a favor to the company.
- **Psychology basis:** inherent loop; reciprocity between counterparts.
- **Preconditions:** the product has (or can grow) a genuinely multiplayer core; single-player value exists while the counterpart pends (else dead-on-arrival sessions).
- **Failure modes:** bolting collaboration onto a solo product (empty rooms); the invitee landing on a signup wall instead of the shared thing (kills c — land them IN the artifact, account later; coordinate with friction-cro).

### Shareable-artifact engineering
- **What:** make usage output beautiful, self-explanatory, and signature-carrying — result cards, year-in-review summaries, public report links, embeds, before/after exports.
- **Psychology basis:** artifact loop + identity (the artifact flatters its maker).
- **Preconditions:** output genuinely impressive or useful to non-users; the artifact renders well where it lands (link previews, image crops — distribution-surface hygiene); signature present but not vandalizing.
- **Failure modes:** watermark-as-billboard (makers crop it out or stop sharing); artifacts that expose private data by default (share must be explicit + scoped); optimizing artifact beauty for users who never share (measure i before polishing).

### Share-moment placement
- **What:** put the ask at the emotional peak — right after the win (report generated, streak milestone, deal closed, design finished), one tap, with the artifact pre-attached.
- **Psychology basis:** peak-state generosity; ability (B=MAP — the share must be effortless at the peak).
- **Preconditions:** the product HAS identifiable win moments (instrument them); share preview shows exactly what the audience will see.
- **Failure modes:** interrupting the win with the ask (resentment); asks at neutral/negative moments (uninstall-grade annoyance); share flows requiring composition from scratch (i collapses — pre-fill everything, let them edit).

### Broadcast status surfaces
- **What:** public profiles, leaderboards, contribution graphs, "top X% of users" cards, earned badges visible to outsiders.
- **Psychology basis:** broadcast loop; status scarcity; social comparison.
- **Preconditions:** the activity is one users are PROUD of (recon psychology check — broadcast on private/sensitive usage humiliates); status legible to non-users; opt-in visibility.
- **Failure modes:** leaderboards that demotivate the bottom 90% (banded/local leagues beat global ranks); status for spending rather than merit (pay-to-win-misdirection boundary); public-by-default shame (guilt-loops boundary).

### Network-density onboarding (find-your-people)
- **What:** contact/team import, org-domain auto-join, "your colleagues are already here" moments at first-run.
- **Psychology basis:** social proof (similar others) + inherent-loop density (product value scales with connections present).
- **Preconditions:** the product is better with connections (else this is contact harvesting); permissions honest and scoped; matching accurate (wrong "colleagues" = creepy).
- **Failure modes:** contact-import dark history (address-book spam destroyed a generation of trust — every import must preview exactly what gets sent, send nothing silently: consent-erosion boundary, S3 in several jurisdictions); ghost-town reveals (importing to find nobody there — gate the moment on actual density).

### Community & UGC flywheels
- **What:** user-created content that acquires the next user — templates galleries, public playbooks, Q&A, showcases — with creator credit as the status payout.
- **Psychology basis:** artifact loop at community scale; status economy for creators.
- **Preconditions:** a creator minority exists and is worth serving (1/9/90 rule — design for the 1% creators, 9% curators); contribution quality moderatable; SEO/discovery surface for the content.
- **Failure modes:** cold-start emptiness (seed with staff/commissioned content until organic); extraction framing (creators enriching your SEO for nothing — pay in real status, features, or money); moderation debt compounding silently.

## Signature questions
1. Which loop is this product SHAPED for (collaborative / artifact / incentivized / broadcast) — and are we forcing the wrong one?
2. Where does k leak today — invites-per-user (i) or conversion-per-invite (c)? (They fail differently; fix the one that's broken.)
3. What's the win moment, and is the share ask sitting on it with the artifact pre-attached?
4. What does sharing this say about the sharer to their audience — pride, utility, or "I'm farming you"?
5. Where does the invitee LAND — in the value, or on a wall?
6. What real numbers/activity could serve as similar-other social proof, and where's the hesitation point they belong at?

## Metric-family mapping
- **Moves best:** acquisition via k-factor (i, c, cycle time), invite rate, share rate, invitee activation.
- **Secondary:** activation (network-density onboarding), retention (community belonging; with hooks-habit), brand search volume (artifact spread).
- **Does NOT move:** checkout conversion (friction-cro), ARPU (pricing-economics), single-player habit depth (hooks-habit).

## Case pointers
`dropbox-referral` · `figma-multiplayer-files` · `calendly-inherent-loop` · `spotify-wrapped` · `strava-segments-clubs` · `linkedin-contact-import-backlash` · `github-contribution-graph` · `notion-template-gallery`

## Anti-patterns
- "Add share buttons" as strategy — placement without a loop model moves nothing; pick the loop first.
- Incentivizing shares on a product whose collaborative core would loop for free — the incentive crowds out the natural motive and costs money.
- Optimizing invite copy while the invitee lands on a signup wall — c is structural before it is textual.
- Global leaderboards as the only status surface — motivates the top 1%, demoralizes the rest; band them.
- Nearest dark-pattern boundary: **consent-erosion** (silent contact spam, share-by-default), **fabricated-scarcity** (fake activity counts), **guilt-loops** (public shame mechanics). The audience test: the loop must survive the sharer's audience learning exactly why the share exists.
