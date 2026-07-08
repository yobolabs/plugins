---
description: Run the full GTM strategy lifecycle — elicitation → brief → spar → war-game → synthesized strategy. Argument = the product/company and what the GTM push is for ("/gtm Northwind — find the wedge and first paying customers").
---

Invoke the `gtm-lifecycle:gtm-lifecycle` skill with the arguments below. Do not begin any elicitation, research, or drafting before the skill is loaded — the skill owns the entire lifecycle (elicitation battery → strategy-brief → GATE 1 → spar → war-game → synthesis → GATE 2).

Arguments: $ARGUMENTS

Argument handling:
- Empty → ask the user what product/company this GTM push is for, then proceed.
- Anything else → the product/company + goal statement; start Phase 1 elicitation against it.
