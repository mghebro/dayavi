import { describe, it, expect } from "vitest";
import { hasPermission } from "@/lib/permissions";

describe("RBAC Capability Matrix", () => {
  describe("OWNER role", () => {
    it("has full administrative permissions", () => {
      expect(hasPermission("OWNER", "DELETE_WORKSPACE")).toBe(true);
      expect(hasPermission("OWNER", "MANAGE_WORKSPACE")).toBe(true);
      expect(hasPermission("OWNER", "INVITE_MEMBERS")).toBe(true);
      expect(hasPermission("OWNER", "CREATE_PROJECT")).toBe(true);
      expect(hasPermission("OWNER", "CREATE_TASK")).toBe(true);
      expect(hasPermission("OWNER", "DELETE_TASK")).toBe(true);
      expect(hasPermission("OWNER", "VIEW")).toBe(true);
    });
  });

  describe("ADMIN role", () => {
    it("can manage projects, members, and tasks, but cannot delete workspace", () => {
      expect(hasPermission("ADMIN", "DELETE_WORKSPACE")).toBe(false);
      expect(hasPermission("ADMIN", "MANAGE_WORKSPACE")).toBe(true);
      expect(hasPermission("ADMIN", "INVITE_MEMBERS")).toBe(true);
      expect(hasPermission("ADMIN", "CREATE_PROJECT")).toBe(true);
      expect(hasPermission("ADMIN", "CREATE_TASK")).toBe(true);
      expect(hasPermission("ADMIN", "VIEW")).toBe(true);
    });
  });

  describe("MEMBER role", () => {
    it("can create, edit, move tasks and comments, but cannot manage workspace or invite", () => {
      expect(hasPermission("MEMBER", "DELETE_WORKSPACE")).toBe(false);
      expect(hasPermission("MEMBER", "MANAGE_WORKSPACE")).toBe(false);
      expect(hasPermission("MEMBER", "INVITE_MEMBERS")).toBe(false);
      expect(hasPermission("MEMBER", "CREATE_PROJECT")).toBe(false);
      expect(hasPermission("MEMBER", "CREATE_TASK")).toBe(true);
      expect(hasPermission("MEMBER", "MOVE_TASK")).toBe(true);
      expect(hasPermission("MEMBER", "COMMENT")).toBe(true);
      expect(hasPermission("MEMBER", "VIEW")).toBe(true);
    });
  });

  describe("VIEWER role", () => {
    it("is strictly read-only", () => {
      expect(hasPermission("VIEWER", "VIEW")).toBe(true);
      expect(hasPermission("VIEWER", "CREATE_TASK")).toBe(false);
      expect(hasPermission("VIEWER", "EDIT_TASK")).toBe(false);
      expect(hasPermission("VIEWER", "DELETE_TASK")).toBe(false);
      expect(hasPermission("VIEWER", "MOVE_TASK")).toBe(false);
      expect(hasPermission("VIEWER", "COMMENT")).toBe(false);
      expect(hasPermission("VIEWER", "MANAGE_WORKSPACE")).toBe(false);
    });
  });
});
