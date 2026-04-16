import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/LoginView.vue'),
      meta: { guest: true }
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('../views/RegisterView.vue'),
      meta: { guest: true }
    },
    {
      path: '/',
      redirect: '/dashboard',
      component: () => import('../layouts/AdminLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('../views/DashboardView.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'users',
          name: 'Users',
          meta: { requiresAuth: true, roles: ['ADMIN'] },
          children: [
            {
              path: '',
              name: 'UserList',
              component: () => import('../views/users/UserListView.vue')
            },
            {
              path: 'create',
              name: 'UserCreate',
              component: () => import('../views/users/UserFormView.vue')
            },
            {
              path: ':id',
              name: 'UserDetails',
              component: () => import('../views/users/UserDetailsView.vue'),
              props: true
            },
            {
              path: ':id/edit',
              name: 'UserEdit',
              component: () => import('../views/users/UserFormView.vue'),
              props: true
            }
          ]
        },
        {
          path: 'requests',
          name: 'Requests',
          meta: { requiresAuth: true },
          children: [
            {
              path: '',
              name: 'RequestList',
              component: () => import('../views/requests/RequestListView.vue')
            },
            {
              path: 'new',
              name: 'ServiceRequest',
              component: () => import('../views/requests/ServiceRequestView.vue')
            }
          ]
        },
        {
          path: 'settings',
          name: 'Settings',
          component: () => import('../views/settings/SettingsLayout.vue'),
          meta: { requiresAuth: true },
          redirect: '/settings/notifications',
          children: [
            {
              path: 'notifications',
              name: 'NotificationSettings',
              component: () => import('../views/settings/NotificationSettingsView.vue')
            },
            {
              path: 'departments',
              name: 'Departments',
              component: () => import('../views/admin/DepartmentListView.vue'),
              meta: { roles: ['ADMIN'] }
            },
            {
              path: 'sections',
              name: 'Sections',
              component: () => import('../views/admin/SectionListView.vue'),
              meta: { roles: ['ADMIN'] }
            },
            {
              path: 'request-types',
              name: 'RequestTypes',
              component: () => import('../views/admin/RequestTypeListView.vue'),
              meta: { roles: ['ADMIN'] }
            },
            {
              path: 'ratings',
              name: 'RatingReports',
              component: () => import('../views/admin/RatingReportsView.vue'),
              meta: { roles: ['ADMIN', 'TECHNICAL'] }
            }
          ]
        },
        {
          path: 'settings/password',
          name: 'ChangePassword',
          component: () => import('../views/ChangePasswordView.vue'),
          meta: { requiresAuth: true }
        }
      ]
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Requires Authentication
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!authStore.isAuthenticated) {
      next('/login')
      return
    }

    // Check Roles
    if (to.meta.roles && !to.meta.roles.includes(authStore.user?.role)) {
      next('/dashboard')
      return
    }
  }

  // Guest only (Login page)
  if (to.meta.guest && authStore.isAuthenticated) {
    next('/dashboard')
    return
  }

  next()
})

export default router
