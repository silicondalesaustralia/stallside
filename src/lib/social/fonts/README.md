# Bundled social overlay fonts (resvg)

Latin-400 TTFs from Fontsource (SIL OFL / Apache where applicable), used by
`@resvg/resvg-js` with `fontFiles` + `loadSystemFonts: false`.

Mirrors `SOCIAL_FONT_FAMILIES` in `lib/social/socialTextStyle.ts` (24 faces).

| Style class | Families |
|-------------|----------|
| **serif** | Playfair Display, Merriweather, Libre Baskerville, Crimson Text |
| **display** | Oswald, Bebas Neue, Anton, Fjalla One |
| **sans** | Inter, Roboto, Montserrat, Poppins, Open Sans, Lato, Raleway, Nunito, Work Sans, DM Sans, Space Grotesk, Archivo, Barlow, Rubik, Karla, Josefin Sans |

Traced into `/api/social/resvg-font-spike` via `next.config.mjs` `outputFileTracingIncludes`.
