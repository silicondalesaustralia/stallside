import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { reviewSubmissionError, reviewSubmissionSchema } from "@/lib/reviews/review-fields";

const valid = {
  storefrontSlug: "alexa-s-egg-stand",
  rating: 5,
  body: "Lovely fresh eggs every week.",
  name: "Sam",
  email: "Sam@Example.com",
};

describe("review form", () => {
  it("accepts a complete review and lowercases the email", () => {
    const parsed = reviewSubmissionSchema.parse(valid);
    assert.equal(parsed.email, "sam@example.com");
  });

  it("explains the first problem in plain words", () => {
    assert.equal(reviewSubmissionError({ ...valid, rating: 0 }), "Choose a star rating.");
    assert.match(reviewSubmissionError({ ...valid, body: "ok" }) ?? "", /at least 10/);
    assert.equal(reviewSubmissionError({ ...valid, email: "nope" }), "Enter a valid email address.");
    assert.equal(reviewSubmissionError(valid), null);
  });
});
