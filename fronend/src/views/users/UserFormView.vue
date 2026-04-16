<template>
  <div class="user-form-view animate-float-in">
    <header class="view-header">
      <router-link to="/users" class="back-link font-mono flex items-center gap-8">
        <ArrowLeft :size="14" /> Back to Users
      </router-link>
      <div class="header-main">
        <h1 class="font-display" :class="isEdit ? 'text-secondary-glow' : 'text-primary-glow'">
          {{ isEdit ? 'Edit User' : 'Add New User' }}
        </h1>
        <p class="text-secondary font-mono fs-07 uppercase">User account management</p>
      </div>
    </header>

    <div class="form-grid">
      <div class="form-container glass-panel">
        <form @submit.prevent="handleSubmit">
          <div class="form-section">
            <h2 class="section-title font-mono">Personal Information</h2>
            
            <div class="form-group mb-24">
              <label class="cad-label">Full Name</label>
              <input v-model="form.name" type="text" placeholder="Enter full name..." required class="cad-input" />
            </div>

            <div class="form-group">
              <label class="cad-label">Email</label>
              <input v-model="form.email" type="email" placeholder="user@cdh.gov" required class="cad-input" />
            </div>
          </div>

          <div class="form-section">
            <h2 class="section-title font-mono">Role & Section</h2>

            <div class="form-row gap-24">
              <div class="form-group flex-1">
                <label class="cad-label">Role</label>
                <select v-model="form.role" class="cad-select-alt">
                  <option value="ADMIN">Admin</option>
                  <option value="TECHNICAL">Technical Staff</option>
                  <option value="USER">User</option>
                </select>
              </div>

              <div class="form-group flex-1">
                <label class="cad-label">Section</label>
                <select v-model="form.sectionId" class="cad-select-alt">
                  <option value="">-- Select Section --</option>
                  <option v-for="section in adminStore.sections" :key="section.id" :value="section.id">
                    {{ section.name.toUpperCase() }}
                  </option>
                </select>
              </div>
            </div>

            <div class="form-group mt-32">
              <label class="cad-label">Status</label>
              <div class="state-toggle">
                <div 
                  class="toggle-opt" 
                  :class="{ 'opt-active': form.status === 'ACTIVE' }"
                  @click="form.status = 'ACTIVE'"
                >
                  <div class="led"></div> Active
                </div>
                <div 
                  class="toggle-opt" 
                  :class="{ 'opt-inactive': form.status === 'INACTIVE' }"
                  @click="form.status = 'INACTIVE'"
                >
                  <div class="led"></div> Inactive
                </div>
              </div>
            </div>
          </div>

          <div class="form-actions border-top-subtle pt-32">
            <button type="button" @click="$router.push('/users')" class="btn-cancel font-mono">Cancel</button>
            <button type="submit" class="btn-primary">
              {{ isEdit ? 'Save Changes' : 'Create User' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Tech Identification Card Preview -->
      <div class="id-card-wrap glass-panel animate-float-in delay-2">
        <div class="card-inner">
          <div class="card-header">
            <span class="font-display fs-07 text-muted">STATION_IDENT_PROTO_SEC</span>
            <div class="card-node"></div>
          </div>
                    <div class="card-body">
            <div class="avatar-box clickable" @click="$refs.fileInput.click()">
              <input 
                type="file" 
                ref="fileInput" 
                class="hidden-input" 
                accept="image/*" 
                @change="handleFileChange"
              />
              <img v-if="previewUrl" :src="previewUrl" class="avatar-img" />
              <div v-else class="initials font-display">{{ avatarInitials }}</div>
              <div class="h-scanner"></div>
              <div class="upload-hint font-mono fs-05">UPLOAD_AVATAR</div>
            </div>
            
            <div class="card-info">
              <div class="info-group">
                <span class="i-label">OPERATOR_ID</span>
                <p class="i-value font-display uppercase">{{ form.name || '---- ---' }}</p>
              </div>
              <div class="info-group">
                <span class="i-label">UPLINK_HEX</span>
                <p class="i-value font-mono fs-06">{{ form.email || 'NULL_ADDR@STATION.SYS' }}</p>
              </div>
              <div class="info-row">
                <div class="info-group">
                  <span class="i-label">DESIGNATION</span>
                  <p class="i-value font-mono text-primary fs-07">{{ form.role.toUpperCase() }}</p>
                </div>
                <div class="info-group">
                  <span class="i-label">NODE_STATE</span>
                  <p class="i-value font-mono fs-07" :class="form.status === 'ACTIVE' ? 'text-success' : 'text-danger'">
                    {{ form.status }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="card-footer">
            <div class="barcode"></div>
            <span class="stamp font-mono">STATION://AL_012</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/userStore'
import { useAdminStore } from '../../stores/adminStore'
import { useToastStore } from '../../stores/toastStore'
import { ArrowLeft } from 'lucide-vue-next'

const props = defineProps({
  id: String
})

const router = useRouter()
const userStore = useUserStore()
const adminStore = useAdminStore()
const toastStore = useToastStore()
const isEdit = computed(() => !!props.id)

const form = ref({
  name: '',
  email: '',
  role: 'USER',
  status: 'ACTIVE',
  sectionId: '',
  avatar: ''
})

const selectedFile = ref(null)
const previewUrl = ref(null)

const getFileUrl = (path) => {
  if (!path) return null
  if (path.startsWith('data:')) return path
  return `/api/${path}`
}

const avatarInitials = computed(() => {
  if (!form.value.name) return '??'
  return form.value.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
})

onMounted(async () => {
  if (adminStore.sections.length === 0) await adminStore.fetchSections()

  if (isEdit.value) {
    const existingUser = userStore.getUserById(props.id)
    if (existingUser) {
      form.value = { ...existingUser, sectionId: existingUser.sectionId || '' }
      if (existingUser.avatar) {
        previewUrl.value = getFileUrl(existingUser.avatar)
      }
    } else {
      router.push('/users')
    }
  }
})

const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    selectedFile.value = file
    const reader = new FileReader()
    reader.onload = (event) => {
      previewUrl.value = event.target.result
    }
    reader.readAsDataURL(file)
  }
}

const handleSubmit = async () => {
  try {
    const formData = new FormData()
    if (isEdit.value) formData.append('id', props.id)
    formData.append('name', form.value.name)
    formData.append('email', form.value.email)
    formData.append('role', form.value.role)
    formData.append('status', form.value.status)
    formData.append('sectionId', form.value.sectionId)
    
    if (selectedFile.value) {
      formData.append('avatar', selectedFile.value)
    } else if (form.value.avatar) {
      formData.append('avatar', form.value.avatar)
    }

    if (isEdit.value) {
      await userStore.updateUser(formData)
      toastStore.success(`NODE_SYNC_COMPLETE: ${form.value.name.toUpperCase()}`)
    } else {
      await userStore.addUser(formData)
      toastStore.success(`NODE_PROVISIONED: ${form.value.name.toUpperCase()}`)
    }
    router.push('/users')
  } catch (error) {
    toastStore.error('SYSTEM_ERROR: SYNC_FAILURE')
  }
}
</script>

<style scoped>
.user-form-view { display: flex; flex-direction: column; gap: 32px; }

.back-link { font-size: 0.65rem; font-weight: 800; color: var(--text-muted); text-decoration: none; margin-bottom: 24px; transition: color 0.2s; display: inline-flex; align-items: center; gap: 6px; }
.back-link:hover { color: var(--accent-primary); }

.view-header h1 { font-size: 1.5rem; letter-spacing: -0.5px; }

.form-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 40px; align-items: start; }
@media (max-width: 1200px) { .form-grid { grid-template-columns: 1fr; } }

.form-container { padding: 24px; }
.form-section { margin-bottom: 48px; }

.section-title {
  font-size: 0.6rem;
  letter-spacing: 2.5px;
  color: var(--text-muted);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-bottom: 16px;
  margin-bottom: 32px;
}

.cad-label {
  display: block;
  font-size: 0.6rem;
  font-weight: 900;
  color: var(--text-secondary);
  letter-spacing: 1px;
  margin-bottom: 12px;
  font-family: var(--font-mono);
}

.cad-input {
  width: 100%;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: var(--text-primary);
  outline: none;
}

.cad-input:focus { border-color: var(--accent-primary); box-shadow: 0 0 15px var(--accent-primary-glow); }

.cad-select-alt {
  width: 100%;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-size: 0.8rem;
  outline: none;
}

.state-toggle { display: flex; gap: 24px; }
.toggle-opt {
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-opt .led { width: 8px; height: 8px; border-radius: 50%; background: #334155; }
.opt-active { border-color: var(--accent-success); color: var(--accent-success); background: rgba(0, 242, 148, 0.05); }
.opt-active .led { background: var(--accent-success); box-shadow: 0 0 10px var(--accent-success); }
.opt-inactive { border-color: var(--accent-danger); color: var(--accent-danger); background: rgba(239, 68, 68, 0.05); }
.opt-inactive .led { background: var(--accent-danger); box-shadow: 0 0 10px var(--accent-danger); }

.form-actions { display: flex; justify-content: flex-end; gap: 20px; }

/* Tech ID Card Preview */
.id-card-wrap {
  padding: 24px;
  background: rgba(15, 23, 42, 0.8);
  position: sticky;
  top: 80px;
}

.card-inner {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 12px;
}

.card-node { width: 12px; height: 12px; background: var(--accent-primary); clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%); }

.card-body { display: flex; gap: 32px; align-items: flex-start; }

.avatar-box {
  width: 120px;
  height: 140px;
  background: rgba(0, 242, 254, 0.05);
  border: 1px solid var(--accent-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.avatar-box .initials { font-size: 3rem; color: var(--accent-primary); opacity: 0.5; }

.upload-hint {
  position: absolute;
  bottom: 0px;
  width: 100%;
  background: rgba(0, 242, 254, 0.2);
  color: var(--accent-primary);
  text-align: center;
  padding: 4px 0;
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none;
}

.avatar-box:hover .upload-hint { opacity: 1; }

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.8;
}

.clickable { cursor: pointer; }
.hidden-input { display: none; }

@keyframes scan-vertical {
  0% { transform: translateY(0); }
  100% { transform: translateY(140px); }
}

.card-info { flex: 1; display: flex; flex-direction: column; gap: 20px; }
.info-group .i-label { font-size: 0.5rem; color: var(--text-muted); letter-spacing: 1px; margin-bottom: 4px; display: block; }
.info-group .i-value { font-size: 1.1rem; color: var(--text-primary); font-weight: 800; }
.info-row { display: flex; gap: 24px; }

.card-footer {
  margin-top: 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.barcode {
  width: 100px;
  height: 32px;
  background-image: repeating-linear-gradient(90deg, var(--text-muted) 0, var(--text-muted) 1px, transparent 1px, transparent 3px);
  opacity: 0.3;
}

.stamp { font-size: 0.6rem; color: var(--text-muted); transform: rotate(-5deg); border: 1px solid; padding: 2px 6px; }

.text-success { color: var(--accent-success); }
.text-danger { color: var(--accent-danger); }
.uppercase { text-transform: uppercase; }
.mt-32 { margin-top: 32px; }
.pt-32 { padding-top: 32px; }
.mb-24 { margin-bottom: 24px; }
.border-top-subtle { border-top: 1px solid rgba(255, 255, 255, 0.05); }
</style>
