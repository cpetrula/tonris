import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Lazy-loaded page components
const Home = () => import('@/pages/Home.vue')
const Login = () => import('@/pages/Login.vue')
const Register = () => import('@/pages/Register.vue')
const SignUpPage = () => import('@/pages/SignUpPage.vue')
const ForgotPasswordPage = () => import('@/pages/ForgotPasswordPage.vue')
const SetNewPasswordPage = () => import('@/pages/SetNewPasswordPage.vue')
const HowItWorksPage = () => import('@/pages/HowItWorksPage.vue')
const FAQPage = () => import('@/pages/FAQPage.vue')
const PricingPage = () => import('@/pages/PricingPage.vue')
const NotFound = () => import('@/pages/NotFound.vue')
const AdminLoginPage = () => import('@/pages/AdminLoginPage.vue')
const AdminClientsPage = () => import('@/pages/AdminClientsPage.vue')

// Admin Dashboard Pages
const DashboardPage = () => import('@/pages/DashboardPage.vue')
const StaffDashboardPage = () => import('@/pages/StaffDashboardPage.vue')
const EmployeesPage = () => import('@/pages/EmployeesPage.vue')
const ServicesPage = () => import('@/pages/ServicesPage.vue')
const AppointmentsPage = () => import('@/pages/AppointmentsPage.vue')
const BillingPage = () => import('@/pages/BillingPage.vue')
const ReportsPage = () => import('@/pages/ReportsPage.vue')
const SettingsPage = () => import('@/pages/SettingsPage.vue')
const PhoneForwardingPage = () => import('@/pages/PhoneForwardingPage.vue')
// DISABLED: Multi-location feature hidden until business hours per location is implemented
// const LocationsPage = () => import('@/pages/LocationsPage.vue')

// Public Layout
const PublicLayout = () => import('@/layouts/PublicLayout.vue')
// Dashboard Layout
const DashboardLayout = () => import('@/layouts/DashboardLayout.vue')

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: PublicLayout,
    children: [
      {
        path: '',
        name: 'home',
        component: Home,
        meta: { requiresAuth: false }
      },
      {
        path: 'login',
        name: 'login',
        component: Login,
        meta: { requiresAuth: false, guestOnly: true }
      },
      {
        path: 'register',
        name: 'register',
        component: Register,
        meta: { requiresAuth: false, guestOnly: true }
      },
      {
        path: 'signup',
        name: 'signup',
        component: SignUpPage,
        meta: { requiresAuth: false, guestOnly: true }
      },
      {
        path: 'forgot-password',
        name: 'forgot-password',
        component: ForgotPasswordPage,
        meta: { requiresAuth: false }
      },
      {
        path: 'set-new-password',
        name: 'set-new-password',
        component: SetNewPasswordPage,
        meta: { requiresAuth: false }
      },
      {
        path: 'how-it-works',
        name: 'how-it-works',
        component: HowItWorksPage,
        meta: { requiresAuth: false }
      },
      {
        path: 'faq',
        name: 'faq',
        component: FAQPage,
        meta: { requiresAuth: false }
      },
      {
        path: 'pricing',
        name: 'pricing',
        component: PricingPage,
        meta: { requiresAuth: false }
      }
    ]
  },
  {
    path: '/criton-admin',
    name: 'admin-login',
    component: AdminLoginPage,
    meta: { requiresAuth: false }
  },
  {
    path: '/admin/clients',
    name: 'admin-clients',
    component: AdminClientsPage,
    meta: { requiresAuth: false }
  },
  {
    path: '/app',
    component: DashboardLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: DashboardPage,
        meta: { requiresRole: ['superuser', 'admin', 'manager'] }
      },
      {
        path: 'my-schedule',
        name: 'staff-dashboard',
        component: StaffDashboardPage,
        meta: { requiresRole: ['staff'] }
      },
      {
        path: 'employees',
        name: 'employees',
        component: EmployeesPage,
        meta: { requiresRole: ['superuser', 'admin', 'manager'] }
      },
      {
        path: 'services',
        name: 'services',
        component: ServicesPage,
        meta: { requiresRole: ['superuser', 'admin', 'manager'] }
      },
      {
        path: 'appointments',
        name: 'appointments',
        component: AppointmentsPage,
        meta: { requiresRole: ['superuser', 'admin', 'manager'] }
      },
      {
        path: 'billing',
        name: 'billing',
        component: BillingPage,
        meta: { requiresRole: ['superuser', 'admin'] }
      },
      {
        path: 'reports',
        name: 'reports',
        component: ReportsPage,
        meta: { requiresRole: ['superuser', 'admin', 'manager'] }
      },
      {
        path: 'settings',
        name: 'settings',
        component: SettingsPage,
        meta: { requiresRole: ['superuser', 'admin'] }
      },
      {
        path: 'phone-forwarding',
        name: 'phone-forwarding',
        component: PhoneForwardingPage,
        meta: { requiresRole: ['superuser', 'admin'] }
      }
      // DISABLED: Multi-location feature hidden until business hours per location is implemented
      // {
      //   path: 'locations',
      //   name: 'locations',
      //   component: LocationsPage,
      //   meta: { requiresRole: ['superuser', 'admin'] }
      // }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFound
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard for authentication and role-based access
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()
  
  // Check if route requires authentication
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const guestOnly = to.matched.some(record => record.meta.guestOnly)
  const requiredRoles = to.meta.requiresRole as string[] | undefined
  
  // If we have a token but no user, try to fetch the user first
  // This handles the case when the page is refreshed and user data is not yet loaded
  if (authStore.token && !authStore.user) {
    await authStore.fetchUser()
  }
  
  if (requiresAuth && !authStore.isAuthenticated) {
    // Redirect to login if not authenticated
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else if (guestOnly && authStore.isAuthenticated) {
    // Redirect to appropriate dashboard based on role
    if (authStore.userRole === 'staff') {
      next({ name: 'staff-dashboard' })
    } else {
      next({ name: 'dashboard' })
    }
  } else if (requiresAuth && authStore.isAuthenticated) {
    // Check role requirements
    if (requiredRoles && !authStore.hasAnyRole(requiredRoles as any[])) {
      // User doesn't have required role - redirect to their appropriate dashboard
      if (authStore.userRole === 'staff') {
        next({ name: 'staff-dashboard' })
      } else {
        next({ name: 'dashboard' })
      }
    } else if (to.path === '/app' && authStore.userRole === 'staff') {
      // Staff trying to access /app root - redirect to staff dashboard
      next({ name: 'staff-dashboard' })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
