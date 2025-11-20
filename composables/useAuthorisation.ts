/**
 * ================================================================================
 *
 * @project:    @monorepo/authorisation
 * @file:       ~/layers/authorisation/composables/useAuthorisation.ts
 * @version:    1.0.0
 * @createDate: 2025 Nov 20
 * @createTime: 01:16
 * @author:     Steve R Lewis
 *
 * ================================================================================
 *
 * @description:
 * Composable for checking permissions in Vue components.
 * Wraps the core `can()` utility and automatically passes the current
 * authenticated user from the store.
 *
 * Usage:
 * const { can } = useAuthorisation();
 * if (can('blog:create')) { ... }
 *
 * ================================================================================
 *
 * @notes: Revision History
 *
 * V1.0.0, 20251120-01:16
 * Initial creation and release of useAuthorisation.ts
 *
 * ================================================================================
 */

import { useAuthentication } from '#imports' // Auto-imported from auth layer
import { can as checkPermission } from '../utils/permissions'

export const useAuthorisation = () => {
  const { user } = useAuthentication();

  /**
   * Reactive permission check.
   * @param action The action to check (e.g. 'blog:create')
   * @param resource Optional resource for context
   */
  const can = (action: string, resource?: any): boolean => {
    // We cast the user state to the expected UserAccount type
    return checkPermission(user.value as any, action, resource);
  }

  return {
    can
  }
}
