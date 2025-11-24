/**
 * ================================================================================
 *
 * @project:    @monorepo/authorisation
 * @file:       ~/layers/authorisation/server/api/authorisation/session.get.ts
 * @version:    1.1.0
 * @createDate: 2025 Nov 21
 * @createTime: 01:08
 * @author:     Steve R Lewis
 *
 * ================================================================================
 *
 * @description:
 * Session Policy Loader.
 *
 * ================================================================================
 *
 * @notes: Revision History
 *
 * V1.2.0, 20251124-01:25
 * - Fixed import error by using the Service Locator `getPolicyRepository()`.
 * - No longer imports FileSystemPolicyRepository directly.
 *
 * V1.0.0, 20251121-01:08
 * Initial creation and release of session.get.ts
 *
 * ================================================================================
 */

import { defineEventHandler, getCookie } from 'h3'

// Nitro Auto-Import: getPolicyRepository() from ~/server/utils/appContainer.ts

export default defineEventHandler(async (event) => {
  const userEmail = getCookie(event, 'authentication-token-email');

  if (!userEmail) {
    return { policies: [] };
  }

  // Use the Service Locator to get the active repository instance
  const policyRepo = getPolicyRepository();

  // In a real production app, you would resolve UserID from email first
  // and fetch specific assignments. For now, we return global scope policies.
  const policies = await policyRepo.getPoliciesByScope('global');

  return { policies };
})
