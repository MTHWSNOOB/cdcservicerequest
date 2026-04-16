<template>
  <div class="service-request-view animate-float-in">
    <header class="view-header">
      <router-link to="/requests" class="back-link font-body flex items-center gap-8">
        <ArrowLeft :size="14" /> Back to Requests
      </router-link>
      <div class="header-main">
        <h1 class="font-display text-primary-glow">New Service Request</h1>
        <p class="text-secondary fs-08">Fill out the details below</p>
      </div>
    </header>

    <!-- Access Denied Prompt if no Section -->
    <div v-if="!authStore.user?.sectionId" class="glass-panel text-center" style="padding: 48px 24px;">
      <div class="system-icon mb-16" style="margin: 0 auto; color: var(--accent-danger);">
        <ShieldAlert :size="48" />
      </div>
      <h2 class="font-display text-primary-glow mb-8" style="color: var(--accent-danger);">Access Restricted</h2>
      <p class="text-secondary fs-09">You are not assigned to any section yet.<br>Please contact the system administrator to configure your section profile before initiating a service request.</p>
    </div>

    <div v-else class="form-container glass-panel">
      <form @submit.prevent="handleSubmit">
        <!-- Technical Progress Stepper -->
        <div class="stepper-interface mb-48">
          <div v-for="s in 3" :key="s" class="step-unit" :class="{ 'active': step >= s, 'completed': step > s }">
            <div class="step-connector"></div>
            <div class="step-orb">
              <span class="orb-content fw-600">{{ s }}</span>
            </div>
            <span class="step-tag">{{ s === 1 ? 'Details' : s === 2 ? 'Specs' : 'Files' }}</span>
          </div>
        </div>

        <!-- Originator Context Bar -->
        <div class="origin-context mb-32 glass-panel">
          <div class="context-item">
            <span class="c-label">Requested By</span>
            <span class="c-value font-display text-primary fw-600">{{ authStore.user?.name }}</span>
          </div>
          <div class="context-divider"></div>
          <div class="context-item">
            <span class="c-label">Section</span>
            <span class="c-value font-display text-secondary fw-600">{{ userSectionName }}</span>
          </div>
          <div class="context-item hide-mobile">
            <span class="c-label">Security</span>
            <span class="c-value font-display text-primary-glow fw-600">Secure</span>
          </div>
        </div>

        <!-- Section 1: Initial Parameters -->
        <div v-if="step === 1" class="phase-container animate-float-in">
          <h2 class="phase-title font-display"><span class="t-accent">Step 1:</span> Basic Info</h2>
          <div class="input-group mb-32">
            <label class="cad-label">Request Type</label>
            <select v-model="form.requestTypeId" required class="cad-select">
              <option v-for="t in adminStore.requestTypes" :key="t.id" :value="t.id">
                {{ t.name }}
              </option>
            </select>
          </div>
          <div class="input-group">
            <label class="cad-label">Description</label>
            <textarea v-model="form.description" rows="6" placeholder="Describe the issue or request in detail..." class="cad-textarea"></textarea>
          </div>
        </div>

        <!-- Section 2: Technical Specifications -->
        <div v-if="step === 2" class="phase-container animate-float-in">
          <h2 class="phase-title font-display"><span class="t-accent">Step 2:</span> Details</h2>

          <div class="input-row gap-24 mb-32">
            <div class="input-group flex-1">
              <label class="cad-label">Urgency Level</label>
              <select v-model="form.urgency" class="cad-select">
                <option value="LOW">Low - Routine</option>
                <option value="MEDIUM">Medium - Needs Attention</option>
                <option value="HIGH">High - Critical</option>
                <option value="CRITICAL">Critical - Emergency</option>
              </select>
            </div>
          </div>

          <div class="input-group">
            <label class="cad-label">Has a Deadline?</label>
            <div class="cad-toggle">
              <div class="toggle-node" :class="{ 'active-node': form.hasDeadline }" @click="form.hasDeadline = true">
                <div class="led"></div> Yes
              </div>
              <div class="toggle-node" :class="{ 'inactive-node': !form.hasDeadline }" @click="form.hasDeadline = false">
                <div class="led"></div> No
              </div>
            </div>
          </div>

          <div v-if="form.hasDeadline" class="input-row gap-24 mt-32 animate-float-in">
            <div class="input-group flex-1">
              <label class="cad-label">Deadline Date</label>
              <input v-model="form.deadlineDate" type="date" class="cad-input" />
            </div>
            <div class="input-group flex-1">
              <label class="cad-label">Reason</label>
              <input v-model="form.deadlineReason" type="text" placeholder="Why is this urgent?" class="cad-input" />
            </div>
          </div>
        </div>

        <!-- Section 3: Technical Documentation -->
        <div v-if="step === 3" class="phase-container animate-float-in">
          <h2 class="phase-title font-display"><span class="t-accent">Step 3:</span> Attachments</h2>
          <div class="tech-scanner-zone p-48 flex-col align-center glass-panel">
            <span class="font-display fs-09 fw-600 mt-16">Upload Files</span>
            <p class="text-secondary fs-08 mt-8">Attach photos or documents (optional)</p>
            <input type="file" multiple class="file-optic-input" @change="handleFileUpload" />
          </div>
          <div v-if="form.files.length > 0" class="file-manifest mt-32">
            <div v-for="(file, i) in form.files" :key="i" class="manifest-item glass-panel">
              <div v-if="isImage(file)" class="file-preview-mini">
                <img :src="getFilePreview(file)" alt="preview" />
              </div>
              <div v-else class="file-node"></div>
              <span class="file-label fw-500">{{ file.name }}</span>
              <button type="button" @click="removeFile(i)" class="purge-file"><X :size="14" /></button>
            </div>
          </div>
        </div>

        <!-- System Controls -->
        <div class="station-controls mt-48 border-top-subtle pt-32">
          <button v-if="step > 1" type="button" @click="step--" class="btn-cancel">Back</button>
          <div class="spacer"></div>
          <button v-if="step < 3" type="button" @click="nextStep" class="btn-primary">Next Step</button>
          <button v-else type="button" @click="handleSubmit" class="btn-primary" :disabled="submitting">
            {{ submitting ? 'Submitting...' : 'Submit Request' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useRequestStore } from '../../stores/requestStore'
import { useAdminStore } from '../../stores/adminStore'
import { useAuthStore } from '../../stores/authStore'
import { useToastStore } from '../../stores/toastStore'
import api from '../../api/axios'
import { ArrowLeft, ShieldAlert, X } from 'lucide-vue-next'

const router = useRouter()
const requestStore = useRequestStore()
const adminStore = useAdminStore()
const authStore = useAuthStore()
const toastStore = useToastStore()

const step = ref(1)
const submitting = ref(false)

const form = ref({
  requestTypeId: '',
  description: '',
  urgency: 'MEDIUM',
  hasDeadline: false,
  deadlineDate: '',
  deadlineReason: '',
  files: []
})

const userSectionName = computed(() => {
  return adminStore.sections.find(s => s.id === authStore.user?.sectionId)?.name || 'N/A'
})

onMounted(async () => {
  // Refresh user data to ensure sectionId is available
  await authStore.fetchCurrentUser()

  if (adminStore.requestTypes && adminStore.requestTypes.length > 0) {
    form.value.requestTypeId = adminStore.requestTypes[0].id
  }
})

const handleFileUpload = (e) => {
  const selectedFiles = Array.from(e.target.files)
  form.value.files.push(...selectedFiles)
}

const removeFile = (index) => {
  form.value.files.splice(index, 1)
}

const isImage = (file) => {
  return file.type.startsWith('image/')
}

const getFilePreview = (file) => {
  return URL.createObjectURL(file)
}

const nextStep = () => {
  if (step.value === 1) {
    if (!form.value.requestTypeId || !form.value.description) {
      toastStore.warning('Please fill in all required fields')
      return
    }
  } else if (step.value === 2) {
    if (!form.value.description) {
      toastStore.warning('REQUIRED_FIELDS_MISSING: PHASE_02')
      return
    }
  }
  step.value++
}

const handleSubmit = async () => {
  if (!form.value.requestTypeId || !form.value.description) {
    toastStore.warning('Please fill in required fields')
    step.value = 1
    return
  }

  submitting.value = true
  try {
    // Auto-generate subject from request type
    const selectedType = adminStore.requestTypes.find(t => t.id === form.value.requestTypeId)
    const autoSubject = selectedType ? selectedType.name : 'Service Request'

    const formData = new FormData()
    formData.append('subject', autoSubject)
    formData.append('urgency', form.value.urgency)
    formData.append('description', form.value.description)
    formData.append('userId', authStore.user?.id)
    formData.append('sectionId', authStore.user?.sectionId)
    formData.append('requestTypeId', form.value.requestTypeId)
    
    // Add files
    if (form.value.files && form.value.files.length > 0) {
      form.value.files.forEach(file => {
        formData.append('attachments', file)
      })
    }
    
    await requestStore.submitRequest(formData)
    toastStore.success('Request Submitted Successfully')
    router.push('/requests')
  } catch (error) {
    toastStore.error('System Error: Failed to submit request')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.service-request-view { max-width: 900px; margin: 0 auto; display: flex; flex-direction: column; gap: 32px; }

.back-link { font-size: 0.65rem; font-weight: 800; color: var(--text-muted); text-decoration: none; margin-bottom: 8px; display: inline-flex; align-items: center; gap: 6px; }
.back-link:hover { color: var(--accent-primary); }

.view-header h1 { font-size: 1.5rem; letter-spacing: -0.5px; }

.form-container { padding: 24px; }

/* Stepper Interface */
.stepper-interface { display: flex; justify-content: space-between; position: relative; padding: 0 60px; }
.step-unit { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 12px; position: relative; }
.step-connector { position: absolute; top: 18px; left: calc(50% + 18px); width: calc(100% - 36px); height: 2px; background: rgba(255, 255, 255, 0.05); z-index: 1; }
.step-unit:last-child .step-connector { display: none; }

.step-orb {
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  z-index: 2;
  border-radius: 50%; /* Make them perfect circles */
  backdrop-filter: blur(10px);
}

.orb-content { font-size: 1rem; color: var(--text-secondary); }
.step-tag { font-size: 0.75rem; color: var(--text-secondary); font-weight: 500; }

.active .step-orb { border-color: var(--accent-primary); box-shadow: 0 0 15px var(--accent-primary-glow); }
.active .orb-content { color: var(--accent-primary); }
.active .step-tag { color: var(--accent-primary); }

.completed .step-orb { background: var(--accent-primary); }
.completed .orb-content { color: #000; }
.completed .step-connector { background: var(--accent-primary); opacity: 0.3; }

/* Origin Context Bar */
.origin-context { display: flex; align-items: center; padding: 20px 24px; gap: 32px; background: rgba(0, 0, 0, 0.2); border-radius: var(--radius-lg); }
.context-item { display: flex; flex-direction: column; gap: 8px; }
.c-label { font-size: 0.65rem; color: var(--text-secondary); letter-spacing: 0.5px; text-transform: uppercase; font-weight: 600; }
.c-value { font-size: 1.1rem; }
.context-divider { width: 1px; height: 40px; background: rgba(255, 255, 255, 0.08); }

/* Form Elements */
.phase-title { font-size: 1.25rem; letter-spacing: -0.5px; margin-bottom: 32px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); padding-bottom: 16px; }
.t-accent { color: var(--accent-primary); }

.cad-label { display: block; font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 12px; }
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
.file-node { width: 8px; height: 8px; border-radius: 50%; background: var(--accent-primary); box-shadow: 0 0 10px var(--accent-primary-glow); }

.file-preview-mini {
  width: 40px;
  height: 40px;
  overflow: hidden;
  border: 1px solid var(--accent-primary-glow);
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
}

.file-preview-mini img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cad-hint { display: block; font-size: 0.55rem; color: var(--text-muted); margin-top: 8px; }

.cad-toggle { display: flex; gap: 16px; }
.toggle-node {
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  border-radius: 999px; /* Pill */
}
.toggle-node .led { width: 8px; height: 8px; border-radius: 50%; background: rgba(255, 255, 255, 0.2); }
.active-node { border-color: rgba(139, 92, 246, 0.5); color: var(--text-primary); background: rgba(139, 92, 246, 0.1); }
.active-node .led { background: var(--accent-primary); box-shadow: 0 0 10px rgba(139, 92, 246, 0.5); }

/* Technical Scanner Zone */
.tech-scanner-zone {
  position: relative;
  border: 2px dashed rgba(255, 255, 255, 0.1);
  overflow: hidden;
  text-align: center;
  border-radius: var(--radius-lg);
  transition: all 0.2s;
  cursor: pointer;
}
.tech-scanner-zone:hover { border-color: rgba(139, 92, 246, 0.5); background: rgba(139, 92, 246, 0.05); }

.file-optic-input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }

.file-manifest { display: flex; flex-direction: column; gap: 12px; }
.manifest-item { display: flex; align-items: center; gap: 16px; padding: 14px 24px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: var(--radius-md); }
.file-node { width: 8px; height: 8px; background: var(--accent-primary); border-radius: 50%; }
.file-label { flex: 1; font-size: 0.85rem; }
.purge-file { background: none; border: none; color: var(--accent-danger); cursor: pointer; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; }

.station-controls { display: flex; justify-content: flex-end; gap: 20px; }
.spacer { flex: 1; }

.border-top-subtle { border-top: 1px solid rgba(255, 255, 255, 0.05); }
.mt-48 { margin-top: 48px; }
.mb-48 { margin-bottom: 48px; }
.mb-32 { margin-bottom: 32px; }
.mt-32 { margin-top: 32px; }
.p-48 { padding: 24px; }
</style>
