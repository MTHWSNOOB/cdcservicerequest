<template>
  <div v-if="qrStore.isScanning" class="qr-scanner-overlay animate-float-in">
    <div class="scanner-container glass-panel">
      <div class="scanner-header">
        <h3 class="font-display text-primary-glow">QR SCANNER</h3>
        <button class="close-btn" @click="closeScanner"><X :size="20" /></button>
      </div>
      
      <div class="scanner-body">
        <p class="font-mono fs-07 text-muted text-center mb-16">Scan a Digital Ticket or Asset Code</p>
        <div id="reader" class="qr-reader"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode'
import { useQRStore } from '../stores/qrStore'
import { X } from 'lucide-vue-next'

const qrStore = useQRStore()
let html5QrcodeScanner = null

const initScanner = async () => {
  await nextTick() // ensure DOM is rendered before targeting #reader
  if (html5QrcodeScanner) return

  html5QrcodeScanner = new Html5QrcodeScanner("reader", { 
    fps: 10,
    qrbox: { width: 250, height: 250 },
    supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
  }, false)

  html5QrcodeScanner.render(onScanSuccess, onScanFailure)
}

const destroyScanner = () => {
  if (html5QrcodeScanner) {
    // try to clear it
    html5QrcodeScanner.clear().catch(e => console.error("Failed to clear html5QrcodeScanner. ", e));
    html5QrcodeScanner = null
  }
}

watch(() => qrStore.isScanning, (isScanning) => {
  if (isScanning) {
    initScanner()
  } else {
    destroyScanner()
  }
})

const onScanSuccess = (decodedText, decodedResult) => {
  // Beep or something cool
  qrStore.handleScan(decodedText)
}

const onScanFailure = (error) => {
  // Ignore continuous fails until success
}

const closeScanner = () => {
  qrStore.stopScan()
}

onUnmounted(() => {
  destroyScanner()
})
</script>

<style scoped>
.qr-scanner-overlay {
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.9);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.scanner-container {
  width: 90%;
  max-width: 400px;
  background: var(--bg-deep-alt);
  border: 1px solid var(--accent-primary);
  box-shadow: 0 0 30px rgba(0, 242, 254, 0.2);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
}

.scanner-header {
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  transition: color 0.2s;
}

.close-btn:hover {
  color: var(--accent-danger);
}

.scanner-body {
  padding: 24px;
}

.qr-reader {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.1);
  background: black;
}

.qr-reader :deep(#reader__dashboard_section_csr span) {
    color: var(--text-secondary) !important;
}
.qr-reader :deep(#reader__dashboard_section_csr select),
.qr-reader :deep(#reader__dashboard_section_csr button) {
    background: rgba(255, 255, 255, 0.1) !important;
    color: white !important;
    border: 1px solid rgba(255,255,255,0.2) !important;
    padding: 8px;
    border-radius: 4px;
}
</style>
