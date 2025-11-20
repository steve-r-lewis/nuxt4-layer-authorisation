/**
 * ================================================================================
 *
 * @project:    @monorepo/authorisation
 * @file:       ~/layers/authorisation/nuxt.config.ts
 * @version:    1.0.0
 * @createDate: 2025 Nov 20
 * @createTime: 01:10
 * @author:     Steve R Lewis
 *
 * ================================================================================
 *
 * @description:
 * This layer handles Authorisation (RBAC/ABAC).
 * It depends on @monorepo/authentication to know *who* the user is,
 * so it can determine *what* they are allowed to do.
 *
 * ================================================================================
 *
 * @notes: Revision History
 *
 * V1.0.0, 20251120-01:10
 * Initial creation and release of nuxt.config.ts
 *
 * ================================================================================
 */

export default defineNuxtConfig({
  // Extends authentication because it needs access to the user state store
  extends: [
    '@monorepo/authentication'
  ]
})
