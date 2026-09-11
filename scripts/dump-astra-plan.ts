/** Dump raw Astra plan shape for debugging. */
import {
  openaiApiKey,
  openaiApiKeyLooksInvalid,
  websiteAiModel,
  websiteAiReasoningEffort,
} from "../src/lib/website-ai/config";

async function main() {
  const key = openaiApiKey();
  if (!key || openaiApiKeyLooksInvalid(key)) {
    console.error("missing key");
    process.exit(1);
  }
  const ctx = {
    businessMode: "BOTH",
    businessName: "Green Valley Farm",
    headline: "Green Valley Farm",
    hasFarmStand: true,
    hasMenus: true,
    selectedPages: ["HOME", "ABOUT", "SHOP"],
    selectedCapabilities: ["SHOP", "MENUS_PREORDERS", "PICKUP", "NEWSLETTER"],
    primaryGoal: "farm-stand",
  };
  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: websiteAiModel(),
      reasoning: { effort: websiteAiReasoningEffort() },
      instructions:
        "Return a json object website plan with version, designSystem, siteStrategy, navigation, pages. HOME with Hero first. Allowed pageTypes: HOME ABOUT CONTACT FAQ SHOP FARM_STAND.",
      input: `Return a json object website plan for: ${JSON.stringify(ctx)}`,
      text: { format: { type: "json_object" } },
      max_output_tokens: 8192,
    }),
  });
  const data = (await res.json()) as {
    output_text?: string;
    output?: Array<{ type?: string; content?: Array<{ text?: string }> }>;
    error?: { message?: string };
  };
  if (!res.ok || data.error) {
    console.error("HTTP", res.status, data.error?.message);
    process.exit(1);
  }
  let content = data.output_text ?? "";
  if (!content) {
    for (const item of data.output ?? []) {
      if (item.type !== "message") continue;
      for (const part of item.content ?? []) {
        if (part.text) {
          content = part.text;
          break;
        }
      }
    }
  }
  const plan = JSON.parse(content) as {
    navigation?: unknown;
    pages?: Array<{ pageType?: string }>;
    designSystem?: string;
  };
  console.log("design=", plan.designSystem);
  console.log("nav=", JSON.stringify(plan.navigation, null, 2));
  console.log(
    "pageTypes=",
    (plan.pages ?? []).map((p) => p.pageType).join(","),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
