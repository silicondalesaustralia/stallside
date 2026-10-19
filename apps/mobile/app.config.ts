import type { ConfigContext, ExpoConfig } from "expo/config";

/**
 * Extends app.json. GOOGLE_SERVICES_JSON is an EAS file env var holding Firebase's
 * google-services.json; Android can't get a push token without it.
 */
export default function appConfig({ config }: ConfigContext): ExpoConfig {
  return {
    ...config,
    name: config.name ?? "Vendl",
    slug: config.slug ?? "vendl",
    android: {
      ...config.android,
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? config.android?.googleServicesFile,
    },
  };
}
