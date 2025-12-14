/**
 * Granular RBAC Permission System
 *
 * Provides fine-grained permission control beyond simple role checks.
 * Admin has all permissions (*), staff has view-only permissions,
 * and permissions can be extended per-role as needed.
 */

// Permission constants - all available permissions in the system
export const PERMISSIONS = {
  // User management (admin only)
  MANAGE_USERS: "MANAGE_USERS",

  // Dashboard & Analytics
  VIEW_DASHBOARD: "VIEW_DASHBOARD",
  VIEW_ANALYTICS: "VIEW_ANALYTICS",

  // Knowledge base
  VIEW_KNOWLEDGE_BASE: "VIEW_KNOWLEDGE_BASE",
  EDIT_KNOWLEDGE_BASE: "EDIT_KNOWLEDGE_BASE",

  // Conversations
  VIEW_CONVERSATIONS: "VIEW_CONVERSATIONS",
  DELETE_CONVERSATIONS: "DELETE_CONVERSATIONS",

  // Bailey AI
  VIEW_BAILEY_AI: "VIEW_BAILEY_AI",
  CONFIGURE_BAILEY_AI: "CONFIGURE_BAILEY_AI",

  // Email analytics
  VIEW_EMAIL_ANALYTICS: "VIEW_EMAIL_ANALYTICS",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// Wildcard constant for admin full access
const WILDCARD = "*" as const;
type WildcardPermission = typeof WILDCARD;

// Combined type for role permissions (either specific permissions or wildcard)
type RolePermissions = readonly Permission[] | readonly [WildcardPermission];

// Role-to-permission mapping
// Admin gets wildcard (*) for all permissions
// Staff gets view-only permissions
// Client gets no admin permissions
const ROLE_PERMISSIONS: Record<string, RolePermissions> = {
  admin: [WILDCARD],
  staff: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_KNOWLEDGE_BASE,
    PERMISSIONS.VIEW_CONVERSATIONS,
    PERMISSIONS.VIEW_BAILEY_AI,
    PERMISSIONS.VIEW_EMAIL_ANALYTICS,
  ],
  client: [],
};

/**
 * Check if a role has a specific permission
 * @param role - User's role (admin, staff, client)
 * @param permission - Required permission
 * @returns true if role has the permission
 */
export function hasPermission(role: string, permission: Permission): boolean {
  const perms = ROLE_PERMISSIONS[role];
  if (!perms) return false;

  // Check for admin wildcard - has all permissions
  if (perms[0] === WILDCARD) return true;

  // Check specific permissions (cast needed for readonly array)
  return (perms as readonly Permission[]).includes(permission);
}

/**
 * Check if a role has ANY of the specified permissions
 * @param role - User's role
 * @param permissions - Array of permissions (OR logic)
 * @returns true if role has at least one permission
 */
export function hasAnyPermission(
  role: string,
  permissions: Permission[]
): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

/**
 * Check if a role has ALL of the specified permissions
 * @param role - User's role
 * @param permissions - Array of permissions (AND logic)
 * @returns true if role has all permissions
 */
export function hasAllPermissions(
  role: string,
  permissions: Permission[]
): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

/**
 * Get all permissions for a role
 * @param role - User's role
 * @returns Array of permission strings, or ['*'] for admin
 */
export function getPermissionsForRole(role: string): RolePermissions {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check if a role is an admin role (has wildcard permissions)
 * @param role - User's role
 * @returns true if role has admin-level access
 */
export function isAdminRole(role: string): boolean {
  const perms = ROLE_PERMISSIONS[role];
  return perms?.[0] === WILDCARD;
}
