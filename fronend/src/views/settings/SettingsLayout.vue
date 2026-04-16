<template>
  <div class="settings-layout">
    <!-- Header with tabs -->
    <div class="settings-header">
      <h2 class="font-display flex items-center gap-12 fs-12 mb-16 text-primary-glow">
        <Settings class="icon text-primary" :size="24" /> 
        <span class="title">System Settings</span>
      </h2>
      
      <div class="settings-tabs">
        <router-link to="/settings/notifications" class="tab-btn fw-600" active-class="active">
          <Bell class="icon" :size="16" /> Notifications
        </router-link>
        
        <template v-if="authStore.isAdmin">
          <router-link to="/settings/departments" class="tab-btn fw-600" active-class="active">
            <Building2 class="icon" :size="16" /> Departments
          </router-link>
          
          <router-link to="/settings/sections" class="tab-btn fw-600" active-class="active">
            <Waypoints class="icon" :size="16" /> Sections
          </router-link>
          
          <router-link to="/settings/request-types" class="tab-btn fw-600" active-class="active">
            <Tags class="icon" :size="16" /> Request Types
          </router-link>
        </template>
      </div>
    </div>

    <!-- Content Area -->
    <div class="settings-content">
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '../../stores/authStore'
import { Settings, Bell, Building2, Waypoints, Tags } from 'lucide-vue-next'
const authStore = useAuthStore()
</script>

<style scoped>
.settings-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.settings-header {
  padding: 24px 32px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  background: var(--bg-deep);
}

.settings-tabs {
  display: flex;
  gap: 24px;
  margin-top: 16px;
  overflow-x: auto;
}

.tab-btn {
  padding: 12px 16px;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
  white-space: nowrap;
}

.tab-btn:hover {
  color: var(--text-primary);
}

.tab-btn.active {
  color: var(--accent-primary);
  border-bottom: 2px solid var(--accent-primary);
  background: rgba(139, 92, 246, 0.05);
  border-top-left-radius: var(--radius-md);
  border-top-right-radius: var(--radius-md);
}

.settings-content {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
}

.flex { display: flex; }
.items-center { align-items: center; }
.gap-12 { gap: 12px; }
.fs-12 { font-size: 1.2rem; }
.mb-16 { margin-bottom: 16px; }
.tracking-wide { letter-spacing: 2px; }

</style>
