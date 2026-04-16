import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../api/axios'

export const useNotificationStore = defineStore('notification', () => {
    const notifications = ref([])
    const unreadCount = ref(0)
    const isLoading = ref(false)
    let pollInterval = null

    async function fetchNotifications() {
        isLoading.value = true
        try {
            const response = await api.get('/notifications')
            notifications.value = response.data
            unreadCount.value = notifications.value.filter(n => !n.isRead).length
        } catch (error) {
            console.error('Failed to fetch notifications:', error)
        } finally {
            isLoading.value = false
        }
    }

    async function fetchUnreadCount() {
        try {
            const response = await api.get('/notifications/unread-count')
            unreadCount.value = response.data.count
        } catch (error) {
            console.error('Failed to fetch unread count:', error)
        }
    }

    async function markAsRead(id) {
        try {
            await api.patch(`/notifications/${id}/read`)
            const notif = notifications.value.find(n => n.id === id)
            if (notif) {
                notif.isRead = true
                unreadCount.value = Math.max(0, unreadCount.value - 1)
            }
        } catch (error) {
            console.error('Failed to mark notification as read:', error)
        }
    }

    function addNotification(notification) {
        notifications.value.unshift(notification)
        unreadCount.value++
    }

    async function markAllAsRead() {
        try {
            await api.patch('/notifications/read-all')
            notifications.value = []
            unreadCount.value = 0
        } catch (error) {
            console.error('Failed to mark all as read:', error)
        }
    }

    // Start polling every 30 seconds for fresh notification count
    function startPolling() {
        stopPolling()
        fetchNotifications()
        pollInterval = setInterval(() => {
            fetchUnreadCount()
        }, 30000)
    }

    function stopPolling() {
        if (pollInterval) {
            clearInterval(pollInterval)
            pollInterval = null
        }
    }

    return {
        notifications,
        unreadCount,
        isLoading,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
        addNotification,
        startPolling,
        stopPolling
    }
})
