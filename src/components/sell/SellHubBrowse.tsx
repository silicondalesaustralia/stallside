"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import SellCategoryCards from "@/components/sell/SellCategoryCards";
import SellDirectory from "@/components/sell/SellDirectory";
import { SELL_CATEGORIES, searchMarkets } from "@/lib/sell";

export default function SellHubBrowse() {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    return searchMarkets(q).slice(0, 24);
  }, [query]);
  const show = query.trim().length > 0;

  return (
    <>
      <section className="hero hub-hero">
        <div
          className="hero-photo"
          role="img"
          aria-label="Freshly baked artisan bread"
        />
        <div className="wrap">
          <div className="crumb">
            <Link href="/">Home</Link> / What you make
          </div>
          <div className="hero-body">
            <div className="hero-copy">
              <span className="eyebrow">For people who make things</span>
              <h1>You make it. Vendl helps you sell it.</h1>
              <p className="lead">
                From ingredients, materials or parts to products people love. Find the
                tools for your kind of business.
              </p>
              <form
                className="search"
                role="search"
                onSubmit={(e) => {
                  e.preventDefault();
                  document
                    .getElementById("search-results")
                    ?.scrollIntoView({ block: "start" });
                }}
              >
                <span className="search-icon" aria-hidden="true">
                  ⌕
                </span>
                <div>
                  <label htmlFor="search-input">What do you make?</label>
                  <input
                    id="search-input"
                    type="search"
                    autoComplete="off"
                    placeholder="Try candles, cookies or 3D prints"
                    aria-controls="search-results"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
              </form>
              <div className="actions">
                <Link className="btn" href="/signup">
                  Start free
                </Link>
                <a className="btn outline" href="#categories">
                  Browse categories
                </a>
              </div>
              <p className="fine">
                Free selling tools. Website and production tools with Pro.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="categories">
        <div className="wrap">
          <h2 className="serif">Find your kind of business.</h2>
          <p className="sub">
            Explore selling, costing and growing a business like yours.
          </p>
          <nav className="chips" aria-label="Maker categories">
            {SELL_CATEGORIES.map((c) => (
              <a key={c.id} className="chip" href={`#cat-${c.id}`}>
                {c.label}
              </a>
            ))}
          </nav>
          <div id="search-results" className="search-results" hidden={!show}>
            <p id="result-count" role="status" aria-live="polite">
              {results.length
                ? `${results.length} matching business ${results.length === 1 ? "type" : "types"}`
                : "No matches yet. Browse the categories below or try a broader product name."}
            </p>
            <div className="result-links">
              {results.map((m) => (
                <Link key={m.slug} href={`/sell/${m.slug}`}>
                  {m.label}
                </Link>
              ))}
            </div>
          </div>
          <SellCategoryCards />
          <div className="center space-top">
            <a className="btn outline" href="#directory">
              Browse all 120 businesses A–Z →
            </a>
          </div>
          <SellDirectory />
        </div>
      </section>
    </>
  );
}
