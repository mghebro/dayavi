import { describe, it, expect } from "vitest";
import {
  registerSchema,
  createWorkspaceSchema,
  createProjectSchema,
  createTaskSchema,
  moveTaskSchema,
} from "@/lib/validation/schemas";

describe("Zod Validation Schemas", () => {
  describe("registerSchema", () => {
    it("accepts valid registration payload", () => {
      const result = registerSchema.safeParse({
        name: "Giorgi Mgebrishvili",
        email: "giorgi@dayavi.app",
        password: "SuperSecretPassword123!",
      });
      expect(result.success).toBe(true);
    });

    it("rejects password with fewer than 8 characters", () => {
      const result = registerSchema.safeParse({
        name: "Giorgi",
        email: "giorgi@dayavi.app",
        password: "short",
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid email formats", () => {
      const result = registerSchema.safeParse({
        name: "Giorgi",
        email: "not-an-email",
        password: "ValidPassword123!",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("createWorkspaceSchema", () => {
    it("accepts valid workspace with slug", () => {
      const result = createWorkspaceSchema.safeParse({
        name: "Design Studio",
        slug: "design-studio",
        accentColor: "#FF6B4A",
      });
      expect(result.success).toBe(true);
    });

    it("rejects uppercase or invalid characters in slug", () => {
      const result = createWorkspaceSchema.safeParse({
        name: "Design Studio",
        slug: "Design_Studio!",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("createTaskSchema", () => {
    it("accepts task with required fields", () => {
      const result = createTaskSchema.safeParse({
        projectId: "proj_123",
        boardId: "brd_123",
        columnId: "col_123",
        title: "Implement drag and drop",
        priority: "HIGH",
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty title", () => {
      const result = createTaskSchema.safeParse({
        projectId: "proj_123",
        boardId: "brd_123",
        columnId: "col_123",
        title: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("moveTaskSchema", () => {
    it("accepts valid movement coordinates", () => {
      const result = moveTaskSchema.safeParse({
        taskId: "tsk_123",
        targetColumnId: "col_456",
        prevOrder: 1000,
        nextOrder: 2000,
      });
      expect(result.success).toBe(true);
    });
  });
});
