<script setup lang="ts">
import { ref } from 'vue'
import { Search, Plus, Filter, Image as ImageIcon } from 'lucide-vue-next'

const products = ref([
  { id: 1, name: 'Cerveza Artesanal IPA', shop: 'Cervecería Norteña', price: '$8,500', stock: 156, status: 'active' },
  { id: 2, name: 'Bolso de Cuero Genuino', shop: 'Cuero y Craft', price: '$45,000', stock: 23, status: 'active' },
  { id: 3, name: 'Mesa de Roble Maciza', shop: 'Carpintería El Roble', price: '$280,000', stock: 5, status: 'inactive' },
  { id: 4, name: 'Collar Artesanal', shop: 'Oro y Piedra', price: '$32,000', stock: 45, status: 'active' },
])
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-primary">Productos</h1>
        <p class="text-text-secondary">Gestionar productos de la plataforma</p>
      </div>
      <button class="btn-primary flex items-center gap-2">
        <Plus class="w-5 h-5" /> Nuevo producto
      </button>
    </div>

    <div class="card">
      <div class="flex items-center gap-4 mb-6">
        <div class="relative flex-1 max-w-md">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Buscar productos..." class="input-field pl-10" />
        </div>
        <button class="btn-outline flex items-center gap-2">
          <Filter class="w-5 h-5" /> Filtros
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="text-left text-sm text-text-secondary border-b border-gray-100">
              <th class="pb-3 font-medium">Producto</th>
              <th class="pb-3 font-medium">Tienda</th>
              <th class="pb-3 font-medium">Precio</th>
              <th class="pb-3 font-medium">Stock</th>
              <th class="pb-3 font-medium">Estado</th>
              <th class="pb-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="product in products" :key="product.id" class="text-sm">
              <td class="py-4">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <ImageIcon class="w-6 h-6 text-gray-400" />
                  </div>
                  <span class="font-medium text-primary">{{ product.name }}</span>
                </div>
              </td>
              <td class="py-4 text-text-secondary">{{ product.shop }}</td>
              <td class="py-4 font-medium text-primary">{{ product.price }}</td>
              <td class="py-4">
                <span :class="product.stock < 10 ? 'text-red-600' : 'text-text-secondary'">
                  {{ product.stock }}
                </span>
              </td>
              <td class="py-4">
                <span
                  :class="[
                    'px-2 py-1 rounded-full text-xs font-medium',
                    product.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  ]"
                >
                  {{ product.status }}
                </span>
              </td>
              <td class="py-4">
                <button class="text-accent hover:text-accent-hover text-sm font-medium">Editar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
