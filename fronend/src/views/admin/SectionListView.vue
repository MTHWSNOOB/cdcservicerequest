<template>
  <div class="admin-view animate-float-in">
    <header class="view-header">
      <div class="header-main">
        <h1 class="font-display text-primary-glow" style="word-break: break-all;">Sections</h1>
        <p class="text-secondary" style="word-break: break-all;">Manage department sections and units.</p>
      </div>
      <button @click="openAddModal" class="btn-primary">
        <PlusCircle class="icon" :size="18" />
        <span class="label">Add Section</span>
      </button>
    </header>

    <div class="table-controls mb-24">
      <div class="search-input">
        <Search class="icon" :size="16" />
        <input v-model="searchQuery" type="text" placeholder="Search sections..." />
      </div>
    </div>

      <div class="hud-table-container">
        <div class="table-scroll-container">
          <table class="hud-table">
            <thead>
              <tr>
                <th>Section Name</th>
                <th>Status</th>
                <th>Department</th>
                <th class="hide-mobile">ID</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="sec in paginatedSections" :key="sec.id" class="hud-row">
                <td>
                  <div class="hud-identity">
                    <div class="hud-avatar"><Network :size="18" /></div>
                    <span class="name">{{ sec.name }}</span>
                  </div>
                </td>
                <td>
                  <span class="status-box active">Active</span>
                </td>
                <td>
                  <span class="role-divider">|</span>
                  <span class="role-text text-secondary-glow">{{ getDeptName(sec.departmentId) }}</span>
                </td>
                <td class="text-muted-blue hide-mobile">
                  <span class="hud-id-badge">#{{ String(sec.id).substring(0, 8) }}</span>
                </td>
                <td class="text-right">
                  <div class="hud-actions">
                    <button @click="openEditModal(sec)" class="hud-action-btn edit">Edit</button>
                    <button @click="handleDeleteClick(sec)" class="hud-action-btn delete">Delete</button>
                  </div>
                </td>
              </tr>
              <tr v-if="paginatedSections.length === 0">
                <td colspan="5" class="text-center text-muted py-24">No sections found in this view.</td>
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
          <h2 class="font-display text-primary-glow mb-24">{{ isEditing ? 'Edit Section' : 'New Section' }}</h2>
          <div class="form-group mb-16">
            <label>Name</label>
            <input v-model="form.name" type="text" placeholder="e.g. Frontend" />
          </div>
          <div class="form-group mb-24">
            <label>Department</label>
            <select v-model="form.departmentId">
              <option v-for="d in adminStore.departments" :key="d.id" :value="d.id">
                {{ d.name }}
              </option>
            </select>
          </div>
          <div class="form-actions">
             <button @click="closeModal" class="btn-cancel" :disabled="isSaving">Cancel</button>
             <button @click="saveSection" class="btn-primary" :disabled="isSaving">{{ isSaving ? 'Saving...' : 'Save' }}</button>
           </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <BaseModal :show="showDeleteModal" @close="showDeleteModal = false" size="sm">
        <template #header>
          <h3 class="font-display text-secondary-glow">Delete Section</h3>
        </template>

        <div class="delete-warning">
          <p class="mb-16" style="color: var(--text-primary);">Are you sure you want to permanently disband this section?</p>
          <div class="item-preview" v-if="selectedSec">
            <p class="item-name">{{ selectedSec.name }}</p>
            <span class="item-meta">Dept: {{ getDeptName(selectedSec.departmentId) }}</span>
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
import { PlusCircle, Search, Network } from 'lucide-vue-next'

const adminStore = useAdminStore()

onMounted(() => {
  adminStore.fetchSections()
  adminStore.fetchDepartments()
})
const toastStore = useToastStore()
const showModal = ref(false)
const isEditing = ref(false)
const currentId = ref(null)
const searchQuery = ref('')
const form = ref({ name: '', departmentId: '' })
const isSaving = ref(false)

const currentPage = ref(1)
const itemsPerPage = ref(10)

const showDeleteModal = ref(false)
const selectedSec = ref(null)
const isDeleting = ref(false)

const getDeptName = (id) => {
  return adminStore.departments.find(d => d.id === id)?.name || 'UNKNOWN'
}

const filteredSections = computed(() => {
  return adminStore.sections.filter(sec => 
    sec.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    getDeptName(sec.departmentId).toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const totalPages = computed(() => Math.ceil(filteredSections.value.length / itemsPerPage.value) || 1)

const paginatedSections = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredSections.value.slice(start, end)
})

watch(searchQuery, () => {
  currentPage.value = 1
})

const openAddModal = () => {
  isEditing.value = false
  form.value = { name: '', departmentId: adminStore.departments[0]?.id || '' }
  showModal.value = true
}

const openEditModal = (sec) => {
  isEditing.value = true
  currentId.value = sec.id
  form.value = { name: sec.name, departmentId: sec.departmentId }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  isEditing.value = false
  currentId.value = null
  form.value = { name: '', departmentId: '' }
}

const saveSection = async () => {
  if (form.value.name && form.value.departmentId) {
    isSaving.value = true
    try {
      if (isEditing.value) {
        await adminStore.updateSection(currentId.value, form.value.name, form.value.departmentId)
        toastStore.success(`SECTION UPDATED: ${form.value.name.toUpperCase()}`)
      } else {
        await adminStore.addSection(form.value.name, form.value.departmentId)
        toastStore.success(`NEW SECTION ESTABLISHED: ${form.value.name.toUpperCase()}`)
      }
      closeModal()
    } catch (error) {
      console.error('Failed to save section:', error)
      toastStore.error(error || 'SYSTEM ERROR: UNABLE TO SAVE SECTION')
    } finally {
      isSaving.value = false
    }
  }
}

const handleDeleteClick = (sec) => {
  selectedSec.value = sec
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (!selectedSec.value) return

  isDeleting.value = true
  try {
    await adminStore.deleteSection(selectedSec.value.id)
    toastStore.success(`SECTION DISBANDED: ${selectedSec.value.name.toUpperCase()}`)
    showDeleteModal.value = false
  } catch (error) {
    console.error('Failed to terminate section:', error)
    toastStore.error(error)
  } finally {
    isDeleting.value = false
    selectedSec.value = null
  }
}
</script>

<style scoped>
/* All shared styles are in src/assets/css/main.css */

</style>
