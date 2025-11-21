/**
 * ================================================================================
 *
 * @project:    @monorepo/authorisation
 * @file:       ~/layers/authorisation/server/api/authorisation/policies/index.ts
 * @version:    1.0.0
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
 * V1.0.0, 20251121-01:33
 * Initial creation and release of index.ts
 *
 * ================================================================================
 */

import { defineEventHandler, readBody, createError, getCookie } from 'h3'
import { FileSystemPolicyRepository } from '../../../repositories/FileSystemPolicyRepository'
import type { PolicyRole } from '../../../../types/Policy'

const repo = new FileSystemPolicyRepository();

export default defineEventHandler(async (event) => {
  // Security Guard: Ensure user is logged in (and ideally is a Superuser)
  const userEmail = getCookie(event, 'authentication-token-email');
  if (!userEmail) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });

  const method = event.method;

  // --- GET: List All Policies ---
  if (method === 'GET') {
    // For a management UI, we want to see everything.
    // In a real app, you might filter by the user's scope (e.g. only show their company's roles).
    const globalPolicies = await repo.getPoliciesByScope('global');
    // You might want to fetch all scopes here if building a superuser dashboard
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
