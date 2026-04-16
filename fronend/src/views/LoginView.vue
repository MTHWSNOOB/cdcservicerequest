<template>
  <div class="login-page">
    <!-- Particle Background -->
    <ParticleBackground />

    <div class="login-card glass-panel animate-float-in">
      <div class="card-header">
        <div class="station-logo">
          <img src="/icon.png" alt="CDH Logo" class="system-icon-main" />
        </div>
        <h1 class="font-display text-primary-glow">CDH</h1>
        <p class="text-secondary fs-08">Service Request System</p>
      </div>

      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="input-unit">
          <label>Email</label>
          <div class="input-dock">
            <Mail class="dock-icon" :size="20" />
            <input 
              v-model="email" 
              type="email" 
              placeholder="Enter your email" 
              required 
              :disabled="authStore.isAuthenticating"
              class="cad-input"
            />
          </div>
        </div>

        <div class="input-unit">
          <label>Password</label>
          <div class="input-dock">
            <Key class="dock-icon" :size="20" />
            <input 
              v-model="password" 
              type="password" 
              placeholder="Enter your password" 
              required 
              :disabled="authStore.isAuthenticating"
              class="cad-input"
            />
          </div>
        </div>

        <div v-if="error" class="sys-error">
          <AlertCircle class="err-node" :size="18" />
          <span class="err-msg fw-500">{{ error }}</span>
        </div>

        <button 
          type="submit" 
          class="btn-primary auth-btn" 
          :disabled="authStore.isAuthenticating"
        >
          <span v-if="!authStore.isAuthenticating">Sign In / Register</span>
          <span v-else class="linking">Processing...</span>
        </button>
      </form>
    </div>
    <!-- Interface Decorators -->
    <div class="ui-decorators opacity-30">
      <div class="glass-orb orb-1"></div>
      <div class="glass-orb orb-2"></div>
    </div>

    <!-- Registration Prompt -->
    <div v-if="showRegisterPrompt" class="security-barrier animate-float-in" style="z-index: 10;">
      <div class="barrier-content glass-panel" style="max-width: 360px; text-align: center; border-radius: var(--radius-lg);">
        <div class="barrier-header mb-16">
          <h3 class="font-display text-primary-glow">Account Not Found</h3>
        </div>
        <div class="barrier-body mb-24">
          <p class="fs-09 text-secondary">
            This email is not registered. Do you want to create a new profile for 
            <strong class="text-primary fw-600">{{ email }}</strong>?
          </p>
        </div>
        <div class="barrier-footer" style="display: flex; gap: 8px; justify-content: center;">
          <button class="node-btn" @click="showRegisterPrompt = false" :disabled="authStore.isAuthenticating" style="flex: 1;">Cancel</button>
          <button class="btn-primary" @click="confirmRegistration" :disabled="authStore.isAuthenticating" style="flex: 1;">
            <span v-if="!authStore.isAuthenticating">Register</span>
            <span v-else>Registering...</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useToastStore } from '../stores/toastStore'
import ParticleBackground from '../components/ParticleBackground.vue'
import { Mail, Key, AlertCircle } from 'lucide-vue-next'

const email = ref('')
const password = ref('')
const error = ref('')
const showRegisterPrompt = ref(false)
const router = useRouter()
const authStore = useAuthStore()
const toastStore = useToastStore()

const handleLogin = async () => {
  error.value = ''
  try {
    await authStore.login(email.value, password.value)
    toastStore.success(`Welcome back, ${authStore.user?.name}`)
    router.push('/dashboard')
  } catch (err) {
    if (err.response?.data?.error === 'USER_NOT_FOUND') {
      showRegisterPrompt.value = true
    } else {
      const errMsg = err.response?.data?.error || 'Authentication Failed'
      error.value = errMsg
      toastStore.error(`Error: ${errMsg}`)
    }
  }
}

const confirmRegistration = async () => {
  error.value = ''
  try {
    const defaultName = email.value.split('@')[0]
    await authStore.register(defaultName, email.value, password.value)
    showRegisterPrompt.value = false
    toastStore.success(`Account created for ${authStore.user?.name}`)
    router.push('/dashboard')
  } catch (err) {
    showRegisterPrompt.value = false
    const errMsg = err.response?.data?.error || 'Invalid Registration Data'
    error.value = errMsg
    toastStore.error(`Error: ${errMsg}`)
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-deep);
  position: relative;
  overflow: hidden;
}

.login-card {
  width: 90%;
  max-width: 400px;
  padding: 48px 32px;
  background: rgba(10, 15, 25, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-xl);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.05);
  text-align: center;
  z-index: 1;
  backdrop-filter: blur(20px);
}

.card-header { margin-bottom: 24px; }

.station-logo { width: 96px; height: 96px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; }
.system-icon-main {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 0 10px var(--accent-primary-glow));
}

.auth-form { display: flex; flex-direction: column; gap: 20px; }

.input-unit { text-align: left; }
.input-unit label { font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px; display: block; }

.input-dock { position: relative; display: flex; align-items: center; }
.dock-icon { position: absolute; left: 16px; color: var(--text-muted); font-size: 1.1rem; }

.input-dock input {
  width: 100%;
  padding: 14px 16px 14px 44px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: 0.95rem;
  outline: none;
  border-radius: var(--radius-md);
  transition: all 0.2s;
}

.input-dock input:focus { border-color: rgba(139, 92, 246, 0.5); box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15); }

.auth-btn { height: 48px; font-size: 0.95rem; font-weight: 600; margin-top: 8px; border-radius: 999px; }

.sys-error {
  padding: 12px 16px;
  background: rgba(244, 63, 94, 0.1);
  border-left: 3px solid var(--accent-danger);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
}

.err-node { color: var(--accent-danger); }
.err-msg { font-size: 0.85rem; color: var(--accent-danger); }

.toggle-mode { margin-top: 16px; text-align: center; }
.toggle-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 0.65rem;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.2s;
}
.toggle-btn:hover {
  color: var(--accent-primary);
  text-shadow: 0 0 10px var(--accent-primary-glow);
}

.ui-decorators .glass-orb { position: absolute; border-radius: 50%; filter: blur(60px); z-index: 0; }
.orb-1 { width: 300px; height: 300px; background: rgba(139, 92, 246, 0.2); top: -100px; left: -100px; }
.orb-2 { width: 250px; height: 250px; background: rgba(0, 242, 254, 0.15); bottom: -50px; right: -50px; }

/* Security Overlay */
.security-barrier {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(10, 15, 25, 0.6);
  backdrop-filter: blur(8px);
}

.barrier-content {
  padding: 40px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  border-radius: var(--radius-lg);
}
</style>
