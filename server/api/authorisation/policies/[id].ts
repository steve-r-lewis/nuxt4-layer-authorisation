/**
 * ================================================================================
 *
 * @project:    @monorepo/authorisation
 * @file:       ~/layers/authorisation/server/api/authorisation/policies/[id].ts
 * @version:    1.1.0
 * @createDate: 2025 Nov 21
 * @createTime: 01:35
 * @author:     Steve R Lewis
 *
 * ================================================================================
 *
 * @description:
 * Handles PUT (Update) and DELETE (Remove) for a specific Policy ID.
 *
 * ================================================================================
 *
 * @notes: Revision History
 *
 * V1.1.0, 20251124-01:32
 * - Uses Service Locator `getPolicyRepository()`.
 * - Removed direct FileSystem import to fix build error.
 *
 * V1.0.0, 20251121-01:35
 * Initial creation and release of [id].ts
 *
 * ================================================================================
 */

import { defineEventHandler, readBody, createError, getCookie, getRouterParam } from 'h3'
import type { PolicyRole } from '../../../../types/Policy'

// Nitro Auto-Import: getPolicyRepository() from ~/server/utils/appContainer.ts

export default defineEventHandler(async (event) => {
  const userEmail = getCookie(event, 'authentication-token-email');
  if (!userEmail) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });

  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID required' });

  // Use Service Locator
  const repo = getPolicyRepository();
  const method = event.method;

  // --- PUT: Update Policy ---
  if (method === 'PUT') {
    const body = await readBody<Partial<PolicyRole>>(event);
    const success = await repo.updatePolicy(id, body);

    if (!success) throw createError({ statusCode: 404, statusMessage: 'Policy not found' });
    return { success: true };
  }

  // --- DELETE: Remove Policy ---
  if (method === 'DELETE') {
    const success = await repo.deletePolicy(id);
    if (!success) throw createError({ statusCode: 404, statusMessage: 'Policy not found' });
    return { success: true };
  }
})
