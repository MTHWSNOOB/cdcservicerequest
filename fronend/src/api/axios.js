import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request Interceptor: Add token to headers
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// Response interceptor — handle expired/invalid token (401)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response && error.response.status === 401) {
            console.warn('⚠️ Token expired or invalid — redirecting to login...');

            // Dynamically import to avoid circular dependency
            const { useAuthStore } = await import('../stores/authStore')
            const { default: router } = await import('../router/index')

            const authStore = useAuthStore()

            // Clear store state + localStorage
            await authStore.logout()

            // Redirect to login only if not already there
            if (router.currentRoute.value.name !== 'Login') {
                router.push({ name: 'Login' })
            }
        }

        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default api;
