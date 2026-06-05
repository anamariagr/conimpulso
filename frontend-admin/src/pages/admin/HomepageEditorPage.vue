<template>
  <div class="homepage-editor">
    <div class="editor-header">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Editor de Inicio</h1>
        <p class="text-gray-500 mt-1">Personaliza el contenido de la página principal</p>
      </div>
      <div class="flex gap-3">
        <button
          @click="openLiveSite"
          class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          title="Ver sitio en vivo"
        >
          <ArrowTopRightOnSquareIcon class="w-5 h-5" />
          Ver Sitio
        </button>
        <button
          @click="previewMode = !previewMode"
          class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
        >
          <EyeIcon class="w-5 h-5" />
          {{ previewMode ? 'Editar' : 'Vista Previa' }}
        </button>
        <button
          @click="saveAllChanges"
          :disabled="saving"
          class="px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 disabled:opacity-50 flex items-center gap-2"
        >
          <ArrowDownTrayIcon v-if="!saving" class="w-5 h-5" />
          <span v-if="saving" class="animate-spin">⟳</span>
          {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
        </button>
      </div>
    </div>

    <div class="editor-content" :class="{ 'preview-mode': previewMode }">
      <!-- Left Panel: Sections & Elements -->
      <div class="left-panel" v-if="!previewMode">
        <div class="panel-tabs">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="['tab-btn', { active: activeTab === tab.id }]"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Banners Tab -->
        <div v-if="activeTab === 'banners'" class="panel-content">
          <div class="panel-section">
            <h3 class="font-semibold text-gray-800 mb-4">Posiciones de Banners</h3>
            <div class="banner-slots">
              <div
                v-for="slot in bannerSlots"
                :key="slot.id"
                class="banner-slot"
              >
                <div class="slot-header">
                  <span class="slot-name">{{ slot.label }}</span>
                  <span class="slot-count">{{ getBannersByPosition(slot.id).length }} banners</span>
                </div>
                <div class="slot-banners">
                  <div
                    v-for="banner in getBannersByPosition(slot.id)"
                    :key="banner.id"
                    class="banner-item"
                  >
                    <div class="banner-preview">
                      <img v-if="banner.media_type === 'image'" :src="banner.media_url" :alt="banner.title" />
                      <video v-else-if="banner.media_type === 'video'" :src="banner.media_url" />
                      <div v-else class="gif-indicator">GIF</div>
                    </div>
                    <div class="banner-info">
                      <span class="font-medium">{{ banner.title }}</span>
                      <span :class="['status-badge', banner.is_active ? 'active' : 'inactive']">
                        {{ banner.is_active ? 'Activo' : 'Inactivo' }}
                      </span>
                    </div>
                    <div class="banner-actions">
                      <button @click="editBanner(banner)" class="p-1 hover:bg-gray-100 rounded">
                        <PencilIcon class="w-4 h-4 text-gray-600" />
                      </button>
                      <button @click="deleteBanner(banner.id)" class="p-1 hover:bg-red-50 rounded">
                        <TrashIcon class="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                  <button @click="showBannerForm(slot.id)" class="add-banner-btn">
                    <PlusIcon class="w-4 h-4" />
                    Agregar Banner
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sections Tab -->
        <div v-if="activeTab === 'sections'" class="panel-content">
          <div class="panel-section">
            <h3 class="font-semibold text-gray-800 mb-4">Secciones de la Página</h3>
            <p class="text-sm text-gray-500 mb-4">Arrastra las secciones para reordenar su posición en la página.</p>

            <div class="sections-list">
              <div
                v-for="(section, index) in sections"
                :key="section.id"
                class="section-item"
                :class="{ disabled: !section.is_active }"
              >
                <div class="section-drag-handle">
                  <Bars3Icon class="w-5 h-5 text-gray-400" />
                </div>
                <div class="section-info">
                  <span class="font-medium">{{ section.name }}</span>
                  <span class="section-type">{{ section.type }}</span>
                </div>
                <div class="section-actions">
                  <button
                    @click="toggleSection(section)"
                    :class="['toggle-btn', section.is_active ? 'active' : '']"
                  >
                    <div class="toggle-track">
                      <div class="toggle-thumb"></div>
                    </div>
                  </button>
                  <button @click="editSection(section)" class="p-1 hover:bg-gray-100 rounded">
                    <PencilIcon class="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            <button @click="showSectionFormModal" class="add-section-btn mt-4">
              <PlusIcon class="w-5 h-5" />
              Agregar Nueva Sección
            </button>
          </div>
        </div>

        <!-- Layout Tab -->
        <div v-if="activeTab === 'layout'" class="panel-content">
          <div class="panel-section">
            <h3 class="font-semibold text-gray-800 mb-4">Configuración General</h3>

            <div class="config-group">
              <label class="config-label">Nombre del Logo</label>
              <input type="text" v-model="layoutSettings.logo_text" class="form-input" placeholder="NexusLab" />
            </div>

            <div class="config-group">
              <label class="config-label">URL del Logo (opcional)</label>
              <input type="url" v-model="layoutSettings.logo_url" class="form-input" placeholder="https://..." />
            </div>

            <div class="config-group">
              <label class="config-label">Ancho del Contenedor</label>
              <select v-model="layoutSettings.container_width" class="form-select">
                <option value="full">Ancho completo</option>
                <option value="lg">Large (1280px)</option>
                <option value="md">Medium (1024px)</option>
                <option value="sm">Small (768px)</option>
              </select>
            </div>

            <div class="config-group">
              <label class="config-label">Color de Fondo</label>
              <input type="color" v-model="layoutSettings.background_color" class="color-input" />
            </div>

            <div class="config-group">
              <label class="config-label">Padding Superior (px)</label>
              <input type="number" v-model="layoutSettings.padding_top" class="number-input" min="0" max="100" />
            </div>

            <div class="config-group">
              <label class="config-label">Padding Inferior (px)</label>
              <input type="number" v-model="layoutSettings.padding_bottom" class="number-input" min="0" max="100" />
            </div>

            <div class="config-group">
              <label class="config-label">Banners Flotantes</label>
              <select v-model="layoutSettings.floating_banners_enabled" class="form-select">
                <option :value="true">Activados</option>
                <option :value="false">Desactivados</option>
              </select>
              <p class="text-xs text-gray-500 mt-1">Los banners flotantes solo aparecen en la página de inicio</p>
            </div>

            <button @click="createInitialContent" class="btn-submit w-full mt-4">
              Crear Contenido Inicial
            </button>
          </div>
        </div>
      </div>

      <!-- Right Panel: Preview -->
      <div class="right-panel">
        <div class="preview-container">
          <div class="preview-frame">
            <!-- Simulated Homepage Preview -->
            <div class="homepage-preview">
              <!-- Header -->
              <div class="preview-header" :class="getContainerClass()">
                <div class="ph-logo">
                  <span class="logo-text">{{ layoutSettings.logo_text || 'NexusLab' }}</span>
                </div>
                <div class="ph-nav"></div>
              </div>

              <!-- Hero Section - Full width (container fluid) -->
              <div class="preview-hero" v-if="getBannersByPosition('hero').length">
                <template v-if="isYoutubeUrl(getBannersByPosition('hero')[0].media_url)">
                  <iframe
                    :src="getYoutubeEmbedUrl(getBannersByPosition('hero')[0].media_url)"
                    class="hero-video"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
                  ></iframe>
                </template>
                <template v-else>
                  <img
                    v-if="getBannersByPosition('hero')[0].media_type === 'image'"
                    :src="getBannersByPosition('hero')[0].media_url"
                    class="hero-image"
                  />
                  <video
                    v-else-if="getBannersByPosition('hero')[0].media_type === 'video'"
                    :src="getBannersByPosition('hero')[0].media_url"
                    class="hero-video"
                    autoplay muted loop
                  />
                </template>
                <div class="hero-content">
                  <h2>{{ getBannersByPosition('hero')[0].title }}</h2>
                  <p>{{ getBannersByPosition('hero')[0].subtitle }}</p>
                  <button v-if="getBannersByPosition('hero')[0].link_text">
                    {{ getBannersByPosition('hero')[0].link_text }}
                  </button>
                </div>
              </div>

              <!-- Container for rest of content (centered) -->
              <div class="homepage-container" :class="getContainerClass()">

                <!-- Sidebar Banners -->
                <div v-if="getBannersByPosition('sidebar').length" class="preview-sidebar">
                  <div
                    v-for="banner in getBannersByPosition('sidebar')"
                    :key="banner.id"
                    class="sidebar-banner"
                  >
                    <template v-if="isYoutubeUrl(banner.media_url)">
                      <iframe
                        :src="getYoutubeEmbedUrl(banner.media_url)"
                        class="sidebar-video"
                        frameborder="0"
                        allowfullscreen
                      ></iframe>
                    </template>
                    <template v-else>
                      <img v-if="banner.media_type === 'image'" :src="banner.media_url" :alt="banner.title" />
                      <video v-else-if="banner.media_type === 'video'" :src="banner.media_url" />
                    </template>
                  </div>
                </div>

                <!-- Sections Preview -->
                <div
                  v-for="section in orderedSections"
                  :key="section.id"
                  class="preview-section"
                  :style="{
                    backgroundColor: section.background_color,
                    paddingTop: section.padding_top + 'px',
                    paddingBottom: section.padding_bottom + 'px'
                  }"
                >
                  <div v-if="section.title" class="section-header">
                    <h3>{{ section.title }}</h3>
                    <p v-if="section.subtitle">{{ section.subtitle }}</p>
                  </div>

                  <!-- Featured Products Section -->
                  <div v-if="section.type === 'featured_products'" class="section-content" :class="section.layout">
                    <div
                      v-for="product in featuredProducts.slice(0, section.columns || 4)"
                      :key="product.id"
                      class="product-card"
                    >
                      <div class="product-image-wrap">
                        <img v-if="getProductImage(product)" :src="getProductImage(product)" :alt="product.name" class="product-card-image" />
                        <div v-else class="product-image-placeholder"></div>
                        <span class="product-badge" v-if="product.discount_percentage">{{ product.discount_percentage }}% OFF</span>
                      </div>
                      <div class="product-card-info">
                        <span class="product-shop-name" v-if="product.shop">{{ product.shop.name }}</span>
                        <h4 class="product-name">{{ product.name }}</h4>
                        <p class="product-description">{{ product.description }}</p>
                        <div class="product-prices">
                          <div class="price-detail">
                            <span class="price-label">Detal</span>
                            <span class="price-value">${{ formatPrice(product.price) }}</span>
                          </div>
                          <div class="price-detail" v-if="product.price_wholesale">
                            <span class="price-label">Mayor</span>
                            <span class="price-value wholesale">${{ formatPrice(product.price_wholesale) }}</span>
                          </div>
                        </div>
                        <div class="product-meta">
                          <span class="product-stock" :class="{ 'out-of-stock': !product.stock || product.stock <= 0 }">
                            {{ product.stock && product.stock > 0 ? product.stock + ' disponibles' : 'Sin stock' }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Categories Section -->
                  <div v-else-if="section.type === 'categories'" class="section-content" :class="section.layout">
                    <div
                      v-for="category in categories.slice(0, section.columns || 6)"
                      :key="category.id"
                      class="category-card-new"
                    >
                      <div class="category-icon-wrap">
                        <span class="category-emoji">{{ getCategoryIcon(category.name) }}</span>
                      </div>
                      <h4 class="category-title">{{ category.name }}</h4>
                      <p class="category-count">{{ getCategoryProductCount(category.id) }} productos</p>
                    </div>
                  </div>

                  <!-- Stores Section -->
                  <div v-else-if="section.type === 'stores'" class="section-content" :class="section.layout">
                    <div
                      v-for="shop in featuredShops.slice(0, section.columns || 3)"
                      :key="shop.id"
                      class="shop-card-new"
                    >
                      <div class="shop-banner-wrap">
                        <img v-if="shop.banner" :src="shop.banner" :alt="shop.name" class="shop-banner" />
                        <div v-else class="shop-banner-placeholder"></div>
                        <div class="shop-logo-wrap">
                          <img v-if="shop.logo" :src="shop.logo" :alt="shop.name" class="shop-logo" />
                          <div v-else class="shop-logo-placeholder">{{ shop.name?.charAt(0) }}</div>
                        </div>
                      </div>
                      <div class="shop-info">
                        <div class="shop-name-row">
                          <h4 class="shop-name">{{ shop.name }}</h4>
                          <span class="shop-verified" v-if="shop.is_verified">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                            Verificado
                          </span>
                        </div>
                        <p class="shop-location">{{ shop.city }}{{ shop.address ? ', ' + shop.address : '' }}</p>
                        <div class="shop-stats">
                          <span class="shop-stat">
                            <span class="stat-value">{{ shop.products_count || 0 }}</span> productos
                          </span>
                          <span class="shop-stat">
                            <span class="stat-value">{{ shop.rating || '5.0' }}</span>
                            <span class="star">★</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Newsletter Section -->
                  <div v-else-if="section.type === 'newsletter'" class="newsletter-preview">
                    <input type="email" placeholder="Tu correo electrónico" class="newsletter-input" />
                    <button class="newsletter-btn">Suscribirse</button>
                  </div>

                  <!-- Generic fallback for other section types -->
                  <div v-else class="section-content" :class="section.layout">
                    <div
                      v-for="i in (section.columns || 4)"
                      :key="i"
                      class="preview-card"
                    ></div>
                  </div>
                </div>
              </div><!-- end homepage-container -->
            </div><!-- end homepage-preview -->
          </div>
        </div>
      </div>
    </div>

    <!-- Banner Form Modal -->
    <div v-if="showBannerModal" class="modal-overlay" @click.self="showBannerModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ editingBanner ? 'Editar Banner' : 'Nuevo Banner' }}</h3>
          <button @click="showBannerModal = false" class="close-btn">×</button>
        </div>
        <form @submit.prevent="saveBanner" class="modal-body">
          <div class="form-group">
            <label>Título</label>
            <input type="text" v-model="bannerForm.title" required class="form-input" />
          </div>
          <div class="form-group">
            <label>Subtítulo</label>
            <input type="text" v-model="bannerForm.subtitle" class="form-input" />
          </div>
          <div class="form-group">
            <label>Tipo de Media</label>
            <select v-model="bannerForm.media_type" class="form-select">
              <option value="image">Imagen</option>
              <option value="video">Video</option>
              <option value="gif">GIF</option>
            </select>
          </div>
          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 mb-2">Media</label>
            <div class="flex gap-4 mb-2">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" v-model="mediaInputType" value="url" class="text-yellow-500" />
                <span class="text-sm">URL</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" v-model="mediaInputType" value="file" class="text-yellow-500" />
                <span class="text-sm">Subir archivo</span>
              </label>
            </div>
            <div v-if="mediaInputType === 'url'">
              <input type="url" v-model="bannerForm.media_url" required class="form-input" placeholder="https://..." />
            </div>
            <div v-else>
              <input type="file" ref="mediaFileInput" @change="handleMediaFileUpload" :accept="getAcceptTypes()" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100" />
              <div v-if="uploadingMedia" class="mt-2 text-sm text-gray-500">Subiendo... {{ uploadProgress }}%</div>
              <div v-if="mediaUploadError" class="mt-2 text-sm text-red-500">{{ mediaUploadError }}</div>
            </div>
          </div>
          <div class="form-group">
            <label>URL de Link (opcional)</label>
            <input type="url" v-model="bannerForm.link_url" class="form-input" />
          </div>
          <div class="form-group">
            <label>Texto del Botón</label>
            <input type="text" v-model="bannerForm.link_text" class="form-input" />
          </div>
          <div class="form-group">
            <label class="flex items-center gap-2">
              <input type="checkbox" v-model="bannerForm.is_active" />
              Banner Activo
            </label>
          </div>
          <div class="modal-footer">
            <button type="button" @click="showBannerModal = false" class="btn-cancel">Cancelar</button>
            <button type="submit" class="btn-submit">Guardar</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Section Form Modal -->
    <div v-if="showSectionModal" class="modal-overlay" @click.self="showSectionModal = false">
      <div class="modal modal-lg">
        <div class="modal-header">
          <h3>{{ editingSection ? 'Editar Sección' : 'Nueva Sección' }}</h3>
          <button @click="showSectionModal = false" class="close-btn">×</button>
        </div>
        <form @submit.prevent="saveSection" class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label>Nombre</label>
              <input type="text" v-model="sectionForm.name" required class="form-input" />
            </div>
            <div class="form-group">
              <label>Tipo</label>
              <select v-model="sectionForm.type" class="form-select">
                <option v-for="type in sectionTypes" :key="type.value" :value="type.value">
                  {{ type.label }}
                </option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Título</label>
              <input type="text" v-model="sectionForm.title" class="form-input" />
            </div>
            <div class="form-group">
              <label>Subtítulo</label>
              <input type="text" v-model="sectionForm.subtitle" class="form-input" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Layout</label>
              <select v-model="sectionForm.layout" class="form-select">
                <option value="grid">Cuadrícula</option>
                <option value="slider">Slider</option>
                <option value="list">Lista</option>
                <option value="masonry">Masonry</option>
              </select>
            </div>
            <div class="form-group">
              <label>Columnas</label>
              <input type="number" v-model="sectionForm.columns" min="1" max="6" class="form-input" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Color de Fondo</label>
              <input type="color" v-model="sectionForm.background_color" class="color-input" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Padding Superior (px)</label>
              <input type="number" v-model="sectionForm.padding_top" min="0" max="100" class="form-input" />
            </div>
            <div class="form-group">
              <label>Padding Inferior (px)</label>
              <input type="number" v-model="sectionForm.padding_bottom" min="0" max="100" class="form-input" />
            </div>
          </div>
          <div class="form-group">
            <label class="flex items-center gap-2">
              <input type="checkbox" v-model="sectionForm.is_active" />
              Sección Activa
            </label>
          </div>
          <div class="modal-footer">
            <button type="button" @click="showSectionModal = false" class="btn-cancel">Cancelar</button>
            <button type="submit" class="btn-submit">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { EyeIcon, ArrowDownTrayIcon, PlusIcon, PencilIcon, TrashIcon, Bars3Icon, ArrowTopRightOnSquareIcon } from '@heroicons/vue/24/outline'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// State
const tabs = [
  { id: 'banners', label: 'Banners' },
  { id: 'sections', label: 'Secciones' },
  { id: 'layout', label: 'Layout' }
]
const activeTab = ref('banners')
const previewMode = ref(false)
const saving = ref(false)

const banners = ref([])
const sections = ref([])
const featuredProducts = ref([])
const categories = ref([])
const featuredShops = ref([])
const layoutSettings = ref({
  background_color: '#ffffff',
  padding_top: 0,
  padding_bottom: 0,
  logo_text: 'NexusLab',
  logo_url: '',
  container_width: 'lg',
  floating_banners_enabled: true
})

const showBannerModal = ref(false)
const showSectionModal = ref(false)
const editingBanner = ref(null)
const editingSection = ref(null)

const bannerForm = ref({
  title: '', subtitle: '', media_type: 'image', media_url: '', link_url: '', link_text: '', position: 'hero', is_active: false
})

const mediaInputType = ref('url')
const mediaFileInput = ref(null)
const uploadingMedia = ref(false)
const uploadProgress = ref(0)
const mediaUploadError = ref('')

const sectionForm = ref({
  name: '', type: 'featured_products', title: '', subtitle: '', layout: 'grid', columns: 4,
  background_color: '#ffffff', padding_top: 16, padding_bottom: 16, is_active: true
})

const bannerSlots = [
  { id: 'hero', label: 'Hero Principal' },
  { id: 'floating_left', label: 'Flotante Izquierda' },
  { id: 'floating_right', label: 'Flotante Derecha' },
  { id: 'sidebar', label: 'Banner Lateral' },
  { id: 'between_sections', label: 'Entre Secciones' },
  { id: 'popup', label: 'Popup' }
]

const sectionTypes = [
  { value: 'hero', label: 'Hero con Slider' },
  { value: 'featured_products', label: 'Productos Destacados' },
  { value: 'categories', label: 'Categorías' },
  { value: 'stores', label: 'Tiendas Destacadas' },
  { value: 'slider', label: 'Slider de Contenido' },
  { value: 'cards_grid', label: 'Grid de Cards' },
  { value: 'banner', label: 'Banner Promocional' },
  { value: 'testimonials', label: 'Testimonios' },
  { value: 'newsletter', label: 'Newsletter' },
  { value: 'custom_html', label: 'HTML Personalizado' }
]

// Computed
const orderedSections = computed(() => {
  return [...sections.value].sort((a, b) => a.order - b.order)
})

// Methods
const getBannersByPosition = (position) => {
  return banners.value.filter(b => b.position === position)
}

// Check if URL is a YouTube video
const isYoutubeUrl = (url) => {
  if (!url) return false
  return url.includes('youtube.com') || url.includes('youtu.be')
}

// Get YouTube embed URL from various YouTube URL formats
const getYoutubeEmbedUrl = (url) => {
  if (!url) return ''
  // Already an embed URL
  if (url.includes('embed')) return url

  // youtu.be format
  if (url.includes('youtu.be')) {
    const videoId = url.split('/').pop().split('?')[0]
    return `https://www.youtube.com/embed/${videoId}`
  }

  // youtube.com/watch?v= format
  if (url.includes('watch')) {
    const urlParams = new URLSearchParams(url.split('?')[1])
    const videoId = urlParams.get('v')
    if (videoId) return `https://www.youtube.com/embed/${videoId}`
  }

  // youtube.com/v/ format
  if (url.includes('/v/')) {
    const videoId = url.split('/v/')[1].split('?')[0]
    return `https://www.youtube.com/embed/${videoId}`
  }

  return url
}

const getAcceptTypes = () => {
  if (bannerForm.value.media_type === 'video') return 'video/*'
  if (bannerForm.value.media_type === 'gif') return 'image/gif'
  return 'image/*'
}

// Format price with CLP formatting
const formatPrice = (price) => {
  if (!price) return '0'
  return new Intl.NumberFormat('es-CL').format(price)
}

// Get category icon emoji based on name
const getCategoryIcon = (name) => {
  const icons = {
    'Alimentos': '🍔',
    'Bebidas': '🥤',
    'Textiles': '👕',
    'Tecnología': '💻',
    'Muebles': '🪑',
    'Artesanía': '🎨',
    'Metalurgia': '⚙️',
    'Servicios': '🔧',
    'default': '📦'
  }
  for (const [key, icon] of Object.entries(icons)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return icon
  }
  return icons.default
}

// Get product image URL (handles JSON string or array)
const getProductImage = (product) => {
  if (!product.images) return null
  if (Array.isArray(product.images)) return product.images[0]
  // Try to parse if it's a JSON string
  try {
    const parsed = JSON.parse(product.images)
    return Array.isArray(parsed) ? parsed[0] : parsed
  } catch {
    return product.images
  }
}

// Get category product count (placeholder - returns random for demo)
const getCategoryProductCount = (categoryId) => {
  // In a real app, this would come from the API
  const counts = {
    1: 156, 7: 89, 13: 45, 19: 234, 22: 67, 27: 23, 31: 112
  }
  return counts[categoryId] || Math.floor(Math.random() * 100) + 20
}

// Get container class based on width setting
const getContainerClass = () => {
  const width = layoutSettings.value.container_width || 'lg'
  return {
    'container-full': width === 'full',
    'container-lg': width === 'lg',
    'container-md': width === 'md',
    'container-sm': width === 'sm'
  }
}

// Open live site in new tab - open client homepage
const openLiveSite = () => {
  window.open('http://127.0.0.1:5173', '_blank')
}

const handleMediaFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  uploadingMedia.value = true
  uploadProgress.value = 0
  mediaUploadError.value = ''

  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', bannerForm.value.media_type)

  try {
    const response = await axios.post('/api/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      onUploadProgress: (progressEvent) => {
        uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      }
    })

    if (response.data.success) {
      bannerForm.value.media_url = response.data.data.url
    }
  } catch (error) {
    mediaUploadError.value = error.response?.data?.message || 'Error al subir archivo'
  } finally {
    uploadingMedia.value = false
  }
}

const loadData = async () => {
  try {
    const [bannersRes, sectionsRes, layoutRes] = await Promise.all([
      api.get('/admin/homepage/banners'),
      api.get('/admin/homepage/sections'),
      api.get('/admin/homepage/layout')
    ])
    banners.value = bannersRes.data.data || []
    sections.value = sectionsRes.data.data || []

    // Load real data from layout endpoint
    const layoutData = layoutRes.data.data
    if (layoutData) {
      // Extract featured products, categories, and shops from API response
      if (layoutData.featured_products) {
        featuredProducts.value = layoutData.featured_products
      }
      if (layoutData.categories) {
        categories.value = layoutData.categories
      }
      if (layoutData.featured_shops) {
        featuredShops.value = layoutData.featured_shops
      }

      // Load layout settings from the layout object
      const layout = layoutData.layout || layoutData
      if (layout && layout.settings) {
        layoutSettings.value = {
          logo_text: layout.settings.logo_text || 'NexusLab',
          logo_url: layout.settings.logo_url || '',
          background_color: layout.settings.background_color || '#ffffff',
          padding_top: layout.settings.padding_top || 0,
          padding_bottom: layout.settings.padding_bottom || 0,
          container_width: layout.settings.container_width || 'lg',
          floating_banners_enabled: layout.settings.floating_banners_enabled !== false
        }
      }
    }
  } catch (error) {
    console.error('Error loading data:', error)
  }
}

const showBannerForm = (position) => {
  editingBanner.value = null
  mediaInputType.value = 'url'
  mediaUploadError.value = ''
  bannerForm.value = {
    title: '', subtitle: '', media_type: 'image', media_url: '', link_url: '', link_text: '', position, is_active: false
  }
  showBannerModal.value = true
}

const editBanner = (banner) => {
  editingBanner.value = banner.id
  mediaInputType.value = 'url'
  mediaUploadError.value = ''
  bannerForm.value = { ...banner }
  showBannerModal.value = true
}

const saveBanner = async () => {
  try {
    if (editingBanner.value) {
      await api.put(`/admin/homepage/banners/${editingBanner.value}`, bannerForm.value)
    } else {
      await api.post('/admin/homepage/banners', bannerForm.value)
    }
    localStorage.setItem('homepage_updated_at', String(Date.now()))
    showBannerModal.value = false
    await loadData()
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || 'Error al guardar banner'
    alert('Error: ' + errorMsg)
  }
}

const deleteBanner = async (id) => {
  if (!confirm('¿Eliminar este banner?')) return
  try {
    await api.delete(`/admin/homepage/banners/${id}`)
    await loadData()
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || 'Error al eliminar banner'
    alert('Error: ' + errorMsg)
  }
}

const showSectionFormModal = () => {
  editingSection.value = null
  sectionForm.value = {
    name: '', type: 'featured_products', title: '', subtitle: '', layout: 'grid', columns: 4,
    background_color: '#ffffff', padding_top: 16, padding_bottom: 16, is_active: true
  }
  showSectionModal.value = true
}

const editSection = (section) => {
  editingSection.value = section.id
  sectionForm.value = { ...section }
  showSectionModal.value = true
}

const saveSection = async () => {
  try {
    if (editingSection.value) {
      await api.put(`/admin/homepage/sections/${editingSection.value}`, sectionForm.value)
    } else {
      await api.post('/admin/homepage/sections', sectionForm.value)
    }
    localStorage.setItem('homepage_updated_at', String(Date.now()))
    showSectionModal.value = false
    await loadData()
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || 'Error al guardar sección'
    alert('Error: ' + errorMsg)
  }
}

const toggleSection = async (section) => {
  try {
    await api.put(`/admin/homepage/sections/${section.id}`, { is_active: !section.is_active })
    await loadData()
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || 'Error al cambiar estado'
    alert('Error: ' + errorMsg)
  }
}

const saveAllChanges = async () => {
  saving.value = true
  try {
    await api.put('/admin/homepage/layout', {
      settings: layoutSettings.value
    })
    alert('Cambios guardados exitosamente')
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || 'Error al guardar'
    alert('Error: ' + errorMsg)
  } finally {
    saving.value = false
  }
}

// Create initial content with sample banners and sections
const createInitialContent = async () => {
  if (!confirm('¿Crear contenido inicial? Esto agregará banners y secciones de ejemplo.')) return

  saving.value = true
  try {
    // Create hero banner
    await api.post('/admin/homepage/banners', {
      title: 'Bienvenido a NexusLab',
      subtitle: 'La plataforma marketplace más completa',
      media_type: 'image',
      media_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1920&q=80',
      link_url: '/products',
      link_text: 'Explorar',
      position: 'hero',
      is_active: true,
      order: 1
    })

    // Create sidebar banner
    await api.post('/admin/homepage/banners', {
      title: 'Oferta Especial',
      subtitle: '20% de descuento en tu primera compra',
      media_type: 'image',
      media_url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&q=80',
      link_url: '/promotions',
      link_text: 'Ver Oferta',
      position: 'sidebar',
      is_active: true,
      order: 1
    })

    // Create Featured Products section
    await api.post('/admin/homepage/sections', {
      name: 'Productos Destacados',
      key: 'featured_products',
      type: 'featured_products',
      title: 'Productos Destacados',
      subtitle: 'Los mejores productos de nuestras tiendas',
      layout: 'grid',
      columns: 4,
      background_color: '#ffffff',
      padding_top: 40,
      padding_bottom: 40,
      is_active: true,
      order: 1
    })

    // Create Categories section
    await api.post('/admin/homepage/sections', {
      name: 'Categorías',
      key: 'categories',
      type: 'categories',
      title: 'Explorar Categorías',
      subtitle: 'Navega por nuestras categorías principales',
      layout: 'grid',
      columns: 6,
      background_color: '#f9fafb',
      padding_top: 40,
      padding_bottom: 40,
      is_active: true,
      order: 2
    })

    // Create Stores section
    await api.post('/admin/homepage/sections', {
      name: 'Tiendas Destacadas',
      key: 'stores',
      type: 'stores',
      title: 'Tiendas Destacadas',
      subtitle: 'Las mejores tiendas en nuestra plataforma',
      layout: 'slider',
      columns: 3,
      background_color: '#ffffff',
      padding_top: 40,
      padding_bottom: 40,
      is_active: true,
      order: 3
    })

    // Create Banner section
    await api.post('/admin/homepage/sections', {
      name: 'Banner Promocional',
      key: 'promo_banner',
      type: 'banner',
      title: '',
      subtitle: '',
      layout: 'grid',
      columns: 1,
      background_color: '#fef3c7',
      padding_top: 20,
      padding_bottom: 20,
      is_active: true,
      order: 4
    })

    // Create Newsletter section
    await api.post('/admin/homepage/sections', {
      name: 'Newsletter',
      key: 'newsletter',
      type: 'newsletter',
      title: 'Suscríbete a nuestro newsletter',
      subtitle: 'Recibe las mejores ofertas y novedades',
      layout: 'list',
      columns: 1,
      background_color: '#1f2937',
      padding_top: 40,
      padding_bottom: 40,
      is_active: true,
      order: 5
    })

    await loadData()
    alert('¡Contenido inicial creado exitosamente!')
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || 'Error al crear contenido'
    alert('Error: ' + errorMsg)
  } finally {
    saving.value = false
  }
}

onMounted(loadData)
</script>

<style scoped>
.homepage-editor {
  min-height: 100vh;
  background: #f5f5f5;
}

.editor-header {
  background: white;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e5e5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.editor-content {
  display: grid;
  grid-template-columns: 400px 1fr;
  min-height: calc(100vh - 73px);
}

.editor-content.preview-mode {
  grid-template-columns: 1fr;
}

.left-panel {
  background: white;
  border-right: 1px solid #e5e5e5;
  overflow-y: auto;
}

.panel-tabs {
  display: flex;
  border-bottom: 1px solid #e5e5e5;
}

.tab-btn {
  flex: 1;
  padding: 12px;
  text-align: center;
  font-weight: 500;
  color: #666;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab-btn.active {
  color: #0A0A0A;
  border-bottom-color: #FFD700;
}

.panel-content {
  padding: 20px;
}

.panel-section {
  margin-bottom: 24px;
}

.banner-slots {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.banner-slot {
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  overflow: hidden;
}

.slot-header {
  background: #f5f5f5;
  padding: 12px;
  display: flex;
  justify-content: space-between;
  font-weight: 500;
  font-size: 14px;
}

.slot-count {
  color: #666;
  font-weight: normal;
}

.slot-banners {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.banner-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  background: #fafafa;
  border-radius: 6px;
}

.banner-preview {
  width: 60px;
  height: 40px;
  border-radius: 4px;
  overflow: hidden;
  background: #e5e5e5;
}

.banner-preview img, .banner-preview video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gif-indicator {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #FFD700;
  font-size: 10px;
  font-weight: bold;
}

.banner-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.status-badge {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
}

.status-badge.active {
  background: #dcfce7;
  color: #166534;
}

.status-badge.inactive {
  background: #f3f4f6;
  color: #666;
}

.banner-actions {
  display: flex;
  gap: 4px;
}

.add-banner-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  border: 1px dashed #ccc;
  border-radius: 6px;
  color: #666;
  font-size: 13px;
  transition: all 0.2s;
}

.add-banner-btn:hover {
  border-color: #FFD700;
  color: #0A0A0A;
  background: #FFFBEB;
}

.sections-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #e5e5e5;
}

.section-item.disabled {
  opacity: 0.5;
}

.section-drag-handle {
  cursor: grab;
}

.section-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.section-type {
  font-size: 12px;
  color: #666;
}

.toggle-btn {
  padding: 4px;
}

.toggle-track {
  width: 36px;
  height: 20px;
  background: #ccc;
  border-radius: 10px;
  position: relative;
  transition: background 0.2s;
}

.toggle-btn.active .toggle-track {
  background: #FFD700;
}

.toggle-thumb {
  width: 16px;
  height: 16px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.2s;
}

.toggle-btn.active .toggle-thumb {
  transform: translateX(16px);
}

.add-section-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px;
  border: 2px dashed #FFD700;
  border-radius: 8px;
  color: #0A0A0A;
  font-weight: 500;
  background: #FFFBEB;
}

.add-section-btn:hover {
  background: #FEF3C7;
}

.config-group {
  margin-bottom: 16px;
}

.config-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

.color-input {
  width: 60px;
  height: 36px;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  cursor: pointer;
}

.number-input {
  width: 100px;
  padding: 8px 12px;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
}

.right-panel {
  overflow: auto;
}

.preview-container {
  padding: 24px;
}

.preview-frame {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  overflow: hidden;
}

.homepage-preview {
  min-height: 600px;
}

.preview-header {
  height: 60px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 20px;
}

.ph-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 40px;
  background: #FFD700;
  border-radius: 8px;
}

.logo-text {
  font-size: 14px;
  font-weight: bold;
  color: #0A0A0A;
  padding: 0 8px;
}

.ph-nav {
  width: 200px;
  height: 20px;
  background: #e5e5e5;
  border-radius: 4px;
}

/* Container widths */
.homepage-container {
  margin: 0 auto;
  padding: 0 20px;
}

.container-full {
  max-width: 100%;
  padding: 0 20px;
}

.container-lg {
  max-width: 1280px;
}

.container-md {
  max-width: 1024px;
}

.container-sm {
  max-width: 768px;
}

/* Floating Banners */
.floating-banner {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.floating-left {
  left: 20px;
}

.floating-right {
  right: 20px;
}

.floating-banner-item {
  width: 120px;
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  background: #e5e5e5;
}

.floating-banner-item img,
.floating-banner-item video,
.floating-banner-item iframe {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.floating-video {
  height: 100%;
}

.preview-hero {
  position: relative;
  height: 300px;
  background: #1a1a1a;
  overflow: hidden;
}

.hero-image, .hero-video, iframe {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.7;
}

.preview-sidebar {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #f9fafb;
}

.sidebar-banner {
  flex: 1;
  border-radius: 8px;
  overflow: hidden;
  background: #e5e5e5;
}

.sidebar-banner img, .sidebar-banner video {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.sidebar-video {
  height: 150px;
}

.hero-content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  text-align: center;
}

.hero-content h2 {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 8px;
}

.hero-content button {
  margin-top: 16px;
  padding: 10px 24px;
  background: #FFD700;
  color: #0A0A0A;
  border-radius: 6px;
  font-weight: 600;
}

.preview-section {
  padding: 40px 20px;
}

.section-header {
  text-align: center;
  margin-bottom: 24px;
}

.section-header h3 {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 4px;
}

.section-content {
  display: grid;
  gap: 16px;
}

.section-content.grid {
  grid-template-columns: repeat(4, 1fr);
}

.preview-card {
  height: 120px;
  background: #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}

.card-image {
  width: 100%;
  height: 80px;
  object-fit: cover;
}

/* Product Card with prices */
.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: transform 0.2s, box-shadow 0.2s;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
}

.product-image-wrap {
  position: relative;
  height: 160px;
  overflow: hidden;
}

.product-card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-image-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%);
}

.product-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  background: #ef4444;
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 4px;
}

.product-card-info {
  padding: 12px;
}

.product-shop-name {
  font-size: 10px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.product-name {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin: 4px 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-description {
  font-size: 11px;
  color: #6b7280;
  line-height: 1.4;
  margin: 6px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-prices {
  display: flex;
  gap: 12px;
  margin: 10px 0;
}

.price-detail {
  display: flex;
  flex-direction: column;
}

.price-label {
  font-size: 9px;
  color: #9ca3af;
  text-transform: uppercase;
}

.price-value {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
}

.price-value.wholesale {
  color: #059669;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #f3f4f6;
}

.product-stock {
  font-size: 10px;
  color: #059669;
}

.product-stock.out-of-stock {
  color: #ef4444;
}

/* Category Card New */
.category-card-new {
  background: white;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.category-card-new:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
}

.category-icon-wrap {
  width: 64px;
  height: 64px;
  margin: 0 auto 12px;
  background: #fef3c7;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.category-emoji {
  font-size: 28px;
}

.category-title {
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.category-count {
  font-size: 11px;
  color: #6b7280;
}

/* Shop Card New */
.shop-card-new {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: transform 0.2s, box-shadow 0.2s;
}

.shop-card-new:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
}

.shop-banner-wrap {
  position: relative;
  height: 80px;
  overflow: hidden;
}

.shop-banner {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.shop-banner-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.shop-logo-wrap {
  position: absolute;
  bottom: -24px;
  left: 16px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid white;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.shop-logo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.shop-logo-placeholder {
  width: 100%;
  height: 100%;
  background: #FFD700;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #0A0A0A;
  font-size: 18px;
}

.shop-info {
  padding: 32px 16px 16px;
}

.shop-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.shop-name {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.shop-verified {
  display: flex;
  align-items: center;
  gap: 2px;
  color: #10b981;
  font-size: 11px;
  font-weight: 500;
}

.shop-location {
  font-size: 11px;
  color: #6b7280;
  margin-bottom: 8px;
}

.shop-stats {
  display: flex;
  gap: 16px;
}

.shop-stat {
  font-size: 11px;
  color: #6b7280;
}

.stat-value {
  font-weight: 600;
  color: #1f2937;
}

.star {
  color: #fbbf24;
}

.card-image-placeholder {
  width: 100%;
  height: 80px;
  background: linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%);
}

.card-info {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.card-title {
  font-size: 11px;
  font-weight: 500;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-price {
  font-size: 12px;
  font-weight: 700;
  color: #FFD700;
}

.card-shop, .card-location {
  font-size: 10px;
  color: #666;
}

.card-verified {
  font-size: 10px;
  color: #10b981;
  font-weight: 500;
}

/* Category Card */
.category-card {
  height: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid #e5e5e5;
}

.category-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.category-name {
  font-size: 11px;
  font-weight: 500;
  color: #333;
  text-align: center;
}

/* Shop Card */
.shop-card {
  background: white;
  border: 1px solid #e5e5e5;
}

.shop-card .card-image {
  height: 70px;
}

/* Newsletter Preview */
.newsletter-preview {
  display: flex;
  gap: 12px;
  max-width: 500px;
  margin: 0 auto;
}

.newsletter-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 8px;
  background: rgba(255,255,255,0.1);
  color: white;
  font-size: 14px;
}

.newsletter-input::placeholder {
  color: rgba(255,255,255,0.6);
}

.newsletter-btn {
  padding: 12px 24px;
  background: #FFD700;
  color: #0A0A0A;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-lg {
  max-width: 640px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e5e5;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: #f5f5f5;
  font-size: 20px;
  cursor: pointer;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

.form-input, .form-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  font-size: 14px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #e5e5e5;
  margin-top: 16px;
}

.btn-cancel {
  padding: 10px 20px;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  background: white;
  cursor: pointer;
}

.btn-submit {
  padding: 10px 20px;
  background: #FFD700;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

.btn-submit.w-full {
  width: 100%;
  margin-top: 12px;
}
</style>
