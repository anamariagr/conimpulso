<script setup lang="ts">
import { ref } from 'vue'
import { Search, Plus, ChevronRight } from 'lucide-vue-next'

const categories = ref([
  { id: 1, name: 'Alimentos y Bebidas', icon: '🍽️', subcategories: 12, products: 234 },
  { id: 2, name: 'Textiles y Ropa', icon: '👕', subcategories: 8, products: 189 },
  { id: 3, name: 'Artesanía', icon: '🎨', subcategories: 15, products: 156 },
  { id: 4, name: 'Tecnología', icon: '💻', subcategories: 6, products: 98 },
  { id: 5, name: 'Muebles', icon: '🪑', subcategories: 10, products: 87 },
])
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-primary">Categorías</h1>
        <p class="text-text-secondary">Organizar categorías y subcategorías</p>
      </div>
      <button class="btn-primary flex items-center gap-2">
        <Plus class="w-5 h-5" /> Nueva categoría
      </button>
    </div>

    <div class="card">
      <div class="relative max-w-md mb-6">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input type="text" placeholder="Buscar categorías..." class="input-field pl-10" />
      </div>

      <div class="space-y-2">
        <div
          v-for="category in categories"
          :key="category.id"
          class="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-accent transition-colors cursor-pointer"
        >
          <div class="flex items-center gap-4">
            <span class="text-2xl">{{ category.icon }}</span>
            <div>
              <h3 class="font-semibold text-primary">{{ category.name }}</h3>
              <p class="text-sm text-text-secondary">{{ category.subcategories }} subcategorías</p>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <span class="text-sm text-text-secondary">{{ category.products }} productos</span>
            <ChevronRight class="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
