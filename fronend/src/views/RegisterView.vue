<template>
  <div class="login-view">
    <ParticleBackground />

    <div class="login-container glass-panel animate-float-in">
      <div class="login-header">
        <div class="logo-area">
          <svg fill="currentColor" viewBox="0 0 24 24" width="48" height="48" style="color: var(--accent-primary);"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          <h1 class="font-display text-primary-glow">Central Data</h1>
        </div>
        <p class="text-secondary fs-08">New Account Registration</p>
      </div>

      <form @submit.prevent="handleRegister" class="login-form">
        <div class="form-group">
          <label>Full Name</label>
          <div class="input-wrapper">
            <User class="icon" :size="20" />
            <input v-model="name" type="text" placeholder="Juan Dela Cruz" required :disabled="loading" />
          </div>
        </div>

        <div class="form-group">
          <label>Email Address</label>
          <div class="input-wrapper">
            <Mail class="icon" :size="20" />
            <input v-model="email" type="email" placeholder="example@domain.com" required :disabled="loading" />
          </div>
        </div>

        <div class="form-group">
          <label>Password (Min 6 Chars)</label>
          <div class="input-wrapper">
            <Key class="icon" :size="20" />
            <input v-model="password" type="password" placeholder="••••••••" required minlength="6" :disabled="loading" />
          </div>
        </div>

        <div class="form-group">
          <label>Confirm Password</label>
          <div class="input-wrapper">
            <Key class="icon" :size="20" />
            <input v-model="confirmPassword" type="password" placeholder="••••••••" required :disabled="loading" />
          </div>
        </div>

        <div v-if="error" class="error-msg">
          <AlertCircle class="icon-node" :size="18" />
          <span class="text fw-500">{{ error }}</span>
        </div>

        <button type="submit" class="btn-primary login-btn" :disabled="loading">
          <span v-if="!loading">Create Account</span>
          <span v-else>Processing...</span>
        </button>
      </form>

      <div class="login-footer">
        <router-link to="/login" class="back-link">↞ Back to Login</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import ParticleBackground from '../components/ParticleBackground.vue'
import { User, Mail, Key, AlertCircle } from 'lucide-vue-next'

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const loading = ref(false)
const router = useRouter()
const authStore = useAuthStore()

const handleRegister = async () => {
  error.value = ''
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match.'
    return
  }
  loading.value = true
  try {
    await authStore.register(name.value, email.value, password.value)
    router.push('/dashboard')
  } catch (err) {
    error.value = err.response?.data?.error || 'Registration Failed'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: var(--bg-deep);
}
.login-container { 
  width: 90%; 
  max-width: 440px; 
  padding: 48px 32px; 
  position: relative; 
  background: rgba(10, 15, 25, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-xl);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
}
.login-header { 
  text-align: center; 
  margin-bottom: 32px; 
  width: 100%;
}
.login-header p {
  word-break: break-all;
  line-height: 1.4;
  letter-spacing: 1px;
}
.logo-area { display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 12px; }
.system-icon-main {
  width: 48px;
  height: 48px;
  object-fit: contain;
  filter: drop-shadow(0 0 10px var(--accent-primary-glow));
}
.login-form { display: flex; flex-direction: column; gap: 20px; }
.form-group { display: flex; flex-direction: column; gap: 8px; text-align: left; }
.form-group label { font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); }
.input-wrapper { position: relative; display: flex; align-items: center; }
.input-wrapper .icon { 
  position: absolute; 
  left: 16px; 
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  filter: none;
  color: var(--text-muted);
}
.input-wrapper input { 
  width: 100%; 
  padding: 14px 16px 14px 44px; 
  background: rgba(0,0,0,0.2); 
  border: 1px solid rgba(255,255,255,0.08); 
  color: var(--text-primary); 
  border-radius: var(--radius-md); 
  transition: all 0.3s; 
  font-family: var(--font-body);
  font-size: 0.95rem;
}
.input-wrapper input:focus { 
  border-color: rgba(139, 92, 246, 0.5); 
  background: rgba(0,0,0,0.3); 
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15); 
  outline: none; 
}
.login-btn { margin-top: 8px; height: 48px; font-size: 0.95rem; font-weight: 600; border-radius: 999px; }
.error-msg { background: rgba(244, 63, 94, 0.1); border-left: 3px solid var(--accent-danger); border-radius: 0 var(--radius-md) var(--radius-md) 0; padding: 12px 16px; display: flex; align-items: center; gap: 12px; font-size: 0.85rem; color: var(--accent-danger); text-align: left; }
.error-msg .icon-node { color: var(--accent-danger); }
.login-footer { margin-top: 32px; text-align: center; }
.back-link { color: var(--text-secondary); font-size: 0.85rem; font-weight: 500; font-family: var(--font-body); transition: 0.2s all; }
.back-link:hover { color: var(--text-primary); text-shadow: none; }
@media (max-width: 480px) {
  .login-container { padding: 24px 20px; }
}
</style>
