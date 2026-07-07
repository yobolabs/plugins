# Exemplars — taste anchors + Fable-direct ground truth

Two entry kinds (specs §6.6):

1. **Fable-direct run distillations** — accepted craft files from frontier-model-direct missions, distilled and redacted. These are the judge's calibration anchors: what "good" looked like, direction chosen, distilled judge standards, authenticity-guardrail quality notes, outcome classes only. New entries only from models at least that strong.
2. **Curated real-ad taste anchors** — public ads demonstrating craft done well or badly, cited by public source (brand + campaign + where published). Both directions matter: the authenticity rubric scores against real-feeling AND fake-feeling anchors.

**Self-containment rule:** every entry stands alone — a judge briefed with only this directory must be able to apply the standards. `_context/` pointers are optional, repo-relative, marked `local-only`; a missing pointer never blocks anything.

**Redaction rule:** no estate org/merchant names, no raw campaign numbers (validator privacy scope). Mission classes only (audience class + placement set + care level).

**Naming:** `fable-<mission-class-slug>.md` · `anchor-<brand-campaign-slug>.md`.

<!-- Seeded by STORY-011 (Fable exemplar missions). Pack "Exemplar pointers" sections name the slots waiting to be filled. -->
