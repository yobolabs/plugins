---
description: Spar a position — steelman-then-assault challenge of an idea, proposal, design, or goal. Accepts a stated position ("/spar <position>"), an artifact path ("/spar path/to/spec.md"), or "resume <slug>" to continue a saved spar.
---

Invoke the `spar:spar` skill with the arguments below. Do not begin any analysis, research, or attack before the skill is loaded — the skill owns the entire loop (intake → prep → steelman → assault → verdict rounds → close).

Arguments: $ARGUMENTS

Argument handling:
- Empty → ask the user for the position (or artifact path) to spar.
- Starts with `resume ` → resume the named spar session from `SPAR_HOME/missions/<slug>/spar-state.md`.
- A readable file path → artifact target (design/spec/proposal document).
- Anything else → the position text itself.
