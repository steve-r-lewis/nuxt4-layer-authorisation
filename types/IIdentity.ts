/**
 * ================================================================================
 *
 * @project:    @monorepo/authorisation
 * @file:       ~/layers/authorisation/types/IIdentity.ts
 * @version:    1.0.0
 * @createDate: 2025 Nov 21
 * @createTime: 00:13
 * @author:     Steve R Lewis
 *
 * ================================================================================
 *
 * @description:
 * The Identity Contract.
 *
 * This interface defines the shape of a user strictly from the perspective of
 * the Authorisation layer. It decouples this layer from the specific implementation
 * details of the Authentication layer (e.g., password hashes, salts, or database IDs).
 *
 * As long as the authenticated user object satisfies this contract, the
 * authorisation policies will function correctly.
 *
 * ================================================================================
 *
 * @notes: Revision History
 *
 * V1.0.0, 20251121-00:13
 * Initial creation and release of IIdentity.ts
 *
 * ================================================================================
 */

export interface IIdentity {
  id: string;
  roles: string[];
  capabilities?: string[];
  status?: string;
}
