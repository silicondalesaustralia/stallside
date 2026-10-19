const { defineConfig, globalIgnores } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  globalIgnores(["dist/*", ".expo/*"]),
  expoConfig,
  {
    // `tsc --noEmit` already checks imports (including the @contracts alias and re-exported enums).
    files: ["**/*.ts", "**/*.tsx"],
    rules: { "import/no-unresolved": "off", "import/namespace": "off" },
  },
]);
