import { io } from 'socket.io-client'
import { useNotificationStore } from '../stores/notificationStore'
import { useRequestStore } from '../stores/requestStore'
import { useToastStore } from '../stores/toastStore'
import { useSettingsStore } from '../stores/settingsStore'

const SOCKET_URL = import.meta.env.VITE_API_URL || ''

class SocketService {
    socket = null

    connect(token) {
        if (this.socket) return

        this.socket = io(SOCKET_URL, {
            auth: { token }
        })

        const notificationStore = useNotificationStore()
        const requestStore = useRequestStore()
        const toastStore = useToastStore()

        this.socket.on('connect', () => {
            console.log('📡 Connected to real-time server')
        })

        this.socket.on('notification:new', (notification) => {
            notificationStore.notifications.unshift(notification)
            notificationStore.unreadCount++
            toastStore.info(notification.message)

            const settingsStore = useSettingsStore()
            settingsStore.playTone()
        })

        this.socket.on('request:created', (newRequest) => {
            const mapped = {
                id: newRequest.id,
                title: newRequest.subject,
                description: newRequest.description || '',
                type: newRequest.requestType?.name || 'N/A',
                requestTypeId: newRequest.requestTypeId || newRequest.requestType?.id || '',
                area: newRequest.section?.name || 'N/A',
                urgency: newRequest.urgency,
                status: newRequest.status,
                requester: newRequest.user?.name || 'Unknown',
                attachments: newRequest.attachments ? JSON.parse(newRequest.attachments) : [],
                deadlineDate: newRequest.deadlineDate || null,
                createdAt: newRequest.createdAt,
                updatedAt: newRequest.updatedAt || newRequest.createdAt,
                disapprovalReason: newRequest.disapprovalReason || '',
                actionsTaken: newRequest.actionsTaken || '',
                remarks: newRequest.remarks || '',
                assignedAdmins: newRequest.assignedAdmins || '',
                rating: newRequest.rating || null,
                feedback: newRequest.feedback || '',
                deletionRequested: newRequest.deletionRequested || false
            }
            // Only add if not already in the list (avoid duplicates from own submissions)
            const exists = requestStore.requests.find(r => r.id === mapped.id)
            if (!exists) {
                requestStore.requests.unshift(mapped)
            }
        })

        this.socket.on('request:updated', (updatedRequest) => {
            const index = requestStore.requests.findIndex(r => r.id === updatedRequest.id)
            if (index !== -1) {
                Object.assign(requestStore.requests[index], {
                    status: updatedRequest.status,
                    title: updatedRequest.subject,
                    urgency: updatedRequest.urgency,
                    deadlineDate: updatedRequest.deadlineDate || null,
                    createdAt: updatedRequest.createdAt,
                    updatedAt: updatedRequest.updatedAt || updatedRequest.createdAt,
                    disapprovalReason: updatedRequest.disapprovalReason || '',
                    actionsTaken: updatedRequest.actionsTaken || '',
                    remarks: updatedRequest.remarks || '',
                    assignedAdmins: updatedRequest.assignedAdmins || '',
                    rating: updatedRequest.rating || null,
                    feedback: updatedRequest.feedback || '',
                    deletionRequested: updatedRequest.deletionRequested || false
                })
            }
        })

        this.socket.on('request:deleted', ({ id }) => {
            const index = requestStore.requests.findIndex(r => r.id === id)
            if (index !== -1) {
                requestStore.requests.splice(index, 1)
            }
        })
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect()
            this.socket = null
        }
    }
}

export const socketService = new SocketService()
