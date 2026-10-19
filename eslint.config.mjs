import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Web dashboard and companion app must share business logic: these entry points go
  // through services in src/lib, never Prisma directly. Add folders as features move over.
  {
    files: [
      "src/app/api/mobile/**/*.ts",
      "src/app/dashboard/(gated)/orders/actions.ts",
      "src/app/dashboard/(gated)/orders/shipping-actions.ts",
      "src/app/dashboard/(gated)/collections/actions.ts",
      "src/app/dashboard/(gated)/customers/actions.ts",
      "src/app/dashboard/(gated)/customers/page.tsx",
      "src/app/dashboard/(gated)/customers/[[]customerId]/page.tsx",
      "src/app/dashboard/(gated)/notifications/actions.ts",
      "src/app/dashboard/(gated)/notifications/page.tsx",
      "src/app/dashboard/(gated)/reviews/actions.ts",
      "src/app/dashboard/(gated)/reviews/page.tsx",
      "src/app/dashboard/(gated)/discounts/actions.ts",
      "src/app/dashboard/(gated)/subscriptions/subscription-lifecycle-actions.ts",
      "src/app/dashboard/(gated)/page.tsx",
      "src/app/dashboard/(gated)/products/page.tsx",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@/lib/prisma",
              message:
                "Call a shared service in src/lib/<feature> so the web dashboard and the app stay in sync.",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Expo companion app lints with its own config.
    "apps/**",
  ]),
]);

export default eslintConfig;
