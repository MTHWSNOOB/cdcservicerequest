<template>
  <aside class="sidebar" :class="{ 'collapsed': isCollapsed, 'mobile-open': isMobileOpen }">
     <button v-if="isMobileOpen" class="close-mobile-btn" @click="$emit('close-mobile')">×</button>
    <div class="logo-area">
      <div class="logo-container">
        <img src="/icon.png" alt="CDH Logo" class="system-logo-sidebar" />
      </div>
      <span v-if="!isCollapsed" class="logo-text font-display">CDH</span>
    </div>

    <nav class="nav-links">
      <router-link to="/dashboard" class="nav-item" active-class="active">
        <LayoutDashboard class="icon" :size="20" />
        <span v-if="!isCollapsed" class="label">Dashboard</span>
        <div class="active-line"></div>
      </router-link>
      

      <router-link to="/requests" class="nav-item" active-class="active">
        <FileText class="icon" :size="20" />
        <span v-if="!isCollapsed" class="label">Service Requests</span>
        <div class="active-line"></div>
      </router-link>

      <template v-if="authStore.isAdminOrTechnical">
        <div v-if="!isCollapsed" class="nav-label">Management</div>
        <div v-else class="nav-separator"></div>

        <router-link v-if="authStore.isAdmin" to="/users" class="nav-item" active-class="active">
          <Users class="icon" :size="20" />
          <span v-if="!isCollapsed" class="label">Users</span>
          <div class="active-line"></div>
        </router-link>

        <router-link v-if="authStore.isAdmin" to="/settings/departments" class="nav-item" active-class="active">
          <Building2 class="icon" :size="20" />
          <span v-if="!isCollapsed" class="label">Departments</span>
          <div class="active-line"></div>
        </router-link>

        <router-link v-if="authStore.isAdmin" to="/settings/sections" class="nav-item" active-class="active">
          <Network class="icon" :size="20" />
          <span v-if="!isCollapsed" class="label">Sections</span>
          <div class="active-line"></div>
        </router-link>

        <router-link v-if="authStore.isAdmin" to="/settings/request-types" class="nav-item" active-class="active">
          <Tags class="icon" :size="20" />
          <span v-if="!isCollapsed" class="label">Request Types</span>
          <div class="active-line"></div>
        </router-link>

        <router-link v-if="authStore.isAdminOrTechnical" to="/settings/ratings" class="nav-item" active-class="active">
          <Star class="icon" :size="20" />
          <span v-if="!isCollapsed" class="label">Rating Reports</span>
          <div class="active-line"></div>
        </router-link>
      </template>
    </nav>

    <div class="sidebar-footer">
      <div class="user-profile-mini">
        <div class="avatar-box">
          {{ authStore.user?.name?.substring(0, 2).toUpperCase() || '??' }}
        </div>
        <div v-if="!isCollapsed" class="user-info">
          <p class="user-name">{{ authStore.user?.name || 'Unknown' }}</p>
          <p class="user-role font-mono">{{ authStore.user?.role || 'Guest' }}</p>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { useAuthStore } from '../stores/authStore'
import { LayoutDashboard, Users, FileText, Building2, Network, Tags, Star } from 'lucide-vue-next'

defineProps({
  isCollapsed: Boolean,
  isMobileOpen: Boolean
})

defineEmits(['toggle', 'close-mobile'])

const authStore = useAuthStore()
</script>

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: var(--sidebar-width);
  height: 100vh;
  z-index: var(--z-sidebar);
  display: flex;
  flex-direction: column;
  transition: width var(--transition);
  background: var(--bg-sidebar);
  border-right: 1px solid rgba(255, 255, 255, 0.03);
  box-shadow: 10px 0 30px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    width: 280px !important;
    transition: transform var(--transition);
    background: #020617;
  }

  .sidebar.mobile-open {
    transform: translateX(0);
    box-shadow: 20px 0 50px rgba(0, 0, 0, 0.5);
  }

  .close-mobile-btn {
    position: absolute;
    right: 12px;
    top: 12px;
    background: rgba(244, 63, 94, 0.1);
    border: 1px solid rgba(244, 63, 94, 0.2);
    color: var(--accent-danger);
    font-size: 1.2rem;
    z-index: 100;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    backdrop-filter: blur(10px);
  }
}

.sidebar.collapsed {
  width: var(--sidebar-collapsed);
}

.logo-area {
  padding: 0 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  height: var(--topbar-height);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.logo-container {
  width: 54px;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.system-logo-sidebar {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 0 8px var(--accent-primary-glow));
}

.logo-text {
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--text-primary);
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
}

.nav-links {
  padding: 32px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 10px 14px;
  border-radius: 999px; /* Pill */
  color: var(--text-secondary);
  transition: all 0.2s ease;
  position: relative;
  white-space: nowrap;
  font-weight: 500;
}

.nav-item .icon {
  font-size: 1rem;
  width: 20px;
  display: flex;
  justify-content: center;
  margin-right: 12px;
  opacity: 0.6;
}

.collapsed .nav-item .icon {
  margin-right: 0;
}

.nav-item .label {
  font-size: 0.85rem;
  letter-spacing: 0.2px;
  font-family: var(--font-body); /* Switch from mono to clean body font */
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
  transform: translateX(4px);
}

.nav-item.active {
  background: rgba(139, 92, 246, 0.15); /* Soft Violet */
  color: var(--text-primary);
}

.active-line {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 60%;
  width: 3px;
  border-radius: 0 4px 4px 0;
  background: var(--accent-primary);
  box-shadow: 0 0 10px var(--accent-primary-glow);
  opacity: 0;
  transition: opacity 0.3s;
}

.nav-item.active .active-line {
  opacity: 1; /* Keep the gentle active indicator */
}

.nav-separator {
  height: 1px;
  background: rgba(255, 255, 255, 0.05);
  margin: 16px 20px;
}

.nav-label {
  padding: 24px 16px 8px;
  font-size: 0.6rem;
  font-weight: 900;
  color: var(--text-muted);
  letter-spacing: 2px;
  text-transform: uppercase;
}

.sidebar-footer {
  padding: 24px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.03);
  background: rgba(0, 0, 0, 0.1);
}

.user-profile-mini {
  display: flex;
  align-items: center;
  gap: 14px;
}

.avatar-box {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(6, 182, 212, 0.2));
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%; /* Soft circular */
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-primary);
  box-shadow: inset 0 2px 4px rgba(255,255,255,0.05);
}

.user-info .user-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
}

.user-info .user-role {
  font-size: 0.7rem;
  color: var(--text-secondary);
  font-weight: 500;
}
</style>
