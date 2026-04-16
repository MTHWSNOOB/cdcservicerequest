import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../api/axios'

export const useAuthStore = defineStore('auth', () => {
    const user = ref(JSON.parse(localStorage.getItem('user')) || null)
    const token = ref(localStorage.getItem('token') || null)
    const isAuthenticating = ref(false)

    const isAuthenticated = computed(() => !!token.value)
    const isAdmin = computed(() => user.value?.role === 'ADMIN')
    const isTechnical = computed(() => user.value?.role === 'TECHNICAL')
    const isAdminOrTechnical = computed(() => ['ADMIN', 'TECHNICAL'].includes(user.value?.role))

    async function login(email, password) {
        isAuthenticating.value = true
        try {
            const response = await api.post('/auth/login', { email, password })
            const { token: authToken, user: userData } = response.data

            token.value = authToken
            user.value = userData

            localStorage.setItem('token', authToken)
            localStorage.setItem('user', JSON.stringify(userData))

            // Set default header for axios
            api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`

            // Initialize Socket
            const { socketService } = await import('../services/socketService')
            socketService.connect(authToken)

            return userData
        } catch (error) {
            console.error('Login failed:', error)
            throw error
        } finally {
            isAuthenticating.value = false
        }
    }

    async function register(name, email, password) {
        isAuthenticating.value = true
        try {
            const response = await api.post('/auth/register', { name, email, password })
            const { token: authToken, user: userData } = response.data

            token.value = authToken
            user.value = userData

            localStorage.setItem('token', authToken)
            localStorage.setItem('user', JSON.stringify(userData))

            api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`

            // Connect Socket
            const { socketService } = await import('../services/socketService')
            socketService.connect(authToken)

            return userData
        } catch (error) {
            console.error('Registration failed:', error)
            throw error
        } finally {
            isAuthenticating.value = false
        }
    }

    async function logout() {
        // Disconnect Socket
        const { socketService } = await import('../services/socketService')
        socketService.disconnect()

        token.value = null
        user.value = null
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        delete api.defaults.headers.common['Authorization']
    }

    async function fetchCurrentUser() {
        if (!token.value) return null
        try {
            const response = await api.get('/auth/me')
            user.value = response.data
            localStorage.setItem('user', JSON.stringify(response.data))

            // Connect socket if not already connected
            const { socketService } = await import('../services/socketService')
            socketService.connect(token.value)

            return response.data
        } catch (error) {
            console.error('Failed to fetch user profile:', error)
            await logout()
            return null
        }
    }

    return {
        user,
        token,
        isAuthenticating,
        isAuthenticated,
        isAdmin,
        isTechnical,
        isAdminOrTechnical,
        login,
        register,
        logout,
        fetchCurrentUser
    }
})
