const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Request/response schemas are shared with the Next.js API (src/contracts at the repo root).
const contractsDir = path.resolve(__dirname, "../../src/contracts");
config.watchFolders = [...(config.watchFolders ?? []), contractsDir];

// One zod for the whole bundle: the contracts' `zod` import resolves from this app, not the repo
// root (EAS cloud builds only install this app's node_modules).
const upstreamResolve = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "zod" || moduleName.startsWith("zod/")) {
    return { type: "sourceFile", filePath: require.resolve(moduleName, { paths: [__dirname] }) };
  }
  return (upstreamResolve ?? context.resolveRequest)(context, moduleName, platform);
};

module.exports = config;
