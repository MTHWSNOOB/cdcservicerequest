import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../api/axios'

export const useRequestStore = defineStore('request', () => {
    const requests = ref([])
    const isFetchingRequests = ref(false)
    const currentPage = ref(1)
    const totalPages = ref(1)
    const totalCount = ref(0)
    const itemsPerPage = ref(10)
    const searchQuery = ref('')
    const statusFilter = ref('ALL')

    async function fetchRequests(options = {}) {
        isFetchingRequests.value = true
        try {
            const page = options.page || currentPage.value
            const limit = options.limit || itemsPerPage.value
            const search = options.search !== undefined ? options.search : searchQuery.value
            const status = options.status !== undefined ? options.status : statusFilter.value

            const response = await api.get('/service-requests', {
                params: { page, limit, search, status }
            })

            const result = response.data
            // Handle both paginated and legacy response formats
            const rawData = Array.isArray(result) ? result : (result.data || [])

            requests.value = rawData.map(req => ({
                id: req.id,
                title: req.subject,
                description: req.description || '',
                type: req.requestType?.name || 'N/A',
                requestTypeId: req.requestTypeId || req.requestType?.id || '',
                area: req.section?.name || 'N/A',
                urgency: req.urgency,
                status: req.status,
                requester: req.user?.name || 'Unknown',
                attachments: req.attachments ? JSON.parse(req.attachments) : [],
                deadline: req.deadline || null,
                createdAt: req.createdAt,
                updatedAt: req.updatedAt,
                disapprovalReason: req.disapprovalReason || '',
                actionsTaken: req.actionsTaken || '',
                remarks: req.remarks || '',
                assignedAdmins: req.assignedAdmins || '',
                rating: req.rating || null,
                feedback: req.feedback || '',
                deletionRequested: req.deletionRequested || false
            }))

            // Update pagination state
            if (!Array.isArray(result)) {
                currentPage.value = result.page || 1
                totalPages.value = result.totalPages || 1
                totalCount.value = result.total || rawData.length
            } else {
                totalCount.value = rawData.length
            }
        } catch (error) {
            console.error('Failed to fetch requests:', error)
        } finally {
            isFetchingRequests.value = false
        }
    }

    const totalRequests = computed(() => totalCount.value)
    const pendingRequests = computed(() => requests.value.filter(r => ['NEW', 'RECEIVED', 'IN_PROGRESS'].includes(r.status)).length)

    async function submitRequest(requestData) {
        try {
            const isFormData = requestData instanceof FormData
            const response = await api.post('/service-requests', requestData, {
                headers: {
                    'Content-Type': isFormData ? 'multipart/form-data' : 'application/json'
                }
            })

            const req = response.data
            const mapped = {
                id: req.id,
                title: req.subject,
                description: req.description || '',
                type: req.requestType?.name || 'N/A',
                requestTypeId: req.requestTypeId || req.requestType?.id || '',
                area: req.section?.name || 'N/A',
                urgency: req.urgency,
                status: req.status,
                requester: req.user?.name || 'Unknown',
                attachments: req.attachments ? JSON.parse(req.attachments) : [],
                deadline: req.deadline || null,
                createdAt: req.createdAt,
                updatedAt: req.updatedAt || req.createdAt,
                disapprovalReason: '',
                actionsTaken: '',
                remarks: '',
                assignedAdmins: '',
                rating: null,
                feedback: '',
                deletionRequested: false
            }
            const existsIndex = requests.value.findIndex(r => r.id === mapped.id)
            if (existsIndex === -1) {
                requests.value.unshift(mapped)
            } else {
                requests.value[existsIndex] = mapped
            }
            return mapped
        } catch (error) {
            console.error('Failed to submit request:', error)
            throw error
        }
    }

    async function updateStatus(id, data) {
        try {
            // Keep backwards compatibility if only a string is passed
            const payload = typeof data === 'string' ? { status: data } : data
            const response = await api.patch(`/service-requests/${id}/status`, payload)

            const index = requests.value.findIndex(r => r.id === id)
            if (index !== -1) {
                requests.value[index] = { ...requests.value[index], ...response.data }
            }
            return response.data
        } catch (error) {
            console.error('Failed to update request status:', error)
            throw error
        }
    }

    async function updateRequest(id, data) {
        try {
            const isFormData = data instanceof FormData;
            const response = await api.put(`/service-requests/${id}`, data, {
                headers: {
                    'Content-Type': isFormData ? 'multipart/form-data' : 'application/json'
                }
            })
            const index = requests.value.findIndex(r => r.id === id)
            if (index !== -1) {
                // Update local list with new data
                requests.value[index] = {
                    ...requests.value[index],
                    title: response.data.subject,
                    urgency: response.data.urgency,
                    // We don't usually change type/area after creation but if we did:
                    type: response.data.requestType?.name || requests.value[index].type,
                    area: response.data.section?.name || requests.value[index].area,
                    attachments: response.data.attachments ? JSON.parse(response.data.attachments) : requests.value[index].attachments,
                    deadline: response.data.deadline || requests.value[index].deadline
                }
            }
            return response.data
        } catch (error) {
            console.error('Failed to update request:', error)
            throw error
        }
    }

    async function requestDeletion(id) {
        try {
            const response = await api.patch(`/service-requests/${id}/request-delete`)
            const index = requests.value.findIndex(r => r.id === id)
            if (index !== -1) {
                requests.value[index].deletionRequested = true
            }
            return response.data
        } catch (error) {
            console.error('Failed to request deletion:', error)
            throw error
        }
    }

    async function submitRating(id, rating, feedback) {
        try {
            const response = await api.post(`/service-requests/${id}/rate`, { rating, feedback })
            const index = requests.value.findIndex(r => r.id === id)
            if (index !== -1) {
                requests.value[index].rating = response.data.rating || rating
                requests.value[index].feedback = response.data.feedback || feedback
            }
            return response.data
        } catch (error) {
            console.error('Failed to submit rating:', error)
            throw error.response?.data?.error || error.message
        }
    }

    async function deleteRequest(id) {
        try {
            await api.delete(`/service-requests/${id}`)
            requests.value = requests.value.filter(r => r.id !== id)
        } catch (error) {
            console.error('Failed to delete request:', error)
            throw error
        }
    }

    function getRequestById(id) {
        return requests.value.find(r => r.id === id)
    }

    return {
        requests,
        isFetchingRequests,
        totalRequests,
        pendingRequests,
        currentPage,
        totalPages,
        totalCount,
        itemsPerPage,
        searchQuery,
        statusFilter,
        fetchRequests,
        submitRequest,
        updateStatus,
        updateRequest,
        deleteRequest,
        requestDeletion,
        submitRating,
        getRequestById
    }
})
