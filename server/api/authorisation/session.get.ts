/**
 * ================================================================================
 *
 * @project:    @monorepo/authorisation
 * @file:       ~/layers/authorisation/server/api/authorisation/session.get.ts
 * @version:    1.0.0
 * @createDate: 2025 Nov 21
 * @createTime: 01:08
 * @author:     Steve R Lewis
 *
 * ================================================================================
 *
 * @description:
 * TODO: Create description here
 *
 * ================================================================================
 *
 * @notes: Revision History
 *
 * V1.0.0, 20251121-01:08
 * Initial creation and release of session.get.ts
 *
 * ================================================================================
 */

import { defineEventHandler, getCookie, createError } from 'h3'
import { FileSystemPolicyRepository } from '../../repositories/FileSystemPolicyRepository'
import type { PolicyRole } from '../../../types/Policy'

// In a real app, use dependency injection here
const policyRepo = new FileSystemPolicyRepository();

export default defineEventHandler(async (event) => {
  // 1. Get the User ID (we rely on the Auth layer's cookie contract)
  // Note: In a stricter environment, verify the JWT token signature here.
  const userEmail = getCookie(event, 'authentication-token-email');

  // If not logged in, they have no policies.
  if (!userEmail) {
    return { policies: [] };
  }

  // We need to resolve Email -> ID.
  // Ideally, the Auth token would contain the ID, but given current architecture,
  // we might need to fetch the user profile or rely on a shared lookup.
  // For this implementation, we will assume we can get the ID or the Auth Layer
  // exposes an endpoint we can call internally.
  //
  // HACK: For this specific encapsulated layer, we will assume the
  // Authentication Layer put the ID in a cookie or we look it up via a shared service.
  // To keep this layer isolated, let's assume the client passes the ID or we fetch
  // it from the userRepo if we had access.
  //
  // IMPROVEMENT: The Authentication layer should probably set a 'uid' cookie.
  // For now, let's return a placeholder or fetch user assignments if we can resolve the ID.

  // To remain robust without importing Auth repositories:
  // We will fetch ALL Global policies + policies relevant to the user's context if known.

  // For this specific file-system mock, let's load all Global policies so the UI works.
  // In production, you would filter this by `repo.getUserAssignments(userId)`.

  const policies = await policyRepo.getPoliciesByScope('global');

  return { policies };
})
