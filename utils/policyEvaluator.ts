/**
 * ================================================================================
 *
 * @project:    @monorepo/authorisation
 * @file:       ~/layers/authorisation/utils/policyEvaluator.ts
 * @version:    1.0.0
 * @createDate: 2025 Nov 21
 * @createTime: 00:53
 * @author:     Steve R Lewis
 *
 * ================================================================================
 *
 * @description:
 * The Logic Engine that enforces Hybrid RBAC/ABAC.
 * It evaluates a User + Action + Resource against a set of PolicyRoles.
 *
 * Compliance:
 * - Fails safe (default deny).
 * - Supports Contextual Variables (e.g., $user.id).
 *
 * ================================================================================
 *
 * @notes: Revision History
 *
 * V1.0.0, 20251121-00:53
 * Initial creation and release of policyEvaluator.ts
 *
 * ================================================================================
 */

import type { IIdentity } from '../types/IIdentity';
import type { PolicyRole, PolicyCondition } from '../types/Policy';
import { get } from 'lodash-es'; // or a simple custom getter helper

/**
 * Helper to resolve values from the context (User or Resource).
 * Supports "$user.id", "resource.status", or static values.
 */
function resolveValue(token: string, identity: IIdentity, resource: any): any {
  if (token.startsWith('$user.')) {
    const path = token.replace('$user.', '');
    // Simple dot notation access for identity
    return (identity as any)[path];
  }
  if (token.startsWith('resource.') && resource) {
    const path = token.replace('resource.', '');
    return get(resource, path); // Using lodash get for deep access
  }
  return token; // It's a static string literal
}

/**
 * Evaluates a single ABAC condition.
 */
function evaluateCondition(condition: PolicyCondition, identity: IIdentity, resource: any): boolean {
  const left = resolveValue(condition.attribute, identity, resource);
  const right = resolveValue(condition.value, identity, resource);

  switch (condition.operator) {
    case 'equals': return left === right;
    case 'not_equals': return left !== right;
    case 'contains': return Array.isArray(left) && left.includes(right);
    case 'in_list': return Array.isArray(right) && right.includes(left);
    case 'starts_with': return typeof left === 'string' && left.startsWith(right);
    default: return false;
  }
}

/**
 * MAIN ENTRY POINT
 * Checks if the given assignments and policies allow the action.
 */
export const evaluatePermission = (
  identity: IIdentity,
  policies: PolicyRole[], // The roles the user HAS assigned
  action: string,
  resource?: any
): boolean => {

  // 1. Global Superuser Bypass
  if (identity.roles.includes('superuser')) return true;

  // 2. Iterate through every policy the user holds
  for (const policy of policies) {

    // A. Check RBAC: Does this policy contain the requested action?
    if (policy.permissions.includes(action) || policy.permissions.includes('*')) {

      // B. Check ABAC: If permissions match, are there conditions?
      if (!policy.conditions || policy.conditions.length === 0) {
        // No conditions = Access Granted
        return true;
      }

      // Check if ALL conditions pass
      const allConditionsMet = policy.conditions.every(cond =>
        evaluateCondition(cond, identity, resource)
      );

      if (allConditionsMet) return true;
    }
  }

  // Default Deny
  return false;
};
