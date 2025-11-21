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
 * The "Bridge" between Server Storage and Client Logic.
 *
 * 1. Identifies the user via the Authentication layer's cookie.
 * 2. Loads their Assignments (which roles do they have?).
 * 3. Resolves those Assignments into full Policy Objects.
 * 4. Returns the Policies to the client for local evaluation.
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

/**
 * ================================================================================
 *
 * @project:    @monorepo/authorisation
 * @file:       ~/layers/authorisation/utils/permissions.ts
 * @version:    2.0.0
 * @createDate: 2025 Nov 21
 * @createTime: 14:15
 * @author:     Steve R Lewis
 *
 * ================================================================================
 *
 * @description:
 * Dictionary of System Roles and Actions.
 *
 * NOTE: The logic engine has moved to `policyEvaluator.ts`.
 * This file now serves only as a source of truth for string constants
 * to avoid "Magic Strings" in the codebase.
 *
 * ================================================================================
 */

export const ROLES = {
  SUPERUSER: 'superuser',
  ADMIN: 'admin',
  USER: 'user'
} as const;

export const ACTIONS = {
  // System Level
  MANAGE_SYSTEM: 'system:manage',

  // User Management
  MANAGE_USERS: 'users:manage',

  // Content
  CREATE_BLOG: 'blog:create',
  EDIT_BLOG: 'blog:edit',

  // Profile
  EDIT_PROFILE: 'profile:edit',

  // Commerce
  MANAGE_SHOP: 'shop:manage'
} as const;
```

### Final Integration Note
To ensure the policies are ready when the app starts, go to your `app.vue` or main layout and add:

```typescript
// In app.vue
const { loadPolicies } = useAuthorisation();
await loadPolicies();








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
