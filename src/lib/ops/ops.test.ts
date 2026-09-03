import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { FulfilmentStatus, HandoverMode } from "./enums";
import {
  canTransitionOps,
  collectionToFulfilmentStatus,
  fulfilmentToCollectionStatus,
  nextHandoverStatus,
  OPS_STATUS_LABEL,
} from "./status";

describe("ops status transitions", () => {
  it("allows prepare → ready → collected", () => {
    assert.equal(canTransitionOps(FulfilmentStatus.NEW, FulfilmentStatus.PREPARING), true);
    assert.equal(canTransitionOps(FulfilmentStatus.PREPARING, FulfilmentStatus.READY), true);
    assert.equal(canTransitionOps(FulfilmentStatus.READY, FulfilmentStatus.COLLECTED), true);
    assert.equal(canTransitionOps(FulfilmentStatus.COLLECTED, FulfilmentStatus.READY), false);
  });

  it("allows delivery path", () => {
    assert.equal(
      canTransitionOps(FulfilmentStatus.READY, FulfilmentStatus.OUT_FOR_DELIVERY),
      true,
    );
    assert.equal(
      canTransitionOps(FulfilmentStatus.OUT_FOR_DELIVERY, FulfilmentStatus.DELIVERED),
      true,
    );
  });

  it("maps dual-write collection statuses", () => {
    assert.equal(fulfilmentToCollectionStatus(FulfilmentStatus.READY), "READY");
    assert.equal(
      fulfilmentToCollectionStatus(FulfilmentStatus.DELIVERED),
      "COLLECTED",
    );
    assert.equal(collectionToFulfilmentStatus("ORDERED"), FulfilmentStatus.NEW);
  });

  it("suggests next handover step", () => {
    assert.equal(
      nextHandoverStatus(FulfilmentStatus.READY, HandoverMode.COLLECT),
      FulfilmentStatus.COLLECTED,
    );
    assert.equal(
      nextHandoverStatus(FulfilmentStatus.READY, HandoverMode.DELIVER),
      FulfilmentStatus.OUT_FOR_DELIVERY,
    );
  });

  it("excludes cancelled from board payment set semantics", () => {
    assert.equal(OPS_STATUS_LABEL.NEW, "To prepare");
    assert.equal(OPS_STATUS_LABEL.CANCELLED, "Cancelled");
  });
});
