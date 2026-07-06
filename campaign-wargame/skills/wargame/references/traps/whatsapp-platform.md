# Traps — WhatsApp Platform

### WA-01 [seed] Template rejection stalls the launch
- What you see: template stuck "pending" or rejected days before send date
- Why: promotional wording in a utility category, banned claims, formatting/variable issues
- What to do: submit templates EARLY as their own move with buffer; have a pre-approved fallback template; rejection reasons guide the rewrite
### WA-02 [seed] Quality rating drops mid-campaign
- What you see: rating drops a level; delivery slows; tier at risk
- Why: block/report rate from recipients — usually audience fatigue or a cold list
- What to do: watch-point on rating during multi-day sends; PAUSE threshold defined before launch; warm cold segments with lighter touches first
### WA-03 [seed] Messaging-tier limit caps the send
- What you see: sends fail partway; "limit reached"
- Why: plan size exceeds the number's current 24h tier
- What to do: researcher checks tier vs audience size BEFORE the plan is drafted; split across days or upgrade tier deliberately
### WA-04 [seed] 24-hour session window confusion
- What you see: replies to customers fail or get charged as new template sends
- Why: free-form messages only allowed within 24h of the customer's last message
- What to do: drip/reply flows must branch: in-window → session message; out-of-window → approved template
### WA-05 [seed] Variable renders literally
- What you see: customer receives "Hi {{1}}"
- Why: variable mapping broken or missing data for some contacts
- What to do: test send to internal numbers INCLUDING a contact with missing fields; default values for every variable
