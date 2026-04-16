<template>
  <div class="admin-view animate-float-in">
    <header class="view-header">
      <div class="header-main">
        <h1 class="font-display text-primary-glow" style="word-break: break-all;">Notifications</h1>
        <p class="text-secondary fs-08" style="word-break: break-all;">Manage alert tones and notification behaviors.</p>
      </div>
    </header>

    <div class="hud-table-container glass-panel p-24">
      <h3 class="text-secondary mb-24 fs-08 fw-600 uppercase" style="letter-spacing: 1px;">Alert Tone Configuration</h3>
      
      <div class="tone-list">
        <label 
          class="tone-card" 
          :class="{ active: settingsStore.notificationTone === 'sci-fi' }"
          @click="selectTone('sci-fi')"
        >
          <div class="tone-details">
            <Radio class="icon" :size="24" />
            <div class="info">
              <span class="fs-09 fw-600 block mb-4">Sci-Fi Chirp</span>
              <span class="text-secondary fs-08">Default CAD Terminal Alert</span>
            </div>
          </div>
          <div class="tone-radio">
            <div class="radio-ui"></div>
          </div>
        </label>

        <label 
          class="tone-card" 
          :class="{ active: settingsStore.notificationTone === 'classic' }"
          @click="selectTone('classic')"
        >
          <div class="tone-details">
            <Speaker class="icon" :size="24" />
            <div class="info">
              <span class="fs-09 fw-600 block mb-4">Classic Ping</span>
              <span class="text-secondary fs-08">Subtle Triangle Wave</span>
            </div>
          </div>
          <div class="tone-radio">
            <div class="radio-ui"></div>
          </div>
        </label>

        <label 
          class="tone-card" 
          :class="{ active: settingsStore.notificationTone === 'deep' }"
          @click="selectTone('deep')"
        >
          <div class="tone-details">
            <Waves class="icon" :size="24" />
            <div class="info">
              <span class="fs-09 fw-600 block mb-4">Deep Gong</span>
              <span class="text-secondary fs-08">Low-Frequency Sawtooth</span>
            </div>
          </div>
          <div class="tone-radio">
            <div class="radio-ui"></div>
          </div>
        </label>

        <label 
          class="tone-card" 
          :class="{ active: settingsStore.notificationTone === 'none' }"
          @click="settingsStore.notificationTone = 'none'"
        >
          <div class="tone-details">
            <BellOff class="icon text-danger" :size="24" />
            <div class="info">
              <span class="fs-09 fw-600 block mb-4 text-danger">Silent (Muted)</span>
              <span class="text-secondary fs-08">Visual alerts only</span>
            </div>
          </div>
          <div class="tone-radio">
            <div class="radio-ui"></div>
          </div>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useSettingsStore } from '../../stores/settingsStore'
import { Radio, Speaker, Waves, BellOff } from 'lucide-vue-next'

const settingsStore = useSettingsStore()

const selectTone = (tone) => {
  settingsStore.notificationTone = tone
  settingsStore.playTone(tone)
}
</script>

<style scoped>
.mb-4 { margin-bottom: 4px; }
.mb-24 { margin-bottom: 24px; }
.p-24 { padding: 24px; }
.block { display: block; }
.fs-08 { font-size: 0.8rem; }
.fs-06 { font-size: 0.6rem; }
.font-bold { font-weight: bold; }

.tone-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 500px;
}

.tone-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(10px);
}

.tone-card:hover {
  background: rgba(139, 92, 246, 0.05);
  border-color: rgba(139, 92, 246, 0.2);
}

.tone-card.active {
  background: rgba(139, 92, 246, 0.1);
  border-color: var(--accent-primary);
  box-shadow: 0 0 10px rgba(139, 92, 246, 0.15);
}

.tone-details {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.tone-details .icon {
  font-size: 1.5rem;
  color: var(--accent-primary);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: rgba(139, 92, 246, 0.1);
}

.tone-radio .radio-ui {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.tone-card.active .radio-ui {
  border-color: var(--accent-primary);
}

.tone-card.active .radio-ui::after {
  content: '';
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--accent-primary);
  box-shadow: 0 0 8px var(--accent-primary-glow);
}
</style>
