<script setup lang="ts">
import { ref } from 'vue'
import { Search, Plus, Filter } from 'lucide-vue-next'

const users = ref([
  { id: 1, name: 'Juan Pérez', email: 'juan@example.com', role: 'vendor', status: 'active', created: '2024-01-15' },
  { id: 2, name: 'María García', email: 'maria@example.com', role: 'client', status: 'active', created: '2024-02-20' },
  { id: 3, name: 'Carlos López', email: 'carlos@example.com', role: 'advisor', status: 'pending', created: '2024-03-10' },
  { id: 4, name: 'Ana Martínez', email: 'ana@example.com', role: 'vendor', status: 'suspended', created: '2024-01-05' },
])
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-primary">Usuarios</h1>
        <p class="text-text-secondary">Gestionar usuarios de la plataforma</p>
      </div>
      <button class="btn-primary flex items-center gap-2">
        <Plus class="w-5 h-5" /> Nuevo usuario
      </button>
    </div>

    <div class="card">
      <div class="flex items-center gap-4 mb-6">
        <div class="relative flex-1 max-w-md">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Buscar usuarios..." class="input-field pl-10" />
        </div>
        <button class="btn-outline flex items-center gap-2">
          <Filter class="w-5 h-5" /> Filtros
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="text-left text-sm text-text-secondary border-b border-gray-100">
              <th class="pb-3 font-medium">Usuario</th>
              <th class="pb-3 font-medium">Rol</th>
              <th class="pb-3 font-medium">Estado</th>
              <th class="pb-3 font-medium">Fecha registro</th>
              <th class="pb-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="user in users" :key="user.id" class="text-sm">
              <td class="py-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
                    <span class="text-primary font-bold">{{ user.name.charAt(0) }}</span>
                  </div>
                  <div>
                    <p class="font-medium text-primary">{{ user.name }}</p>
                    <p class="text-xs text-text-secondary">{{ user.email }}</p>
                  </div>
                </div>
              </td>
              <td class="py-4">
                <span class="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium text-primary capitalize">
                  {{ user.role }}
                </span>
              </td>
              <td class="py-4">
                <span
                  :class="[
                    'px-2 py-1 rounded-full text-xs font-medium',
                    user.status === 'active' ? 'bg-green-100 text-green-700' :
                    user.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  ]"
                >
                  {{ user.status }}
                </span>
              </td>
              <td class="py-4 text-text-secondary">{{ user.created }}</td>
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