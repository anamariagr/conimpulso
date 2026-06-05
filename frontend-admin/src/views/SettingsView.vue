<script setup lang="ts">
import { ref } from 'vue'

const settings = ref({
  appName: 'NexusLab',
  appUrl: 'http://localhost',
  email: 'admin@nexuslab.com',
  currency: 'COP',
  timezone: 'America/Bogota',
  maintenanceMode: false,
  advisorMonetization: false,
})

function saveSettings() {
  console.log('Saving settings:', settings.value)
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-primary">Configuración</h1>
        <p class="text-text-secondary">Configuración general de la plataforma</p>
      </div>
      <button @click="saveSettings" class="btn-primary">Guardar cambios</button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Settings -->
      <div class="lg:col-span-2 space-y-6">
        <div class="card">
          <h2 class="text-lg font-semibold text-primary mb-6">General</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-primary mb-2">Nombre de la aplicación</label>
              <input v-model="settings.appName" type="text" class="input-field" />
            </div>
            <div>
              <label class="block text-sm font-medium text-primary mb-2">URL de la aplicación</label>
              <input v-model="settings.appUrl" type="text" class="input-field" />
            </div>
            <div>
              <label class="block text-sm font-medium text-primary mb-2">Email de contacto</label>
              <input v-model="settings.email" type="email" class="input-field" />
            </div>
          </div>
        </div>

        <div class="card">
          <h2 class="text-lg font-semibold text-primary mb-6">Localización</h2>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-primary mb-2">Moneda</label>
              <select v-model="settings.currency" class="input-field">
                <option value="COP">Peso Colombiano (COP)</option>
                <option value="USD">Dólar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-primary mb-2">Zona horaria</label>
              <select v-model="settings.timezone" class="input-field">
                <option value="America/Bogota">Bogotá (UTC-5)</option>
                <option value="America/Mexico_City">Ciudad de México (UTC-6)</option>
                <option value="America/Buenos_Aires">Buenos Aires (UTC-3)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar Settings -->
      <div class="space-y-6">
        <div class="card">
          <h2 class="text-lg font-semibold text-primary mb-6">Sistema</h2>
          <div class="space-y-4">
            <label class="flex items-center justify-between cursor-pointer">
              <span class="text-sm text-primary">Modo mantenimiento</span>
              <input v-model="settings.maintenanceMode" type="checkbox" class="rounded text-accent" />
            </label>
            <div class="pt-4 border-t border-gray-100">
              <p class="text-xs text-text-secondary">
                Cuando está activado, solo los administradores pueden acceder al sitio.
              </p>
            </div>
          </div>
        </div>

        <div class="card">
          <h2 class="text-lg font-semibold text-primary mb-6">Monetización</h2>
          <div class="space-y-4">
            <label class="flex items-center justify-between cursor-pointer">
              <span class="text-sm text-primary">Cobrar por conexión de asesores</span>
              <input v-model="settings.advisorMonetization" type="checkbox" class="rounded text-accent" />
            </label>
            <div class="pt-4 border-t border-gray-100">
              <p class="text-xs text-text-secondary">
                Si está desactivado, los asesores pueden conectar con tiendas gratis.
              </p>
            </div>
          </div>
        </div>

        <div class="card bg-accent/10 border-accent/20">
          <h3 class="font-semibold text-primary mb-2">Zona de peligro</h3>
          <p class="text-xs text-text-secondary mb-4">
            Estas acciones son irreversibles. Procede con precaución.
          </p>
          <button class="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors">
            Reiniciar plataforma
          </button>
        </div>
      </div>
    </div>
  </div>
</template>