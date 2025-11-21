/**
* ================================================================================
*
* @project:    @monorepo/authorisation
* @file:       ~/layers/authorisation/pages/account/Permissions.vue
* @version:    1.0.0
* @createDate: 2025 Nov 21
* @createTime: 01:37
* @author:     Steve R Lewis
*
* ================================================================================
*
* @description:
* CRUD Management Interface for Authorization Policies.
* Allows creating, editing, and deleting roles/policies.
*
* ================================================================================
*
* @notes: Revision History
*
* V1.0.0, 20251121-01:37
* Initial creation and release of Permissions.vue
*
* ================================================================================
*/

<template>
  <div>
    <header class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-pen-base-default">Permissions & Roles</h1>
        <p class="text-pen-muted-default mt-2">Manage system access policies.</p>
      </div>
      <button @click="openEditor()" class="btn btn-primary flex items-center gap-2 px-4 py-2">
        <Icon name="lucide:plus" class="w-4 h-4" />
        <span>New Role</span>
      </button>
    </header>

    <!-- Policies Grid -->
    <div v-if="pending" class="text-center py-12">
      <Icon name="lucide:loader-circle" class="w-8 h-8 animate-spin text-pen-primary-default mx-auto" />
      <p class="mt-4 text-pen-muted-default">Loading policies...</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        v-for="policy in policies"
        :key="policy.id"
        class="card p-6 rounded-xl border border-edge-base-default bg-fill-base-default hover:border-edge-primary-default transition cursor-pointer group"
        @click="openEditor(policy)"
      >
        <div class="flex justify-between items-start">
          <div>
            <h3 class="font-bold text-lg text-pen-base-default group-hover:text-pen-primary-default">
              {{ policy.name }}
            </h3>
            <span class="text-xs font-mono bg-fill-tertiary-default px-2 py-0.5 rounded mt-1 inline-block text-pen-muted-default">
              {{ policy.id }}
            </span>
          </div>
          <span class="text-xs uppercase tracking-wider font-bold text-pen-muted-default">
            {{ policy.scope }}
          </span>
        </div>

        <p class="mt-3 text-sm text-pen-muted-default line-clamp-2">
          {{ policy.description || 'No description provided.' }}
        </p>

        <div class="mt-4 flex flex-wrap gap-2">
          <span v-if="policy.permissions.includes('*')" class="text-xs bg-fill-error-default text-pen-error-default px-2 py-1 rounded-full font-bold">
            Full Access
          </span>
          <span v-for="perm in policy.permissions.slice(0, 3)" :key="perm" class="text-xs bg-fill-tertiary-default px-2 py-1 rounded-full">
            {{ perm }}
          </span>
          <span v-if="policy.permissions.length > 3" class="text-xs text-pen-muted-default px-2 py-1">
            +{{ policy.permissions.length - 3 }} more
          </span>
        </div>
      </div>
    </div>

    <!-- Editor Modal (Simple Implementation) -->
    <div v-if="isEditorOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="bg-fill-base-default rounded-xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-auto flex flex-col">
        <div class="p-6 border-b border-edge-base-default flex justify-between items-center">
          <h2 class="text-xl font-bold">
            {{ editingId ? 'Edit Role' : 'Create Role' }}
          </h2>
          <button @click="isEditorOpen = false" class="text-pen-muted-default hover:text-pen-base-default">
            <Icon name="lucide:x" class="w-6 h-6" />
          </button>
        </div>

        <form @submit.prevent="savePolicy" class="p-6 space-y-4 flex-1 overflow-auto">
          <div>
            <label class="block text-sm font-bold mb-1">Role Name</label>
            <input v-model="form.name" type="text" class="form-input w-full" required placeholder="e.g. Shop Manager" />
          </div>

          <div>
            <label class="block text-sm font-bold mb-1">Description</label>
            <textarea v-model="form.description" class="form-input w-full" rows="2"></textarea>
          </div>

          <div>
            <label class="block text-sm font-bold mb-1">Scope</label>
            <select v-model="form.scope" class="form-input w-full">
              <option value="global">Global (System Wide)</option>
              <!-- You could dynamically add tenant scopes here -->
            </select>
          </div>

          <div>
            <label class="block text-sm font-bold mb-1">Permissions</label>
            <p class="text-xs text-pen-muted-default mb-2">Comma separated list (e.g. blog:create, shop:edit)</p>
            <input v-model="permissionsInput" type="text" class="form-input w-full" placeholder="blog:create, blog:edit" />
          </div>

          <!-- ABAC Conditions could go here in a more advanced UI -->

          <div class="pt-4 flex justify-between items-center border-t border-edge-base-default mt-4">
            <button
              type="button"
              v-if="editingId"
              @click="deletePolicy"
              class="text-pen-error-default hover:underline text-sm"
            >
              Delete Role
            </button>
            <div v-else></div> <!-- Spacer -->

            <div class="flex gap-3">
              <button type="button" @click="isEditorOpen = false" class="btn bg-fill-tertiary-default text-pen-base-default">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary">
                Save Role
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import type { PolicyRole } from '../../types/Policy'

definePageMeta({
  layout: 'account',
  middleware: 'authentication'
});

// --- Data Fetching ---
const { data: policies, pending, refresh } = await useFetch<PolicyRole[]>('/api/authorisation/policies');

// --- Editor State ---
const isEditorOpen = ref(false);
const editingId = ref<string | null>(null);

const form = reactive({
  name: '',
  description: '',
  scope: 'global',
  permissions: [] as string[],
  conditions: []
});

// Helper for the permission input string
const permissionsInput = ref('');

// --- Actions ---

function openEditor(policy?: PolicyRole) {
  if (policy) {
    editingId.value = policy.id;
    form.name = policy.name;
    form.description = policy.description || '';
    form.scope = policy.scope;
    permissionsInput.value = policy.permissions.join(', ');
  } else {
    editingId.value = null;
    form.name = '';
    form.description = '';
    form.scope = 'global';
    permissionsInput.value = '';
  }
  isEditorOpen.value = true;
}

async function savePolicy() {
  // Convert string input back to array
  const perms = permissionsInput.value.split(',').map(p => p.trim()).filter(p => p);

  const payload = {
    ...form,
    permissions: perms
  };

  try {
    if (editingId.value) {
      // Update
      await $fetch(`/api/authorisation/policies/${editingId.value}`, {
        method: 'PUT',
        body: payload
      });
    } else {
      // Create
      await $fetch('/api/authorisation/policies', {
        method: 'POST',
        body: payload
      });
    }
    isEditorOpen.value = false;
    refresh(); // Reload list
  } catch (e) {
    alert('Failed to save policy');
    console.error(e);
  }
}

async function deletePolicy() {
  if (!confirm('Are you sure you want to delete this role?')) return;

  try {
    await $fetch(`/api/authorisation/policies/${editingId.value}`, {
      method: 'DELETE'
    });
    isEditorOpen.value = false;
    refresh();
  } catch (e) {
    alert('Failed to delete policy');
  }
}
</script>

<style scoped>
/* TODO: Add component-specific styles for LayoutDevelopment if utility classes are insufficient. */
</style>
