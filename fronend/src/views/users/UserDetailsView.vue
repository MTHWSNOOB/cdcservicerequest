<template>
  <div v-if="user" class="user-details-view animate-float-in">
    <header class="view-header">
      <router-link to="/users" class="back-link font-mono flex items-center gap-8">
        <ArrowLeft :size="14" /> Back to Users
      </router-link>
      <div class="header-actions">
        <h1 class="font-display text-primary-glow">User Profile: {{ user.name.split(' ')[0] }}</h1>
        <router-link :to="'/users/' + user.id + '/edit'" class="action-btn-tech">
          Edit Profile
        </router-link>
      </div>
    </header>

    <div class="details-grid">
      <!-- Left Column: Primary Profile -->
      <div class="profile-main-card glass-panel flex-col align-center">
        <div class="avatar-scanned">
          <div class="scan-line"></div>
          <div class="avatar-inner font-display">
            {{ user.name[0] }}
          </div>
          <div class="corner-accents">
            <span></span><span></span><span></span><span></span>
          </div>
        </div>
        
        <h2 class="user-name mt-24 font-display">{{ user.name }}</h2>
        <p class="user-serial text-muted font-mono">SERIAL_UID: #{{ String(user.id).substring(0,8).toUpperCase() }}</p>
        
        <div class="status-hardware" :class="user.status.toLowerCase()">
          <span class="led"></span>
          <span class="label font-mono">{{ user.status.toUpperCase() }}</span>
        </div>

        <div class="info-block w-100 mt-40">
          <div class="info-row">
            <span class="i-label font-mono">Role</span>
            <span class="i-value font-mono text-secondary">{{ user.role.toUpperCase() }}</span>
          </div>
          <div class="info-row">
            <span class="i-label font-mono">Email</span>
            <span class="i-value font-mono fs-07">{{ user.email }}</span>
          </div>
          <div class="info-row">
            <span class="i-label font-mono">Section</span>
            <span class="i-value font-mono">{{ user.section?.name.toUpperCase() || 'UNMAPPED' }}</span>
          </div>
        </div>
      </div>

      <!-- Right Column: Telemetry & History -->
      <div class="profile-details flex-col gap-24">
        <!-- System Activity Graph -->
        <div class="telemetry-card glass-panel">
          <div class="t-header">
            <h3 class="font-display text-secondary mb-20 uppercase fs-08">Activity</h3>
            <span class="live-pulse font-mono fs-06">SYNC_OK</span>
          </div>
          <div class="telemetry-visual">
            <div v-for="h in 24" :key="h" class="visual-bar-wrap">
              <div 
                class="visual-bar" 
                :style="{ height: (Math.random() * 70 + 10) + '%', animationDelay: (h * 0.05) + 's' }"
              ></div>
            </div>
          </div>
          <div class="telemetry-footer">
            <div class="f-stat"><span class="fs-label">EFFICIENCY</span><span class="fs-val font-mono">98.4%</span></div>
            <div class="f-stat"><span class="fs-label">UPTIME</span><span class="fs-val font-mono">1,412H</span></div>
            <div class="f-stat"><span class="fs-label">LOAD</span><span class="fs-val font-mono">LOW</span></div>
          </div>
        </div>

        <!-- Clearance Status -->
        <div class="clearance-card glass-panel">
          <h3 class="font-display text-muted mb-24 uppercase fs-08">Access Permissions</h3>
          <div class="clearance-grid">
            <div class="clearance-item active">
              <div class="c-node"></div>
              <span class="c-label font-mono">INFRA_ACCESS</span>
            </div>
            <div class="clearance-item active">
              <div class="c-node"></div>
              <span class="c-label font-mono">SECURITY_FED</span>
            </div>
            <div class="clearance-item active">
              <div class="c-node"></div>
              <span class="c-label font-mono">REGISTRY_RW</span>
            </div>
            <div class="clearance-item" :class="{ 'active': user.role === 'ADMIN' }">
              <div class="c-node"></div>
              <span class="c-label font-mono">ROOT_LEVEL</span>
            </div>
          </div>
        </div>

        <!-- Terminal Output -->
        <div class="terminal-card glass-panel">
          <div class="terminal-header">
            <div class="term-dots"><span></span><span></span><span></span></div>
            <span class="term-title font-mono">STATION_DIAGNOSTIC_UPLINK</span>
          </div>
          <div class="terminal-content font-mono">
            <p class="term-prompt">> station.query(node_id: {{ user.id.substring(0,8) }})</p>
            <p class="term-msg">NODE_CONNECTED: {{ user.name.toUpperCase() }}</p>
            <p class="term-prompt">> current.state()</p>
            <p class="term-msg">OPERATIONAL_LEVEL: NOMINAL ({{ user.status }})</p>
            <p class="term-prompt">> integrity.verify()</p>
            <p class="term-msg">DATA_CONSISTENCY: 100% SECURE</p>
            <p class="term-cursor">_</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="not-found animate-float-in">
    <AlertCircle class="error-node" :size="64" />
    <h1 class="font-display text-secondary-glow">User Not Found</h1>
    <p class="text-secondary font-mono fs-08 mt-12">The requested user profile does not exist.</p>
    <router-link to="/users" class="btn-primary mt-32">Back to Users</router-link>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '../../stores/userStore'
import { ArrowLeft, AlertCircle } from 'lucide-vue-next'

const props = defineProps({
  id: String
})

const userStore = useUserStore()
const user = computed(() => userStore.getUserById(props.id))
</script>

<style scoped>
.user-details-view { display: flex; flex-direction: column; gap: 32px; }

.back-link { font-size: 0.65rem; font-weight: 800; color: var(--text-muted); text-decoration: none; margin-bottom: 24px; display: inline-flex; align-items: center; gap: 6px;}
.back-link:hover { color: var(--accent-primary); }

.header-actions { display: flex; justify-content: space-between; align-items: center; }
.header-actions h1 { font-size: 2.22rem; letter-spacing: -1px; }

.action-btn-tech {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
  padding: 12px 24px;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn-tech:hover {
  background: var(--accent-primary-glow);
  color: var(--accent-primary);
  border-color: var(--accent-primary);
  box-shadow: 0 0 15px var(--accent-primary-glow);
}

.details-grid { display: grid; grid-template-columns: 340px 1fr; gap: 40px; }
@media (max-width: 1200px) { .details-grid { grid-template-columns: 1fr; } }

.profile-main-card { padding: 48px 32px; text-align: center; }

.avatar-scanned {
  position: relative;
  width: 160px;
  height: 160px;
  background: rgba(0, 242, 254, 0.05);
  border: 1px solid rgba(0, 242, 254, 0.2);
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-inner { font-size: 4rem; color: var(--accent-primary); opacity: 0.6; }

.scan-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--accent-primary);
  box-shadow: 0 0 15px var(--accent-primary);
  animation: scan-vertical 3s infinite linear;
  z-index: 2;
}

@keyframes scan-vertical {
  0% { transform: translateY(0); }
  100% { transform: translateY(160px); }
}

.corner-accents span {
  position: absolute;
  width: 10px;
  height: 10px;
  border: 2px solid var(--accent-primary);
}
.corner-accents span:nth-child(1) { top: -2px; left: -2px; border-right: 0; border-bottom: 0; }
.corner-accents span:nth-child(2) { top: -2px; right: -2px; border-left: 0; border-bottom: 0; }
.corner-accents span:nth-child(3) { bottom: -2px; left: -2px; border-right: 0; border-top: 0; }
.corner-accents span:nth-child(4) { bottom: -2px; right: -2px; border-left: 0; border-top: 0; }

.user-name { font-size: 2rem; letter-spacing: -1px; }
.user-serial { font-size: 0.7rem; letter-spacing: 1px; margin-top: 8px; }

.status-hardware {
  margin: 24px auto 0;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.status-hardware .led { width: 8px; height: 8px; border-radius: 50%; background: #334155; }
.active .led { background: var(--accent-success); box-shadow: 0 0 10px var(--accent-success); }
.inactive .led { background: var(--accent-danger); box-shadow: 0 0 10px var(--accent-danger); }
.status-hardware .label { font-size: 0.65rem; font-weight: 800; letter-spacing: 1px; }

.info-block { display: flex; flex-direction: column; gap: 20px; text-align: left; }
.info-row { display: flex; justify-content: space-between; padding-bottom: 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
.i-label { font-size: 0.55rem; color: var(--text-muted); letter-spacing: 1px; }
.i-value { font-size: 0.85rem; color: var(--text-primary); font-weight: 700; }

.telemetry-card { padding: 32px; }
.t-header { display: flex; justify-content: space-between; align-items: flex-start; }
.live-pulse { color: var(--accent-success); display: flex; align-items: center; gap: 8px; }
.live-pulse::before { content: ''; width: 6px; height: 6px; background: var(--accent-success); border-radius: 50%; animation: pulse-green 1.5s infinite; }

@keyframes pulse-green { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(2.5); opacity: 0; } }

.telemetry-visual {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  height: 120px;
  margin-top: 24px;
}

.visual-bar-wrap { flex: 1; }
.visual-bar {
  width: 100%;
  background: var(--accent-primary);
  opacity: 0.3;
  animation: bar-osc 1s ease-in-out infinite alternate;
}

@keyframes bar-osc { from { transform: scaleY(1); } to { transform: scaleY(0.6); } }

.telemetry-footer { display: flex; gap: 40px; margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(255, 255, 255, 0.05); }
.f-stat { display: flex; flex-direction: column; gap: 4px; }
.fs-label { font-size: 0.5rem; color: var(--text-muted); letter-spacing: 1.5px; }
.fs-val { font-size: 1rem; color: var(--text-primary); font-weight: 800; }

.clearance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.clearance-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  opacity: 0.4;
}

.clearance-item.active { opacity: 1; border-color: var(--accent-primary); background: rgba(0, 242, 254, 0.05); }
.c-node { width: 8px; height: 8px; background: rgba(255, 255, 255, 0.2); transform: rotate(45deg); }
.active .c-node { background: var(--accent-primary); box-shadow: 0 0 10px var(--accent-primary); }
.c-label { font-size: 0.65rem; font-weight: 800; color: var(--text-muted); }
.active .c-label { color: var(--text-primary); }

.terminal-card { padding: 32px; background: rgba(15, 23, 42, 0.6); }
.term-dots { display: flex; gap: 6px; }
.term-dots span { width: 8px; height: 8px; border-radius: 50%; opacity: 0.5; }
.term-dots span:nth-child(1) { background: #ef4444; }
.term-dots span:nth-child(2) { background: #f59e0b; }
.term-dots span:nth-child(3) { background: #10b981; }
.term-title { font-size: 0.6rem; color: var(--text-muted); margin-left: auto; }

.terminal-content { margin-top: 24px; font-size: 0.75rem; line-height: 1.8; }
.term-prompt { color: var(--accent-primary); opacity: 0.6; }
.term-msg { color: var(--text-secondary); padding-left: 20px; }
.term-cursor { animation: blink 1s step-end infinite; color: var(--accent-primary); }

@keyframes blink { 50% { opacity: 0; } }

.not-found { height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.error-node { color: var(--accent-danger); transform: skewX(-10deg); margin-bottom: 24px; }
</style>
