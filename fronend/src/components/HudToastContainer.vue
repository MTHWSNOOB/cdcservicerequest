<template>
  <div class="hud-toast-container">
    <transition-group name="toast-list" tag="div">
      <div 
        v-for="toast in toastStore.toasts" 
        :key="toast.id" 
        class="hud-toast"
        :class="`toast-${toast.type}`"
      >
        <div class="toast-side-node"></div>
        <div class="toast-main">
          <div class="toast-top">
            <div class="t-tag fw-600 flex items-center gap-8">
              <CheckCircle v-if="toast.type === 'success'" :size="14" />
              <AlertCircle v-if="toast.type === 'error'" :size="14" />
              <AlertTriangle v-if="toast.type === 'warning'" :size="14" />
              <Info v-if="toast.type === 'info'" :size="14" />
              <span>{{ toast.type.toUpperCase() }}</span>
            </div>
            <span class="t-id fs-07">#{{ String(toast.id).substring(0,4) }}</span>
          </div>
          <div class="toast-body">{{ toast.message }}</div>
          <div class="toast-timer">
            <div class="timer-fill"></div>
          </div>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { useToastStore } from '../stores/toastStore'
import { CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-vue-next'
const toastStore = useToastStore()
</script>

<style scoped>
.hud-toast-container {
  position: fixed;
  bottom: 40px;
  right: 40px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 16px;
  pointer-events: none;
}

.hud-toast {
  pointer-events: auto;
  background: var(--bg-panel);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: var(--border-base);
  width: 340px;
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-lg); /* Rounded glass toast */
  box-shadow: var(--shadow-lg), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  display: flex;
}

.toast-side-node {
  width: 6px; 
  height: auto;
}

.toast-success { border-left: 2px solid var(--accent-success); }
.toast-success .toast-side-node { background: var(--accent-success); box-shadow: 0 0 15px rgba(16, 185, 129, 0.3); }

.toast-error { border-left: 2px solid var(--accent-danger); }
.toast-error .toast-side-node { background: var(--accent-danger); box-shadow: 0 0 15px rgba(244, 63, 94, 0.3); }

.toast-warning { border-left: 2px solid var(--accent-warning); }
.toast-warning .toast-side-node { background: var(--accent-warning); box-shadow: 0 0 15px rgba(245, 158, 11, 0.3); }

.toast-info { border-left: 2px solid var(--accent-primary); }
.toast-info .toast-side-node { background: var(--accent-primary); box-shadow: 0 0 15px rgba(139, 92, 246, 0.3); }

.toast-main {
  flex: 1;
  padding: 16px 20px;
}

.toast-top {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.t-tag {
  font-size: 0.7rem;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
}

.toast-success .t-tag { color: var(--accent-success); }
.toast-error .t-tag { color: var(--accent-danger); }
.toast-warning .t-tag { color: var(--accent-warning); }
.toast-info .t-tag { color: var(--accent-primary); }

.t-id { font-size: 0.6rem; color: var(--text-muted); }

.toast-body {
  font-size: 0.9rem;
  color: var(--text-primary);
  font-weight: 400;
  line-height: 1.4;
}

.toast-timer {
  height: 2px;
  background: rgba(255, 255, 255, 0.05);
  margin-top: 12px;
}

.timer-fill {
  height: 100%;
  width: 100%;
  animation: toast-drain 4s linear forwards;
}

.toast-success .timer-fill { background: var(--accent-success); }
.toast-error .timer-fill { background: var(--accent-danger); }
.toast-warning .timer-fill { background: var(--accent-warning); }
.toast-info .timer-fill { background: var(--accent-primary); }

@keyframes toast-drain {
  from { width: 100%; }
  to { width: 0%; }
}

/* Vue Transitions */
.toast-list-enter-active,
.toast-list-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-list-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95); /* Softer float up */
}

.toast-list-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95); /* Float out */
}
</style>
