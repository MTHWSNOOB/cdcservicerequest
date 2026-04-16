<template>
  <div class="admin-view animate-float-in">
    <header class="view-header">
      <div class="header-main">
        <h1 class="font-display text-primary-glow" style="word-break: break-all;">Request Types</h1>
        <p class="text-secondary" style="word-break: break-all;">Define categories for service requests.</p>
      </div>
      <button @click="openAddModal" class="btn-primary">
        <PlusCircle class="icon" :size="18" />
        <span class="label">Add Category</span>
      </button>
    </header>

    <div class="table-controls mb-24">
      <div class="search-input">
        <Search class="icon" :size="16" />
        <input v-model="searchQuery" type="text" placeholder="Search categories..." />
      </div>
    </div>

      <div class="hud-table-container">
        <div class="table-scroll-container">
          <table class="hud-table">
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Status</th>
                <th>ID</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="type in paginatedRequestTypes" :key="type.id" class="hud-row">
                <td>
                  <div class="hud-identity">
                    <div class="hud-avatar"><Tags :size="18" /></div>
                    <span class="name">{{ type.name }}</span>
                  </div>
                </td>
                <td>
                  <span class="status-box active">Active</span>
                </td>
                <td class="text-muted-blue">
                  <span class="hud-id-badge">#{{ String(type.id).substring(0, 8) }}</span>
                </td>
                <td class="text-right">
                  <div class="hud-actions">
                    <button @click="openEditModal(type)" class="hud-action-btn edit">Edit</button>
                    <button @click="handleDeleteClick(type)" class="hud-action-btn delete">Delete</button>
                  </div>
                </td>
              </tr>
              <tr v-if="paginatedRequestTypes.length === 0">
                <td colspan="4" class="text-center text-muted py-24">No categories found in this sector.</td>
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
          <h2 class="font-display text-primary-glow mb-24">{{ isEditing ? 'Edit Category' : 'New Category' }}</h2>
          <div class="form-group mb-24">
            <label>Category Name</label>
            <input v-model="form.name" type="text" placeholder="e.g. Bug / Defect" />
          </div>
          <div class="form-actions">
             <button @click="closeModal" class="btn-cancel">Cancel</button>
             <button @click="saveType" class="btn-primary">Save Changes</button>
           </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <BaseModal :show="showDeleteModal" @close="showDeleteModal = false" size="sm">
        <template #header>
          <h3 class="font-display text-secondary-glow">Delete Category</h3>
        </template>

        <div class="delete-warning">
          <p class="mb-16" style="color: var(--text-primary);">Are you sure you want to permanently delete this request category?</p>
          <div class="item-preview" v-if="selectedType">
            <p class="item-name">{{ selectedType.name }}</p>
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
import { PlusCircle, Search, Tags } from 'lucide-vue-next'

const adminStore = useAdminStore()

onMounted(() => {
  adminStore.fetchRequestTypes()
})
const toastStore = useToastStore()
const showModal = ref(false)
const isEditing = ref(false)
const currentId = ref(null)
const searchQuery = ref('')
const form = ref({ name: '' })

const currentPage = ref(1)
const itemsPerPage = ref(10)

const showDeleteModal = ref(false)
const selectedType = ref(null)
const isDeleting = ref(false)

const filteredRequestTypes = computed(() => {
  return adminStore.requestTypes.filter(type => 
    type.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const totalPages = computed(() => Math.ceil(filteredRequestTypes.value.length / itemsPerPage.value) || 1)

const paginatedRequestTypes = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredRequestTypes.value.slice(start, end)
})

watch(searchQuery, () => {
  currentPage.value = 1
})

const openAddModal = () => {
  isEditing.value = false
  form.value = { name: '' }
  showModal.value = true
}

const openEditModal = (type) => {
  isEditing.value = true
  currentId.value = type.id
  form.value = { name: type.name }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  isEditing.value = false
  currentId.value = null
  form.value = { name: '' }
}

const saveType = async () => {
  if (form.value.name) {
    try {
      if (isEditing.value) {
        await adminStore.updateRequestType(currentId.value, form.value.name)
        toastStore.success(`REQUEST TYPE UPDATED: ${form.value.name.toUpperCase()}`)
      } else {
        await adminStore.addRequestType(form.value.name)
        toastStore.success(`NEW REQUEST TYPE ESTABLISHED: ${form.value.name.toUpperCase()}`)
      }
      closeModal()
    } catch (error) {
       console.error('Failed to save request type:', error)
       toastStore.error('SYSTEM ERROR: UNABLE TO SAVE REQUEST TYPE')
    }
  }
}

const handleDeleteClick = (type) => {
  selectedType.value = type
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (!selectedType.value) return

  isDeleting.value = true
  try {
    await adminStore.deleteRequestType(selectedType.value.id)
    toastStore.success(`REQUEST TYPE DISBANDED: ${selectedType.value.name.toUpperCase()}`)
    showDeleteModal.value = false
  } catch (error) {
    console.error('Failed to terminate request type:', error)
    toastStore.error(error)
  } finally {
    isDeleting.value = false
    selectedType.value = null
  }
}
</script>

<style scoped>
/* All shared styles are in src/assets/css/main.css */
</style>
