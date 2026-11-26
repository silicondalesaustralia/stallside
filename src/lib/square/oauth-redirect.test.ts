import assert from "node:assert/strict";
import { describe, it, beforeEach, afterEach } from "node:test";
import { squareOAuthRedirectUri } from "./config";

const KEYS = [
  "VENDL_BETA_APP",
  "NEXT_PUBLIC_APP_URL",
  "SQUARE_OAUTH_REDIRECT_URI",
] as const;

describe("squareOAuthRedirectUri on beta", () => {
  const previous = new Map<string, string | undefined>();

  beforeEach(() => {
    for (const key of KEYS) {
      previous.set(key, process.env[key]);
    }
    process.env.VENDL_BETA_APP = "1";
    process.env.NEXT_PUBLIC_APP_URL = "https://beta.vendl.app";
  });

  afterEach(() => {
    for (const key of KEYS) {
      const value = previous.get(key);
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  it("keeps Connect on beta even when env points at www", () => {
    process.env.SQUARE_OAUTH_REDIRECT_URI =
      "https://www.vendl.app/api/square/oauth/callback";
    assert.equal(
      squareOAuthRedirectUri(),
      "https://beta.vendl.app/api/square/oauth/callback",
    );
  });

  it("uses an explicit beta redirect URI when it matches this host", () => {
    process.env.SQUARE_OAUTH_REDIRECT_URI =
      "https://beta.vendl.app/api/square/oauth/callback";
    assert.equal(
      squareOAuthRedirectUri(),
      "https://beta.vendl.app/api/square/oauth/callback",
    );
  });
});
