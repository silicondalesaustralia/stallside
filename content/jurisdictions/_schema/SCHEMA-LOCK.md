# Jurisdiction schema, Phase 0 lock

**Locked:** 2026-08-24  
**Basis:** NSW + SA (spec §6 verified) + VIC + QLD (§16 research logs)  
**Updated:** 2026-08-24 — AU Phase 1a adds WA/TAS/ACT/NT research; US Phase 1b pilots are volume-led FL/MI/OH/SC/MO/CA (replacing TX/NJ/WY/WI).

## Where records live

Repo JSON under `content/jurisdictions/{au|us}/{code}/record.json` with companion `research-log.json`. Types in `src/lib/jurisdictions/types.ts`.

**Local authorities (phase 2 seed):** optional `content/jurisdictions/{au|us}/{code}/councils.json` — SA first. Directory route lists councils; individual council URLs stay gated on index score ≥6 + Parent Topic.

## Gate-type divergence (why four AU records were required)

| Code | `gate.type` | `regulator_determined_by` | What broke a naive shared template |
|---|---|---|---|
| nsw | `notification` | `sales_channel` | Council vs NSW Food Authority split |
| sa | `notification` | `geography` | Single council path; donations = sale |
| vic | `registration_or_notification` | `business_class` | Classes 1–3A/4; FoodTrader + statement of trade |
| qld | `licence` | `food_risk` | Licensable vs exempt activities (s 48), not notification |

## Fields added at lock (beyond spec §5 sketch)

1. **`gate.type`**, enum extended with `registration_or_notification` (VIC).
2. **`gate.portal_url`**, statewide online register/notify (VIC FoodTrader).
3. **`gate.statement_of_trade_required`**, VIC temporary/mobile trade notice.
4. **`gate.penalty_max_individual_units` / `penalty_max_body_corporate_units`**, QLD Act uses penalty units; do not invent AUD conversions.
5. **`classification`**, optional block for class systems (VIC classes 1, 2, 3, 3A, 4).
6. **`scope.licence_exemptions`**, QLD non-licensable activity list (Tier 1 statute + qld.gov.au).
7. **`scope.manufacture_triggers_licence`**, QLD manufacture = licensable.
8. **`commodity_scheme_regulator`**, may differ (PIRSA / PrimeSafe / DFSV / Safe Food Production QLD).
9. **`information_gain`**, string[] logged at ship time (≥4 required).
10. **`meta.completeness`**, `phase0_partial` | `research_complete` | `verified_publishable`.

## Sentinel values

- `not_published`, regulator silent after §16.6 searches (logged).
- `not_required`, regulator affirmatively states no obligation.
- `not_applicable`, field does not apply in this country/regime.
- `null`, **unresearched** (Phase 0/1a only). Must not render on a live page. Never treat as `not_published`.

## US Phase 1b notes

US records reuse the AU shape. Set `law.code_applies`, `scope.commodity_schemes`, and `food_safety_management.standard_322a_*` to `not_applicable`. Load-bearing fields: `sales_cap`, `approved_food_list`, `mandated_disclaimer_text`.

## Template code gate

Template / page routes must not ship until:

1. This lock is accepted.
2. Each jurisdiction’s `research-log.json` has `completed` set.
3. Human verification gate (§12 / §14) passes.

## Still open (§15)

Named reviewer, disclaimer legal sign-off, re-verification owner, Ahrefs exports, postcode→council lookup scope.
