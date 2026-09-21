import { describe, it, expect } from "vitest";
import { calculateNewOrder, needsRebalance, DEFAULT_ORDER_SPACING } from "@/lib/ordering";

describe("Fractional Float Ordering", () => {
  it("assigns default spacing to the first item in an empty list", () => {
    const order = calculateNewOrder(null, null);
    expect(order).toBe(DEFAULT_ORDER_SPACING);
  });

  it("calculates correct order when inserting at the top before existing first item", () => {
    const order = calculateNewOrder(null, 1000);
    expect(order).toBe(500);
  });

  it("calculates correct order when inserting at the bottom after existing last item", () => {
    const order = calculateNewOrder(2000, null);
    expect(order).toBe(3000);
  });

  it("calculates exact midpoint when inserting between two items", () => {
    const order = calculateNewOrder(1000, 2000);
    expect(order).toBe(1500);
  });

  it("handles narrow fractional gaps properly", () => {
    const order = calculateNewOrder(1000.5, 1001.0);
    expect(order).toBe(1000.75);
  });

  it("detects when rebalancing is required", () => {
    expect(needsRebalance(1000.000001, 1000.000002)).toBe(true);
    expect(needsRebalance(1000, 2000)).toBe(false);
  });
});
