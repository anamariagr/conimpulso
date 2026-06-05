<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const showPassword = ref(false)
const formData = ref({
  email: '',
  password: '',
})
const localError = ref('')
const fieldErrors = ref({
  email: '',
  password: '',
})

function validateForm(): boolean {
  fieldErrors.value = { email: '', password: '' }
  let isValid = true

  if (!formData.value.email) {
    fieldErrors.value.email = 'El email es requerido'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
    fieldErrors.value.email = 'Ingresa un email válido'
    isValid = false
  }

  if (!formData.value.password) {
    fieldErrors.value.password = 'La contraseña es requerida'
    isValid = false
  } else if (formData.value.password.length < 4) {
    fieldErrors.value.password = 'La contraseña debe tener al menos 4 caracteres'
    isValid = false
  }

  return isValid
}

async function handleLogin() {
  localError.value = ''
  fieldErrors.value = { email: '', password: '' }

  if (!validateForm()) {
    return
  }

  const result = await authStore.login(formData.value.email, formData.value.password)
  if (result.success) {
    router.push('/')
  } else {
    // Handle specific error messages
    const message = result.message || ''
    if (message.toLowerCase().includes('invalid') || message.toLowerCase().includes('credential')) {
      localError.value = 'Email o contraseña incorrectos. Verifica tus datos e intenta nuevamente.'
    } else if (message.toLowerCase().includes('not found') || message.toLowerCase().includes('not exist')) {
      localError.value = 'No existe una cuenta con este email.'
    } else if (message.toLowerCase().includes('blocked') || message.toLowerCase().includes('disabled') || message.toLowerCase().includes('inactive')) {
      localError.value = 'Tu cuenta está desactivada. Contacta al soporte.'
    } else if (message.toLowerCase().includes('email') && message.toLowerCase().includes('verify')) {
      localError.value = 'Por favor verifica tu email antes de iniciar sesión.'
    } else if (message.includes('Network Error') || message.includes('ERR_')) {
      localError.value = 'Error de conexión. Verifica tu red e intenta nuevamente.'
    } else {
      localError.value = message || 'Ocurrió un error inesperado. Intenta nuevamente.'
    }
  }
}

const errorMessage = computed(() => localError.value || authStore.error || '')
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center p-4">
    <div class="card max-w-md w-full">
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span class="text-primary font-bold text-3xl">N</span>
        </div>
        <h1 class="text-2xl font-bold text-primary">NexusLab Admin</h1>
        <p class="text-text-secondary mt-2">Ingresa tus credenciales</p>
      </div>

      <!-- Error Alert -->
      <div v-if="errorMessage" class="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-xl flex items-start gap-3 shadow-sm">
        <AlertCircle class="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
        <div>
          <p class="text-red-700 font-bold text-lg">Error de autenticación</p>
          <p class="text-red-600 text-sm mt-1">{{ errorMessage }}</p>
        </div>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-5">
        <div>
          <label class="block text-sm font-medium text-primary mb-2">Email</label>
          <div class="relative">
            <Mail class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input
              v-model="formData.email"
              type="email"
              :class="['input-field pl-12 pr-4 py-3 rounded-lg transition-all', fieldErrors.email ? 'border-2 border-red-500 bg-red-50 ring-2 ring-red-200' : 'border border-gray-300']"
              placeholder="tucorreo@ejemplo.com"
            />
          </div>
          <p v-if="fieldErrors.email" class="mt-2 text-sm text-red-600 flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
            <span class="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            {{ fieldErrors.email }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-primary mb-2">Contraseña</label>
          <div class="relative">
            <Lock class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input
              v-model="formData.password"
              :type="showPassword ? 'text' : 'password'"
              :class="['input-field pl-12 pr-12 py-3 rounded-lg transition-all', fieldErrors.password ? 'border-2 border-red-500 bg-red-50 ring-2 ring-red-200' : 'border border-gray-300']"
              placeholder="Tu contraseña"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary transition-colors"
            >
              <EyeOff v-if="showPassword" class="w-5 h-5" />
              <Eye v-else class="w-5 h-5" />
            </button>
          </div>
          <p v-if="fieldErrors.password" class="mt-2 text-sm text-red-600 flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
            <span class="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            {{ fieldErrors.password }}
          </p>
        </div>

        <button
          type="submit"
          :disabled="authStore.isLoading"
          class="btn-primary w-full py-3 text-base font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
        >
          <span v-if="authStore.isLoading" class="flex items-center justify-center gap-2">
            <svg class="animate-spin w-5 h-5" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            Verificando...
          </span>
          <span v-else>Iniciar Sesión</span>
        </button>
      </form>

      <p class="text-center text-sm text-text-secondary mt-6">
        ¿Olvidaste tu contraseña? <a href="#" class="text-accent hover:text-accent-hover">Recuperar</a>
      </p>
    </div>
  </div>
</template>