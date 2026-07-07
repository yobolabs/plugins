# Lens Pack Skeleton — authoring contract

Every lens pack is a file in this directory following EXACTLY these seven sections (validator-checked headers). One `growth-lens` agent consumes any pack — adding a lens is dropping a file here, never editing an agent (INV-1).

```markdown
# {Lens Name} — lens pack

## Scope
<what this lens sees and deliberately ignores; one paragraph>

## Core models
<the 2–4 theories this lens operationalizes — DISTILLED into usable form, not name-dropped.
 Test: a generator with no prior growth knowledge could apply the model from this text alone.>

## Mechanism inventory
<the heart. Per mechanic:
### {mechanic}
- **What:** the pattern, one line
- **Psychology basis:** which core-model force it uses
- **Preconditions:** what must be true of the product/segment for it to work
- **Failure modes:** how it goes wrong in practice — the known ways>

## Signature questions
<4–6 questions this lens asks of ANY product — the interrogation that surfaces which mechanics apply>

## Metric-family mapping
<which metric families this lens moves best (and which it does NOT) — doubles as the skill's lens-selection table>

## Case pointers
<case-library ids this pack's mechanics cite — pointers only, entries live in ../case-library/>

## Anti-patterns
<the lens's own signature mistakes — what NOT to generate, and the dark-pattern boundary nearest this lens>
```

Authoring bar: distillation over citation; preconditions and failure modes are MANDATORY per mechanic (a mechanic without failure modes hasn't been thought about); no invented statistics — numbers live in case entries with sources.
