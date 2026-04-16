<template>
  <div class="request-list-view animate-float-in">
    <header class="view-header">
      <div class="header-main">
        <h1 class="font-display text-primary-glow">Service Requests</h1>
        <p class="text-secondary fs-08">All service requests</p>
      </div>
      <router-link v-if="!authStore.isAdmin" to="/requests/new" class="btn-primary">
        <PlusCircle class="icon" :size="18" />
        <span class="label">New Request</span>
      </router-link>
    </header>

    <div class="stats-mini-grid mb-24">
      <div class="mini-stat glass-panel">
        <div class="stat-m-header">Total Requests</div>
        <div class="stat-m-body text-secondary">{{ requestStore.totalRequests }}</div>
        <div class="stat-progress"><div class="stat-fill" style="width: 100%; background: var(--accent-primary)"></div></div>
      </div>
      <div class="mini-stat glass-panel">
        <div class="stat-m-header">Active</div>
        <div class="stat-m-body text-primary-glow">{{ requestStore.pendingRequests }}</div>
        <div class="stat-progress"><div class="stat-fill" style="width: 40%; background: var(--accent-primary)"></div></div>
      </div>
      <div class="mini-stat glass-panel">
        <div class="stat-m-header">Uptime</div>
        <div class="stat-m-body text-secondary-glow">99.9%</div>
        <div class="stat-progress"><div class="stat-fill" style="width: 99.9%; background: var(--accent-secondary)"></div></div>
      </div>
    </div>

    <div class="view-controls mb-24" style="display:flex; gap: 8px; align-items: center; flex-wrap: wrap;">
      <button v-if="authStore.isAdmin" class="node-btn" :class="{ 'active-view': viewMode === 'table' }" @click="viewMode = 'table'">Table View</button>
      <button v-if="authStore.isAdmin" class="node-btn" :class="{ 'active-view': viewMode === 'board' }" @click="viewMode = 'board'">Board View</button>

      <div style="flex: 1;"></div>

      <!-- Search -->
      <div class="search-box">
        <Search class="search-icon" :size="16" />
        <input 
          type="text" 
          class="search-input" 
          placeholder="Search requests..." 
          v-model="localSearch"
          @input="onSearchInput"
        />
      </div>

      <!-- Status Filter -->
      <select class="status-filter" v-model="localStatusFilter" @change="onFilterChange">
        <option value="ALL">All Statuses</option>
        <option value="NEW">New</option>
        <option value="RECEIVED">Received</option>
        <option value="APPROVED">Approved</option>
        <option value="DISAPPROVED">Disapproved</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="COMPLETED">Completed</option>
        <option value="CANCELLED">Cancelled</option>
      </select>
    </div>

    <div v-if="viewMode === 'table'" class="hud-table-container">
      <div class="table-scroll-container">
        <table class="hud-table">
          <thead>
            <tr>
              <th><span class="th-label">ID</span></th>
              <th><span class="th-label">Subject</span></th>
              <th><span class="th-label">Date Requested</span></th>
              <th><span class="th-label">SLA / Deadline</span></th>
              <th><span class="th-label">Type</span></th>
              <th><span class="th-label">Section</span></th>
              <th><span class="th-label">Urgency</span></th>
              <th><span class="th-label">Status</span></th>
              <th class="text-right"><span class="th-label">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="req in requestStore.requests" :key="req.id" class="hud-row">
              <td style="width: 130px;">
                <span class="node-badge">#{{ String(req.id).substring(0, 8) }}</span>
              </td>
              <td class="title-cell">
                <span class="text-primary font-display fs-09 fw-600">{{ req.title }}</span>
                <span class="requester fs-08 text-secondary">By: {{ req.requester }}</span>
              </td>
              <td>
                <div class="date-cell">
                  <div class="text-primary fs-08 fw-600">{{ formatDate(req.createdAt).date }}</div>
                  <div class="text-secondary fs-07">{{ formatDate(req.createdAt).time }}</div>
                </div>
              </td>
              <td>
                <div v-if="req.deadline && req.status !== 'COMPLETED' && req.status !== 'CANCELLED'" class="deadline-indicator">
                  <span class="sla-badge" :class="getSlaStatus(req.deadline)">
                    <Clock :size="12" class="me-1 inline-icon" />
                    {{ getSlaText(req.deadline) }}
                  </span>
                </div>
                <div v-else-if="req.deadline" class="fs-07 text-secondary">
                  Target: {{ formatDate(req.deadline).date }}
                </div>
                <div v-else class="fs-07 text-muted">No SLA set</div>
              </td>
              <td>
                <span class="type-node">{{ req.type.split(' ')[0] }}</span>
              </td>
              <td>
                <span class="sector-id">{{ req.area }}</span>
              </td>
              <td>
                <span class="urgency-tag" :class="req.urgency.toLowerCase()">
                  {{ req.urgency }}
                </span>
              </td>
              <td>
                <div class="state-indicator" :class="req.status.toLowerCase()">
                  <div class="led-dot"></div>
                  <span class="state-label">{{ req.status.toLowerCase().replace('_', ' ') }}</span>
                </div>
                <!-- Rating indicator -->
                <div v-if="req.status === 'COMPLETED' && req.rating" class="rating-mini-display mt-4">
                  <Star v-for="n in 5" :key="n" :size="10" class="star" :class="{ 'filled': n <= req.rating }" :fill="n <= req.rating ? 'currentColor' : 'none'" />
                </div>
              </td>
              <td class="text-right">
                <div class="action-dock">
                  <template v-if="authStore.isAdmin">
                    <button class="node-btn manage" @click="handleEdit(req)">Manage</button>
                    <button v-if="req.deletionRequested" class="node-btn delete" @click="handleDelete(req)">Purge</button>
                  </template>
                  <template v-else>
                    <button v-if="req.status === 'COMPLETED' && !req.rating" class="node-btn rate-btn" @click="handleEdit(req)">
                      Rate Service
                    </button>
                    <button v-else class="node-btn view" @click="handleEdit(req)">
                      {{ req.status === 'NEW' ? 'Edit' : 'View' }}
                    </button>
                    <button v-if="req.status !== 'IN_PROGRESS' && req.status !== 'COMPLETED' && !req.deletionRequested" 
                            class="node-btn delete request-del" 
                            @click="handleRequestDelete(req)">Request Delete</button>
                    <span v-else-if="req.deletionRequested" class="text-secondary fs-08 delete-status">Del Req</span>
                  </template>
                </div>
              </td>
            </tr>
            <tr v-if="requestStore.requests.length === 0">
              <td colspan="8" class="empty-state">No requests found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- KANBAN BOARD PREVIEW -->
    <div v-if="viewMode === 'board'" class="kanban-board">
      <div v-for="col in kanbanColumns" :key="col.id" class="k-col glass-panel">
        <div class="k-col-header">
          <span class="font-display text-primary-glow fw-600 fs-11">{{ col.title }}</span>
          <span class="k-count">{{ kanbanLists[col.statusGroup].length }}</span>
        </div>
        <div class="k-col-body">
          <VueDraggable
            v-model="kanbanLists[col.statusGroup]"
            :data-group="col.statusGroup"
            :group="{ name: 'kanban' }"
            item-key="id"
            class="k-drag-area"
            @end="onDragEnd($event, col.statusGroup)"
            :animation="200"
          >
            <template #item="{ element: req }">
              <div class="k-card" @click="handleEdit(req)">
                <div class="k-card-header">
                   <span class="node-badge">#{{ String(req.id).substring(0, 6) }}</span>
                   <span class="urgency-tag" :class="req.urgency.toLowerCase()">{{ req.urgency.substring(0,1).toUpperCase() }}</span>
                </div>
                <p class="k-title font-display text-primary mt-8 mb-4 fw-600">{{ req.title }}</p>
                <p class="fs-08 text-secondary mb-8">By: {{ req.requester }}</p>
                
                <div v-if="req.deadline && req.status !== 'COMPLETED' && req.status !== 'CANCELLED'" class="mb-8">
                  <span class="sla-badge w-100 justify-center" :class="getSlaStatus(req.deadline)">
                    <Clock :size="12" class="me-1 inline-icon" />
                    {{ getSlaText(req.deadline) }}
                  </span>
                </div>

                <div class="flex-row-between mt-8 border-top-subtle pt-8">
                  <span class="state-label p-4" :class="req.status.toLowerCase()">{{ req.status.replace('_', ' ') }}</span>
                  <span class="fs-08 text-secondary">{{ req.type.split(' ')[0] }}</span>
                </div>
              </div>
            </template>
          </VueDraggable>
          <div v-if="kanbanLists[col.statusGroup].length === 0" class="empty-k-card fs-08 text-center text-secondary mt-8">
            No active entries
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination Controls -->
    <div class="pagination-controls">
      <div class="pagination-info fs-08 text-secondary">
        Showing {{ requestStore.requests.length }} of {{ requestStore.totalCount }} results (Page {{ requestStore.currentPage }} / {{ requestStore.totalPages }})
      </div>
      <div class="pagination-buttons">
        <button class="node-btn" :disabled="requestStore.currentPage <= 1" @click="goToPage(1)">First</button>
        <button class="node-btn" :disabled="requestStore.currentPage <= 1" @click="goToPage(requestStore.currentPage - 1)">Prev</button>
        <span class="page-indicator">{{ requestStore.currentPage }}</span>
        <button class="node-btn" :disabled="requestStore.currentPage >= requestStore.totalPages" @click="goToPage(requestStore.currentPage + 1)">Next</button>
        <button class="node-btn" :disabled="requestStore.currentPage >= requestStore.totalPages" @click="goToPage(requestStore.totalPages)">Last</button>
      </div>
    </div>

    <!-- Edit Request Modal -->
    <EditRequestModal 
      :show="showEditModal" 
      :request="selectedRequest" 
      @close="showEditModal = false"
      @updated="requestStore.fetchRequests()"
    />

    <!-- Delete Confirmation Modal -->
    <BaseModal :show="showDeleteModal" @close="showDeleteModal = false" size="sm">
      <template #header>
        <h3 class="font-display text-secondary-glow">Delete Request</h3>
      </template>
      
      <div class="purge-warning">
        <p class="text-secondary mb-24 fs-09">Are you sure you want to permanently delete this request?</p>
        <div class="request-context glass-panel p-24 mb-24" v-if="selectedRequest">
          <div class="node-label">Record</div>
          <span class="text-primary fs-08">#{{ selectedRequest.id }}</span>
          <p class="font-display text-primary mt-12">{{ selectedRequest.title }}</p>
        </div>
        <div class="critical-alert">
          <span class="alert-text">Warning: This action cannot be undone.</span>
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

    <!-- Request Deletion Modal (User) -->
    <BaseModal :show="showReqDelModal" @close="showReqDelModal = false" size="sm">
      <template #header>
        <h3 class="font-display text-secondary-glow">Request Deletion</h3>
      </template>
      
      <div class="purge-warning">
        <p class="text-secondary mb-24 fs-09">Are you sure you want to request the deletion of this item?</p>
        <div class="request-context glass-panel p-24 mb-24" v-if="selectedRequest">
          <p class="font-display text-primary">{{ selectedRequest.title }}</p>
        </div>
      </div>

      <template #footer>
        <button class="btn-cancel" @click="showReqDelModal = false">Cancel</button>
        <button class="btn-primary" 
          style="background: var(--accent-danger); box-shadow: 0 0 15px rgba(239, 68, 68, 0.4);" 
          @click="confirmRequestDelete"
          :disabled="isDeleting"
        >
          {{ isDeleting ? 'Requesting...' : 'Confirm Request' }}
        </button>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRequestStore } from '../../stores/requestStore'
import { useAuthStore } from '../../stores/authStore'
import { useToastStore } from '../../stores/toastStore'
import BaseModal from '../../components/BaseModal.vue'
import EditRequestModal from './EditRequestModal.vue'
import VueDraggable from 'vuedraggable'
import { PlusCircle, Search, Clock, Star } from 'lucide-vue-next'

const requestStore = useRequestStore()
const authStore = useAuthStore()
const toastStore = useToastStore()
const route = useRoute()
const router = useRouter()

const showEditModal = ref(false)
const showDeleteModal = ref(false)
const showReqDelModal = ref(false)
const selectedRequest = ref(null)
const isDeleting = ref(false)

const formatDate = (dateString) => {
  if (!dateString) return { date: 'N/A', time: '' }
  const date = new Date(dateString)
  return {
    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  }
}

// Custom Ref to force SLA updates every minute
const now = ref(new Date())

let timer;
onMounted(() => {
  timer = setInterval(() => {
    now.value = new Date()
  }, 60000)
  checkScanQuery()
})

const getSlaStatus = (deadlineDate) => {
  if (!deadlineDate) return 'none'
  const deadline = new Date(deadlineDate).getTime()
  const current = now.value.getTime()
  const diffHours = (deadline - current) / (1000 * 60 * 60)

  if (diffHours < 0) return 'breached'  // Past deadline
  if (diffHours <= 4) return 'critical' // Less than 4 hours
  if (diffHours <= 24) return 'warning' // Less than 24 hours
  return 'safe'                         // More than 24 hours
}

const getSlaText = (deadlineDate) => {
  if (!deadlineDate) return ''
  const deadline = new Date(deadlineDate).getTime()
  const current = now.value.getTime()
  const diffMs = deadline - current

  if (diffMs < 0) return 'Breached'

  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return `${days}d ${hours}h left`
  if (hours > 0) return `${hours}h ${minutes}m left`
  return `${minutes}m left`
}

const viewMode = ref('table')
const localSearch = ref('')
const localStatusFilter = ref('ALL')
let searchTimeout = null

const onSearchInput = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    requestStore.searchQuery = localSearch.value
    requestStore.fetchRequests({ page: 1, search: localSearch.value })
  }, 400)
}

const onFilterChange = () => {
  requestStore.statusFilter = localStatusFilter.value
  requestStore.fetchRequests({ page: 1, status: localStatusFilter.value })
}

const goToPage = (page) => {
  if (page < 1 || page > requestStore.totalPages) return
  requestStore.fetchRequests({ page })
}

const kanbanColumns = [
  { id: 'todo', title: 'Queue', statusGroup: 'TODO' },
  { id: 'doing', title: 'Active', statusGroup: 'DOING' },
  { id: 'done', title: 'Completed', statusGroup: 'DONE' }
]

const kanbanLists = ref({
  TODO: [],
  DOING: [],
  DONE: []
})

watch(() => requestStore.requests, (newRequests) => {
  const groups = {
    TODO: [],
    DOING: [],
    DONE: []
  }
  newRequests.forEach(r => {
    if (r.status === 'NEW' || r.status === 'RECEIVED' || r.status === 'DISAPPROVED') groups.TODO.push(r)
    else if (r.status === 'IN_PROGRESS' || r.status === 'APPROVED') groups.DOING.push(r)
    else if (r.status === 'COMPLETED' || r.status === 'CANCELLED') groups.DONE.push(r)
  })
  kanbanLists.value = groups
}, { immediate: true, deep: true })

const onDragEnd = async (event) => {
  const itemEl = event.item;
  // Find which column received the drop
  let newStatusGroup = event.to.getAttribute('data-group');
  if (!newStatusGroup) {
    const toData = event.to.__vueParentComponent?.props?.modelValue; 
    const groups = kanbanLists.value;
    if(toData === groups.TODO) newStatusGroup = 'TODO'
    else if(toData === groups.DOING) newStatusGroup = 'DOING'
    else if(toData === groups.DONE) newStatusGroup = 'DONE'
  }
  
  if(!newStatusGroup) return;
  
  // If dropped in the same column, we just ignore for now (ordering not persisted yet)
  if(event.from === event.to) return;

  const toDataArray = kanbanLists.value[newStatusGroup];
  const request = toDataArray[event.newIndex];
  if (!request) return;

  // Map the column drop to an actual system status
  let mappedStatus = request.status;
  if (newStatusGroup === 'TODO') mappedStatus = 'NEW';
  else if (newStatusGroup === 'DOING') mappedStatus = 'IN_PROGRESS';
  else if (newStatusGroup === 'DONE') mappedStatus = 'COMPLETED';

  // Prevent redundant updates
  if (mappedStatus === request.status) return;

  // Check Permissions: Only admins can change status, if user is not admin, deny and revert
  if (!authStore.isAdmin) {
    toastStore.error('Only Administrators can drag and change request status');
    await requestStore.fetchRequests(); // Revert back
    return;
  }
  
  try {
    toastStore.success(`Updating ticket status...`);
    await requestStore.updateStatus(request.id, mappedStatus);
    toastStore.success(`Status updated to ${mappedStatus.replace('_', ' ')}`);
    await requestStore.fetchRequests(); // Re-sync store to fix array references from computed
  } catch (err) {
    toastStore.error('Failed to update status by dragging');
    await requestStore.fetchRequests(); // Revert back
  }
}

const handleEdit = (req) => {
  selectedRequest.value = req
  showEditModal.value = true
}

const handleDelete = (req) => {
  selectedRequest.value = req
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (!selectedRequest.value) return
  
  isDeleting.value = true
  try {
    await requestStore.deleteRequest(selectedRequest.value.id)
    toastStore.success(`PROTOCOL_PURGED: #${String(selectedRequest.value.id).substring(0,8).toUpperCase()}`)
    showDeleteModal.value = false
  } catch (e) {
    toastStore.error('SYSTEM_ERROR: FAILED_TO_PURGE_PROTOCOL')
  } finally {
    isDeleting.value = false
    selectedRequest.value = null
  }
}

const handleRequestDelete = (req) => {
  selectedRequest.value = req
  showReqDelModal.value = true
}

const confirmRequestDelete = async () => {
  if (!selectedRequest.value) return
  isDeleting.value = true
  try {
    await requestStore.requestDeletion(selectedRequest.value.id)
    toastStore.success('Deletion request sent')
    showReqDelModal.value = false
  } catch (e) {
    toastStore.error('Failed to request deletion')
  } finally {
    isDeleting.value = false
    selectedRequest.value = null
  }
}

const checkScanQuery = () => {
  if (route.query.scan) {
    const targetId = route.query.scan
    // Remove it from URL so refreshing won't pop it open again unexpectedly
    router.replace({ ...route, query: { ...route.query, scan: undefined } })
    
    const req = requestStore.requests.find(r => r.id === targetId)
    if (req) {
      handleEdit(req)
    } else {
      toastStore.error('Scanned Request Ticket Not Found in Ledger')
    }
  }
}

watch(() => route.query.scan, (newScan) => {
  if (newScan) checkScanQuery()
})

watch(() => requestStore.requests, (newRequests) => {
  // Try checking again in case requests just loaded
  if (route.query.scan) checkScanQuery()
}, { deep: true })
</script>

<style scoped>
.request-list-view {
  display: flex;
  flex-direction: column;
  gap: 32px;
  min-width: 0;
  overflow-x: hidden;
}

.view-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-bottom: 24px;
}

.view-header h1 {
  font-size: 1.5rem;
  letter-spacing: -0.5px;
}

.stats-mini-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.mini-stat {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-m-header {
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--text-secondary);
  letter-spacing: 0.5px;
}

.stat-m-body {
  font-size: 1.4rem;
  font-weight: 800;
}

.stat-progress {
  height: 2px;
  background: rgba(255, 255, 255, 0.05);
  width: 100%;
  margin-top: 12px;
}

.stat-fill { height: 100%; }

.th-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.node-badge {
  font-size: 0.75rem;
  color: var(--accent-primary);
  background: rgba(139, 92, 246, 0.1);
  border: 1px solid rgba(139, 92, 246, 0.2);
  padding: 4px 10px;
  border-radius: 999px;
}

.title-cell { display: flex; flex-direction: column; gap: 4px; }
.requester { opacity: 0.8; }

.type-node {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.05);
  padding: 4px 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  text-transform: capitalize;
}

.sector-id {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.urgency-tag {
  font-size: 0.65rem;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 999px;
  text-transform: capitalize;
}

.urgency-tag.low { background: rgba(255, 255, 255, 0.05); color: var(--text-secondary); }
.urgency-tag.medium { background: rgba(245, 158, 11, 0.1); color: var(--accent-warning); }
.urgency-tag.high { background: rgba(139, 92, 246, 0.1); color: var(--accent-primary); }
.urgency-tag.critical { background: rgba(244, 63, 94, 0.1); color: var(--accent-danger); }

.state-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
}

.led-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--text-muted); }
.state-indicator.new .led-dot { background: var(--accent-warning); box-shadow: 0 0 10px rgba(245, 158, 11, 0.4); }
.state-indicator.received .led-dot { background: var(--text-secondary); }
.state-indicator.approved .led-dot { background: var(--accent-success); box-shadow: 0 0 10px rgba(16, 185, 129, 0.4); }
.state-indicator.disapproved .led-dot { background: var(--accent-danger); box-shadow: 0 0 10px rgba(244, 63, 94, 0.4); }
.state-indicator.in_progress .led-dot { background: var(--accent-primary); box-shadow: 0 0 10px rgba(139, 92, 246, 0.4); }
.state-indicator.completed .led-dot { background: var(--accent-success); }
.state-indicator.cancelled .led-dot { background: var(--accent-danger); }

.state-label { font-size: 0.7rem; font-weight: 600; letter-spacing: 0.5px; color: var(--text-secondary); text-transform: capitalize; }

.action-dock {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* SLA Badges */
.deadline-indicator { display: flex; align-items: center; }
.sla-badge {
  display: flex;
  align-items: center;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  letter-spacing: 0.5px;
}
.sla-badge.safe { background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); }
.sla-badge.warning { background: rgba(245, 158, 11, 0.1); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.2); }
.sla-badge.critical { background: rgba(244, 63, 94, 0.15); color: #ef4444; border: 1px solid rgba(244, 63, 94, 0.4); animation: pulse-border-red 2s infinite; }
.sla-badge.breached { background: rgba(244, 63, 94, 0.8); color: white; box-shadow: 0 0 10px rgba(244, 63, 94, 0.6); }

@keyframes pulse-border-red {
  0%, 100% { border-color: rgba(244, 63, 94, 0.4); box-shadow: 0 0 0 rgba(244, 63, 94, 0); }
  50% { border-color: rgba(244, 63, 94, 1); box-shadow: 0 0 10px rgba(244, 63, 94, 0.4); }
}

.node-btn {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08); /* Softer */
  font-family: var(--font-body); /* Clean sans-serif */
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 999px; /* Pill */
  backdrop-filter: blur(10px);
}

.node-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-primary);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: var(--shadow-sm);
}

.node-btn.delete:hover {
  background: rgba(244, 63, 94, 0.1);
  color: var(--accent-danger);
  border-color: rgba(244, 63, 94, 0.3);
}

.purge-warning .node-label {
  font-size: 0.5rem;
  color: var(--text-muted);
  letter-spacing: 2px;
  margin-bottom: 8px;
}

.critical-alert {
  padding: 12px;
  background: rgba(239, 68, 68, 0.1);
  border-left: 3px solid var(--accent-danger);
}

.alert-text {
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

/* KANBAN BOARD PREVIEW STYLES */
.active-view {
  background: var(--accent-primary-glow) !important;
  color: var(--accent-primary) !important;
  border-color: var(--accent-primary) !important;
}

.kanban-board {
  display: flex;
  gap: 24px;
  overflow-x: auto;
  padding-bottom: 24px;
}
.k-col {
  flex: 1;
  min-width: 320px;
  display: flex;
  flex-direction: column;
  background: var(--bg-panel);
  border: var(--border-subtle);
  border-radius: var(--radius-xl);
  overflow: hidden;
}
.k-col-header {
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.02);
}
.k-count {
  background: rgba(255, 255, 255, 0.1);
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-primary);
}
.k-col-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 400px;
}
.k-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-lg);
  transition: all 0.2s;
  padding: 16px;
  cursor: pointer;
  backdrop-filter: blur(12px);
}
.k-card:hover {
  transform: translateY(-2px);
  border-color: rgba(139, 92, 246, 0.4);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  background: rgba(255, 255, 255, 0.05);
}
.k-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.k-title {
  font-size: 0.85rem;
  font-weight: 700;
  line-height: 1.2;
}
.empty-k-card {
  padding: 24px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px dashed rgba(255, 255, 255, 0.1);
}
.flex-row-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.p-4 { padding: 4px; border: 1px solid rgba(255,255,255,0.05); background: rgba(0,0,0,0.2); }
.mt-8 { margin-top: 8px; }
.mb-4 { margin-bottom: 4px; }
.mt-4 { margin-top: 4px; }
.fs-09 { font-size: 0.9rem; }
.fs-06 { font-size: 0.6rem; }
.fs-07 { font-size: 0.7rem; }
.pt-8 { padding-top: 8px; }
.border-top-subtle { border-top: 1px solid rgba(255, 255, 255, 0.05); }
.justify-center { justify-content: center; }

.rating-mini-display {
  display: flex;
  gap: 2px;
}

.rating-mini-display .star {
  color: rgba(148, 163, 184, 0.2);
}

.rating-mini-display .star.filled {
  color: #f59e0b;
}

.rate-btn {
  background: rgba(139, 92, 246, 0.15) !important;
  border-color: rgba(139, 92, 246, 0.4) !important;
  color: var(--accent-primary) !important;
  animation: pulse-glow-soft 2s infinite;
}

@keyframes pulse-glow-soft {
  0%, 100% { box-shadow: 0 0 5px rgba(139, 92, 246, 0.2); }
  50% { box-shadow: 0 0 15px rgba(139, 92, 246, 0.4); }
}

/* Search & Filter */
.search-box {
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  padding: 0 16px;
  gap: 8px;
  min-width: 240px;
}
.search-icon { color: var(--text-muted); font-size: 1rem; }
.search-input {
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-size: 0.8rem;
  padding: 10px 0;
  width: 100%;
}
.search-input::placeholder { color: var(--text-muted); opacity: 0.5; }

.status-filter {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 500;
  padding: 10px 16px;
  cursor: pointer;
  outline: none;
}
.status-filter option {
  background: var(--bg-deep);
  color: var(--text-primary);
}

/* Pagination */
.pagination-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  flex-wrap: wrap;
  gap: 12px;
}
.pagination-buttons {
  display: flex;
  gap: 6px;
  align-items: center;
}
.page-indicator {
  background: rgba(139, 92, 246, 0.1);
  color: var(--text-primary);
  font-size: 0.8rem;
  font-weight: 700;
  padding: 8px 16px;
  border-radius: 999px;
  border: 1px solid rgba(139, 92, 246, 0.3);
}
.node-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  pointer-events: none;
}

/* ── Mobile Responsive ── */
@media (max-width: 768px) {
  .request-list-view { gap: 20px; }

  /* Stats grid */
  .stats-mini-grid { grid-template-columns: 1fr 1fr; gap: 12px; }

  /* View controls + search stack */
  .view-controls {
    flex-direction: column !important;
    align-items: stretch !important;
  }
  .view-controls > div[style*="flex: 1"] { display: none !important; }
  .search-box { min-width: 100% !important; }
  .status-filter { width: 100%; }

  /* Kanban single column scroll */
  .kanban-board { flex-direction: column; gap: 16px; }
  .k-col { min-width: 100%; }
  .k-col-body { min-height: 200px; }

  /* Pagination compact */
  .pagination-controls { flex-direction: column; gap: 8px; text-align: center; }
  .pagination-buttons { justify-content: center; }
  .pagination-buttons .node-btn { padding: 6px 10px; font-size: 0.55rem; }
  .page-indicator { padding: 6px 10px; font-size: 0.65rem; }
}

@media (max-width: 480px) {
  .stats-mini-grid { grid-template-columns: 1fr; }
  .view-controls .node-btn { width: 100%; text-align: center; }
}
</style>
