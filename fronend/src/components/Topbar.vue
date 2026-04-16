<template>
  <header class="topbar">
    <div class="left-section">
      <button class="toggle-btn" @click="handleToggle">
        <Menu :size="20" class="hamburger-icon" />
      </button>
      <div class="breadcrumbs">
        <span class="crumb node-text font-display" style="font-size: 1.1rem; color: var(--text-primary); letter-spacing: 0.5px; opacity: 0.9;">Service Request System</span>
      </div>
    </div>



    <div class="right-section">
      <!-- Search Uplink -->
      <div class="search-uplink hide-mobile">
        <Search class="icon" :size="16" />
        <input type="text" placeholder="Search..." />
      </div>

      <div class="divider"></div>

      <!-- Station Alerts -->
      <div class="notification-container">
        <button class="alert-trigger" @click.stop="toggleNotifications" :class="{ 'active-alerts': notificationStore.unreadCount > 0 }">
          <Bell class="icon" :size="20" />
          <div v-if="notificationStore.unreadCount > 0" class="alert-badge">
            {{ notificationStore.unreadCount }}
          </div>
        </button>

        <div v-if="showNotifications" class="alert-dropdown glass-panel animate-float-in" @click.stop>
          <div class="drop-header">
            <span class="h-text font-display">Notifications</span>
            <div class="drop-header-actions">
              <button v-if="notificationStore.notifications.length > 0" @click.stop="handleClearAll" class="clear-btn">Clear All</button>
              <button class="close-notif-btn" @click.stop="showNotifications = false"><X :size="16" /></button>
            </div>
          </div>
          <div class="drop-body">
            <div v-if="notificationStore.notifications.length === 0" class="empty-feed">
              <span class="font-mono fs-07 text-muted">No notifications</span>
            </div>
            <div v-else class="alert-list">
              <div 
                v-for="notif in notificationStore.notifications" 
                :key="notif.id" 
                class="alert-entry"
                :class="{ 'unread-entry': !notif.isRead }"
                @click="handleNotifClick(notif)"
              >
                <div class="entry-node"></div>
                <div class="entry-details">
                  <p class="entry-msg">{{ notif.message }}</p>
                  <p class="entry-time font-mono">TS_{{ formatTimestamp(notif.createdAt) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <!-- User Interface -->
      <div class="interface-controls">
        <button class="settings-btn" @click="startScan" title="Scan QR Code">
          <QrCode class="icon" :size="20" />
        </button>

        <router-link to="/settings" class="settings-btn" title="System Settings">
          <Settings class="icon" :size="20" />
        </router-link>

        <button class="disconnect-btn" @click.stop="handleLogout" title="Logout">
           <LogOut class="icon" :size="18" />
          <span class="label hide-mobile">Logout</span>
        </button>
      </div>
    </div>

    <!-- Security Override Modal -->
    <div v-if="showLogoutModal" class="security-barrier animate-float-in" @click.self="showLogoutModal = false">
      <div class="barrier-content glass-panel">
        <div class="barrier-header">
          <h3 class="font-display text-secondary-glow">Confirm Logout</h3>
        </div>
        <div class="barrier-body">
          <p class="font-mono fs-08 text-secondary">Are you sure you want to log out?</p>
        </div>
        <div class="barrier-footer">
          <button class="btn-cancel" @click="showLogoutModal = false">Cancel</button>
          <button class="btn-primary" style="background: var(--accent-danger); box-shadow: 0 0 20px rgba(239, 68, 68, 0.4);" @click="confirmLogout">Confirm Logout</button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useNotificationStore } from '../stores/notificationStore'
import { useQRStore } from '../stores/qrStore'
import { Menu, Search, Bell, QrCode, Settings, LogOut, X } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const qrStore = useQRStore()

const startScan = () => {
  qrStore.startScan()
}

const showNotifications = ref(false)
const showLogoutModal = ref(false)

onMounted(() => {
  if (authStore.isAuthenticated) {
    notificationStore.fetchUnreadCount()
    window.notifInterval = setInterval(() => {
      notificationStore.fetchUnreadCount()
    }, 30000)
  }
  document.addEventListener('click', closeNotifications)
})

onUnmounted(() => {
  clearInterval(window.notifInterval)
  document.removeEventListener('click', closeNotifications)
})

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
  if (showNotifications.value && notificationStore.notifications.length === 0) {
    notificationStore.fetchNotifications()
  }
}

const closeNotifications = (e) => {
  if (!e.target.closest('.notification-container')) {
    showNotifications.value = false
  }
}

const handleNotifClick = (notif) => {
  if (!notif.isRead) notificationStore.markAsRead(notif.id)
  if (notif.serviceRequestId) router.push('/requests')
  showNotifications.value = false
}

const handleClearAll = async () => {
  await notificationStore.markAllAsRead()
  // Keep dropdown open so user sees the cleared state
}

const formatTimestamp = (dateStr) => {
  const d = new Date(dateStr)
  return d.toLocaleTimeString([], { hour12: false })
}

const currentRouteName = computed(() => {
  if (route.name === 'Login') return 'SECURITY_GATE'
  if (route.name === 'UserList') return 'STAFF_INVENTORY'
  if (route.name === 'Dashboard') return 'STATION_DIAGNOSTICS'
  if (route.name === 'RequestList') return 'PROTOCOL_LEDGER'
  return route.name?.toUpperCase() || 'CORE_INTERFACE'
})

const handleLogout = () => showLogoutModal.value = true
const confirmLogout = async () => {
  await authStore.logout()
  showLogoutModal.value = false
  router.push('/login')
}

const emit = defineEmits(['toggle-sidebar', 'open-mobile-menu'])
const handleToggle = () => {
  if (window.innerWidth <= 768) emit('open-mobile-menu')
  else emit('toggle-sidebar')
}
</script>

<style scoped>
.topbar {
  position: sticky;
  top: 0;
  height: var(--topbar-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: var(--bg-topbar) !important;
  backdrop-filter: blur(24px) !important;
  -webkit-backdrop-filter: blur(24px) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05); /* Softer line */
  z-index: 1000;
}

.left-section, .right-section, .center-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.toggle-btn {
  background: rgba(255, 255, 255, 0.03); /* Subtle backdrop */
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.08); /* Defined border */
  border-radius: 12px; /* Uniform with HUD style */
  transition: all 0.2s;
  color: var(--text-primary); /* Ensure icon takes primary color */
}

.toggle-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: var(--shadow-sm);
}

.hamburger-icon {
  opacity: 0.9;
  filter: drop-shadow(0 0 5px var(--accent-primary-glow));
}

.hamburger {
  width: 18px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.hamburger span {
  height: 2px;
  width: 100%;
  background: var(--accent-primary);
  opacity: 0.6;
}

.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.topbar-icon {
  width: 32px;
  height: 32px;
  object-fit: contain;
  filter: drop-shadow(0 0 5px var(--accent-primary-glow));
}

.node-text {
  font-family: var(--font-body);
  font-size: 0.8rem;
  letter-spacing: 0.5px;
  font-weight: 500;
  color: var(--text-secondary);
}

.active-node {
  font-size: 0.9rem;
  font-weight: 800;
  color: var(--accent-primary);
  text-shadow: 0 0 10px var(--accent-primary-glow);
}

.separator { color: rgba(255, 255, 255, 0.1); }

/* Clock Widget */
.digital-clock {
  font-size: 1.4rem;
  color: var(--accent-primary);
  display: flex;
  align-items: baseline;
  gap: 4px;
  opacity: 0.8;
}

.milliseconds { font-size: 0.7rem; opacity: 0.5; }

/* Search Uplink */
.search-uplink {
  position: relative;
  width: 240px;
}

.search-uplink input {
  width: 100%;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05); /* Softer */
  border-radius: 999px; /* Pill */
  padding: 8px 16px 8px 36px;
  font-family: var(--font-body);
  font-size: 0.8rem;
  color: var(--text-primary);
  backdrop-filter: blur(10px);
}

.search-uplink .icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.8rem;
  opacity: 0.4;
}

/* Alert System */
.alert-trigger {
  background: none;
  border: none;
  font-size: 1.4rem;
  color: var(--text-muted);
  position: relative;
  cursor: pointer;
  transition: all 0.2s;
}

.active-alerts { color: var(--accent-secondary); }

.alert-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: var(--accent-secondary);
  color: #000;
  font-size: 0.55rem;
  font-weight: 900;
  width: 14px;
  height: 14px;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.alert-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 320px;
  margin-top: 20px;
  background: var(--bg-panel);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border-radius: var(--radius-lg);
  border: var(--border-subtle);
  box-shadow: var(--shadow-lg), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
}

.drop-header {
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.h-text { font-size: 0.65rem; letter-spacing: 1px; color: var(--text-secondary); }
.clear-btn {
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--accent-primary);
  font-size: 0.55rem;
  font-family: var(--font-mono);
  padding: 4px 8px;
  cursor: pointer;
}

.drop-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.close-notif-btn {
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-muted);
  font-size: 0.8rem;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}
.close-notif-btn:hover {
  color: var(--accent-danger);
  border-color: var(--accent-danger);
}

.drop-body {
  max-height: 360px;
  overflow-y: auto;
}

.alert-entry {
  display: flex;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  cursor: pointer;
}

.entry-node { width: 4px; height: 100%; background: var(--accent-primary); opacity: 0.1; }
.unread-entry .entry-node { opacity: 1; box-shadow: 0 0 10px var(--accent-primary); }

.entry-details .entry-msg { font-size: 0.8rem; color: var(--text-primary); margin-bottom: 4px; }
.entry-details .entry-time { font-size: 0.6rem; color: var(--text-muted); }

/* Disconnect Interface */
.interface-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.op-id { font-size: 0.6rem; opacity: 0.5; color: var(--accent-primary); }

.disconnect-btn {
  background: rgba(244, 63, 94, 0.1);
  border: none; /* Cleaner */
  color: var(--accent-danger);
  padding: 8px 16px;
  font-weight: 600;
  font-family: var(--font-body);
  border-radius: 999px; /* Pill */
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.disconnect-btn:hover { background: var(--accent-danger); color: #fff; box-shadow: 0 0 10px rgba(244, 63, 94, 0.4); }

.settings-btn {
  background: transparent; /* No border initially */
  color: var(--text-secondary);
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%; /* Circle */
  text-decoration: none;
  transition: all 0.2s;
}

.settings-btn:hover {
  background: rgba(255, 255, 255, 0.08); /* Generic hover */
  color: var(--text-primary);
}

/* Security Barrier Modal */
.security-barrier {
  position: fixed;
  inset: 0;
  background: rgba(11, 15, 25, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.barrier-content { width: 360px; padding: 32px; text-align: center; border-radius: var(--radius-xl); }
.barrier-header h3 { font-size: 1.1rem; letter-spacing: 0px; font-weight: 600; }

@media (max-width: 768px) {
  .topbar { padding: 0 12px; gap: 8px; }
  .hide-mobile { display: none !important; }
  .left-section, .right-section { gap: 8px; }
  .breadcrumbs .node-text { display: none; }
  .interface-controls { gap: 4px; }
  .right-section { gap: 4px; }
  .disconnect-btn { padding: 6px 10px; font-size: 0.6rem; }
  .disconnect-btn .label { display: none; }
  .settings-btn { width: 30px; height: 30px; }
  .toggle-btn { width: 36px; height: 36px; }
  .alert-trigger { font-size: 1.2rem; }
  .divider { display: none; }

  /* Full-width notification dropdown on mobile */
  .notification-container { position: static; }
  .alert-dropdown {
    position: fixed;
    top: var(--topbar-height);
    left: 0;
    right: 0;
    width: 100%;
    max-height: 60vh;
    overflow-y: auto;
    margin-top: 0;
    z-index: 9999;
  }
}

@media (max-width: 480px) {
  .topbar-icon { display: none; }
}

.fs-08 { font-size: 0.8rem; }
.fs-07 { font-size: 0.7rem; }
</style>
