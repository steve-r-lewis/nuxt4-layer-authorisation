/**
 * ================================================================================
 *
 * @project:    @monorepo/authorisation
 * @file:       ~/layers/authorisation/server/types/IPolicyRepository.ts
 * @version:    1.0.0
 * @createDate: 2025 Nov 21
 * @createTime: 00:50
 * @author:     Steve R Lewis
 *
 * ================================================================================
 *
 * @description:
 * Contract for Policy Storage.
 * Allows the backend storage to be swapped (File System -> SQL -> NoSQL)
 * without changing the application logic.
 *
 * ================================================================================
 *
 * @notes: Revision History
 *
 * V1.0.0, 20251121-00:50
 * Initial creation and release of IPolicyRepository.ts
 *
 * ================================================================================
 */

import type { PolicyRole, RoleAssignment } from '../../types/Policy';

export interface IPolicyRepository {
  // --- Policy Definitions (The Rules) ---
  createPolicy(policy: PolicyRole): Promise<PolicyRole>;
  getPolicy(id: string): Promise<PolicyRole | null>;
  getPoliciesByScope(scope: string): Promise<PolicyRole[]>;
  updatePolicy(id: string, updates: Partial<PolicyRole>): Promise<boolean>;
  deletePolicy(id: string): Promise<boolean>;

  // --- Assignments (Who has what rule) ---
  assignRole(assignment: RoleAssignment): Promise<void>;
  getUserAssignments(userId: string): Promise<RoleAssignment[]>;
  revokeAssignment(userId: string, roleId: string, scope: string): Promise<boolean>;
}
