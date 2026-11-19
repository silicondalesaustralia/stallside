# Vendl `/sell` programmatic pages

Build specification: `vendl-programmatic-page-blueprint.md` (revision 2).

## Routes

- Hub: `/sell` — directory of 120 maker markets
- Leaves: `/sell/[slug]` — one page per market in `src/lib/sell/markets.json`

## Visual references

Download the approved mockups from the ChatGPT library links in the blueprint (§16) and save them here as:

- `sell-hub-mockup.png`
- `sell-candles-expanded-mockup.png`

## Implementation map

| Area | Location |
| --- | --- |
| Registry + calculator + schema | `src/lib/sell/` |
| Hub UI | `src/components/sell/SellHub.tsx` |
| Leaf UI | `src/components/sell/SellMarketPage.tsx` |
| App routes | `src/app/sell/` |

Pricing and Free/Pro copy reuse the home pricing source (`saas-pricing`, `home-plan-features`).
