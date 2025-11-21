/**
 * ================================================================================
 *
 * @project:    @monorepo/authorisation
 * @file:       ~/layers/authorisation/types/Policy.ts
 * @version:    1.0.0
 * @createDate: 2025 Nov 21
 * @createTime: 00:47
 * @author:     Steve R Lewis
 *
 * ================================================================================
 *
 * @description:
 * Defines the serializable data structures for the Authorization System.
 * Supports Hybrid RBAC/ABAC.
 *
 * - RBAC: Roles contain a list of Action strings.
 * - ABAC: Roles can optionally contain "Conditions" that restrict when
 * those actions apply (e.g., "Only if resource.ownerId == user.id").
 *
 * ================================================================================
 *
 * @notes: Revision History
 *
 * V1.0.0, 20251121-00:47
 * Initial creation and release of Policy.ts
 *
 * ================================================================================
 */

export type Operator = 'equals' | 'not_equals' | 'contains' | 'in_list' | 'starts_with';

/**
 * A Dynamic Condition (ABAC).
 * Defined as a JSON structure so it can be stored in a DB.
 */
export interface PolicyCondition {
  attribute: string; // e.g., "resource.ownerId"
  operator: Operator;
  value: string;     // e.g., "$user.id" (variable) or "active" (static)
}

/**
 * Represents a "Role" or "Policy" definition.
 * Users can create these for their own Companies/Shops.
 */
export interface PolicyRole {
  id: string;
  name: string;        // e.g., "Shop Manager"
  description?: string;
  scope: string;       // e.g., "global" or "tenant:company_123"
  permissions: string[]; // e.g., ["shop:edit", "shop:view_orders"]
  conditions?: PolicyCondition[]; // Optional ABAC constraints
}

/**
 * The Assignment of a Role to a User.
 */
export interface RoleAssignment {
  userId: string;
  roleId: string;
  scope: string; // Must match the policy scope or be a sub-scope
}
