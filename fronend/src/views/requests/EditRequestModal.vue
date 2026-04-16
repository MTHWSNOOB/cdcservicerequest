<template>
  <BaseModal :show="show" @close="$emit('close')" size="md">
    <template #header>
      <h3 class="font-display text-primary-glow">
        {{ authStore.isAdmin && request?.status !== 'NEW' ? 'Review Request' : (request?.status !== 'NEW' ? 'View Request' : 'Edit Request') }}
      </h3>
    </template>

    <form @submit.prevent="handleSave" class="mt-8">
      <div v-if="request" class="request-ticket glass-panel mb-24 flex gap-16 item-center justify-between pointer" @click="showQrTicket = !showQrTicket">
        <div class="ticket-info">
          <div class="info-item mb-8">
            <span class="info-label">Record ID</span>
            <span class="info-value text-primary">REQ-{{ request.id.substring(0,8) }}</span>
          </div>
          <div class="info-item mb-8" v-if="authStore.isAdmin">
            <span class="info-label">Requester</span>
            <span class="info-value">{{ request.requester }} ({{ request.area }})</span>
          </div>
          <div class="info-item">
            <span class="info-label">Status</span>
            <span class="info-value status-val" :class="request.status?.toLowerCase()">{{ request.status?.replace('_', ' ') }}</span>
          </div>
        </div>
        
        <div class="qr-thumbnail" :class="{ 'expanded': showQrTicket }">
          <QrcodeVue 
             :value="'CDH-REQ-' + request.id"
             :size="showQrTicket ? 150 : 60"
             level="M"
             background="transparent"
             foreground="#00f2fe"
          />
          <div v-if="showQrTicket" class="fw-500 text-center fs-07 mt-8 text-primary">Scan to Verify</div>
        </div>
      </div>

      <!-- Editable fields (only when status is NEW) -->
      <template v-if="request?.status === 'NEW'">
        <div class="input-group mb-24">
          <label class="cad-label">Request Type</label>
          <select v-model="form.requestTypeId" required class="cad-select">
            <option v-for="t in adminStore.requestTypes" :key="t.id" :value="t.id">
              {{ t.name }}
            </option>
          </select>
        </div>

        <div class="input-group mb-24">
          <label class="cad-label">Urgency</label>
          <select v-model="form.urgency" class="cad-select">
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>
      </template>

      <!-- Description (always visible) -->
      <div class="input-group mb-24">
        <label class="cad-label">Description</label>
        <textarea v-if="request?.status === 'NEW' && !authStore.isAdmin" v-model="form.description" rows="5" class="cad-textarea"></textarea>
        <div v-else class="description-display">{{ form.description || 'No description provided.' }}</div>
      </div>

      <!-- Attachments -->
      <div v-if="request?.status === 'NEW' && !authStore.isAdmin" class="input-group mb-24">
        <label class="cad-label">Attachments (Upload to replace existing)</label>
        <div class="file-drop-zone" @click="$refs.fileInput.click()">
          <input type="file" ref="fileInput" multiple @change="handleFileUpload" class="hidden-input" />
          <div class="drop-content">
            <UploadCloud :size="24" class="mb-8 text-primary" />
            <span class="fw-600 fs-08 text-primary">Select Files</span>
          </div>
        </div>
        <div v-if="newFiles.length > 0" class="mt-8">
          <span class="fs-08 text-secondary">Will upload {{ newFiles.length }} new file(s) and replace current attachments.</span>
        </div>
        <div v-else-if="request?.attachments && request.attachments.length > 0" class="attachments-grid mt-16">
          <div v-for="(file, idx) in request.attachments" :key="idx" class="attachment-preview" @click="openAttachment(file)">
            <img v-if="isImage(file)" :src="getFileUrl(file)" :alt="'Attachment ' + (idx + 1)" class="attachment-img" />
            <div v-else class="attachment-file">
              <Paperclip :size="16" class="file-icon" />
              <span class="file-name">{{ getFileName(file) }}</span>
            </div>
          </div>
        </div>
      </div>
      <div v-else-if="request?.attachments && request.attachments.length > 0" class="input-group mb-24">
        <label class="cad-label">Attachments</label>
        <div class="attachments-grid">
          <div v-for="(file, idx) in request.attachments" :key="idx" class="attachment-preview" @click="openAttachment(file)">
            <img v-if="isImage(file)" :src="getFileUrl(file)" :alt="'Attachment ' + (idx + 1)" class="attachment-img" />
            <div v-else class="attachment-file">
              <Paperclip :size="16" class="file-icon" />
              <span class="file-name">{{ getFileName(file) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Deadline info (Always visible if set) -->
      <div v-if="request?.deadline || form.deadline" class="input-group mb-24">
        <label class="cad-label">Deadline / Target Completion</label>
        <div class="description-display text-accent-secondary fw-600">
          <Clock :size="16" class="inline-icon me-2" />
          {{ formatDateDisplay(request?.deadline || form.deadline) }}
        </div>
      </div>

      <!-- Admin Actions: Approve / Disapprove -->
      <div v-if="authStore.isAdmin && request?.status !== 'APPROVED' && request?.status !== 'DISAPPROVED' && request?.status !== 'IN_PROGRESS' && request?.status !== 'COMPLETED' && request?.status !== 'CANCELLED'" class="admin-actions mb-24">
        <label class="cad-label">Admin Decision</label>
        
        <div v-if="!isDisapproving" class="decision-btns">
          <button type="button" class="decision-btn approve flex items-center justify-center gap-8" @click="handleStatusChange('APPROVED')" :disabled="statusChanging">
            <CheckCircle2 :size="16" /> Approve
          </button>
          <button type="button" class="decision-btn disapprove flex items-center justify-center gap-8" @click="isDisapproving = true">
            <XCircle :size="16" /> Disapprove
          </button>
        </div>

        <div v-else class="disapprove-form animate-float-in">
          <label class="cad-label text-danger">Reason for Disapproval</label>
          <textarea v-model="form.disapprovalReason" class="cad-textarea mb-16" rows="3" placeholder="Explain why this request is denied..."></textarea>
          <div class="decision-btns">
            <button type="button" class="btn-cancel font-mono" @click="isDisapproving = false">Cancel</button>
            <button type="button" class="decision-btn disapprove flex items-center justify-center gap-8" @click="handleStatusChange('DISAPPROVED')" :disabled="statusChanging">
              Confirm Disapproval
            </button>
          </div>
        </div>
      </div>

      <!-- Disapproved View (Read Only) -->
      <div v-if="request?.status === 'DISAPPROVED'" class="disapproved-view mb-24">
        <div class="decision-result mb-16">
          <span class="decision-badge disapproved flex items-center justify-center gap-8"><XCircle :size="18" /> Disapproved</span>
        </div>
        <label class="cad-label">Disapproval Reason</label>
        <div class="description-display">{{ request.disapprovalReason || 'No reason specified.' }}</div>
      </div>

      <!-- Ongoing / Completed View (Admin can update progress) -->
      <div v-if="authStore.isAdmin && ['APPROVED', 'IN_PROGRESS', 'COMPLETED'].includes(request?.status)" class="progress-actions mb-24 border-top-subtle pt-24">
        <label class="cad-label">Update Progress</label>
        
        <div class="input-group mb-16">
          <label class="cad-label">Set Status</label>
          <select v-model="form.status" class="cad-select">
            <option value="APPROVED">Approved (Pending start)</option>
            <option value="IN_PROGRESS">Ongoing / In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        <div class="input-group mb-16 mt-16">
          <label class="cad-label">Set Deadline (Optional)</label>
          <input v-model="form.deadline" type="datetime-local" class="cad-input" />
        </div>

        <div class="input-group mb-16 relative">
          <label class="cad-label">Assigned Admin(s)</label>
          <div class="multi-select-container">
            <div class="cad-select multi-select-display" @click="isDropdownOpen = !isDropdownOpen">
              <span v-if="form.assignedAdmins.length === 0" class="text-muted">-- Select Assigned Admin(s) --</span>
              <span v-else>{{ form.assignedAdmins.join(', ') }}</span>
              <ChevronDown :size="14" class="dropdown-icon" />
            </div>
            
            <div v-if="isDropdownOpen" class="dropdown-menu">
              <label v-for="admin in adminUsers" :key="admin.id" class="admin-checkbox">
                <input type="checkbox" :value="admin.name" v-model="form.assignedAdmins" />
                <div class="checkbox-ui"></div>
                <span class="checkbox-label">{{ admin.name }}</span>
              </label>
            </div>
          </div>
        </div>

        <div class="input-group mb-16">
          <label class="cad-label">Actions Taken / Work Done</label>
          <textarea v-model="form.actionsTaken" rows="3" placeholder="What has been done to fix/process this?" class="cad-textarea"></textarea>
        </div>

        <div class="input-group mb-16">
          <label class="cad-label">Remarks</label>
          <textarea v-model="form.remarks" rows="2" placeholder="Any final remarks..." class="cad-textarea"></textarea>
        </div>

        <button type="button" class="btn-primary w-100 mt-16" @click="handleStatusChange()" :disabled="statusChanging">
          {{ statusChanging ? 'Saving Progress...' : 'Save Progress & Status' }}
        </button>
      </div>

      <!-- Client View of Progress -->
      <div v-if="!authStore.isAdmin && ['APPROVED', 'IN_PROGRESS', 'COMPLETED'].includes(request?.status)" class="progress-actions mb-24 border-top-subtle pt-24">
        <h4 class="font-display text-primary-glow mb-16">Progress & Resolution</h4>
        
        <div class="info-item mb-16">
          <span class="info-label">Assigned To</span>
          <span class="info-value">{{ request.assignedAdmins || 'Pending assignment...' }}</span>
        </div>

        <div class="info-item mb-16">
          <span class="info-label">Actions Taken</span>
          <div class="description-display">{{ request.actionsTaken || 'No actions logged yet.' }}</div>
        </div>

        <div class="info-item">
          <span class="info-label">Remarks</span>
          <div class="description-display">{{ request.remarks || 'No remarks.' }}</div>
        </div>
      </div>

      <!-- Rating Section -->
      <div v-if="request?.status === 'COMPLETED'" class="rating-section mb-24 border-top-subtle pt-24">
        <h4 class="font-display text-primary-glow mb-16">Service Rating</h4>
        
        <div v-if="request.rating">
          <div class="stars-display mb-12">
            <Star v-for="n in 5" :key="'disp-'+n" :size="20" class="star" :class="{ 'star-filled': n <= request.rating }" :fill="n <= request.rating ? 'currentColor' : 'none'" />
          </div>
          <div class="description-display">{{ request.feedback || 'No feedback provided.' }}</div>
        </div>

        <div v-else-if="!authStore.isAdmin">
          <div class="stars-input mb-16 glow-pulse">
            <Star v-for="n in 5" :key="'inp-'+n" 
                  :size="32"
                  class="star-btn" 
                  :class="{ 'star-filled': n <= ratingForm.rating }"
                  :fill="n <= ratingForm.rating ? 'currentColor' : 'none'"
                  @click="ratingForm.rating = n" />
          </div>
          <textarea v-model="ratingForm.feedback" rows="2" placeholder="Leave feedback for the assigned personnel..." class="cad-textarea mb-16"></textarea>
          <button type="button" class="btn-primary w-100" @click="submitRating" :disabled="submittingRating || ratingForm.rating === 0">
            {{ submittingRating ? 'Submitting...' : 'Submit Rating' }}
          </button>
        </div>
        
        <div v-else class="text-secondary fs-08 text-center mt-16 glass-panel py-24">
          Awaiting user rating...
        </div>
      </div>

      <!-- Footer controls -->
      <div class="modal-controls mt-24 border-top-subtle pt-24">
        <button type="button" @click="$emit('close')" class="btn-cancel">Close</button>
        <div class="spacer"></div>
        <button v-if="request?.status === 'NEW'" type="submit" class="btn-primary" :disabled="saving">
          {{ saving ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>
    </form>
  </BaseModal>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import BaseModal from '../../components/BaseModal.vue'
import QrcodeVue from 'qrcode.vue'
import { useAdminStore } from '../../stores/adminStore'
import { useRequestStore } from '../../stores/requestStore'
import { useAuthStore } from '../../stores/authStore'
import { useToastStore } from '../../stores/toastStore'
import { CheckCircle2, XCircle, ChevronDown, UploadCloud, Paperclip, Star, Clock } from 'lucide-vue-next'

const props = defineProps({
  show: Boolean,
  request: Object
})

const emit = defineEmits(['close', 'updated'])

const adminStore = useAdminStore()
const requestStore = useRequestStore()
const authStore = useAuthStore()
const toastStore = useToastStore()

const adminUsers = computed(() => adminStore.users ? adminStore.users.filter(u => u.role === 'ADMIN') : [])
const saving = ref(false)
const statusChanging = ref(false)
const isDisapproving = ref(false)
const isDropdownOpen = ref(false)
const showQrTicket = ref(false)

const submittingRating = ref(false)
const ratingForm = ref({
  rating: 0,
  feedback: ''
})

const fileInput = ref(null)
const newFiles = ref([])

const handleFileUpload = (e) => {
  newFiles.value = Array.from(e.target.files)
}

const form = ref({
  title: '',
  requestTypeId: '',
  description: '',
  urgency: '',
  deadline: '',
  disapprovalReason: '',
  status: '',
  assignedAdmins: [],
  actionsTaken: '',
  remarks: ''
})

watch(() => props.request, (newVal) => {
  if (newVal) {
    form.value = {
      title: newVal.title || '',
      requestTypeId: newVal.requestTypeId || adminStore.requestTypes.find(t => t.name === newVal.type)?.id || '',
      description: newVal.description || '',
      urgency: newVal.urgency || 'MEDIUM',
      deadline: newVal.deadline ? new Date(newVal.deadline).toISOString().slice(0, 16) : '',
      disapprovalReason: newVal.disapprovalReason || '',
      status: newVal.status || '',
      assignedAdmins: newVal.assignedAdmins ? newVal.assignedAdmins.split(', ') : [],
      actionsTaken: newVal.actionsTaken || '',
      remarks: newVal.remarks || ''
    }
    // Reset file input state when opening modal
    newFiles.value = []
    if (fileInput.value) fileInput.value.value = ''
  }
}, { immediate: true })

const isImage = (filePath) => {
  const ext = filePath.split('.').pop()?.toLowerCase()
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext)
}

const getFileUrl = (filePath) => {
  if (filePath.startsWith('http')) return filePath
  return `/api/uploads/${filePath}`
}

const getFileName = (filePath) => {
  return filePath.split('/').pop() || filePath
}

const openAttachment = (file) => {
  window.open(getFileUrl(file), '_blank')
}

const formatDateDisplay = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
}

const handleSave = async () => {
  saving.value = true
  try {
    const selectedType = adminStore.requestTypes.find(t => t.id === form.value.requestTypeId)
    
    let payload;
    if (newFiles.value.length > 0) {
      payload = new FormData()
      payload.append('subject', selectedType ? selectedType.name : form.value.title)
      payload.append('requestTypeId', form.value.requestTypeId)
      payload.append('description', form.value.description)
      payload.append('urgency', form.value.urgency)
      newFiles.value.forEach(f => payload.append('attachments', f))
    } else {
      payload = {
        subject: selectedType ? selectedType.name : form.value.title,
        requestTypeId: form.value.requestTypeId,
        description: form.value.description,
        urgency: form.value.urgency,
      }
    }
    
    await requestStore.updateRequest(props.request.id, payload)
    toastStore.success('Request updated successfully')
    emit('updated')
    emit('close')
  } catch (error) {
    toastStore.error('Failed to update request')
  } finally {
    saving.value = false
  }
}

const handleStatusChange = async (statusOverride) => {
  const targetStatus = statusOverride || form.value.status;
  
  if (targetStatus === 'DISAPPROVED' && !form.value.disapprovalReason.trim()) {
    toastStore.warning('Please provide a reason for disapproval');
    return;
  }

  statusChanging.value = true;
  try {
    const data = {
      status: targetStatus,
      disapprovalReason: targetStatus === 'DISAPPROVED' ? form.value.disapprovalReason : undefined,
      assignedAdmins: Array.isArray(form.value.assignedAdmins) ? form.value.assignedAdmins.join(', ') : '',
      actionsTaken: form.value.actionsTaken,
      remarks: form.value.remarks,
      deadline: form.value.deadline ? new Date(form.value.deadline).toISOString() : undefined
    };

    await requestStore.updateStatus(props.request.id, data);
    toastStore.success(`Action successful`);
    isDisapproving.value = false;
    emit('updated');
    emit('close');
  } catch (error) {
    toastStore.error('Failed to update request');
  } finally {
    statusChanging.value = false;
  }
}

const submitRating = async () => {
  if (ratingForm.value.rating === 0) return;
  submittingRating.value = true;
  try {
    await requestStore.submitRating(props.request.id, ratingForm.value.rating, ratingForm.value.feedback);
    toastStore.success('Rating submitted successfully!');
    emit('updated');
  } catch (error) {
    toastStore.error(error || 'Failed to submit rating');
  } finally {
    submittingRating.value = false;
  }
}
</script>

<style scoped>
.cad-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.cad-input, .cad-textarea, .cad-select {
  width: 100%;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.08);
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--text-primary);
  outline: none;
  border-radius: var(--radius-md);
  backdrop-filter: blur(10px);
}

.cad-input:focus, .cad-textarea:focus, .cad-select:focus { border-color: rgba(139, 92, 246, 0.5); box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15); }

.info-bar {
  display: flex;
  gap: 24px;
  padding: 16px;
  flex-wrap: wrap;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.info-value {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary);
}

.status-val { text-transform: uppercase; font-size: 0.7rem; }
.status-val.new { color: var(--accent-secondary); }
.status-val.received { color: var(--accent-primary); }
.status-val.approved { color: #10b981; }
.status-val.disapproved { color: var(--accent-danger); }
.status-val.in_progress { color: var(--accent-primary); }
.status-val.completed { color: var(--accent-success); }

.description-display {
  padding: 16px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-lg);
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.6;
  white-space: pre-wrap;
  min-height: 80px;
}

/* File drop zone */
.file-drop-zone {
  border: 2px dashed rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  padding: 32px;
  text-align: center;
  background: rgba(255, 255, 255, 0.02);
  cursor: pointer;
  transition: all 0.2s;
}
.file-drop-zone:hover {
  background: rgba(139, 92, 246, 0.05);
  border-color: rgba(139, 92, 246, 0.5);
}
.hidden-input { display: none; }
.drop-content { display: flex; flex-direction: column; align-items: center; color: var(--text-muted); }

.attachments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}

.attachment-preview {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
}

.attachment-preview:hover {
  border-color: rgba(139, 92, 246, 0.5);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  transform: translateY(-2px);
}

.attachment-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.attachment-file {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
}

.file-icon { font-size: 1.5rem; }
.file-name {
  font-size: 0.6rem;
  color: var(--text-muted);
  font-family: var(--font-mono);
  text-align: center;
  word-break: break-all;
}

/* Decision buttons container */

.decision-btns {
  display: flex;
  gap: 12px;
}

.decision-btn {
  flex: 1;
  padding: 14px 20px;
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 500;
  border: 1px solid;
  cursor: pointer;
  transition: all 0.25s;
  border-radius: 999px; /* Pill */
}

.decision-btn.approve {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.3);
  color: #10b981;
}

.decision-btn.approve:hover {
  background: rgba(16, 185, 129, 0.2);
  border-color: #10b981;
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
}

.decision-btn.disapprove {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

.decision-btn.disapprove:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: #ef4444;
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
}

.decision-result { text-align: center; }

.decision-badge {
  display: inline-block;
  padding: 12px 32px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 999px; /* Pill */
  border: 1px solid;
  background: rgba(255, 255, 255, 0.05); /* Soft background */
}

.decision-badge.approved {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.3);
  color: var(--accent-success);
}

.decision-badge.disapproved {
  background: rgba(244, 63, 94, 0.1);
  border-color: rgba(244, 63, 94, 0.3);
  color: var(--accent-danger);
}

.cad-toggle { display: flex; gap: 16px; }
.toggle-node {
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 0.85rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  border-radius: 999px; /* Pill */
}

.toggle-node .led { width: 8px; height: 8px; border-radius: 50%; background: rgba(255, 255, 255, 0.2); }
.active-node { border-color: rgba(139, 92, 246, 0.5); color: var(--text-primary); background: rgba(139, 92, 246, 0.1); }
.active-node .led { background: var(--accent-primary); box-shadow: 0 0 10px rgba(139, 92, 246, 0.5); }

.modal-controls { display: flex; justify-content: flex-end; gap: 16px; align-items: center; }
.spacer { flex: 1; }

.border-top-subtle { border-top: 1px solid rgba(255, 255, 255, 0.05); }
.text-danger { color: var(--accent-danger); }
.w-100 { width: 100%; }
.mt-16 { margin-top: 16px; }
.mb-16 { margin-bottom: 16px; }
.pt-24 { padding-top: 24px; }
.p-24 { padding: 24px; }
.mt-8 { margin-top: 8px; }
.mt-24 { margin-top: 24px; }
.admin-checkbox-list { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

/* Multi-select Dropdown */
.relative { position: relative; }
.multi-select-container { position: relative; width: 100%; }
.multi-select-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  min-height: 48px; 
}
.dropdown-icon { font-size: 0.8rem; color: var(--text-secondary); }
.dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  max-height: 240px;
  overflow-y: auto;
  background: var(--bg-deep);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-md);
  z-index: 10;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-lg);
}
.dropdown-menu .admin-checkbox {
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  background: transparent;
}
.dropdown-menu .admin-checkbox:hover {
  background: rgba(0, 242, 254, 0.1);
}

.admin-checkbox { display: flex; align-items: center; gap: 12px; cursor: pointer; padding: 12px 16px; background: transparent; border-bottom: 1px solid rgba(255, 255, 255, 0.05); transition: 0.2s all; }
.admin-checkbox:last-child { border-bottom: none; }
.info-bar, .request-ticket { display: flex; padding: 24px; background: rgba(0, 0, 0, 0.2); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: var(--radius-lg); }
.pointer { cursor: pointer; transition: 0.2s all; }
.pointer:hover { background: rgba(139, 92, 246, 0.05); border-color: rgba(139, 92, 246, 0.2); }
.ticket-info { flex: 1; display: flex; flex-direction: column; justify-content: center; }
.qr-thumbnail { display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(255,255,255,0.03); padding: 12px; border-radius: var(--radius-md); border: 1px solid rgba(255, 255, 255, 0.08); transition: 0.3s all; }
.qr-thumbnail.expanded { padding: 24px; background: rgba(255,255,255,0.05); border-color: rgba(139, 92, 246, 0.4); box-shadow: 0 0 20px rgba(139, 92, 246, 0.1); }
.mt-8 { margin-top: 8px; }
.fs-06 { font-size: 0.6rem; }
.justify-between { justify-content: space-between; }
.item-center { align-items: center; }
.gap-16 { gap: 16px; }

.info-item { display: flex; flex-direction: column; gap: 4px; }
.admin-checkbox input { display: none; }
.checkbox-ui { width: 18px; height: 18px; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 4px; display: inline-block; position: relative; transition: all 0.2s; }
.admin-checkbox input:checked + .checkbox-ui { background: var(--accent-primary); border-color: var(--accent-primary); box-shadow: 0 0 10px rgba(139, 92, 246, 0.4); }
.admin-checkbox input:checked + .checkbox-ui::after {
  content: '✓';
  color: white;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.75rem;
}
.admin-checkbox:hover .checkbox-ui { border-color: var(--accent-primary); }
.checkbox-label { font-size: 0.9rem; color: var(--text-primary); }

/* Rating Styles */
.stars-display { display: flex; gap: 4px; font-size: 1.5rem; color: rgba(255, 255, 255, 0.1); }
.stars-display .star-filled { color: #f59e0b; text-shadow: 0 0 10px rgba(245, 158, 11, 0.5); }

.stars-input { display: flex; gap: 8px; font-size: 2rem; color: rgba(255, 255, 255, 0.1); justify-content: center; }
.star-btn:hover { color: #f59e0b; transform: scale(1.2) rotate(5deg); }
.star-btn:active { transform: scale(0.9); }
.star-btn.star-filled { 
  color: #f59e0b; 
  filter: drop-shadow(0 0 15px rgba(245, 158, 11, 0.6)); 
  animation: star-pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes star-pop {
  0% { transform: scale(1); }
  50% { transform: scale(1.4); }
  100% { transform: scale(1); }
}

.glow-pulse {
  animation: star-glow-pulse 3s infinite ease-in-out;
}

@keyframes star-glow-pulse {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.2) drop-shadow(0 0 5px rgba(245, 158, 11, 0.2)); }
}
</style>
