import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../api/axios'

export const useUserStore = defineStore('user', () => {
    const users = ref([])
    const isFetchingUsers = ref(false)

    async function fetchUsers() {
        isFetchingUsers.value = true
        try {
            const response = await api.get('/users')
            users.value = response.data.map(user => ({
                ...user,
                // Ensure avatar exists for HUD display
                avatar: user.avatar || user.name.split(' ').map(n => n[0]).join('')
            }))
        } catch (error) {
            console.error('Failed to fetch users:', error)
        } finally {
            isFetchingUsers.value = false
        }
    }

    const totalUsers = computed(() => users.value.length)
    const activeUsers = computed(() => users.value.filter(u => u.status === 'ACTIVE' || u.status === 'Active').length)

    async function addUser(payload) {
        try {
            const response = await api.post('/users', payload)
            const newUser = {
                ...response.data,
                avatar: response.data.avatar || response.data.name.split(' ').map(n => n[0]).join('')
            }
            users.value.push(newUser)
            return newUser
        } catch (error) {
            console.error('Failed to add user:', error)
            throw error
        }
    }

    async function updateUser(payload) {
        try {
            const id = payload instanceof FormData ? payload.get('id') : payload.id;
            const response = await api.put(`/users/${id}`, payload)
            const index = users.value.findIndex(u => u.id === id)
            if (index !== -1) {
                users.value[index] = {
                    ...response.data,
                    avatar: response.data.avatar || response.data.name.split(' ').map(n => n[0]).join('')
                }
            }
            return response.data
        } catch (error) {
            console.error('Failed to update user:', error)
            throw error
        }
    }

    async function deleteUser(id) {
        try {
            await api.delete(`/users/${id}`)
            // Instead of removing, we update status to INACTIVE locally to match backend
            const index = users.value.findIndex(u => u.id === id)
            if (index !== -1) {
                users.value[index].status = 'INACTIVE'
            }
        } catch (error) {
            console.error('Failed to decommission user:', error)
            throw error.response?.data?.error || error.message
        }
    }

    async function resetPassword(id, password) {
        try {
            await api.patch(`/users/${id}/reset-password`, { password })
        } catch (error) {
            console.error('Failed to reset password:', error)
            throw error.response?.data?.error || error.message
        }
    }

    function getUserById(id) {
        return users.value.find(u => u.id === id)
    }

    return {
        users,
        isFetchingUsers,
        totalUsers,
        activeUsers,
        fetchUsers,
        addUser,
        updateUser,
        deleteUser,
        resetPassword,
        getUserById
    }
})
