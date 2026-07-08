# Traps: State Blindness

Screens designed only in their sunniest moment - populated, loaded, succeeded - while real sessions live in empty, loading, failed, disabled, and overflowing states. This is the flagship failure mode mockify exists to catch (D8): UI that demos well and works badly is almost always state-blind UI, because the demo shows the lucky state and the user meets the other five. The spec-file's per-screen states matrix is the structural defense; every entry below is a way that matrix goes missing, hand-waved, or contradicted by the mockups that claim to evidence it.

How entries are consumed: spec-file avoid-lists cite entries by id; the director walks the states matrix per screen in deepen mode with these markers as the coverage check; the critic replays the walk adversarially and the judge's completeness dimension scores the residue. Each entry carries the eight schema fields (id, anti-pattern, markers, why-it-fails, negative-prompt, severity, provenance-class, privacy-check). Severity bands are closed and honest: kills-the-screen (the spec/mockup cannot ship with it), hurts (ships only with a recorded reason), cosmetic (note it, fix in the next pass).

### state-blindness-01 - happy-path-only
- id: state-blindness-01
- anti-pattern: Only the populated success state designed - the states matrix absent, or filled with "standard" and "TBD" instead of decisions.
- markers: A per-screen section with no states matrix; mockups that all render the same lucky moment (mid-size dataset, everything loaded, nothing failed); no recorded decision for empty/loading/error/disabled on any component that does IO; matrix cells that name a state without designing it. Context class: a static content screen with no IO may legitimately carry a one-line matrix saying so.
- why-it-fails: The unhappy states are where the persona actually decides whether the product works; leaving them undesigned delegates the hardest design decisions to whoever implements the screen, at the moment they have the least context (interaction-states pack owns the matrix grammar).
- negative-prompt: no screen ships without a filled states matrix, design empty and loading and error and disabled explicitly, no TBD cells, mockups must render at least one non-happy state
- severity: kills-the-screen
- provenance-class: session corpus
- privacy-check: pass - generalized state-coverage failure class; no end-user, customer, or mission data

### state-blindness-02 - empty-state-neglect
- id: state-blindness-02
- anti-pattern: Zero-data rendered as furniture over nothing - table headers above an empty region, a blank canvas with no explanation, no action to change the situation.
- markers: Column headers over emptiness; an empty panel with no statement of what belongs there, why it is empty, and the one action that fills it; first-run emptiness and filtered-to-zero treated as the same state (they are different jobs: onboard vs adjust the filter); empty search results indistinguishable from no data at all. Context class: transient sub-panels inside a populated screen may share a standard minimal empty treatment.
- why-it-fails: The empty state is the onboarding surface - first-run is the moment of highest attention and lowest investment, and furniture-over-nothing spends it teaching the user that the product is hollow.
- negative-prompt: every list and panel gets a designed empty state with what-this-is and one fill action, first-run and filtered-to-zero are distinct designs, no bare table headers over nothing
- severity: hurts
- provenance-class: published craft knowledge
- privacy-check: pass - generalized state-coverage failure class; no end-user, customer, or mission data

### state-blindness-03 - error-as-afterthought
- id: state-blindness-03
- anti-pattern: Failure states undesigned or delegated to toasts - failed loads and failed submits with no rendered plan, no recovery action, no statement of what survived.
- markers: No error rendering designed for any fetch or submit; error copy that names the failure but offers no retry or path back; toast as the error channel (banned here - flow-friction-04); a failed submit that clears the user's input; partial-failure semantics undefined (three of five rows saved - then what?). Context class: none for IO screens; the matrix may record "inherits the app shell's global error boundary" where that is a real, named mechanism.
- why-it-fails: Errors are where trust is won or lost - recovery design is the difference between a hiccup and lost work, and an undesigned error path guarantees the implementer improvises one under deadline, badly.
- negative-prompt: every fetch and submit has a designed inline error state with a recovery action, errors render next to what failed, user input survives failure, no toast errors
- severity: kills-the-screen
- provenance-class: session corpus
- privacy-check: pass - generalized state-coverage failure class; no end-user, customer, or mission data

### state-blindness-04 - loading-story-missing
- id: state-blindness-04
- anti-pattern: No loading decision per async region - spinner-by-default, skeleton nowhere, and layout that jumps when data lands.
- markers: No loading design recorded for a region that fetches; a spinner where the content's shape is known (a skeleton would preserve geometry); skeletons that do not match the loaded layout, so the swap jolts; content shifting as data arrives; no decision about what stays interactive while loading. Context class: near-instant local operations may legitimately skip a loading treatment - the matrix should say so rather than stay silent (skeleton-vs-spinner grammar lives in the interaction-states pack).
- why-it-fails: The loading state is the first thing every user sees on every visit; layout shift and spinner soup read as jank before a single feature is judged, and unpreserved geometry makes the wait feel longer than it is.
- negative-prompt: a loading decision per async region, skeletons that match loaded geometry, no full-screen spinner where regional loading works, zero layout shift when data lands
- severity: hurts
- provenance-class: published craft knowledge
- privacy-check: pass - generalized state-coverage failure class; no end-user, customer, or mission data

### state-blindness-05 - long-content-denial
- id: state-blindness-05
- anti-pattern: Real content lengths unhandled - the design works only for the tidy strings the mockup happened to use.
- markers: No truncation or wrap rule for names, titles, and addresses; the long-name test (a 60-character record name) visibly breaking a row or card; tag and badge sets with no overflow pattern (plus-N or scroll); nothing decided for translated strings that run longer than the English (the spec's i18n slots exist for this); truncation with no way to read the full value. Context class: fixed-vocabulary fields (status enums) may skip overflow rules - the matrix should name them as bounded.
- why-it-fails: Content length is not an edge case, it is the population - real data has a long tail, and a layout that only survives tidy strings ships broken for exactly the records users care most about; ai-slop-ui-06 data hides this until production.
- negative-prompt: a truncation or wrap rule for every text field, mockups include one long name and one overflowing tag set, translated-length headroom stated per label
- severity: hurts
- provenance-class: session corpus
- privacy-check: pass - generalized state-coverage failure class; no end-user, customer, or mission data

### state-blindness-06 - volume-blindness
- id: state-blindness-06
- anti-pattern: Designed for a handful of items - breaks at zero (see state-blindness-02) and at thousands, with no pagination, grouping, or virtualization decision.
- markers: Unbounded lists with no pagination or infinite-scroll or virtualization choice recorded; dropdowns enumerating sets that grow without limit (a select where a search-picker is needed); charts designed for a few series with no story for many; select-all semantics undefined across pages; counts and badges with no large-number formatting rule. Context class: genuinely bounded sets (a settings page's fixed toggles) are exempt when the spec states the bound.
- why-it-fails: Volume is a scaling cliff, not a polish item - the pattern that works at ten items is often the wrong component entirely at ten thousand, and discovering that during implementation reopens the design.
- negative-prompt: a volume decision for every unbounded collection, no plain dropdowns over unbounded sets, pagination or virtualization named per list, select-all semantics stated
- severity: hurts
- provenance-class: published craft knowledge
- privacy-check: pass - generalized state-coverage failure class; no end-user, customer, or mission data

### state-blindness-07 - pending-affordance-missing
- id: state-blindness-07
- anti-pattern: In-flight and disabled states unspecified - submits that can double-fire, controls disabled with no explanation, optimistic updates left as an implementation surprise.
- markers: Submit buttons with no pending treatment (double-submit is possible); disabled controls with no cue for why or how to enable; the optimistic-update decision unmade (does the new row appear immediately or after the round trip?); no stale-data indication for slow connections; destructive actions with no in-flight lock. Context class: instant local toggles may skip pending treatment when the matrix says the operation cannot fail visibly.
- why-it-fails: The gap between action and confirmation is where users lose faith and click again - double-fires, ghost rows, and unexplained dead controls all trace to this one unspecified band of time (interaction-states pack: affordance and feedback without toasts).
- negative-prompt: pending state on every submit, disabled controls explain themselves, the optimistic-or-wait decision recorded per mutation, no unlockable dead controls
- severity: hurts
- provenance-class: session corpus
- privacy-check: pass - generalized state-coverage failure class; no end-user, customer, or mission data
