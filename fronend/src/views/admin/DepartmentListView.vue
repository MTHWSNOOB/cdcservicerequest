<template>
  <div class="admin-view animate-float-in">
    <header class="view-header">
      <div class="header-main">
        <h1 class="font-display text-primary-glow" style="word-break: break-all;">Departments</h1>
        <p class="text-secondary" style="word-break: break-all;">Manage organizational departments.</p>
      </div>
      <button @click="showModal = true" class="btn-primary">
        <PlusCircle class="icon" :size="18" />
        <span class="label">Add Department</span>
      </button>
    </header>

    <div class="table-controls mb-24">
      <div class="search-input">
        <Search class="icon" :size="16" />
        <input v-model="searchQuery" type="text" placeholder="Search departments..." />
      </div>
    </div>

      <div class="hud-table-container">
        <div class="table-scroll-container">
          <table class="hud-table">
            <thead>
              <tr>
                <th>Department Name</th>
                <th>Status</th>
                <th>Code</th>
                <th class="hide-mobile">ID</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="dept in paginatedDepartments" :key="dept.id" class="hud-row">
                <td>
                  <div class="hud-identity">
                    <div class="hud-avatar"><Building2 :size="18" /></div>
                    <span class="name">{{ dept.name }}</span>
                  </div>
                </td>
                <td>
                  <span class="status-box active">Active</span>
                </td>
                <td>
                  <span class="role-divider">|</span>
                  <span class="role-text text-secondary-glow">{{ dept.code.toUpperCase() }}</span>
                </td>
                <td class="text-muted-blue hide-mobile">
                  <span class="hud-id-badge">#{{ String(dept.id).substring(0, 8) }}</span>
                </td>
                <td class="text-right">
                  <div class="hud-actions">
                    <button @click="openEditModal(dept)" class="hud-action-btn edit">Edit</button>
                    <button @click="handleDeleteClick(dept)" class="hud-action-btn delete">Delete</button>
                  </div>
                </td>
              </tr>
              <tr v-if="paginatedDepartments.length === 0">
                <td colspan="5" class="text-center text-muted py-24">No departments found in this view.</td>
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

      <!-- Create/Edit Modal -->
      <div v-if="showModal" class="local-modal-overlay">
        <div class="local-modal-content">
          <h2 class="font-display text-primary-glow mb-24">{{ isEditing ? 'Edit Department' : 'New Department' }}</h2>
          <div class="form-group mb-16">
            <label>Name</label>
            <input v-model="form.name" type="text" placeholder="e.g. Engineering" />
          </div>
          <div class="form-group mb-24">
            <label>Code</label>
            <input v-model="form.code" type="text" placeholder="e.g. ENG" />
          </div>
          <div class="form-actions">
             <button @click="closeModal" class="btn-cancel">Cancel</button>
             <button @click="saveDept" class="btn-primary">Save Changes</button>
           </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <BaseModal :show="showDeleteModal" @close="showDeleteModal = false" size="sm">
        <template #header>
          <h3 class="font-display text-secondary-glow">Delete Department</h3>
        </template>

        <div class="delete-warning">
          <p class="mb-16" style="color: var(--text-primary);">Are you sure you want to permanently disband this department?</p>
          <div class="item-preview" v-if="selectedDept">
            <p class="item-name">{{ selectedDept.name }}</p>
            <span class="item-meta">Code: {{ selectedDept.code }}</span>
          </div>
          <p class="warn-text">Warning: This action cannot be undone.</p>
        </div>

        <template #footer>
          <button class="btn-cancel" @click="showDeleteModal = false">Cancel</button>
          <button class="btn-primary" 
            style="background: var(--accent-danger); box-shadow: 0 0 10px rgba(244,63,94,0.3);" 
            @click="confirmDelete"
            :disabled="isDeleting"
          >
            {{ isDeleting ? 'Deleting...' : 'Confirm Delete' }}
          </button>
        </template>
      </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useAdminStore } from '../../stores/adminStore'
import { useToastStore } from '../../stores/toastStore'
import BaseModal from '../../components/BaseModal.vue'
import { PlusCircle, Search, Building2 } from 'lucide-vue-next'

const adminStore = useAdminStore()

onMounted(() => {
  adminStore.fetchDepartments()
})
const toastStore = useToastStore()
const showModal = ref(false)
const isEditing = ref(false)
const currentId = ref(null)
const searchQuery = ref('')
const form = ref({ name: '', code: '' })

const currentPage = ref(1)
const itemsPerPage = ref(10)

const showDeleteModal = ref(false)
const selectedDept = ref(null)
const isDeleting = ref(false)

const filteredDepartments = computed(() => {
  return adminStore.departments.filter(dept => 
    dept.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    dept.code.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const totalPages = computed(() => Math.ceil(filteredDepartments.value.length / itemsPerPage.value) || 1)

const paginatedDepartments = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredDepartments.value.slice(start, end)
})

watch(searchQuery, () => {
  currentPage.value = 1
})

const openEditModal = (dept) => {
  isEditing.value = true
  currentId.value = dept.id
  form.value = { name: dept.name, code: dept.code }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  isEditing.value = false
  currentId.value = null
  form.value = { name: '', code: '' }
}

const saveDept = async () => {
  if (form.value.name && form.value.code) {
    try {
      if (isEditing.value) {
        await adminStore.updateDepartment(currentId.value, form.value.name, form.value.code)
        toastStore.success(`DEPARTMENT UPDATED: ${form.value.name.toUpperCase()}`)
      } else {
        await adminStore.addDepartment(form.value.name, form.value.code)
        toastStore.success(`NEW DEPARTMENT ESTABLISHED: ${form.value.name.toUpperCase()}`)
      }
      closeModal()
    } catch (error) {
      console.error('Failed to save department:', error)
      toastStore.error('SYSTEM ERROR: UNABLE TO SAVE DEPARTMENT')
    }
  }
}

const handleDeleteClick = (dept) => {
  selectedDept.value = dept
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (!selectedDept.value) return

  isDeleting.value = true
  try {
    await adminStore.deleteDepartment(selectedDept.value.id)
    toastStore.success(`DEPARTMENT DISBANDED: ${selectedDept.value.name.toUpperCase()}`)
    showDeleteModal.value = false
  } catch (error) {
    console.error('Failed to terminate department:', error)
    toastStore.error(error)
  } finally {
    isDeleting.value = false
    selectedDept.value = null
  }
}
</script>

<style scoped>
/* All shared styles are in src/assets/css/main.css */
</style>
