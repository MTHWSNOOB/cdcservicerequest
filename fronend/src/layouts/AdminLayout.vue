<template>
  <div class="admin-layout">
    <Sidebar 
      :is-collapsed="isSidebarCollapsed" 
      :is-mobile-open="isMobileMenuOpen"
      @toggle="toggleSidebar" 
      @close-mobile="isMobileMenuOpen = false"
    />
    
    <div class="main-container" :class="{ 'sidebar-collapsed': isSidebarCollapsed, 'sidebar-mobile-open': isMobileMenuOpen }">
       <Topbar @toggle-sidebar="toggleSidebar" @open-mobile-menu="isMobileMenuOpen = true" />
       
       <main class="content-area">
         <router-view v-slot="{ Component }">
           <component :is="Component" />
         </router-view>
       </main>
       
       <!-- Technical Layout Markers -->
       <div class="cad-frame">
         <div class="corner tl"><span>X: 0.00 | Y: 1.00</span></div>
         <div class="corner tr"><span>Z: 0.50</span></div>
         <div class="corner bl"><span>STATION_SYNC_OK</span></div>
         <div class="corner br"><span>CAD_ENGINE_v4.2</span></div>
       </div>

       <!-- Mobile Overlay -->
       <div v-if="isMobileMenuOpen" class="mobile-overlay" @click="isMobileMenuOpen = false"></div>

       <QRScannerModal />
     </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Sidebar from '../components/Sidebar.vue'
import Topbar from '../components/Topbar.vue'
import QRScannerModal from '../components/QRScannerModal.vue'
import { useAuthStore } from '../stores/authStore'
import { useAdminStore } from '../stores/adminStore'
import { useUserStore } from '../stores/userStore'
import { useRequestStore } from '../stores/requestStore'
import { useNotificationStore } from '../stores/notificationStore'

const isSidebarCollapsed = ref(false)
const isMobileMenuOpen = ref(false)

const authStore = useAuthStore()
const adminStore = useAdminStore()
const userStore = useUserStore()
const requestStore = useRequestStore()
const notificationStore = useNotificationStore()

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}

onMounted(() => {
  adminStore.initialize()
  requestStore.fetchRequests()
  notificationStore.startPolling()
})

onUnmounted(() => {
  notificationStore.stopPolling()
})
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  position: relative;
  background: var(--bg-deep);
  overflow-x: hidden;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: var(--sidebar-width);
  transition: margin-left var(--transition);
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  max-width: 100vw;
  /* Minimal non-distractive background */
  background: 
    linear-gradient(rgba(2, 6, 23, 0.92), rgba(2, 6, 23, 0.88)),
    url('/layout_bg_minimal.png');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
}

.main-container.sidebar-collapsed {
  margin-left: var(--sidebar-collapsed);
}

.content-area {
  padding: 32px;
  flex: 1;
  z-index: 10;
  max-width: var(--content-max-width);
  margin: 0 auto;
  width: 100%;
  position: relative;
  overflow-x: hidden;
}

/* CAD HUD Markers */
.cad-frame {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 999;
}

.corner {
  position: absolute;
  padding: 12px;
  font-family: var(--font-mono);
  font-size: 0.55rem;
  color: var(--accent-primary);
  opacity: 0.5;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.tl { top: 0; left: var(--sidebar-width); transition: left var(--transition); border-left: 1px solid var(--accent-primary); border-top: 1px solid var(--accent-primary); width: 100px; height: 100px; }
.tr { top: 0; right: 0; border-right: 1px solid var(--accent-primary); border-top: 1px solid var(--accent-primary); width: 100px; height: 100px; text-align: right; }
.bl { bottom: 0; left: var(--sidebar-width); transition: left var(--transition); border-left: 1px solid var(--accent-primary); border-bottom: 1px solid var(--accent-primary); width: 100px; height: 100px; display: flex; align-items: flex-end; }
.br { bottom: 0; right: 0; border-right: 1px solid var(--accent-primary); border-bottom: 1px solid var(--accent-primary); width: 100px; height: 100px; text-align: right; display: flex; align-items: flex-end; justify-content: flex-end; }

.sidebar-collapsed .tl, .sidebar-collapsed .bl {
  left: var(--sidebar-collapsed);
}

/* Scanning Effect */

@media (max-width: 768px) {
  .main-container { margin-left: 0 !important; }
  .content-area { padding: 16px; }
  .cad-frame { display: none; } /* Hide CAD markers on mobile for cleaner UI */

  .mobile-overlay {
    position: fixed;
    inset: 0;
    background: rgba(2, 6, 23, 0.85);
    backdrop-filter: blur(12px);
    z-index: 95;
  }
}

@media (max-width: 480px) {
  .content-area { padding: 12px; }
}

</style>
