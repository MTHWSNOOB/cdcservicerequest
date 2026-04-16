<template>
  <div class="change-password-view animate-float-in">
    <header class="view-header">
      <div class="header-main">
        <h1 class="font-display text-primary-glow" style="font-size: 1.8rem; margin-bottom: 4px;">Change Password</h1>
        <p class="text-secondary fs-08">Update your secure authentication credentials.</p>
      </div>
    </header>

    <div class="form-container glass-panel">
      <form @submit.prevent="handleChangePassword">
        <div class="form-group mb-24">
          <label>Current Password</label>
          <input v-model="currentPassword" type="password" placeholder="••••••••" required />
        </div>

        <div class="form-group mb-24">
          <label>New Password (Min 6 Chars)</label>
          <input v-model="newPassword" type="password" placeholder="••••••••" required minlength="6" />
        </div>

        <div class="form-group mb-24">
          <label>Confirm New Password</label>
          <input v-model="confirmNewPassword" type="password" placeholder="••••••••" required />
        </div>

        <div v-if="error" class="error-msg mb-24">
          <AlertCircle class="icon-node" :size="18" /> <span class="fw-500">{{ error }}</span>
        </div>

        <div v-if="success" class="success-msg mb-24">
          <CheckCircle class="icon-node" :size="18" /> <span class="fw-500">{{ success }}</span>
        </div>

        <button type="submit" class="btn-primary auth-btn w-100" :disabled="loading">
          {{ loading ? 'Updating...' : 'Update Password' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '../api/axios'
import { AlertCircle, CheckCircle } from 'lucide-vue-next'

const currentPassword = ref('')
const newPassword = ref('')
const confirmNewPassword = ref('')
const error = ref('')
const success = ref('')
const loading = ref(false)

const handleChangePassword = async () => {
  error.value = ''
  success.value = ''

  if (newPassword.value !== confirmNewPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  loading.value = true
  try {
    await api.patch('/auth/change-password', {
      currentPassword: currentPassword.value,
      newPassword: newPassword.value
    })
    success.value = 'Password updated successfully'
    currentPassword.value = ''
    newPassword.value = ''
    confirmNewPassword.value = ''
  } catch (err) {
    error.value = err.response?.data?.error || 'Update Failed'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.change-password-view { display: flex; flex-direction: column; gap: 24px; }
.form-container { padding: 40px; max-width: 500px; border-radius: var(--radius-lg); }
.form-group { display: flex; flex-direction: column; gap: 8px; text-align: left; }
.form-group label { font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); }
.form-group input { padding: 14px 16px; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.08); color: var(--text-primary); border-radius: var(--radius-md); font-family: var(--font-body); font-size: 0.95rem; transition: all 0.2s; }
.form-group input:focus { border-color: rgba(139, 92, 246, 0.5); outline: none; box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15); }
.error-msg { background: rgba(244, 63, 94, 0.1); border-left: 3px solid var(--accent-danger); border-radius: 0 var(--radius-md) var(--radius-md) 0; padding: 12px 16px; font-size: 0.85rem; color: var(--accent-danger); display: flex; align-items: center; gap: 12px; }
.error-msg .icon-node { color: var(--accent-danger); }
.success-msg { background: rgba(16, 185, 129, 0.1); border-left: 3px solid var(--accent-success); border-radius: 0 var(--radius-md) var(--radius-md) 0; padding: 12px 16px; font-size: 0.85rem; color: var(--accent-success); display: flex; align-items: center; gap: 12px; }
.success-msg .icon-node { color: var(--accent-success); }
.w-100 { width: 100%; }
.auth-btn { height: 48px; font-size: 0.95rem; font-weight: 600; margin-top: 8px; border-radius: 999px; }
</style>
