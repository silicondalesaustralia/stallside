/**
 * Production bake-list inclusion rules.
 * Run: npm run test:production
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  FulfilmentOptionKind,
  FulfilmentStatus,
} from "@/generated/prisma/client";
import { isProductionDemandOrder } from "./production-demand";

const from = new Date("2026-09-09T00:00:00.000Z");
const to = new Date("2026-09-10T00:00:00.000Z");
const inRange = new Date("2026-09-09T10:00:00.000Z");
const outOfRange = new Date("2026-09-11T10:00:00.000Z");

describe("isProductionDemandOrder", () => {
  it("excludes farmstand takeaways with no collectionAt", () => {
    assert.equal(
      isProductionDemandOrder(
        {
          isPreOrder: false,
          collectionAt: null,
          fulfilment: {
            kind: FulfilmentOptionKind.STAND_IMMEDIATE,
            fulfilmentStatus: FulfilmentStatus.COLLECTED,
          },
        },
        { from, to },
      ),
      false,
    );
  });

  it("excludes STAND_IMMEDIATE even when collectionAt is set", () => {
    assert.equal(
      isProductionDemandOrder(
        {
          isPreOrder: false,
          collectionAt: inRange,
          fulfilment: {
            kind: FulfilmentOptionKind.STAND_IMMEDIATE,
            fulfilmentStatus: FulfilmentStatus.COLLECTED,
          },
        },
        { from, to },
      ),
      false,
    );
  });

  it("includes pre-orders with collectionAt in range", () => {
    assert.equal(
      isProductionDemandOrder(
        {
          isPreOrder: true,
          collectionAt: inRange,
          fulfilment: {
            kind: FulfilmentOptionKind.PREORDER_SHEET,
            fulfilmentStatus: FulfilmentStatus.NEW,
          },
        },
        { from, to },
      ),
      true,
    );
  });

  it("still includes collected pre-orders while collection day is in range", () => {
    assert.equal(
      isProductionDemandOrder(
        {
          isPreOrder: true,
          collectionAt: inRange,
          fulfilment: {
            kind: FulfilmentOptionKind.PREORDER_SHEET,
            fulfilmentStatus: FulfilmentStatus.COLLECTED,
          },
        },
        { from, to },
      ),
      true,
    );
  });

  it("excludes pre-orders outside the range", () => {
    assert.equal(
      isProductionDemandOrder(
        {
          isPreOrder: true,
          collectionAt: outOfRange,
          fulfilment: {
            kind: FulfilmentOptionKind.PREORDER_SHEET,
            fulfilmentStatus: FulfilmentStatus.NEW,
          },
        },
        { from, to },
      ),
      false,
    );
  });

  it("includes open website scheduled pickup in range", () => {
    assert.equal(
      isProductionDemandOrder(
        {
          isPreOrder: false,
          collectionAt: inRange,
          fulfilment: {
            kind: FulfilmentOptionKind.PICKUP,
            fulfilmentStatus: FulfilmentStatus.PREPARING,
          },
        },
        { from, to },
      ),
      true,
    );
  });

  it("excludes closed website pickup that was already handed over", () => {
    assert.equal(
      isProductionDemandOrder(
        {
          isPreOrder: false,
          collectionAt: inRange,
          fulfilment: {
            kind: FulfilmentOptionKind.PICKUP,
            fulfilmentStatus: FulfilmentStatus.COLLECTED,
          },
        },
        { from, to },
      ),
      false,
    );
  });
});
