<template>
  <router-view />
  <HudToastContainer />
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from './stores/authStore'
import { socketService } from './services/socketService'
import HudToastContainer from './components/HudToastContainer.vue'

const authStore = useAuthStore()

onMounted(async () => {
  if (authStore.token) {
    socketService.connect(authStore.token)
  }
})
</script>

<style>
/* Base styles already in main.css */
</style>
