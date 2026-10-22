-- Admin-managed beta feature flags per owner (e.g. "social")
ALTER TABLE "Owner" ADD COLUMN "betaFeatures" TEXT[] DEFAULT ARRAY[]::TEXT[];
