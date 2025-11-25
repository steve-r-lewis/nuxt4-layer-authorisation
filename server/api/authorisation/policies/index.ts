/**
 * ================================================================================
 *
 * @project:    @monorepo/authorisation
 * @file:       ~/layers/authorisation/server/api/authorisation/policies/index.ts
 * @version:    1.3.0
 * @createDate: 2025 Nov 21
 * @createTime: 01:33
 * @author:     Steve R Lewis
 *
 * ================================================================================
 *
 * @description:
 * Handles GET (List) and POST (Create) for Policies.
 *
 * ================================================================================
 *
 * @notes: Revision History
 *
 * V1.3.0, 20251124-20:59
 * - Fixed import error by using Service Locator `getPolicyRepository()`.
 *
 * V1.1.0, 20251124-01:45
 * - Uses Service Locator `getPolicyRepository()`.
 * - Removed direct FileSystem import to fix build error.
 *
 * V1.0.0, 20251121-01:33
 * Initial creation and release of index.ts
 *
 * ================================================================================
 */

import { defineEventHandler, readBody, createError, getCookie } from 'h3'
import type { PolicyRole } from '../../../../types/Policy'

// Nitro Auto-Import: getPolicyRepository() from ~/server/utils/appContainer.ts

export default defineEventHandler(async (event) => {
  // Security Guard
  const userEmail = getCookie(event, 'authentication-token-email');
  if (!userEmail) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });

  // Use Service Locator
  const repo = getPolicyRepository();
  const method = event.method;

  // --- GET: List All Policies ---
  if (method === 'GET') {
    const globalPolicies = await repo.getPoliciesByScope('global');
    return globalPolicies;
  }

  // --- POST: Create New Policy ---
  if (method === 'POST') {
    const body = await readBody<PolicyRole>(event);

    if (!body.name || !body.scope) {
      throw createError({ statusCode: 400, statusMessage: 'Name and Scope are required' });
    }

    // Defaults
    const newPolicy: PolicyRole = {
      id: body.id || Math.random().toString(36).substr(2, 9),
      name: body.name,
      description: body.description || '',
      scope: body.scope,
      permissions: body.permissions || [],
      conditions: body.conditions || []
    };

    return await repo.createPolicy(newPolicy);
  }
})
