import prisma from "./db/prisma";

export class DependencyCycleError extends Error {
  constructor(message: string = "Circular dependency detected. A task cannot depend on a chain of tasks that depends on itself.") {
    super(message);
    this.name = "DependencyCycleError";
  }
}

/**
 * Validates that adding a dependency (blockerId blocks dependentId) does not introduce a cycle.
 * Traverses the dependency graph via Depth First Search (DFS).
 * If `dependentId` can reach `blockerId`, adding `blockerId -> dependentId` would close a cycle.
 */
export async function validateNoDependencyCycle(
  blockerId: string,
  dependentId: string
): Promise<void> {
  // 1. Trivial self-dependency check
  if (blockerId === dependentId) {
    throw new DependencyCycleError("A task cannot depend on or block itself.");
  }

  // 2. Fetch all existing dependencies within this task cluster
  // We check if from `dependentId` we can reach `blockerId` by following outgoing blocker links
  const visited = new Set<string>();
  const queue: string[] = [dependentId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (currentId === blockerId) {
      throw new DependencyCycleError();
    }

    if (!visited.has(currentId)) {
      visited.add(currentId);

      // Tasks that `currentId` blocks:
      const outgoing = await prisma.taskDependency.findMany({
        where: { blockerId: currentId },
        select: { dependentId: true },
      });

      for (const edge of outgoing) {
        if (!visited.has(edge.dependentId)) {
          queue.push(edge.dependentId);
        }
      }
    }
  }
}
