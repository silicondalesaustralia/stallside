/** Current Vendl website definition version. Bump with a migration step. */
export const WEBSITE_SCHEMA_VERSION = 1 as const;

export const WEBSITE_LIMITS = {
  pages: 60,
  sectionsPerPage: 40,
  headingChars: 160,
  shortTextChars: 400,
  bodyChars: 5000,
  labelChars: 60,
  urlChars: 2048,
  idChars: 64,
  productIdsPerSection: 48,
  definitionBytes: 1_500_000,
} as const;
