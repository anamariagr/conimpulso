import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

const API_URL = '/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const token = ref(localStorage.getItem('token') || null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value)
  const isSuperAdmin = computed(() => {
    const roles = user.value?.roles || []
    return roles.includes('super_admin') || roles.includes('admin')
  })

  const isVendor = computed(() => {
    const roles = user.value?.roles || []
    return roles.includes('vendor') || user.value?.is_vendor === true
  })

  const isAdvisor = computed(() => {
    const roles = user.value?.roles || []
    return roles.includes('advisor') || user.value?.is_advisor === true
  })

  async function login(email: string, password: string) {
    isLoading.value = true
    error.value = null

    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password })
      const { user: userData, token: authToken } = response.data.data

      localStorage.setItem('token', authToken)
      localStorage.setItem('user', JSON.stringify(userData))

      user.value = userData
      token.value = authToken

      return { success: true }
    } catch (e: any) {
      let message = 'Login failed'
      if (e.response?.data?.message) {
        message = e.response.data.message
      } else if (e.request?.status === 0 || e.message?.includes('Network')) {
        message = 'Error de conexión. Verifica tu red e intenta nuevamente.'
      }
      error.value = message
      return { success: false, message }
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    try {
      await axios.post(`${API_URL}/auth/logout`, {}, {
        headers: { Authorization: `Bearer ${token.value}` }
      })
    } catch (e) {
      // Ignore
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      user.value = null
      token.value = null
    }
  }

  async function checkAuth() {
    if (!token.value) return

    try {
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token.value}` }
      })
      user.value = response.data.data.user
    } catch (e) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      user.value = null
      token.value = null
    }
  }

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    isSuperAdmin,
    isVendor,
    isAdvisor,
    login,
    logout,
    checkAuth,
  }
})