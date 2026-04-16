import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export const useQRStore = defineStore('qr', () => {
    const isScanning = ref(false)
    const scannedData = ref(null)
    const router = useRouter()

    const startScan = () => {
        scannedData.value = null
        isScanning.value = true
    }

    const stopScan = () => {
        isScanning.value = false
    }

    const handleScan = (data) => {
        if (!data) return
        scannedData.value = data
        isScanning.value = false

        // Parse the scanned data. Expected format: CDH-REQ-<UUID>
        if (data.startsWith('CDH-REQ-')) {
            const id = data.replace('CDH-REQ-', '')
            // Navigate to request list and trigger the scan parameter
            router.push({ path: '/requests', query: { scan: id } })
        } else {
            // Handle unknown QR formats later
            console.warn('Unknown QR format:', data)
        }
    }

    return {
        isScanning,
        scannedData,
        startScan,
        stopScan,
        handleScan
    }
})
