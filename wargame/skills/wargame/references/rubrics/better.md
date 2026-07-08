# The Better Rubric

"Better" never means "more complex." Complexity is a **cost** to be justified on another axis, explicitly — never an achievement. A solution improves only along these axes:

| Axis | Question | Signals |
|------|----------|---------|
| **Elegant** | Does the shape of the solution match the shape of the problem? | One concept does the work of three; the fix deletes code; special cases collapse into the general case |
| **Simple** | Fewest moving parts that fully solve it? | Fewer layers, fewer states, fewer dependencies; a new reader predicts behavior correctly |
| **Performant** | Faster / cheaper on the path that matters? | Measured on the hot path named by the mission, not micro-optimized everywhere |
| **Usable** | Easier for its consumer (human or code) to use correctly and hard to misuse? | Right defaults; errors say what to do; the obvious call is the correct call |
| **Integrable** | Easier to plug into — fewer assumptions imposed on its environment? | Narrow interface, standard protocols, no bespoke setup ritual, link:-friendly |
| **Understandable** | Can someone who didn't write it explain why it works? | Why-comments where non-obvious; observable behavior; names that carry the model |

## Scoring

- Score only the axes a change **moves** (±), don't ritually grade all six.
- Every plus must name its cost axis if one exists ("more performant, less simple: adds a cache layer — justified because hot path X").
- **Ties break toward the mission brief's primary axis.**
- Consumer count and strategic anchor beat speculative breadth: "extract when the second consumer materializes" is a valid top ranking.
- Anti-pattern to reject on sight: an "improvement" whose only movement is negative on simple/understandable while claiming unmeasured performance or hypothetical flexibility.
