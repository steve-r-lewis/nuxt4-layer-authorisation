/**
 * ================================================================================
 *
 * @project:    @monorepo/authorisation
 * @file:       ~/layers/authorisation/utils/permissions.ts
 * @version:    1.0.0
 * @createDate: 2025 Nov 20
 * @createTime: 01:14
 * @author:     Steve R Lewis
 *
 * ================================================================================
 *
 * @description:
 * Core Permission Logic (Policy Engine).
 * Defines Roles and Capabilities constants.
 * Implements the `can()` function for RBAC/ABAC checks.
 *
 * ================================================================================
 *
 * @notes: Revision History
 *
 * V1.0.0, 20251120-01:14
 * Initial creation and release of permissions.ts
 *
 * ================================================================================
 */

import type { UserAccount } from '../../authentication/server/types/IUserRepository';

// --- Constants ---

export const ROLES = {
  SUPERUSER: 'superuser',
  ADMIN: 'admin',
  USER: 'user'
} as const;

export const ACTIONS = {
  // System Level
  MANAGE_SYSTEM: 'system:manage',

  // User Management
  MANAGE_USERS: 'users:manage',

  // Content
  CREATE_BLOG: 'blog:create',
  EDIT_BLOG: 'blog:edit',

  // Profile
  EDIT_PROFILE: 'profile:edit',

  // Commerce
  MANAGE_SHOP: 'shop:manage'
} as const;

// --- The Policy Engine ---

/**
 * Checks if a user is authorized to perform an action.
 * * @param user - The hydrated user object (from store or session)
 * @param action - The action string (e.g., 'blog:create')
 * @param resource - (Optional) The target object for ABAC checks (e.g., the blog post itself)
 */
export const can = (user: UserAccount | null | undefined, action: string, resource?: any): boolean => {
  if (!user) return false;

  // 1. Superuser Bypass (RBAC)
  if (user.roles && user.roles.includes(ROLES.SUPERUSER)) {
    return true;
  }

  // 2. Capability Check (Granular Permissions)
  if (user.capabilities && user.capabilities.includes(action)) {
    return true;
  }

  // 3. Logic-based Checks (ABAC)
  switch (action) {
    case ACTIONS.EDIT_PROFILE:
      // Policy: Users can only edit their own profile
      return resource?.userId === user.id;

    case ACTIONS.CREATE_BLOG:
      // Policy: Only 'active' users can create blogs
      return user.status === 'active';

    case ACTIONS.EDIT_BLOG:
      // Policy: User must be the author OR an admin
      if (user.roles.includes(ROLES.ADMIN)) return true;
      return resource?.authorId === user.id;

    default:
      // Default deny
      return false;
  }
};
