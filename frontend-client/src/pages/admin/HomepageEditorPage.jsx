import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye, EyeOff, Save, Plus, Pencil, Trash2, X, ExternalLink,
  Layout, Image as ImageIcon, Video, FileText, CheckCircle, AlertCircle, Edit, Upload, FolderOpen
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useSiteStore } from '../../stores/siteStore';

const bannerSlots = [
  { id: 'hero', label: 'Hero Principal' },
  { id: 'floating_left', label: 'Flotante Izquierda' },
  { id: 'floating_right', label: 'Flotante Derecha' },
  { id: 'sidebar', label: 'Banner Lateral' },
  { id: 'between_sections', label: 'Entre Secciones' },
  { id: 'popup', label: 'Popup' }
];

const sectionTypes = [
  { value: 'featured_products', label: 'Productos Destacados' },
  { value: 'categories', label: 'Categorías' },
  { value: 'stores', label: 'Tiendas Destacadas' },
  { value: 'slider', label: 'Slider de Contenido' },
  { value: 'cards_grid', label: 'Grid de Cards' },
  { value: 'banner', label: 'Banner Promocional' },
  { value: 'newsletter', label: 'Newsletter' },
  { value: 'testimonials', label: 'Testimonios' },
  { value: 'custom_html', label: 'HTML Personalizado' }
];

const layoutOptions = [
  { value: 'grid', label: 'Cuadrícula' },
  { value: 'slider', label: 'Slider' },
  { value: 'list', label: 'Lista' },
  { value: 'masonry', label: 'Masonry' }
];

export default function HomepageEditorPage() {
  const navigate = useNavigate();
  const { logoUrl, siteName, updateSettings } = useSiteStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('banners');
  const [previewMode, setPreviewMode] = useState(false);

  // Logo states
  const [logoPreview, setLogoPreview] = useState(null);
  const [pendingLogoUrl, setPendingLogoUrl] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoFileRef = useRef(null);
  const [logoHistory, setLogoHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ci_logo_history') || '[]'); }
    catch { return []; }
  });

  // Data states
  const [banners, setBanners] = useState([]);
  const [sections, setSections] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [featuredShops, setFeaturedShops] = useState([]);

  // Modal states
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [editingSection, setEditingSection] = useState(null);

  // Form states
  const [bannerForm, setBannerForm] = useState({
    title: '', subtitle: '', media_type: 'image', media_url: '', link_url: '', link_text: '', position: 'hero', is_active: false,
    vendor_title: '', vendor_description: '', buyer_title: '', buyer_description: '',
  });
  const [sectionForm, setSectionForm] = useState({
    name: '', type: 'featured_products', title: '', subtitle: '', layout: 'grid', columns: 4,
    background_color: '#ffffff', padding_top: 16, padding_bottom: 16, is_active: true, items: []
  });

  // Product picker (for the "featured_products" section type)
  const [productSearch, setProductSearch] = useState('');
  const [productResults, setProductResults] = useState([]);
  const [searchingProducts, setSearchingProducts] = useState(false);
  const productSearchTimeout = useRef(null);

  // Banner media upload states
  const [mediaInputType, setMediaInputType] = useState('file');
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mediaUploadError, setMediaUploadError] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const modalId = useRef(Date.now());

  useEffect(() => {
    loadData();
  }, []);

  // ── Logo handlers ──────────────────────────────────────────────
  const handleLogoFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Solo imágenes (PNG, JPG, SVG)'); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error('Máximo 2 MB'); return; }
    setLogoPreview(URL.createObjectURL(file));
    setUploadingLogo(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('type', 'image');
      const res = await api.post('/media/upload', fd, {
        headers: { 'Content-Type': undefined },
      });
      const url = res.data?.data?.url || res.data?.url;
      if (!url) throw new Error();
      setPendingLogoUrl(url);
      setLogoHistory(prev => {
        const updated = [url, ...prev.filter(u => u !== url)].slice(0, 16);
        localStorage.setItem('ci_logo_history', JSON.stringify(updated));
        return updated;
      });
      toast.success('Logo cargado — guarda para aplicar');
    } catch {
      toast.error('Error al subir el logo');
      setLogoPreview(null);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSaveLogo = async () => {
    if (pendingLogoUrl === null) return;
    try {
      await updateSettings({ logo_url: pendingLogoUrl });
      toast.success('Logo guardado');
      setPendingLogoUrl(null);
      setLogoPreview(null);
    } catch {
      toast.error('Error al guardar el logo');
    }
  };

  const handleRemoveLogo = async () => {
    try {
      await updateSettings({ logo_url: '' });
      setLogoPreview(null);
      setPendingLogoUrl(null);
      toast.success('Logo eliminado');
    } catch {
      toast.error('Error al eliminar el logo');
    }
  };
  // ──────────────────────────────────────────────────────────────

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('Loading homepage data...');

      // Load banners - correct API path is /admin/homepage/banners
      let bannersData = [];
      try {
        const bannersRes = await api.get('/admin/homepage/banners');
        console.log('Banners response:', bannersRes.data);
        bannersData = bannersRes.data.data || [];
        setBanners(bannersData);
      } catch (e) {
        console.log('Banners error:', e.message);
      }

      // Load sections - correct API path is /admin/homepage/sections
      let sectionsData = [];
      try {
        const sectionsRes = await api.get('/admin/homepage/sections');
        console.log('Sections response:', sectionsRes.data);
        sectionsData = sectionsRes.data.data || [];
        console.log('Setting sections:', sectionsData.length, 'items');
        setSections(sectionsData);
      } catch (e) {
        console.log('Sections error:', e.message);
      }

      // Load preview data
      try {
        const activeRes = await api.get('/homepage/active');
        console.log('Active homepage response:', activeRes.data);
        const data = activeRes.data.data;
        if (data.featured_products) setFeaturedProducts(data.featured_products);
        if (data.categories) setCategories(data.categories);
        if (data.featured_shops) setFeaturedShops(data.featured_shops);
        if (data.sections) {
          // Merge any extra section data from activeLayout
          console.log('Sections from activeLayout:', data.sections.length);
        }
      } catch (e) {
        console.log('Active homepage error:', e.message);
        // Use fallback sample data
        setFeaturedProducts([
          { id: 1, name: 'Producto 1', price: 100, images: [] },
          { id: 2, name: 'Producto 2', price: 200, images: [] },
        ]);
        setCategories([
          { id: 1, name: 'Categoría 1', icon: '📦' },
          { id: 2, name: 'Categoría 2', icon: '🎨' },
        ]);
        setFeaturedShops([
          { id: 1, name: 'Tienda 1', logo: null },
          { id: 2, name: 'Tienda 2', logo: null },
        ]);
      }

      console.log('Final sections state:', sectionsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBannersByPosition = (position) => {
    return banners.filter(b => b.position === position);
  };

  const openLiveSite = () => {
    window.open('/', '_blank');
  };

  const showBannerForm = (position) => {
    setEditingBanner(null);
    modalId.current = Date.now();
    setMediaInputType('file');
    setMediaUploadError('');
    setUploadedFileName('');
    setUploadProgress(0);
    setBannerForm({
      title: '', subtitle: '', media_type: 'video', media_url: '', link_url: '', link_text: '', position, is_active: false,
      vendor_title: '', vendor_description: '', buyer_title: '', buyer_description: '',
    });
    setShowBannerModal(true);
  };

  const editBanner = (banner) => {
    setEditingBanner(banner.id);
    modalId.current = Date.now();
    // Auto-detect: if media_url is an external URL (YouTube, http...) use URL mode
    const isExternalUrl = banner.media_url && banner.media_url.startsWith('http');
    setMediaInputType(isExternalUrl ? 'url' : 'file');
    setMediaUploadError('');
    setUploadedFileName('');
    setUploadProgress(0);
    setBannerForm({ ...banner });
    setShowBannerModal(true);
  };

  const getAcceptTypes = () => {
    if (bannerForm.media_type === 'video') return 'video/*';
    if (bannerForm.media_type === 'gif') return 'image/gif';
    return 'image/*';
  };

  const getDropzoneHint = () => {
    if (bannerForm.media_type === 'video') return 'MP4, WebM u OGG · máximo 100 MB';
    if (bannerForm.media_type === 'gif') return 'GIF animado';
    return 'JPG, PNG, GIF, WebP o SVG';
  };

  const openFilePicker = () => {
    const el = document.getElementById('media-file-input-' + modalId.current);
    if (el) el.click();
    else if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleMediaFileUpload = async (file) => {
    if (!file) return;

    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      setMediaUploadError(`El archivo es demasiado grande (${(file.size / 1024 / 1024).toFixed(1)} MB). Máximo 100 MB.`);
      return;
    }

    if (bannerForm.media_type === 'video' && !file.type.startsWith('video/')) {
      setMediaUploadError('Por favor selecciona un archivo de video válido (mp4, webm, ogg).');
      return;
    }
    if (bannerForm.media_type === 'image' && !file.type.startsWith('image/')) {
      setMediaUploadError('Por favor selecciona un archivo de imagen válido.');
      return;
    }

    setUploadingMedia(true);
    setUploadProgress(0);
    setMediaUploadError('');
    setUploadedFileName('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', bannerForm.media_type);

    try {
      const response = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': undefined },
        onUploadProgress: (progressEvent) => {
          const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(pct);
        },
      });

      if (response.data.success) {
        setBannerForm((prev) => ({ ...prev, media_url: response.data.data.url }));
        setUploadedFileName(file.name);
      }
    } catch (error) {
      setMediaUploadError(error.response?.data?.message || 'Error al subir archivo');
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    handleMediaFileUpload(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) handleMediaFileUpload(file);
  };

  const clearUploadedFile = () => {
    setUploadedFileName('');
    setBannerForm((prev) => ({ ...prev, media_url: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onMediaTypeChange = (newType) => {
    setBannerForm((prev) => ({ ...prev, media_type: newType, media_url: '' }));
    setUploadedFileName('');
    setMediaUploadError('');
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const saveBanner = async () => {
    try {
      console.log('Saving banner:', editingBanner ? `Updating ${editingBanner}` : 'Creating new', bannerForm);
      if (editingBanner) {
        await api.put(`/admin/homepage/banners/${editingBanner}`, bannerForm);
        console.log('Banner updated successfully');
      } else {
        await api.post('/admin/homepage/banners', bannerForm);
        console.log('Banner created successfully');
      }
      setShowBannerModal(false);
      loadData();
      toast.success('Banner guardado');
      localStorage.setItem('homepage_updated_at', String(Date.now()));
      // Reload homepage data in this browser tab
      window.dispatchEvent(new Event('homepage-updated'));
    } catch (error) {
      console.error('Error saving banner:', error);
      const msg = error.response?.data?.message
        || (error.response?.data?.errors ? Object.values(error.response.data.errors).flat().join(' ') : null)
        || error.message
        || 'Error al guardar banner';
      toast.error(msg);
    }
  };

  const deleteBanner = async (id) => {
    if (!confirm('¿Eliminar este banner?')) return;
    try {
      await api.delete(`/admin/homepage/banners/${id}`);
      loadData();
      toast.success('Banner eliminado');
    } catch (error) {
      toast.error('Error al eliminar banner');
    }
  };

  const showSectionForm = () => {
    setEditingSection(null);
    setSectionForm({
      name: '', type: 'featured_products', title: '', subtitle: '', layout: 'grid', columns: 4,
      background_color: '#ffffff', padding_top: 16, padding_bottom: 16, is_active: true, items: []
    });
    setProductSearch('');
    setProductResults([]);
    setShowSectionModal(true);
  };

  const editSection = (section) => {
    setEditingSection(section.id);
    setSectionForm({ items: [], ...section });
    setProductSearch('');
    setProductResults([]);
    setShowSectionModal(true);
  };

  const handleProductSearch = (value) => {
    setProductSearch(value);
    clearTimeout(productSearchTimeout.current);
    if (!value.trim()) {
      setProductResults([]);
      return;
    }
    productSearchTimeout.current = setTimeout(async () => {
      setSearchingProducts(true);
      try {
        const res = await api.get('/products', { params: { search: value, per_page: 8 } });
        setProductResults(res.data.data || []);
      } catch {
        setProductResults([]);
      } finally {
        setSearchingProducts(false);
      }
    }, 300);
  };

  const addPickedProduct = (product) => {
    setSectionForm((prev) => {
      const items = prev.items || [];
      if (items.some((i) => i.id === product.id)) return prev;
      return { ...prev, items: [...items, { id: product.id, name: product.name, image: getProductImage(product) }] };
    });
    setProductSearch('');
    setProductResults([]);
  };

  const removePickedProduct = (id) => {
    setSectionForm((prev) => ({ ...prev, items: (prev.items || []).filter((i) => i.id !== id) }));
  };

  const saveSection = async () => {
    try {
      console.log('Saving section:', editingSection ? `Updating ${editingSection}` : 'Creating new', sectionForm);
      if (editingSection) {
        await api.put(`/admin/homepage/sections/${editingSection}`, sectionForm);
        console.log('Section updated successfully');
      } else {
        await api.post('/admin/homepage/sections', sectionForm);
        console.log('Section created successfully');
      }
      setShowSectionModal(false);
      loadData();
      toast.success('Sección guardada');
      localStorage.setItem('homepage_updated_at', String(Date.now()));
      // Reload homepage data in this browser tab
      window.dispatchEvent(new Event('homepage-updated'));
    } catch (error) {
      console.error('Error saving section:', error);
      toast.error('Error al guardar sección');
    }
  };

  const deleteSection = async (id) => {
    if (!confirm('¿Eliminar esta sección?')) return;
    try {
      await api.delete(`/admin/homepage/sections/${id}`);
      loadData();
      toast.success('Sección eliminada');
    } catch (error) {
      toast.error('Error al eliminar sección');
    }
  };

  const toggleSectionActive = async (section) => {
    try {
      await api.put(`/admin/homepage/sections/${section.id}`, { is_active: !section.is_active });
      loadData();
    } catch (error) {
      toast.error('Error al actualizar sección');
    }
  };

  const getProductImage = (product) => {
    if (!product?.images) return 'https://picsum.photos/seed/default/400/400';
    if (Array.isArray(product.images)) return product.images[0];
    try {
      const parsed = JSON.parse(product.images);
      return Array.isArray(parsed) ? parsed[0] : parsed;
    } catch {
      return product.images;
    }
  };

  const getCategoryIcon = (name) => {
    const icons = {
      'Alimentos': '🍽️', 'Bebidas': '🥤', 'Textiles': '👕', 'Ropa': '👗',
      'Tecnología': '💻', 'Muebles': '🪑', 'Artesanía': '🎨',
      'Metalurgia': '⚙️', Servicios: '🔧', default: '📦'
    };
    for (const [key, icon] of Object.entries(icons)) {
      if (name?.toLowerCase().includes(key.toLowerCase())) return icon;
    }
    return icons.default;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="homepage-editor">
      {/* Header */}
      <div className="editor-header flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editor de Inicio</h1>
          <p className="text-gray-500 mt-1">Personaliza el contenido de la página principal</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={openLiveSite}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <ExternalLink className="w-5 h-5" />
            Ver Sitio
          </button>
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            {previewMode ? <Edit className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            {previewMode ? 'Editar' : 'Vista Previa'}
          </button>
          <button
            onClick={loadData}
            disabled={saving}
            className="px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            Actualizar
          </button>
        </div>
      </div>

      <div className="editor-content flex gap-6">
        {/* Left Panel */}
        {!previewMode && (
          <div className="left-panel w-1/3 bg-white rounded-xl shadow-sm p-6">
            <div className="flex gap-2 mb-6 border-b pb-2 flex-wrap">
              <button
                onClick={() => setActiveTab('banners')}
                className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'banners' ? 'bg-accent text-primary' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Banners
              </button>
              <button
                onClick={() => setActiveTab('sections')}
                className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'sections' ? 'bg-accent text-primary' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Secciones
              </button>
              <button
                onClick={() => setActiveTab('logo')}
                className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'logo' ? 'bg-accent text-primary' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Logo
              </button>
            </div>

            {/* Banners Tab */}
            {activeTab === 'banners' && (
              <div className="space-y-6">
                {bannerSlots.map(slot => (
                  <div key={slot.id} className="banner-slot">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-gray-800">{slot.label}</span>
                      <span className="text-sm text-gray-500">{getBannersByPosition(slot.id).length} banners</span>
                    </div>
                    <div className="space-y-2">
                      {getBannersByPosition(slot.id).map(banner => (
                        <div key={banner.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-16 h-12 bg-gray-200 rounded overflow-hidden">
                            {banner.media_url && (
                              <img src={banner.media_url} alt="" className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{banner.title || 'Sin título'}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${banner.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                              {banner.is_active ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => editBanner(banner)} className="p-1.5 hover:bg-gray-200 rounded">
                              <Pencil className="w-4 h-4 text-gray-600" />
                            </button>
                            <button onClick={() => deleteBanner(banner.id)} className="p-1.5 hover:bg-red-50 rounded">
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={() => showBannerForm(slot.id)}
                        className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-accent hover:text-accent flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Agregar Banner
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Sections Tab */}
            {activeTab === 'sections' && (
              <div className="space-y-4">
                <button onClick={showSectionForm} className="w-full py-3 bg-accent text-primary font-semibold rounded-lg hover:bg-yellow-400 flex items-center justify-center gap-2">
                  <Plus className="w-5 h-5" />
                  Nueva Sección
                </button>

                {sections.sort((a, b) => a.order - b.order).map(section => (
                  <div key={section.id} className={`p-4 rounded-lg border-2 ${section.is_active ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold">{section.name}</p>
                        <p className="text-sm text-gray-500">{sectionTypes.find(t => t.value === section.type)?.label}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleSectionActive(section)}
                          className={`p-1.5 rounded ${section.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}
                        >
                          {section.is_active ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        </button>
                        <button onClick={() => editSection(section)} className="p-1.5 hover:bg-gray-200 rounded">
                          <Pencil className="w-4 h-4 text-gray-600" />
                        </button>
                        <button onClick={() => deleteSection(section.id)} className="p-1.5 hover:bg-red-50 rounded">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                    {section.title && <p className="text-sm text-gray-600">{section.title}</p>}
                  </div>
                ))}
              </div>
            )}

            {/* Logo Tab */}
            {activeTab === 'logo' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Logo de la plataforma</h3>
                  <p className="text-sm text-gray-500 mb-4">Aparece en la barra de navegación y los sidebars del dashboard y admin.</p>

                  {/* Vista previa */}
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-500 uppercase mb-2">Vista previa</p>
                    <div className="h-16 bg-primary rounded-xl flex items-center px-4 gap-3">
                      {(logoPreview || logoUrl) ? (
                        <img
                          src={logoPreview || logoUrl}
                          alt="Logo"
                          className="h-9 max-w-[140px] object-contain"
                        />
                      ) : (
                        <>
                          <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-primary font-bold">C</span>
                          </div>
                          <span className="text-white font-bold">ConImpulso</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Upload */}
                  <input
                    ref={logoFileRef}
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    className="hidden"
                    id="logo-file-editor"
                    onChange={handleLogoFile}
                  />
                  <label
                    htmlFor="logo-file-editor"
                    className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed cursor-pointer text-sm font-medium transition-colors
                      ${uploadingLogo
                        ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'border-accent/50 text-accent hover:bg-accent/5 hover:border-accent'
                      }`}
                  >
                    {uploadingLogo ? (
                      <>
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        {(logoPreview || logoUrl) ? 'Cambiar logo' : 'Subir logo'}
                      </>
                    )}
                  </label>
                  <p className="text-xs text-gray-400 mt-2 text-center">PNG, JPG o SVG · máx. 2 MB · fondo transparente recomendado</p>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 mt-4">
                    {pendingLogoUrl !== null && (
                      <button
                        onClick={handleSaveLogo}
                        className="w-full py-2.5 bg-accent text-primary font-semibold rounded-xl hover:bg-yellow-400 flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Guardar logo
                      </button>
                    )}
                    {(logoUrl || logoPreview) && (
                      <button
                        onClick={handleRemoveLogo}
                        className="w-full py-2 text-sm text-red-500 hover:text-red-700 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Eliminar logo
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Right Panel - Preview */}
        <div className={`${previewMode ? 'w-full' : 'w-2/3'} bg-white rounded-xl shadow-sm p-6`}>
          <div className="preview-header bg-gray-100 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
                <span className="text-primary font-bold text-lg">N</span>
              </div>
              <div className="flex gap-4">
                <div className="h-4 w-16 bg-gray-300 rounded"></div>
                <div className="h-4 w-16 bg-gray-300 rounded"></div>
                <div className="h-4 w-16 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>

          {/* Preview Content - same as HomePage */}
          <div className="preview-content space-y-6">
            {/* Hero Banner */}
            {getBannersByPosition('hero').length > 0 && (
              <div className="relative h-64 bg-primary rounded-xl overflow-hidden">
                <img
                  src={getBannersByPosition('hero')[0].media_url}
                  alt=""
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h2 className="text-2xl font-bold">{getBannersByPosition('hero')[0].title}</h2>
                    <p>{getBannersByPosition('hero')[0].subtitle}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Sections Preview */}
            {sections.length === 0 && !loading && (
              <div className="text-center py-12 text-gray-400">
                <Layout className="w-12 h-12 mx-auto mb-3" />
                <p>No hay secciones configuradas. Usa el panel izquierdo para crear una.</p>
              </div>
            )}
            {sections.map((section) => (
              <div
                key={section.id}
                className={`p-4 rounded-lg border-2 ${section.is_active ? 'border-gray-200' : 'border-dashed border-yellow-300 bg-yellow-50'}`}
                style={{
                  backgroundColor: section.background_color || '#ffffff',
                  paddingTop: section.padding_top || 16,
                  paddingBottom: section.padding_bottom || 16
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded">{section.type}</span>
                    <span className="text-xs text-gray-400">Orden: {section.order}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${section.is_active ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {section.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                {section.title && (
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold">{section.title}</h3>
                    {section.subtitle && <p className="text-gray-500 text-sm">{section.subtitle}</p>}
                  </div>
                )}

                {section.type === 'featured_products' && (
                  <div className="grid grid-cols-4 gap-4">
                    {(section.items?.length ? section.items : featuredProducts).slice(0, section.columns || 4).map(product => (
                      <div key={product.id} className="bg-gray-100 rounded-lg p-2">
                        <div className="aspect-square bg-gray-200 rounded mb-2 overflow-hidden">
                          <img src={product.image || getProductImage(product)} alt="" className="w-full h-full object-cover" />
                        </div>
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        {product.price != null && <p className="text-xs text-gray-500">${product.price}</p>}
                      </div>
                    ))}
                    {!section.items?.length && featuredProducts.length === 0 && (
                      <div className="col-span-4 text-center py-4 text-gray-400 text-sm">
                        No hay productos destacados
                      </div>
                    )}
                  </div>
                )}

                {section.type === 'categories' && (
                  <div className="grid grid-cols-6 gap-4">
                    {categories.slice(0, section.columns || 6).map(category => (
                      <div key={category.id} className="text-center">
                        <div className="text-3xl mb-1">{getCategoryIcon(category.name)}</div>
                        <p className="text-sm">{category.name}</p>
                      </div>
                    ))}
                    {categories.length === 0 && (
                      <div className="col-span-6 text-center py-4 text-gray-400 text-sm">
                        No hay categorías
                      </div>
                    )}
                  </div>
                )}

                {section.type === 'stores' && (
                  <div className="grid grid-cols-3 gap-4">
                    {featuredShops.slice(0, section.columns || 3).map(shop => (
                      <div key={shop.id} className="bg-gray-100 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <img src={shop.logo || 'https://picsum.photos/100'} alt="" className="w-10 h-10 rounded-full object-cover" />
                          <p className="font-medium text-sm">{shop.name}</p>
                        </div>
                      </div>
                    ))}
                    {featuredShops.length === 0 && (
                      <div className="col-span-3 text-center py-4 text-gray-400 text-sm">
                        No hay tiendas destacadas
                      </div>
                    )}
                  </div>
                )}

                {section.type === 'banner' && (
                  <div className="bg-gray-200 rounded-xl h-32 flex items-center justify-center text-gray-500">
                    Banner promocional
                  </div>
                )}

                {section.type === 'newsletter' && (
                  <div className="bg-gray-800 text-white p-6 rounded-xl text-center">
                    <h3 className="font-bold">Suscríbete a nuestro newsletter</h3>
                    <div className="flex gap-2 mt-4 max-w-md mx-auto">
                      <input type="email" placeholder="tu@correo.com" className="flex-1 px-4 py-2 rounded-lg text-black" />
                      <button className="px-4 py-2 bg-accent text-primary font-semibold rounded-lg">Suscribirse</button>
                    </div>
                  </div>
                )}

                {section.type === 'slider' && (
                  <div className="bg-gray-100 rounded-xl h-40 flex items-center justify-center text-gray-500">
                    Slider de contenido
                  </div>
                )}

                {section.type === 'cards_grid' && (
                  <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="bg-gray-100 rounded-lg p-4 h-32"></div>
                    ))}
                  </div>
                )}

                {section.type === 'testimonials' && (
                  <div className="bg-gray-100 rounded-xl p-4 text-center text-gray-500">
                    Testimonios de clientes
                  </div>
                )}

                {section.type === 'custom_html' && (
                  <div className="bg-gray-100 rounded-xl p-4 text-center text-gray-500">
                    Contenido HTML personalizado
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Banner Modal */}
      {showBannerModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg flex flex-col" style={{ maxHeight: '85vh' }}>
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100 flex-shrink-0">
              <h3 className="text-lg font-bold">{editingBanner ? 'Editar Banner' : 'Nuevo Banner'}</h3>
              <button onClick={() => setShowBannerModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="overflow-y-auto flex-1 p-6 pt-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Título</label>
                <input
                  type="text"
                  value={bannerForm.title}
                  onChange={e => setBannerForm({ ...bannerForm, title: e.target.value })}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Subtítulo</label>
                <input
                  type="text"
                  value={bannerForm.subtitle}
                  onChange={e => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tipo de Media</label>
                <select
                  value={bannerForm.media_type}
                  onChange={e => onMediaTypeChange(e.target.value)}
                  className="input-field w-full"
                >
                  <option value="image">Imagen</option>
                  <option value="video">Video</option>
                  <option value="gif">GIF</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Media</label>
                <div className="flex gap-4 mb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="mediaInputType"
                      checked={mediaInputType === 'file'}
                      onChange={() => setMediaInputType('file')}
                      className="text-yellow-500"
                    />
                    <span className="text-sm">Subir archivo desde la PC</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="mediaInputType"
                      checked={mediaInputType === 'url'}
                      onChange={() => setMediaInputType('url')}
                      className="text-yellow-500"
                    />
                    <span className="text-sm">URL externa</span>
                  </label>
                </div>

                {mediaInputType === 'url' ? (
                  <input
                    type="url"
                    value={bannerForm.media_url}
                    onChange={e => setBannerForm({ ...bannerForm, media_url: e.target.value })}
                    className="input-field w-full"
                    placeholder="https://www.youtube.com/watch?v=... o URL directa de imagen/video"
                  />
                ) : (
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 p-4 transition-colors"
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    style={isDragging ? { borderColor: '#FFD700', background: '#FEF3C7' } : {}}
                  >
                    <input
                      id={`media-file-input-${modalId.current}`}
                      ref={fileInputRef}
                      type="file"
                      accept={getAcceptTypes()}
                      onChange={handleFileChange}
                      className="sr-only-file-input"
                    />
                    {!uploadedFileName && !bannerForm.media_url && !uploadingMedia && (
                      <div className="text-center py-4">
                        <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600 font-medium mb-1">
                          Arrastra tu archivo aquí
                        </p>
                        <p className="text-xs text-gray-500 mb-3">
                          {getDropzoneHint()}
                        </p>
                        <button
                          type="button"
                          onClick={openFilePicker}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 transition-colors"
                        >
                          <FolderOpen className="w-4 h-4" />
                          Explorar PC
                        </button>
                      </div>
                    )}

                    {uploadingMedia && (
                      <div className="py-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-700 font-medium">Subiendo archivo...</span>
                          <span className="text-sm text-yellow-600 font-semibold">{uploadProgress}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-400 transition-all"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {(uploadedFileName || bannerForm.media_url) && !uploadingMedia && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                          <CheckCircle className="w-5 h-5" />
                          <span className="truncate">{uploadedFileName || 'Archivo actual'}</span>
                        </div>
                        <div className="bg-black rounded-lg overflow-hidden">
                          {bannerForm.media_type === 'image' || bannerForm.media_type === 'gif' ? (
                            <img
                              src={bannerForm.media_url}
                              alt=""
                              className="w-full h-40 object-cover"
                            />
                          ) : (
                            <video
                              src={bannerForm.media_url}
                              className="w-full h-40 object-cover bg-black"
                              controls
                              muted
                            />
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={openFilePicker}
                            className="text-xs px-3 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                          >
                            Cambiar archivo
                          </button>
                          <button
                            type="button"
                            onClick={clearUploadedFile}
                            className="text-xs px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100"
                          >
                            Quitar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {mediaUploadError && (
                  <div className="mt-2 text-sm text-red-500">{mediaUploadError}</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">URL de Link (opcional)</label>
                <input
                  type="url"
                  value={bannerForm.link_url}
                  onChange={e => setBannerForm({ ...bannerForm, link_url: e.target.value })}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Texto del Botón</label>
                <input
                  type="text"
                  value={bannerForm.link_text}
                  onChange={e => setBannerForm({ ...bannerForm, link_text: e.target.value })}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={bannerForm.is_active}
                    onChange={e => setBannerForm({ ...bannerForm, is_active: e.target.checked })}
                  />
                  Banner Activo
                </label>
              </div>

              {/* Role-specific text — only for hero banners */}
              {(bannerForm.position === 'hero' || !bannerForm.position) && (
                <div className="border-t border-gray-100 pt-4 space-y-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Texto por rol (opcional)</p>
                  <p className="text-xs text-gray-400 -mt-2">Si se llena, reemplaza el título/descripción general según quién visita el sitio.</p>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 space-y-3">
                    <p className="text-xs font-semibold text-yellow-700 flex items-center gap-1">🏪 Para vendedores</p>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Título</label>
                      <input
                        type="text"
                        value={bannerForm.vendor_title || ''}
                        onChange={e => setBannerForm({ ...bannerForm, vendor_title: e.target.value })}
                        className="input-field w-full text-sm"
                        placeholder="Ej: Tu tienda, tu precio, tus reglas"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Descripción</label>
                      <textarea
                        value={bannerForm.vendor_description || ''}
                        onChange={e => setBannerForm({ ...bannerForm, vendor_description: e.target.value })}
                        className="input-field w-full text-sm"
                        rows={2}
                        placeholder="Ej: Vende directo a compradores reales sin intermediarios..."
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
                    <p className="text-xs font-semibold text-blue-700 flex items-center gap-1">🛍️ Para compradores</p>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Título</label>
                      <input
                        type="text"
                        value={bannerForm.buyer_title || ''}
                        onChange={e => setBannerForm({ ...bannerForm, buyer_title: e.target.value })}
                        className="input-field w-full text-sm"
                        placeholder="Ej: Compra directo al que lo hace"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Descripción</label>
                      <textarea
                        value={bannerForm.buyer_description || ''}
                        onChange={e => setBannerForm({ ...bannerForm, buyer_description: e.target.value })}
                        className="input-field w-full text-sm"
                        rows={2}
                        placeholder="Ej: Descubre productos únicos hechos a mano..."
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            </div>
            <div className="flex gap-3 p-6 pt-4 border-t border-gray-100 flex-shrink-0">
              <button onClick={() => setShowBannerModal(false)} className="flex-1 py-2 border rounded-lg">Cancelar</button>
              <button onClick={saveBanner} className="flex-1 py-2 bg-accent text-primary font-semibold rounded-lg">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Section Modal */}
      {showSectionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg flex flex-col" style={{ maxHeight: '85vh' }}>
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100 flex-shrink-0">
              <h3 className="text-lg font-bold">{editingSection ? 'Editar Sección' : 'Nueva Sección'}</h3>
              <button onClick={() => setShowSectionModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="overflow-y-auto flex-1 p-6 pt-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input
                  type="text"
                  value={sectionForm.name}
                  onChange={e => setSectionForm({ ...sectionForm, name: e.target.value })}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tipo</label>
                <select
                  value={sectionForm.type}
                  onChange={e => setSectionForm({ ...sectionForm, type: e.target.value })}
                  className="input-field w-full"
                >
                  {sectionTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Título</label>
                <input
                  type="text"
                  value={sectionForm.title}
                  onChange={e => setSectionForm({ ...sectionForm, title: e.target.value })}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Subtítulo</label>
                <input
                  type="text"
                  value={sectionForm.subtitle}
                  onChange={e => setSectionForm({ ...sectionForm, subtitle: e.target.value })}
                  className="input-field w-full"
                />
              </div>

              {sectionForm.type === 'featured_products' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Productos específicos (opcional)</label>
                  <p className="text-xs text-gray-400 mb-2">
                    Si no eliges ninguno, se muestran automáticamente los productos marcados como "destacados".
                  </p>
                  <div className="relative">
                    <input
                      type="text"
                      value={productSearch}
                      onChange={e => handleProductSearch(e.target.value)}
                      placeholder="Buscar producto por nombre..."
                      className="input-field w-full"
                    />
                    {searchingProducts && (
                      <span className="text-xs text-gray-400 absolute right-3 top-1/2 -translate-y-1/2">Buscando...</span>
                    )}
                  </div>
                  {productResults.length > 0 && (
                    <div className="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto divide-y divide-gray-100">
                      {productResults.map(p => (
                        <button
                          type="button"
                          key={p.id}
                          onClick={() => addPickedProduct(p)}
                          className="w-full flex items-center gap-2 p-2 hover:bg-gray-50 text-left"
                        >
                          <img src={getProductImage(p)} alt="" className="w-8 h-8 rounded object-cover bg-gray-100 flex-shrink-0" />
                          <span className="text-sm truncate flex-1">{p.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {(sectionForm.items || []).length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {sectionForm.items.map(p => (
                        <span key={p.id} className="flex items-center gap-1.5 bg-gray-100 rounded-full pl-1 pr-2 py-1 text-xs">
                          <img src={p.image} alt="" className="w-5 h-5 rounded-full object-cover bg-gray-200" />
                          <span className="max-w-[120px] truncate">{p.name}</span>
                          <button type="button" onClick={() => removePickedProduct(p.id)} className="text-gray-400 hover:text-red-500">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Layout</label>
                  <select
                    value={sectionForm.layout}
                    onChange={e => setSectionForm({ ...sectionForm, layout: e.target.value })}
                    className="input-field w-full"
                  >
                    {layoutOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Columnas</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={sectionForm.columns}
                    onChange={e => setSectionForm({ ...sectionForm, columns: parseInt(e.target.value) })}
                    className="input-field w-full"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Color de Fondo</label>
                <input
                  type="color"
                  value={sectionForm.background_color}
                  onChange={e => setSectionForm({ ...sectionForm, background_color: e.target.value })}
                  className="w-full h-10 rounded-lg cursor-pointer"
                />
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={sectionForm.is_active}
                    onChange={e => setSectionForm({ ...sectionForm, is_active: e.target.checked })}
                  />
                  Sección Activa
                </label>
              </div>
            </div>
            </div>
            <div className="flex gap-3 p-6 pt-4 border-t border-gray-100 flex-shrink-0">
              <button onClick={() => setShowSectionModal(false)} className="flex-1 py-2 border rounded-lg">Cancelar</button>
              <button onClick={saveSection} className="flex-1 py-2 bg-accent text-primary font-semibold rounded-lg">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
