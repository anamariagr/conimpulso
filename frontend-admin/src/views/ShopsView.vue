<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Search, Plus, Filter, MoreVertical, Check, X, Star, Shield } from 'lucide-vue-next'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/api'

const shops = ref<any[]>([])
const loading = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  suspended: 'bg-red-100 text-red-700',
  rejected: 'bg-red-100 text-red-700',
  draft: 'bg-gray-100 text-gray-700',
}

const fetchShops = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get(`${API_URL}/admin/shops`, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        search: searchQuery.value || undefined,
        status: statusFilter.value || undefined,
      }
    })
    shops.value = response.data.data
  } catch (error) {
    console.error('Failed to fetch shops:', error)
    // Use mock data for demo
    shops.value = [
      { id: 1, name: 'Cervecería Norteña', owner: { name: 'Juan Pérez' }, city: 'Bogotá', status: 'active', is_verified: true, is_featured: true, products_count: 24 },
      { id: 2, name: 'Cuero y Craft', owner: { name: 'María García' }, city: 'Medellín', status: 'pending', is_verified: false, is_featured: false, products_count: 18 },
      { id: 3, name: 'Carpintería El Roble', owner: { name: 'Carlos López' }, city: 'Cali', status: 'active', is_verified: true, is_featured: false, products_count: 12 },
      { id: 4, name: 'Oro y Piedra', owner: { name: 'Ana Martínez' }, city: 'Bogotá', status: 'suspended', is_verified: false, is_featured: false, products_count: 30 },
    ]
  } finally {
    loading.value = false
  }
}

const approveShop = async (id: number) => {
  try {
    const token = localStorage.getItem('token')
    await axios.put(`${API_URL}/admin/shops/${id}/approve`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const shop = shops.value.find(s => s.id === id)
    if (shop) shop.status = 'active'
  } catch (error) {
    console.error('Failed to approve shop:', error)
  }
}

const rejectShop = async (id: number) => {
  const reason = prompt('Razón del rechazo:')
  if (!reason) return
  try {
    const token = localStorage.getItem('token')
    await axios.put(`${API_URL}/admin/shops/${id}/reject`, { reason }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const shop = shops.value.find(s => s.id === id)
    if (shop) shop.status = 'rejected'
  } catch (error) {
    console.error('Failed to reject shop:', error)
  }
}

const toggleFeatured = async (id: number) => {
  try {
    const token = localStorage.getItem('token')
    await axios.put(`${API_URL}/admin/shops/${id}/featured`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const shop = shops.value.find(s => s.id === id)
    if (shop) shop.is_featured = !shop.is_featured
  } catch (error) {
    console.error('Failed to toggle featured:', error)
  }
}

const toggleVerified = async (id: number) => {
  try {
    const token = localStorage.getItem('token')
    await axios.put(`${API_URL}/admin/shops/${id}/verified`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const shop = shops.value.find(s => s.id === id)
    if (shop) shop.is_verified = !shop.is_verified
  } catch (error) {
    console.error('Failed to toggle verified:', error)
  }
}

onMounted(fetchShops)
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-primary">Tiendas</h1>
        <p class="text-text-secondary">Gestionar tiendas de la plataforma</p>
      </div>
      <button class="btn-primary flex items-center gap-2">
        <Plus class="w-5 h-5" /> Nueva tienda
      </button>
    </div>

    <div class="card">
      <div class="flex items-center gap-4 mb-6">
        <div class="relative flex-1 max-w-md">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            v-model="searchQuery"
            @keyup.enter="fetchShops"
            type="text"
            placeholder="Buscar tiendas..."
            class="input-field pl-10"
          />
        </div>
        <select v-model="statusFilter" @change="fetchShops" class="input-field w-40">
          <option value="">Todos</option>
          <option value="pending">Pendientes</option>
          <option value="active">Activas</option>
          <option value="suspended">Suspendidas</option>
        </select>
        <button @click="fetchShops" class="btn-outline flex items-center gap-2">
          <Filter class="w-5 h-5" /> Filtrar
        </button>
      </div>

      <div v-if="loading" class="text-center py-8 text-text-secondary">
        Cargando tiendas...
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="shop in shops"
          :key="shop.id"
          class="p-4 border border-gray-100 rounded-xl hover:border-accent transition-colors"
        >
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div class="w-14 h-14 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
                <span class="text-accent font-bold text-xl">{{ shop.name?.charAt(0) || 'S' }}</span>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="font-semibold text-primary">{{ shop.name }}</h3>
                  <Shield v-if="shop.is_verified" class="w-4 h-4 text-blue-500" title="Verificada" />
                  <Star v-if="shop.is_featured" class="w-4 h-4 text-accent" title="Destacada" />
                </div>
                <p class="text-sm text-text-secondary">{{ shop.owner?.name || 'Sin dueño' }} • {{ shop.city || 'Sin ciudad' }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span
                :class="['px-2 py-1 rounded-full text-xs font-medium', statusColors[shop.status] || 'bg-gray-100']"
              >
                {{ shop.status }}
              </span>
              <button class="p-1 hover:bg-gray-100 rounded">
                <MoreVertical class="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
            <span class="text-sm text-text-secondary">{{ shop.products_count || 0 }} productos</span>

            <div class="flex items-center gap-2">
              <!-- Approve/Reject for pending -->
              <template v-if="shop.status === 'pending'">
                <button
                  @click="approveShop(shop.id)"
                  class="p-2 hover:bg-green-50 rounded text-green-600"
                  title="Aprobar"
                >
                  <Check class="w-4 h-4" />
                </button>
                <button
                  @click="rejectShop(shop.id)"
                  class="p-2 hover:bg-red-50 rounded text-red-600"
                  title="Rechazar"
                >
                  <X class="w-4 h-4" />
                </button>
              </template>

              <!-- Toggle Featured -->
              <button
                @click="toggleFeatured(shop.id)"
                :class="[
                  'p-2 rounded',
                  shop.is_featured ? 'hover:bg-yellow-50 text-yellow-600' : 'hover:bg-gray-50 text-gray-400'
                ]"
                title="Destacar"
              >
                <Star class="w-4 h-4" />
              </button>

              <!-- Toggle Verified -->
              <button
                @click="toggleVerified(shop.id)"
                :class="[
                  'p-2 rounded',
                  shop.is_verified ? 'hover:bg-blue-50 text-blue-600' : 'hover:bg-gray-50 text-gray-400'
                ]"
                title="Verificar"
              >
                <Shield class="w-4 h-4" />
              </button>

              <button class="text-accent hover:text-accent-hover text-sm font-medium ml-2">
                Editar
              </button>
            </div>
          </div>
        </div>

        <div v-if="shops.length === 0 && !loading" class="col-span-2 text-center py-8 text-text-secondary">
          No se encontraron tiendas
        </div>
      </div>
    </div>
  </div>
</template>