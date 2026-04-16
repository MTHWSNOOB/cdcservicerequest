import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api/axios'

export const useAdminStore = defineStore('admin', () => {
    // --- Departments ---
    const departments = ref([])
    const isFetchingDepartments = ref(false)

    async function fetchDepartments() {
        isFetchingDepartments.value = true
        try {
            const response = await api.get('/lookup/departments')
            departments.value = response.data
        } catch (error) {
            console.error('Failed to fetch departments:', error)
        } finally {
            isFetchingDepartments.value = false
        }
    }

    async function addDepartment(name, code) {
        try {
            const response = await api.post('/departments', { name, code })
            departments.value.push(response.data)
            return response.data
        } catch (error) {
            console.error('Failed to add department:', error)
            throw error.response?.data?.error || error.message
        }
    }

    async function deleteDepartment(id) {
        try {
            await api.delete(`/departments/${id}`)
            departments.value = departments.value.filter(d => d.id !== id)
        } catch (error) {
            console.error('Failed to delete department:', error)
            throw error.response?.data?.error || error.message
        }
    }

    async function updateDepartment(id, name, code) {
        try {
            const response = await api.put(`/departments/${id}`, { name, code })
            const index = departments.value.findIndex(d => d.id === id)
            if (index !== -1) {
                departments.value[index] = response.data
            }
            return response.data
        } catch (error) {
            console.error('Failed to update department:', error)
            throw error.response?.data?.error || error.message
        }
    }

    // --- Sections ---
    const sections = ref([])
    const isFetchingSections = ref(false)

    async function fetchSections() {
        isFetchingSections.value = true
        try {
            const response = await api.get('/lookup/sections')
            sections.value = response.data
        } catch (error) {
            console.error('Failed to fetch sections:', error)
        } finally {
            isFetchingSections.value = false
        }
    }

    async function addSection(name, departmentId) {
        try {
            const response = await api.post('/sections', { name, departmentId })
            sections.value.push(response.data)
            return response.data
        } catch (error) {
            console.error('Failed to add section:', error)
            throw error.response?.data?.error || error.message
        }
    }

    async function deleteSection(id) {
        try {
            await api.delete(`/sections/${id}`)
            sections.value = sections.value.filter(s => s.id !== id)
        } catch (error) {
            console.error('Failed to delete section:', error)
            throw error.response?.data?.error || error.message
        }
    }

    async function updateSection(id, name, departmentId) {
        try {
            const response = await api.put(`/sections/${id}`, { name, departmentId })
            const index = sections.value.findIndex(s => s.id === id)
            if (index !== -1) {
                sections.value[index] = response.data
            }
            return response.data
        } catch (error) {
            console.error('Failed to update section:', error)
            throw error.response?.data?.error || error.message
        }
    }

    // --- Request Types ---
    const requestTypes = ref([])
    const isFetchingRequestTypes = ref(false)

    async function fetchRequestTypes() {
        isFetchingRequestTypes.value = true
        try {
            const response = await api.get('/lookup/request-types')
            requestTypes.value = response.data
        } catch (error) {
            console.error('Failed to fetch request types:', error)
        } finally {
            isFetchingRequestTypes.value = false
        }
    }

    async function addRequestType(name) {
        try {
            const response = await api.post('/request-types', { name })
            requestTypes.value.push(response.data)
            return response.data
        } catch (error) {
            console.error('Failed to add request type:', error)
            throw error.response?.data?.error || error.message
        }
    }

    async function deleteRequestType(id) {
        try {
            await api.delete(`/request-types/${id}`)
            requestTypes.value = requestTypes.value.filter(t => t.id !== id)
        } catch (error) {
            console.error('Failed to delete request type:', error)
            throw error.response?.data?.error || error.message
        }
    }

    async function updateRequestType(id, name) {
        try {
            const response = await api.put(`/request-types/${id}`, { name })
            const index = requestTypes.value.findIndex(t => t.id === id)
            if (index !== -1) {
                requestTypes.value[index] = response.data
            }
            return response.data
        } catch (error) {
            console.error('Failed to update request type:', error)
            throw error.response?.data?.error || error.message
        }
    }

    // --- Users ---
    const users = ref([])
    const isFetchingUsers = ref(false)

    async function fetchUsers() {
        isFetchingUsers.value = true
        try {
            const response = await api.get('/users')
            users.value = response.data
        } catch (error) {
            console.error('Failed to fetch users:', error)
        } finally {
            isFetchingUsers.value = false
        }
    }

    // Initialize all lookup data
    async function initialize() {
        const authStore = (await import('./authStore')).useAuthStore()

        await Promise.all([
            fetchDepartments(),
            fetchSections(),
            fetchRequestTypes(),
            authStore.isAdmin ? fetchUsers() : Promise.resolve()
        ])
    }

    return {
        departments,
        isFetchingDepartments,
        fetchDepartments,
        addDepartment,
        deleteDepartment,
        sections,
        isFetchingSections,
        fetchSections,
        addSection,
        deleteSection,
        requestTypes,
        isFetchingRequestTypes,
        fetchRequestTypes,
        addRequestType,
        deleteRequestType,
        updateDepartment,
        updateSection,
        updateRequestType,
        users,
        isFetchingUsers,
        fetchUsers,
        initialize
    }
})
