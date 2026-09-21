/**
 * Fractional Float Ordering System
 * Enables O(1) persistent reordering for Kanban columns, tasks, and subtasks
 * without mutating sibling database records.
 */

export const DEFAULT_ORDER_SPACING = 1000.0;
export const MIN_ORDER_DIFFERENCE = 0.00001;

/**
 * Calculates new orderIndex when inserting or moving an item.
 * @param prevOrder - The orderIndex of the item immediately preceding the new position (or null if first)
 * @param nextOrder - The orderIndex of the item immediately following the new position (or null if last)
 */
export function calculateNewOrder(
  prevOrder: number | null | undefined,
  nextOrder: number | null | undefined
): number {
  // Case 1: Inserting into an empty list
  if (prevOrder == null && nextOrder == null) {
    return DEFAULT_ORDER_SPACING;
  }

  // Case 2: Moving to the very top (before the current first item)
  if (prevOrder == null && nextOrder != null) {
    return nextOrder / 2.0;
  }

  // Case 3: Moving to the very bottom (after the current last item)
  if (prevOrder != null && nextOrder == null) {
    return prevOrder + DEFAULT_ORDER_SPACING;
  }

  // Case 4: Inserting between two existing items
  if (prevOrder != null && nextOrder != null) {
    if (prevOrder >= nextOrder) {
      // Inverted or equal, handle gracefully
      return prevOrder + (DEFAULT_ORDER_SPACING / 2.0);
    }
    return (prevOrder + nextOrder) / 2.0;
  }

  return DEFAULT_ORDER_SPACING;
}

/**
 * Detects if the gap between items has narrowed to a threshold requiring rebalancing.
 */
export function needsRebalance(prevOrder: number, nextOrder: number): boolean {
  return Math.abs(nextOrder - prevOrder) < MIN_ORDER_DIFFERENCE;
}
