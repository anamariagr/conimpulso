<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import {
  TrendingUp, Users, ShoppingBag, DollarSign, ArrowUpRight, ArrowDownRight,
  Layout, Store, Package, Grid3X3, AlertTriangle,
  CheckCircle, Clock, XCircle, Eye, Edit
} from 'lucide-vue-next'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

const salesData = {
  labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Ventas',
      data: [30, 45, 35, 50, 40, 60],
      borderColor: '#FFD700',
      backgroundColor: 'rgba(255, 215, 0, 0.1)',
      tension: 0.4,
      fill: true,
    },
  ],
}

const salesOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#9CA3AF' },
    },
    y: {
      grid: { color: 'rgba(0,0,0,0.05)' },
      ticks: { color: '#9CA3AF' },
    },
  },
}

const topProducts = [
  { name: 'Cerveza Artesanal', store: 'Cervecería Norteña', sales: 234, growth: '+12%' },
  { name: 'Bolso de Cuero', store: 'Cuero y Craft', sales: 189, growth: '+8%' },
  { name: 'Mesa de Roble', store: 'Carpintería El Roble', sales: 156, growth: '+15%' },
  { name: 'Joyería Artesanal', store: 'Oro y Piedra', sales: 134, growth: '+5%' },
]

const metrics = [
  { label: 'Ventas del mes', value: '$12,345,000', change: '+12.5%', up: true, icon: DollarSign },
  { label: 'Nuevos pedidos', value: '1,234', change: '+8.2%', up: true, icon: ShoppingBag },
  { label: 'Usuarios activos', value: '45,678', change: '+15.3%', up: true, icon: Users },
  { label: 'Tasa de conversión', value: '3.24%', change: '-0.5%', up: false, icon: TrendingUp },
]

const platformStats = [
  { label: 'Total Tiendas', value: '234', change: '+12', icon: Store, color: 'bg-blue-500' },
  { label: 'Total Productos', value: '5,678', change: '+234', icon: Package, color: 'bg-green-500' },
  { label: 'Total Usuarios', value: '12,456', change: '+456', icon: Users, color: 'bg-purple-500' },
  { label: 'Categorías', value: '48', change: '+3', icon: Grid3X3, color: 'bg-yellow-500' },
]

const recentOrders = ref([
  { id: 'ORD-001', customer: 'María García', product: 'Cerveza Artesanal x6', amount: '$51,000', status: 'completed' },
  { id: 'ORD-002', customer: 'Juan Rodríguez', product: 'Bolso de Cuero', amount: '$45,000', status: 'pending' },
  { id: 'ORD-003', customer: 'Ana López', product: 'Mesa de Roble', amount: '$280,000', status: 'completed' },
  { id: 'ORD-004', customer: 'Carlos Díaz', product: 'Joyería Artesanal', amount: '$65,000', status: 'processing' },
])

const pendingApprovals = ref([
  { type: 'Tienda', name: 'Cervecería Norteña', status: 'pending', time: '2 horas' },
  { type: 'Producto', name: 'Artefacto de Cocina', status: 'pending', time: '5 horas' },
  { type: 'Usuario', name: 'Carlos Mendoza', status: 'pending', time: '1 día' },
])

</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-primary">Dashboard Super Admin</h1>
        <p class="text-text-secondary">Gestión completa de la plataforma NexusLab</p>
      </div>
      <div class="flex gap-3">
        <RouterLink to="/homepage-editor" class="btn-primary flex items-center gap-2">
          <Layout class="w-5 h-5" />
          Editor de Inicio
        </RouterLink>
        <button class="btn-outline">Descargar reporte</button>
      </div>
    </div>

    <!-- Quick Access Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <RouterLink to="/homepage-editor" class="card hover:shadow-lg transition-shadow group">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-yellow-400/20 rounded-xl flex items-center justify-center">
            <Layout class="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <p class="font-semibold text-primary group-hover:text-yellow-600 transition-colors">Editor de Inicio</p>
            <p class="text-sm text-text-secondary">Banners y secciones</p>
          </div>
        </div>
      </RouterLink>

      <RouterLink to="/users" class="card hover:shadow-lg transition-shadow group">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
            <Users class="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p class="font-semibold text-primary group-hover:text-blue-600 transition-colors">Usuarios</p>
            <p class="text-sm text-text-secondary">Clientes y asesores</p>
          </div>
        </div>
      </RouterLink>

      <RouterLink to="/shops" class="card hover:shadow-lg transition-shadow group">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
            <Store class="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p class="font-semibold text-primary group-hover:text-green-600 transition-colors">Tiendas</p>
            <p class="text-sm text-text-secondary">Gestionar tiendas</p>
          </div>
        </div>
      </RouterLink>

      <RouterLink to="/products" class="card hover:shadow-lg transition-shadow group">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
            <Package class="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p class="font-semibold text-primary group-hover:text-purple-600 transition-colors">Productos</p>
            <p class="text-sm text-text-secondary">Catálogo completo</p>
          </div>
        </div>
      </RouterLink>
    </div>

    <!-- Platform Stats (Super Admin) -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div v-for="stat in platformStats" :key="stat.label" class="metrics-card">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-primary/70 font-medium">{{ stat.label }}</span>
          <div :class="['w-8 h-8 rounded-lg flex items-center justify-center', stat.color]">
            <component :is="stat.icon" class="w-4 h-4 text-white" />
          </div>
        </div>
        <p class="text-3xl font-bold text-primary">{{ stat.value }}</p>
        <p class="text-xs text-green-600 mt-1">{{ stat.change }} nuevos</p>
      </div>
    </div>

    <!-- Metrics Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div v-for="metric in metrics" :key="metric.label" class="metrics-card">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-primary/70 font-medium">{{ metric.label }}</span>
          <component :is="metric.icon" class="w-5 h-5 text-primary/50" />
        </div>
        <p class="text-3xl font-bold text-primary">{{ metric.value }}</p>
        <div class="flex items-center gap-1 mt-1">
          <ArrowUpRight v-if="metric.up" class="w-4 h-4 text-green-600" />
          <ArrowDownRight v-else class="w-4 h-4 text-red-500" />
          <span :class="metric.up ? 'text-green-600' : 'text-red-500'" class="text-sm font-medium">
            {{ metric.change }}
          </span>
          <span class="text-primary/50 text-sm">vs mes anterior</span>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Sales Chart -->
      <div class="lg:col-span-2 card">
        <h2 class="text-lg font-semibold text-primary mb-4">Ventas de los últimos 6 meses</h2>
        <div class="h-64">
          <Line :data="salesData" :options="salesOptions" />
        </div>
      </div>

      <!-- Top Products -->
      <div class="card">
        <h2 class="text-lg font-semibold text-primary mb-4">Productos más vendidos</h2>
        <div class="space-y-4">
          <div
            v-for="(product, index) in topProducts"
            :key="product.name"
            class="flex items-center gap-3"
          >
            <span class="w-6 h-6 bg-accent/20 rounded-full flex items-center justify-center text-xs font-bold text-primary">
              {{ index + 1 }}
            </span>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-primary truncate">{{ product.name }}</p>
              <p class="text-xs text-text-secondary">{{ product.store }}</p>
            </div>
            <div class="text-right">
              <p class="font-semibold text-primary">{{ product.sales }}</p>
              <p class="text-xs text-green-600">{{ product.growth }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Management Tables Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Pending Approvals -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-primary flex items-center gap-2">
            <Clock class="w-5 h-5 text-yellow-500" />
            Pendientes de Aprobación
          </h2>
          <a href="#" class="text-accent hover:text-accent-hover text-sm font-medium">Ver todos</a>
        </div>
        <div class="space-y-3">
          <div
            v-for="item in pendingApprovals"
            :key="item.name"
            class="flex items-center justify-between p-3 bg-yellow-50 rounded-xl border border-yellow-100"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertTriangle class="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p class="font-medium text-primary">{{ item.name }}</p>
                <p class="text-xs text-text-secondary">{{ item.type }} • {{ item.time }}</p>
              </div>
            </div>
            <div class="flex gap-2">
              <button class="p-2 bg-green-100 hover:bg-green-200 rounded-lg transition-colors">
                <CheckCircle class="w-4 h-4 text-green-600" />
              </button>
              <button class="p-2 bg-red-100 hover:bg-red-200 rounded-lg transition-colors">
                <XCircle class="w-4 h-4 text-red-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- System Alerts -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-primary flex items-center gap-2">
            <AlertTriangle class="w-5 h-5 text-orange-500" />
            Alertas del Sistema
          </h2>
        </div>
        <div class="space-y-4">
          <div class="flex items-start gap-3 p-3 bg-yellow-50 rounded-xl border border-yellow-100">
            <div class="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
            <div>
              <p class="font-medium text-primary text-sm">3 tiendas pendientes de aprobación</p>
              <p class="text-xs text-text-secondary mt-1">Revisar tiendas nuevas en cola de moderación</p>
            </div>
          </div>
          <div class="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
            <div class="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <div>
              <p class="font-medium text-primary text-sm">12 productos en revisión</p>
              <p class="text-xs text-text-secondary mt-1">Contenido pendiente de verificación</p>
            </div>
          </div>
          <div class="flex items-start gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
            <div class="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <div>
              <p class="font-medium text-primary text-sm">Sistema operando normalmente</p>
              <p class="text-xs text-text-secondary mt-1">Todos los servicios activos</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Orders -->
    <div class="card">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-primary">Pedidos recientes</h2>
        <a href="#" class="text-accent hover:text-accent-hover text-sm font-medium">Ver todos</a>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="text-left text-sm text-text-secondary border-b border-gray-100">
              <th class="pb-3 font-medium">Orden</th>
              <th class="pb-3 font-medium">Cliente</th>
              <th class="pb-3 font-medium">Producto</th>
              <th class="pb-3 font-medium">Monto</th>
              <th class="pb-3 font-medium">Estado</th>
              <th class="pb-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="order in recentOrders" :key="order.id" class="text-sm">
              <td class="py-3 font-medium text-primary">{{ order.id }}</td>
              <td class="py-3 text-text-secondary">{{ order.customer }}</td>
              <td class="py-3 text-text-secondary truncate max-w-[150px]">{{ order.product }}</td>
              <td class="py-3 font-medium text-primary">{{ order.amount }}</td>
              <td class="py-3">
                <span
                  :class="[
                    'px-2 py-1 rounded-full text-xs font-medium',
                    order.status === 'completed' ? 'bg-green-100 text-green-700' :
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  ]"
                >
                  {{ order.status }}
                </span>
              </td>
              <td class="py-3">
                <div class="flex gap-2">
                  <button class="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors" title="Ver">
                    <Eye class="w-4 h-4 text-gray-600" />
                  </button>
                  <button class="p-1.5 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors" title="Editar">
                    <Edit class="w-4 h-4 text-blue-600" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
