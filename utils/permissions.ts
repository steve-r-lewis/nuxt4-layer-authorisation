/**
 * ================================================================================
 *
 * @project:    @monorepo/authorisation
 * @file:       ~/layers/authorisation/utils/permissions.ts
 * @version:    2.0.0
 * @createDate: 2025 Nov 20
 * @createTime: 01:14
 * @author:     Steve R Lewis
 *
 * ================================================================================
 *
 * @description:
 * Dictionary of System Roles and Actions.
 *
 * NOTE: The logic engine has moved to `policyEvaluator.ts`.
 * This file now serves only as a source of truth for string constants
 * to avoid "Magic Strings" in the codebase.
 *
 * ================================================================================
 *
 * @notes: Revision History
 *
 * V2.0.0, 20251121-01:17
 * Refactored to a dictionary of constants.
 *
 * V1.1.0, 20251121-12:05
 * - Refactored to use local `IIdentity` interface instead of importing
 * `UserAccount` from the authentication layer.
 * - This fully decouples the policy engine from the auth implementation.
 *
 * V1.0.0, 20251120-01:14
 * Initial creation and release of permissions.ts
 *
 * ================================================================================
 */

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
