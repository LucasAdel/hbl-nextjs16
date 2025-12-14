/**
 * Permission Matrix Security Tests
 *
 * Verifies that the RBAC permission system correctly restricts access.
 * These tests ensure permission checks don't regress.
 */

import { describe, it, expect } from "vitest";
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  isAdminRole,
  getPermissionsForRole,
  PERMISSIONS,
} from "@/lib/auth/permissions";

describe("Permission System", () => {
  describe("hasPermission", () => {
    it("should grant admin all permissions via wildcard", () => {
      expect(hasPermission("admin", PERMISSIONS.MANAGE_USERS)).toBe(true);
      expect(hasPermission("admin", PERMISSIONS.VIEW_DASHBOARD)).toBe(true);
      expect(hasPermission("admin", PERMISSIONS.VIEW_ANALYTICS)).toBe(true);
      expect(hasPermission("admin", PERMISSIONS.EDIT_KNOWLEDGE_BASE)).toBe(true);
      expect(hasPermission("admin", PERMISSIONS.DELETE_CONVERSATIONS)).toBe(true);
      expect(hasPermission("admin", PERMISSIONS.CONFIGURE_BAILEY_AI)).toBe(true);
    });

    it("should restrict staff from admin-only permissions", () => {
      // Staff should NOT have these permissions
      expect(hasPermission("staff", PERMISSIONS.MANAGE_USERS)).toBe(false);
      expect(hasPermission("staff", PERMISSIONS.EDIT_KNOWLEDGE_BASE)).toBe(false);
      expect(hasPermission("staff", PERMISSIONS.DELETE_CONVERSATIONS)).toBe(false);
      expect(hasPermission("staff", PERMISSIONS.CONFIGURE_BAILEY_AI)).toBe(false);
    });

    it("should grant staff view-only permissions", () => {
      // Staff SHOULD have these permissions
      expect(hasPermission("staff", PERMISSIONS.VIEW_DASHBOARD)).toBe(true);
      expect(hasPermission("staff", PERMISSIONS.VIEW_ANALYTICS)).toBe(true);
      expect(hasPermission("staff", PERMISSIONS.VIEW_KNOWLEDGE_BASE)).toBe(true);
      expect(hasPermission("staff", PERMISSIONS.VIEW_CONVERSATIONS)).toBe(true);
      expect(hasPermission("staff", PERMISSIONS.VIEW_BAILEY_AI)).toBe(true);
      expect(hasPermission("staff", PERMISSIONS.VIEW_EMAIL_ANALYTICS)).toBe(true);
    });

    it("should deny client all admin permissions", () => {
      expect(hasPermission("client", PERMISSIONS.MANAGE_USERS)).toBe(false);
      expect(hasPermission("client", PERMISSIONS.VIEW_DASHBOARD)).toBe(false);
      expect(hasPermission("client", PERMISSIONS.VIEW_ANALYTICS)).toBe(false);
      expect(hasPermission("client", PERMISSIONS.VIEW_KNOWLEDGE_BASE)).toBe(false);
    });

    it("should deny unknown roles all permissions", () => {
      expect(hasPermission("hacker", PERMISSIONS.MANAGE_USERS)).toBe(false);
      expect(hasPermission("", PERMISSIONS.VIEW_DASHBOARD)).toBe(false);
      expect(hasPermission("undefined", PERMISSIONS.VIEW_ANALYTICS)).toBe(false);
    });
  });

  describe("hasAnyPermission", () => {
    it("should return true if role has any of the permissions", () => {
      expect(
        hasAnyPermission("staff", [
          PERMISSIONS.MANAGE_USERS,
          PERMISSIONS.VIEW_DASHBOARD,
        ])
      ).toBe(true);
    });

    it("should return false if role has none of the permissions", () => {
      expect(
        hasAnyPermission("staff", [
          PERMISSIONS.MANAGE_USERS,
          PERMISSIONS.EDIT_KNOWLEDGE_BASE,
        ])
      ).toBe(false);
    });
  });

  describe("hasAllPermissions", () => {
    it("should return true only if role has all permissions", () => {
      expect(
        hasAllPermissions("admin", [
          PERMISSIONS.MANAGE_USERS,
          PERMISSIONS.VIEW_DASHBOARD,
        ])
      ).toBe(true);

      expect(
        hasAllPermissions("staff", [
          PERMISSIONS.VIEW_DASHBOARD,
          PERMISSIONS.VIEW_ANALYTICS,
        ])
      ).toBe(true);
    });

    it("should return false if role lacks any permission", () => {
      expect(
        hasAllPermissions("staff", [
          PERMISSIONS.VIEW_DASHBOARD,
          PERMISSIONS.MANAGE_USERS,
        ])
      ).toBe(false);
    });
  });

  describe("isAdminRole", () => {
    it("should identify admin role correctly", () => {
      expect(isAdminRole("admin")).toBe(true);
      expect(isAdminRole("staff")).toBe(false);
      expect(isAdminRole("client")).toBe(false);
      expect(isAdminRole("")).toBe(false);
    });
  });

  describe("getPermissionsForRole", () => {
    it("should return wildcard for admin", () => {
      const perms = getPermissionsForRole("admin");
      expect(perms[0]).toBe("*");
    });

    it("should return specific permissions for staff", () => {
      const perms = getPermissionsForRole("staff");
      expect(perms).toContain(PERMISSIONS.VIEW_DASHBOARD);
      expect(perms).not.toContain(PERMISSIONS.MANAGE_USERS);
    });

    it("should return empty array for unknown role", () => {
      const perms = getPermissionsForRole("unknown");
      expect(perms).toEqual([]);
    });
  });
});

describe("Critical Permission Boundaries", () => {
  /**
   * These tests verify the most critical security boundaries.
   * If any of these fail, it indicates a serious security regression.
   */

  it("CRITICAL: Staff must NEVER have MANAGE_USERS permission", () => {
    // This is the most critical permission boundary
    expect(hasPermission("staff", PERMISSIONS.MANAGE_USERS)).toBe(false);
  });

  it("CRITICAL: Client must NEVER have any admin permissions", () => {
    const allPermissions = Object.values(PERMISSIONS);
    for (const permission of allPermissions) {
      expect(hasPermission("client", permission)).toBe(false);
    }
  });

  it("CRITICAL: Unknown roles must be denied all permissions", () => {
    const maliciousRoles = ["hacker", "admin ", " admin", "ADMIN", "Admin", "root", "superuser"];
    const allPermissions = Object.values(PERMISSIONS);

    for (const role of maliciousRoles) {
      for (const permission of allPermissions) {
        expect(hasPermission(role, permission)).toBe(false);
      }
    }
  });
});
