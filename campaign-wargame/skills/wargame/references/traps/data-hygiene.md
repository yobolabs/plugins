# Traps — Data Hygiene

### DH-01 [seed] Personalization on dirty data
- What you see: "Hi ," or wrong names; instantly reads as spam
- Why: missing/garbage fields in the contact data
- What to do: researcher samples the segment's actual field quality; defaults set for every variable; test send includes a known-dirty contact
### DH-02 [seed] The imported-list landmine
- What you see: high bounce/complaint rate from one source
- Why: a list imported from an event/partner never got permission-confirmed
- What to do: fact base records each segment's SOURCE; imported cohorts get a permission touch before promos
### DH-03 [seed] Test contacts in the real send
- What you see: internal/demo numbers receive (and sometimes reply to) the campaign
- Why: test contacts live in the production segment
- What to do: standard exclusion list applied as a move, verified in pre-flight
