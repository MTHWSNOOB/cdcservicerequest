<template>
  <div class="user-list-view animate-float-in">
    <header class="view-header">
      <div class="header-main">
        <h1 class="font-display text-primary-glow">User Management</h1>
        <p class="text-secondary font-mono fs-08">Total Users: {{ filteredUsers.length }}</p>
      </div>
      <router-link to="/users/create" class="btn-primary">
        <UserPlus class="icon" :size="18" />
        <span class="label">Add User</span>
      </router-link>
    </header>

    <div class="table-controls glass-panel mb-24">
      <div class="search-input">
        <Search class="icon" :size="16" />
        <input v-model="searchQuery" type="text" placeholder="Search by name or email..." />
      </div>
      <div class="filters">
        <select v-model="filterRole" class="cad-select">
          <option value="">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="TECHNICAL">Technical Staff</option>
          <option value="USER">User</option>
        </select>
      </div>
    </div>

    <div class="hud-table-container">
      <div class="table-scroll-container">
        <table class="hud-table">
          <thead>
            <tr>
              <th><span class="th-label">Name</span></th>
              <th><span class="th-label">Status</span></th>
              <th><span class="th-label">Role</span></th>
              <th><span class="th-label">Section</span></th>
              <th class="hide-mobile"><span class="th-label">Email</span></th>
              <th class="text-right"><span class="th-label">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in paginatedUsers" :key="user.id" class="hud-row">
              <td>
                <div class="hud-identity">
                  <div class="avatar-node">
                    <img v-if="user.avatar && user.avatar.includes('/')" :src="getFileUrl(user.avatar)" class="avatar-cell-img" />
                    <span v-else>{{ user.avatar || user.name?.substring(0, 1).toUpperCase() }}</span>
                  </div>
                  <div class="id-text">
                    <span class="name">{{ user.name }}</span>
                  </div>
                </div>
              </td>
              <td>
                <div class="status-indicator" :class="user.status.toLowerCase()">
                  <div class="led"></div>
                  <span class="status-text font-mono">{{ user.status.toUpperCase() }}</span>
                </div>
              </td>
              <td>
                <span class="role-text font-mono text-secondary">{{ user.role.toUpperCase() }}</span>
              </td>
              <td>
                <span class="sector-tag" v-if="user.section">{{ user.section.name.toUpperCase() }}</span>
                <span class="text-muted font-mono fs-06" v-else>Unassigned</span>
              </td>
              <td class="comm-uplink hide-mobile font-mono">{{ user.email }}</td>
              <td class="text-right">
                <div class="hud-actions">
                  <button @click="handleResetClick(user)" class="action-node reset" title="Reset Password">Reset</button>
                  <router-link :to="'/users/' + user.id" class="action-node view">View</router-link>
                  <router-link :to="'/users/' + user.id + '/edit'" class="action-node edit hide-mobile">Edit</router-link>
                  <button @click="handleDeleteClick(user)" class="action-node delete">Delete</button>
                </div>
              </td>
            </tr>
            <tr v-if="paginatedUsers.length === 0">
              <td colspan="6" class="empty-state">No users found</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pagination-controls mt-16 flex items-center justify-between" v-if="totalPages > 1" style="padding: 0 16px 16px;">
        <span class="text-muted font-mono fs-07">Showing page {{ currentPage }} of {{ totalPages }}</span>
        <div class="flex gap-8" style="display: flex; gap: 8px;">
          <button class="btn-cancel font-mono" style="padding: 4px 12px; font-size: 0.8rem;" :disabled="currentPage === 1" @click="currentPage--">Prev</button>
          <button class="btn-cancel font-mono" style="padding: 4px 12px; font-size: 0.8rem;" :disabled="currentPage === totalPages" @click="currentPage++">Next</button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <BaseModal :show="showDeleteModal" @close="showDeleteModal = false" size="sm">
      <template #header>
        <h3 class="font-display text-secondary-glow">Delete User</h3>
      </template>

      <div class="revoke-confirm">
        <p class="text-secondary mb-24 font-mono fs-07">Are you sure you want to permanently delete this user?</p>
        <div class="operator-preview glass-panel p-24 mb-24" v-if="selectedUser">
          <div class="p-header">OPERATOR_ID</div>
          <p class="font-display text-primary">{{ selectedUser.name.toUpperCase() }}</p>
          <span class="text-muted font-mono fs-07">UPLINK://{{ selectedUser.email }}</span>
        </div>
        <div class="warning-box">
          <span class="w-text">Warning: This action cannot be undone.</span>
        </div>
      </div>

      <template #footer>
        <button class="btn-cancel" @click="showDeleteModal = false">Cancel</button>
        <button class="btn-primary" 
          style="background: var(--accent-danger); box-shadow: 0 0 15px rgba(239, 68, 68, 0.4);" 
          @click="confirmDelete"
          :disabled="isDeleting"
        >
          {{ isDeleting ? 'Deleting...' : 'Confirm Delete' }}
        </button>
      </template>
    </BaseModal>

    <!-- Reset Password Modal -->
    <BaseModal :show="showResetModal" @close="showResetModal = false" size="sm">
      <template #header>
        <h3 class="font-display text-primary-glow">Reset Password</h3>
      </template>

      <div class="reset-form">
        <p class="text-secondary mb-24 font-mono fs-07">Configure a new temporary password for this operator.</p>
        <div class="operator-preview glass-panel p-24 mb-24" v-if="selectedUser">
          <p class="font-display text-primary">{{ selectedUser.name.toUpperCase() }}</p>
        </div>
        
        <div class="input-group">
          <label class="cad-label">New Temporary Password</label>
          <input v-model="resetPasswordVal" type="text" placeholder="Enter new password..." class="cad-input" />
          <span class="cad-hint">Note: Inform the user of their new password after synchronization.</span>
        </div>
      </div>

      <template #footer>
        <button class="btn-cancel" @click="showResetModal = false">Cancel</button>
        <button class="btn-primary" @click="confirmReset" :disabled="isResetting || !resetPasswordVal">
          {{ isResetting ? 'Synchronizing...' : 'Reset Access' }}
        </button>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useUserStore } from '../../stores/userStore'
import { useAuthStore } from '../../stores/authStore'
import { useToastStore } from '../../stores/toastStore'
import BaseModal from '../../components/BaseModal.vue'
import { UserPlus, Search, Key } from 'lucide-vue-next'

const userStore = useUserStore()
const authStore = useAuthStore()
const toastStore = useToastStore()

const searchQuery = ref('')
const filterRole = ref('')
const showDeleteModal = ref(false)
const showResetModal = ref(false)
const resetPasswordVal = ref('password123')
const selectedUser = ref(null)
const isDeleting = ref(false)
const isResetting = ref(false)

const getFileUrl = (path) => {
  if (!path) return null
  return `/api/${path}`
}

const currentPage = ref(1)
const itemsPerPage = ref(10)

onMounted(async () => {
  await userStore.fetchUsers()
})

const filteredUsers = computed(() => {
  let users = userStore.users

  if (filterRole.value !== '') {
    users = users.filter(u => u.role === filterRole.value)
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    users = users.filter(u => 
      u.name.toLowerCase().includes(q) || 
      u.email.toLowerCase().includes(q)
    )
  }

  return users
})

const totalPages = computed(() => Math.ceil(filteredUsers.value.length / itemsPerPage.value) || 1)

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredUsers.value.slice(start, end)
})

watch([searchQuery, filterRole], () => {
  currentPage.value = 1
})

const handleDeleteClick = (user) => {
  selectedUser.value = user
  showDeleteModal.value = true
}

const handleResetClick = (user) => {
  selectedUser.value = user
  resetPasswordVal.value = 'password123'
  showResetModal.value = true
}

const confirmReset = async () => {
  if (!selectedUser.value || !resetPasswordVal.value) return
  isResetting.value = true
  try {
    await userStore.resetPassword(selectedUser.value.id, resetPasswordVal.value)
    toastStore.success(`ACCESS_RESTORED: ${selectedUser.value.name.toUpperCase()}`)
    showResetModal.value = false
  } catch (error) {
    toastStore.error(error || 'Failed to reset password')
  } finally {
    isResetting.value = false
    selectedUser.value = null
  }
}

const confirmDelete = async () => {
  if (!selectedUser.value) return
  
  isDeleting.value = true
  try {
    await userStore.deleteUser(selectedUser.value.id)
    toastStore.success(`OPERATOR_PURGED: ${selectedUser.value.name.toUpperCase()}`)
    showDeleteModal.value = false
  } catch (error) {
    console.error('Failed to delete user:', error)
    toastStore.error('PROTOCOL_FAILURE: UNABLE_TO_PURGE_NODE')
  } finally {
    isDeleting.value = false
    selectedUser.value = null
  }
}
</script>

<style scoped>
.user-list-view {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.view-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-bottom: 24px;
}

.view-header h1 {
  font-size: 1.5rem;
  letter-spacing: -0.5px;
}

.table-controls {
  padding: 16px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.search-input {
  position: relative;
  flex: 1 1 300px;
  max-width: 500px;
}

.search-input .icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--accent-primary);
  opacity: 0.5;
}

.search-input input {
  padding-left: 48px;
  font-family: var(--font-mono);
}

.cad-select {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--text-primary);
  padding: 12px 20px;
  font-family: var(--font-body);
  font-size: 0.85rem;
  outline: none;
  border-radius: 999px; /* Pill */
  backdrop-filter: blur(10px);
}

.cad-select:focus { border-color: rgba(139, 92, 246, 0.5); box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15); }

.th-label {
  font-size: 0.6rem;
  font-weight: 900;
  letter-spacing: 2px;
  color: var(--text-muted);
}

.hud-identity {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-node {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(6, 182, 212, 0.2));
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%; /* Soft circular */
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 1rem;
  box-shadow: inset 0 2px 4px rgba(255,255,255,0.05);
  overflow: hidden;
}

.avatar-cell-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.id-text .name {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-primary);
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
}

.led {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-muted);
}

.active .led { background: var(--accent-success); box-shadow: 0 0 10px rgba(16, 185, 129, 0.4); }
.inactive .led { background: var(--accent-danger); box-shadow: 0 0 10px rgba(244, 63, 94, 0.4); }

.status-text { font-size: 0.75rem; font-weight: 600; letter-spacing: 0.5px; opacity: 0.8; font-family: var(--font-body) !important; }

.sector-tag {
  background: rgba(255, 255, 255, 0.03);
  padding: 4px 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-family: var(--font-mono);
  font-size: 0.65rem;
  color: var(--text-primary);
}

.comm-uplink {
  color: var(--text-secondary);
  font-size: 0.8rem;
  opacity: 0.8;
}

.hud-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.action-node {
  padding: 8px 20px;
  white-space: nowrap;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08); /* Softer */
  border-radius: 999px; /* Pill */
  font-family: var(--font-body); /* Clean sans-serif */
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  margin-left: 8px;
  transition: all 0.2s;
  backdrop-filter: blur(10px);
}

.action-node:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-primary);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: var(--shadow-sm);
}

.action-node.delete:hover {
  background: rgba(244, 63, 94, 0.1);
  color: var(--accent-danger);
  border-color: rgba(244, 63, 94, 0.3);
}

.action-node.reset:hover {
  background: rgba(245, 158, 11, 0.1);
  color: var(--accent-warning);
  border-color: rgba(245, 158, 11, 0.3);
}

.cad-label { display: block; font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 12px; }
.cad-input { width: 100%; padding: 12px 16px; background: rgba(0, 0, 0, 0.2); border: 1px solid rgba(255, 255, 255, 0.08); font-family: var(--font-body); font-size: 0.9rem; color: var(--text-primary); outline: none; border-radius: var(--radius-md); backdrop-filter: blur(10px); }
.cad-input:focus { border-color: rgba(139, 92, 246, 0.5); box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15); }
.cad-hint { display: block; font-size: 0.6rem; color: var(--text-muted); margin-top: 8px; font-style: italic; }

.revoke-confirm .p-header {
  font-size: 0.55rem;
  color: var(--text-muted);
  letter-spacing: 2px;
  margin-bottom: 8px;
}

.warning-box {
  padding: 12px;
  background: rgba(239, 68, 68, 0.1);
  border-left: 3px solid var(--accent-danger);
}

.warning-box .w-text {
  font-size: 0.65rem;
  font-weight: 800;
  color: var(--accent-danger);
  letter-spacing: 1px;
}

.empty-state {
  text-align: center;
  padding: 80px 24px !important;
  color: var(--text-muted);
  font-family: var(--font-mono);
  letter-spacing: 2px;
  font-size: 0.75rem;
}
@media (max-width: 768px) {
  .user-list-view { gap: 20px; }
  
  .table-controls {
    flex-direction: column;
    align-items: stretch;
    padding: 12px;
  }

  .search-input {
    flex: none;
    max-width: none;
    width: 100%;
  }

  .filters {
    display: flex;
    gap: 8px;
    width: 100%;
  }

  .cad-select {
    flex: 1;
    padding: 10px 14px;
    font-size: 0.75rem;
  }

  .hud-identity { gap: 8px; }
  .avatar-node { width: 32px; height: 32px; font-size: 0.8rem; }
  .id-text .name { font-size: 0.8rem; }

  .action-node {
    padding: 6px 12px;
    font-size: 0.65rem;
    margin-left: 4px;
  }

  .hud-actions {
    flex-wrap: wrap;
    justify-content: flex-end;
  }
}

@media (max-width: 480px) {
  .view-header {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }

  .header-main { margin-bottom: 8px; }

  .btn-primary {
    width: 100%;
    justify-content: center;
  }

  .action-node {
    width: calc(50% - 4px);
    margin-left: 0;
    margin-bottom: 4px;
    text-align: center;
  }

  .hud-actions {
    gap: 4px;
    justify-content: space-between;
  }
}
</style>
