# Traps — Segmentation

### SG-01 [seed] Overlapping segments double-hit
- What you see: same customer gets two (or more) messages; complaints citing "you keep messaging me"
- Why: segments defined independently overlap; two campaigns run the same week
- What to do: researcher checks overlap between THIS segment and every other segment with an active campaign; dedupe or exclusion rule as an explicit move
### SG-02 [seed] Stale segment count
- What you see: planned reach ≠ actual sends; budget/stock math wrong
- Why: count from a screenshot last month; list changed
- What to do: counts pulled fresh on war-game day AND re-checked in the pre-flight
### SG-03 [seed] Right segment, wrong moment
- What you see: technically-correct audience, dead response
- Why: filter says "bought before" but ignores recency/lifecycle — a buyer from 2 years ago is not a warm customer
- What to do: every segment definition includes a recency clause deliberately chosen, not defaulted
### SG-04 [seed] Opt-outs leak back in
- What you see: a complaint from someone who unsubscribed
- Why: segment built from a source that doesn't sync opt-out status
- What to do: opt-out exclusion verified as its own fact-base line, tagged checked
