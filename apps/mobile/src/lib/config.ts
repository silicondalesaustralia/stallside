import Constants from "expo-constants";

const DEFAULT_API_URL = "https://www.vendl.app";

export const API_URL = (process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL).replace(/\/$/, "");

export const APP_VERSION = Constants.expoConfig?.version ?? "0.0.0";
