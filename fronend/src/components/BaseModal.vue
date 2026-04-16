<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-container glass-panel" :class="size">
          <div class="modal-header">
            <slot name="header">
              <h3 class="font-display text-primary-glow">System Modal</h3>
            </slot>
            <button class="close-btn font-mono" @click="$emit('close')"><X :size="20" /></button>
          </div>
          
          <div class="modal-body custom-scrollbar">
            <slot></slot>
          </div>
          
          <div class="modal-footer" v-if="$slots.footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { X } from 'lucide-vue-next'
defineProps({
  show: Boolean,
  size: {
    type: String,
    default: 'md' // sm, md, lg
  }
})

defineEmits(['close'])
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.85);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 24px;
}

.modal-container {
  position: relative;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-panel);
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  border: var(--border-subtle);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  overflow: visible;
  animation: modal-init 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes modal-init {
  from { transform: translateY(20px) scale(0.98); opacity: 0; }
  to { transform: translateY(0) scale(1); opacity: 1; }
}

.modal-container.sm { max-width: 440px; }
.modal-container.md { max-width: 680px; }
.modal-container.lg { max-width: 1000px; }

.modal-header {
  padding: 24px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
  letter-spacing: 0px;
  font-weight: 600;
}

.close-btn {
  background: transparent;
  color: var(--text-secondary);
  font-size: 1.2rem;
  transition: all 0.2s;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: none;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-primary);
}

.modal-body {
  padding: 32px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 20px 32px;
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(0, 0, 0, 0.2);
}



/* Transitions */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
