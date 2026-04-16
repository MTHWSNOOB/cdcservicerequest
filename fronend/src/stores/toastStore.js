import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toast', () => {
    const toasts = ref([])
    let nextId = 0

    /**
     * Show a HUD toast message
     * @param {string} message The text to display
     * @param {string} type 'success', 'error', 'info', 'warning'
     * @param {number} duration Duration in ms (default 3000)
     */
    function show(message, type = 'info', duration = 3000) {
        const id = nextId++
        toasts.value.push({ id, message, type })

        setTimeout(() => {
            remove(id)
        }, duration)
    }

    function remove(id) {
        const index = toasts.value.findIndex(t => t.id === id)
        if (index !== -1) {
            toasts.value.splice(index, 1)
        }
    }

    function success(message, duration) { show(message, 'success', duration) }
    function error(message, duration) { show(message, 'error', duration) }
    function warning(message, duration) { show(message, 'warning', duration) }
    function info(message, duration) { show(message, 'info', duration) }

    return { toasts, show, remove, success, error, warning, info }
})
