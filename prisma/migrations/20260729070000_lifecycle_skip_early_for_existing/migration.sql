-- Existing owners at cutover: skip Day 0 welcome + Day 7; enter sequence at Day 14 (halfway).
-- New signups after this migration keep NULL timestamps and get the full sequence.
UPDATE "Owner"
SET
  "trialWelcomeSentAt" = COALESCE("trialWelcomeSentAt", CURRENT_TIMESTAMP),
  "trialDay7SentAt" = COALESCE("trialDay7SentAt", CURRENT_TIMESTAMP)
WHERE "trialWelcomeSentAt" IS NULL
   OR "trialDay7SentAt" IS NULL;
