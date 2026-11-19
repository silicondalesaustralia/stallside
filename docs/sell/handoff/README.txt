Vendl /sell design handoff
==========================

Give this folder + ../mocks/ to the design agent.

Files
-----
sell.css              Shared tokens + layout styles from the current build
sell-hub.html         Static snapshot of /sell (current structure + image slots)
sell-candles.html     Static snapshot of /sell/candles (current structure + image slots)

Mocks (target look)
-------------------
../mocks/sell-hub-mockup.jpg
../mocks/sell-candles-expanded-mockup.jpg

Blueprint
---------
../vendl-programmatic-page-blueprint.md  (§7 candles, §16 mocks, §17 hub)

Live (with npm run dev)
-----------------------
http://localhost:3000/sell
http://localhost:3000/sell/candles

React sources
-------------
src/components/sell/SellHub.tsx
src/components/sell/SellMarketPage.tsx
src/components/sell/sections/*
src/components/sell/sell-styles.ts

Notes for the design agent
--------------------------
1. These HTML files mirror CURRENT scaffolding, not the mocks. Prefer the mock JPGs for layout/visual direction.
2. Every dashed .img-slot is a missing asset (lifestyle photo or real Vendl UI capture).
3. Keep Free vs Pro boundaries honest (shop link on Free; website/domain/costing on Pro).
4. Calculator math for candles must stay: batch $68 / 12 + $0.80 = $6.47; at $18 → $11.53 (64.1%).
5. Do not invent proof, fake customer stores, or “free website” claims.
6. Open the HTML files in a browser (same folder as sell.css).
