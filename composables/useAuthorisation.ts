/**
 * ================================================================================
 *
 * @project:    @monorepo/authorisation
 * @file:       ~/layers/authorisation/composables/useAuthorisation.ts
 * @version:    2.0.0
 * @createDate: 2025 Nov 20
 * @createTime: 01:16
 * @author:     Steve R Lewis
 *
 * ================================================================================
 *
 * @description:
 * The Client-Side Entry Point for Authorisation.
 *
 * acts as an Adapter between the globally available Authentication state
 * and the local Authorisation Policy Engine.
 *
 * ================================================================================
 *
 * @notes: Revision History
 *
 * V2.0.0, 20251121-01:11
 * - Fetches active policies from the API on load.
 * - Uses the `evaluatePermission` engine (ABAC/RBAC) instead of static switch statements.
 * - Provides a `can` method that is fully reactive.
 *
 * V1.1.0, 20251121-12:10
 * - Updated to cast the incoming user object to the local `IIdentity` type.
 * - Added runtime safety check.
 *
 * V1.0.0, 20251120-01:16
 * Initial creation and release of useAuthorisation.ts
 *
 * ================================================================================
 */

import { useAuthentication } from '#imports'
import { evaluatePermission } from '../utils/policyEvaluator'
import type { IIdentity } from '../types/IIdentity'
import type { PolicyRole } from '../types/Policy'

export const useAuthorisation = () => {
  const { user } = useAuthentication();

  // State to hold the loaded policies (cached)
  // We use `useState` so this is shared across the app instance and hydrates from SSR
  const policies = useState<PolicyRole[]>('auth-policies', () => []);
  const hasLoaded = useState<boolean>('auth-policies-loaded', () => false);

  /**
   * Bootstrapper: Loads policies from the server.
   * Call this in your root layout or app.vue
   */
  const loadPolicies = async () => {
    if (hasLoaded.value) return;

    try {
      const { data } = await useFetch('/api/authorisation/session');
      if (data.value && data.value.policies) {
        policies.value = data.value.policies;
        hasLoaded.value = true;
      }
    } catch (e) {
      console.error('Failed to load authorisation policies', e);
    }
  };

  /**
   * The Core Check Function
   */
  const can = (action: string, resource?: any): boolean => {
    const currentUser = user.value;

    // 1. Identity Check
    if (!currentUser || !currentUser.id) return false;

    // 2. Data Check
    // If policies haven't loaded yet, we fail safe (deny) unless Superuser
    if (policies.value.length === 0 && !currentUser.roles?.includes('superuser')) {
      // Optional: Trigger load if not loading?
      return false;
    }

    // 3. Execution (Delegates to the Evaluator Engine)
    return evaluatePermission(
      currentUser as IIdentity,
      policies.value,
      action,
      resource
    );
  }

  return {
    can,
    loadPolicies,
    policies // Exposed for debugging or UI lists
  }
};
