import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Lazy-loaded page components
const Home = () => import('@/pages/Home.vue')
const Login = () => import('@/pages/Login.vue')
const Register = () => import('@/pages/Register.vue')
const SignUpPage = () => import('@/pages/SignUpPage.vue')
const ForgotPasswordPage = () => import('@/pages/ForgotPasswordPage.vue')
const HowItWorksPage = () => import('@/pages/HowItWorksPage.vue')
const FAQPage = () => import('@/pages/FAQPage.vue')
const Dashboard = () => import('@/pages/Dashboard.vue')
const NotFound = () => import('@/pages/NotFound.vue')

// Admin Dashboard Pages
const DashboardPage = () => import('@/pages/DashboardPage.vue')
const EmployeesPage = () => import('@/pages/EmployeesPage.vue')
const ServicesPage = () => import('@/pages/ServicesPage.vue')
const AppointmentsPage = () => import('@/pages/AppointmentsPage.vue')
const BillingPage = () => import('@/pages/BillingPage.vue')
const ReportsPage = () => import('@/pages/ReportsPage.vue')
const SettingsPage = () => import('@/pages/SettingsPage.vue')

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
      }
    ]
  },
  {
    path: '/app',
    component: DashboardLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: DashboardPage
      },
      {
        path: 'employees',
        name: 'employees',
        component: EmployeesPage
      },
      {
        path: 'services',
        name: 'services',
        component: ServicesPage
      },
      {
        path: 'appointments',
        name: 'appointments',
        component: AppointmentsPage
      },
      {
        path: 'billing',
        name: 'billing',
        component: BillingPage
      },
      {
        path: 'reports',
        name: 'reports',
        component: ReportsPage
      },
      {
        path: 'settings',
        name: 'settings',
        component: SettingsPage
      }
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

// Navigation guard for authentication
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  
  // Check if route requires authentication
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const guestOnly = to.matched.some(record => record.meta.guestOnly)
  
  if (requiresAuth && !authStore.isAuthenticated) {
    // Redirect to login if not authenticated
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else if (guestOnly && authStore.isAuthenticated) {
    // Redirect to dashboard if already authenticated
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router
