// Vercel "Ignored Build Step" (vercel.json ignoreCommand): exit 0 skips the build, exit 1 builds.
// Two Vercel projects deploy this repo: `stallside` (main, www.vendl.app) and `vendl-beta`
// (feature/social-kit, beta.vendl.app). Each project builds only the branches meant for it.
// Beta branches: anything containing "social-kit", or "beta" as a whole word (beta-x, x-beta, fix/x-beta).
// VERCEL_BUILD_ALL_BRANCHES=1 on a project turns the filter off.

const ref = process.env.VERCEL_GIT_COMMIT_REF || "";
const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || "";

function isBetaProject() {
  return process.env.VENDL_BETA_APP === "1" || /(^|[.-])beta[.-]/.test(productionHost);
}

function isBetaBranch(branch) {
  return branch.includes("social-kit") || /(^|[-/])beta([-/]|$)/.test(branch);
}

function shouldBuild() {
  if (!ref || process.env.VERCEL_BUILD_ALL_BRANCHES === "1") return true;
  return isBetaProject() === isBetaBranch(ref);
}

const build = shouldBuild();
console.log(
  `[ignore-build] project=${isBetaProject() ? "beta" : "main"} branch=${ref || "(unknown)"} -> ${build ? "build" : "skip"}`,
);
process.exit(build ? 1 : 0);
