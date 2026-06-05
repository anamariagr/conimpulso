<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import {
  LayoutDashboard,
  Users,
  Store,
  Package,
  Grid3X3,
  Settings,
  LogOut,
  Bell,
  Search,
  Menu,
  Layout,
  Megaphone,
  TrendingUp,
  Handshake,
  Briefcase,
  Lightbulb,
} from 'lucide-vue-next'

const route = useRoute()
const authStore = useAuthStore()
const sidebarOpen = ref(true)

// Super Admin Menu
const superAdminMenuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'Editor de Inicio', icon: Layout, path: '/homepage-editor' },
  { name: 'Usuarios', icon: Users, path: '/users' },
  { name: 'Tiendas', icon: Store, path: '/shops' },
  { name: 'Productos', icon: Package, path: '/products' },
  { name: 'Categorías', icon: Grid3X3, path: '/categories' },
  { name: 'Configuración', icon: Settings, path: '/settings' },
]

// Vendor Menu
const vendorMenuItems = [
  { name: 'Mis Productos', icon: Package, path: '/products' },
  { name: 'Mi Tienda', icon: Store, path: '/shops' },
  { name: 'Pedidos', icon: LayoutDashboard, path: '/orders' },
  { name: 'Analíticas', icon: TrendingUp, path: '/analytics' },
  { name: 'Publicidad', icon: Megaphone, path: '/advertising' },
]

// Advisor Menu
const advisorMenuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'Mis Leads', icon: Handshake, path: '/leads' },
  { name: 'Comisiones', icon: Briefcase, path: '/commissions' },
]

// Client Menu (no role)
const clientMenuItems = computed(() => {
  const items = []
  if (authStore.isVendor) {
    items.push(...vendorMenuItems)
  } else if (authStore.isAdvisor) {
    items.push(...advisorMenuItems)
  }
  return items
})

// Options to become vendor/advisor - NOT for super admins
const becomeOptions = computed(() => {
  if (authStore.isSuperAdmin) return [] // Super admin doesn't need become options
  const options = []
  if (!authStore.isVendor) {
    options.push({ name: 'Ser Vendedor', icon: Store, path: '/become-vendor', highlight: true })
  }
  if (!authStore.isAdvisor) {
    options.push({ name: 'Ser Asesor', icon: Lightbulb, path: '/become-advisor', highlight: true })
  }
  return options
})

const allMenuItems = computed(() => {
  if (authStore.isSuperAdmin) {
    return superAdminMenuItems
  }
  return clientMenuItems.value
})

const isActive = (path: string) => route.path === path
</script>

<template>
  <div class="flex min-h-screen bg-gray-50">
    <!-- Sidebar -->
    <aside
      :class="[
        'bg-primary text-white flex flex-col transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-20'
      ]"
    >
      <!-- Logo -->
      <div class="p-6 border-b border-gray-800 flex items-center justify-between">
        <RouterLink to="/" class="flex items-center gap-2">
          <div class="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
            <span class="text-primary font-bold text-xl">N</span>
          </div>
          <span v-if="sidebarOpen" class="font-bold text-xl">NexusLab</span>
        </RouterLink>
        <button
          @click="sidebarOpen = !sidebarOpen"
          class="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <Menu class="w-5 h-5" />
        </button>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 p-4">
        <ul class="space-y-1">
          <li v-for="item in allMenuItems" :key="item.path">
            <RouterLink
              :to="item.path"
              :class="[
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
                isActive(item.path)
                  ? 'bg-accent text-primary font-semibold'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              ]"
            >
              <component :is="item.icon" class="w-5 h-5" />
              <span v-if="sidebarOpen">{{ item.name }}</span>
            </RouterLink>
          </li>
        </ul>

        <!-- Become Vendor/Advisor options -->
        <div v-if="becomeOptions.length > 0" class="mt-6 pt-6 border-t border-gray-700">
          <p v-if="sidebarOpen" class="px-4 text-xs text-gray-500 uppercase tracking-wider mb-2">Opciones</p>
          <ul class="space-y-1">
            <li v-for="item in becomeOptions" :key="item.path">
              <RouterLink
                :to="item.path"
                :class="[
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium',
                  item.highlight
                    ? 'bg-yellow-400 text-primary hover:bg-yellow-500'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                ]"
              >
                <component :is="item.icon" class="w-5 h-5" />
                <span v-if="sidebarOpen">{{ item.name }}</span>
              </RouterLink>
            </li>
          </ul>
        </div>
      </nav>

      <!-- User section -->
      <div class="p-4 border-t border-gray-800">
        <div class="flex items-center gap-3 px-4 py-3">
          <div class="w-10 h-10 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
            <span class="text-primary font-bold">
              {{ authStore.user?.name?.charAt(0)?.toUpperCase() || 'U' }}
            </span>
          </div>
          <div v-if="sidebarOpen" class="flex-1 min-w-0">
            <p class="font-medium text-white truncate">{{ authStore.user?.name || 'Admin' }}</p>
            <p class="text-xs text-gray-400 truncate">{{ authStore.user?.email }}</p>
          </div>
          <button
            @click="authStore.logout()"
            class="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <LogOut class="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <!-- Header -->
      <header class="bg-white border-b border-gray-200 px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4 flex-1">
            <div class="relative flex-1 max-w-md">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar..."
                class="input-field pl-10"
              />
            </div>
          </div>

          <div class="flex items-center gap-4">
            <button class="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
              <Bell class="w-5 h-5 text-gray-600" />
              <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>
