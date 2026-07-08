---
description: War-game a non-code decision on paper — full mission loop (recon → moves → red-team → cascade → scout → judge) producing a war-game file written for human execution. For code/platform missions use the jetdevs wargame plugin instead.
---

Invoke the `spar:wargame` skill with the arguments below. Do not draft any moves before the skill is loaded — the skill owns the mission loop.

Arguments: $ARGUMENTS

Argument handling:
- Empty → ask the user for the mission (decision to fight on paper) and any context artifacts.
- A readable file path → treat as the mission brief or primary context artifact.
- Anything else → the mission statement itself.

Routing note: if the mission is a code/platform mission (repos, deploys, migrations, epics), route to `wargame:wargame` (jetdevs plugin) instead — this skill is for business, negotiation, product/design, and personal decisions.
