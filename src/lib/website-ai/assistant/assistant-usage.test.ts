import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { imageCost, textCost } from "./usage/pricing";
import { formatUsdMicros } from "./usage/format";
import { usageFrom } from "./ai/result";
import { sumImageUsage } from "@/lib/website-ai/image-usage";

const ENV = ["WEBSITE_AI_INPUT_USD_PER_1M", "WEBSITE_AI_CACHED_INPUT_USD_PER_1M", "WEBSITE_AI_OUTPUT_USD_PER_1M", "WEBSITE_AI_IMAGE_INPUT_USD_PER_1M", "WEBSITE_AI_IMAGE_OUTPUT_USD_PER_1M"];
afterEach(() => {
  for (const k of ENV) delete process.env[k];
});

const usage = usageFrom({
  input_tokens: 10_000,
  input_tokens_details: { cached_tokens: 4_000 },
  output_tokens: 2_000,
  output_tokens_details: { reasoning_tokens: 1_500 },
});

test("usage reads cached and reasoning tokens", () => {
  assert.equal(usage.cachedInputTokens, 4_000);
  assert.equal(usage.reasoningTokens, 1_500);
});

test("no configured price means the cost is unknown, not zero", () => {
  const cost = textCost("gpt-test", usage);
  assert.equal(cost.usdMicros, null);
  assert.equal(cost.quality, "unknown");
});

test("text cost charges cached input at its own rate and reasoning only once", () => {
  process.env.WEBSITE_AI_INPUT_USD_PER_1M = "2";
  process.env.WEBSITE_AI_CACHED_INPUT_USD_PER_1M = "0.5";
  process.env.WEBSITE_AI_OUTPUT_USD_PER_1M = "10";
  // 6,000 × $2 + 4,000 × $0.50 + 2,000 × $10 per 1M = $0.034
  assert.equal(textCost("gpt-test", usage).usdMicros, 34_000);
});

test("cached input falls back to the input rate", () => {
  process.env.WEBSITE_AI_INPUT_USD_PER_1M = "2";
  process.env.WEBSITE_AI_OUTPUT_USD_PER_1M = "10";
  assert.equal(textCost("gpt-test", usage).usdMicros, 40_000);
});

test("image cost uses known model rates, env overrides, or unknown", () => {
  const img = sumImageUsage([{ input_tokens: 100, output_tokens: 4_000 }, { input_tokens: 100, output_tokens: 4_000 }]);
  assert.deepEqual(img, { inputTokens: 200, outputTokens: 8_000 });
  assert.equal(imageCost("gpt-image-2", img).usdMicros, 200 * 5 + 8_000 * 30);
  assert.equal(imageCost("other-image", img).usdMicros, null);
  process.env.WEBSITE_AI_IMAGE_INPUT_USD_PER_1M = "1";
  process.env.WEBSITE_AI_IMAGE_OUTPUT_USD_PER_1M = "2";
  assert.equal(imageCost("other-image", img).usdMicros, 200 + 16_000);
  assert.equal(sumImageUsage([{ input_tokens: 1 }, undefined]), null);
});

test("costs format in USD with AUD alongside", () => {
  assert.equal(formatUsdMicros(34_000, 1.5), "US$0.03 (A$0.05)");
  assert.equal(formatUsdMicros(null, 1.5), "Unknown");
  assert.equal(formatUsdMicros(500, undefined), "<US$0.01");
});
