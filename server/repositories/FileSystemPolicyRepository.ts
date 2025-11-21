/**
 * ================================================================================
 *
 * @project:    @monorepo/authorisation
 * @file:       ~/layers/authorisation/server/repositories/FileSystemPolicyRepository.ts
 * @version:    1.0.0
 * @createDate: 2025 Nov 21
 * @createTime: 00:58
 * @author:     Steve R Lewis
 *
 * ================================================================================
 *
 * @description:
 * FileSystem implementation of IPolicyRepository.
 * Stores Policies and Assignments in JSON files.
 *
 * ================================================================================
 *
 * @notes: Revision History
 *
 * V1.0.0, 20251121-00:58
 * Initial creation and release of FileSystemPolicyRepository.ts
 *
 * ================================================================================
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import type { IPolicyRepository } from '../types/IPolicyRepository';
import type { PolicyRole, RoleAssignment } from '../../types/Policy';

const DB_PATH = path.resolve(process.cwd(), 'layers/authorisation/assets/json_db');
const POLICIES_FILE = 'policies.json';
const ASSIGNMENTS_FILE = 'role_assignments.json';

export class FileSystemPolicyRepository implements IPolicyRepository {

  private async _readJson<T>(filename: string): Promise<T[]> {
    try {
      const filePath = path.join(DB_PATH, filename);
      await fs.mkdir(DB_PATH, { recursive: true });
      try {
        await fs.access(filePath);
      } catch {
        return [];
      }
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private async _writeJson<T>(filename: string, data: T[]): Promise<void> {
    const filePath = path.join(DB_PATH, filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }

  // --- Policy Operations ---

  async createPolicy(policy: PolicyRole): Promise<PolicyRole> {
    const policies = await this._readJson<PolicyRole>(POLICIES_FILE);
    // Simple ID gen
    if (!policy.id) policy.id = Math.random().toString(36).substr(2, 9);
    policies.push(policy);
    await this._writeJson(POLICIES_FILE, policies);
    return policy;
  }

  async getPolicy(id: string): Promise<PolicyRole | null> {
    const policies = await this._readJson<PolicyRole>(POLICIES_FILE);
    return policies.find(p => p.id === id) || null;
  }

  async getPoliciesByScope(scope: string): Promise<PolicyRole[]> {
    const policies = await this._readJson<PolicyRole>(POLICIES_FILE);
    // Return global policies + specific scope policies
    return policies.filter(p => p.scope === 'global' || p.scope === scope);
  }

  async updatePolicy(id: string, updates: Partial<PolicyRole>): Promise<boolean> {
    const policies = await this._readJson<PolicyRole>(POLICIES_FILE);
    const index = policies.findIndex(p => p.id === id);
    if (index === -1) return false;
    policies[index] = { ...policies[index], ...updates };
    await this._writeJson(POLICIES_FILE, policies);
    return true;
  }

  async deletePolicy(id: string): Promise<boolean> {
    const policies = await this._readJson<PolicyRole>(POLICIES_FILE);
    const filtered = policies.filter(p => p.id !== id);
    if (filtered.length === policies.length) return false;
    await this._writeJson(POLICIES_FILE, filtered);
    return true;
  }

  // --- Assignment Operations ---

  async assignRole(assignment: RoleAssignment): Promise<void> {
    const assignments = await this._readJson<RoleAssignment>(ASSIGNMENTS_FILE);
    // Avoid duplicates
    if (!assignments.find(a => a.userId === assignment.userId && a.roleId === assignment.roleId)) {
      assignments.push(assignment);
      await this._writeJson(ASSIGNMENTS_FILE, assignments);
    }
  }

  async getUserAssignments(userId: string): Promise<RoleAssignment[]> {
    const assignments = await this._readJson<RoleAssignment>(ASSIGNMENTS_FILE);
    return assignments.filter(a => a.userId === userId);
  }

  async revokeAssignment(userId: string, roleId: string, scope: string): Promise<boolean> {
    const assignments = await this._readJson<RoleAssignment>(ASSIGNMENTS_FILE);
    const filtered = assignments.filter(a =>
      !(a.userId === userId && a.roleId === roleId && a.scope === scope)
    );
    if (filtered.length === assignments.length) return false;
    await this._writeJson(ASSIGNMENTS_FILE, filtered);
    return true;
  }
}
