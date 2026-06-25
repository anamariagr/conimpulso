import { useState, useEffect, useRef } from 'react';
import { Upload, Copy, Trash2, Image as ImageIcon, Check } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function MediaLibraryPage() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get('/media/list');
      const all = res.data?.data || [];
      setImages(all.filter(f => f.folder === 'images' || f.url?.match(/\.(png|jpg|jpeg|webp|svg|gif)$/i)));
    } catch {
      toast.error('No se pudo cargar la galería');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    let uploaded = 0;
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      if (file.size > 5 * 1024 * 1024) { toast.error(`${file.name} supera 5 MB`); continue; }
      try {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('type', 'image');
        await api.post('/media/upload', fd, { headers: { 'Content-Type': undefined } });
        uploaded++;
      } catch {
        toast.error(`Error subiendo ${file.name}`);
      }
    }
    if (uploaded) { toast.success(`${uploaded} imagen${uploaded > 1 ? 'es' : ''} subida${uploaded > 1 ? 's' : ''}`); }
    setUploading(false);
    e.target.value = '';
    load();
  };

  const copyUrl = (url) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedUrl(url);
      toast.success('URL copiada');
      setTimeout(() => setCopiedUrl(null), 2000);
    });
  };

  const handleDelete = async (item) => {
    if (!confirm(`¿Eliminar ${item.filename}?`)) return;
    try {
      await api.delete('/media/delete', { data: { path: item.url } });
      setImages(prev => prev.filter(i => i.url !== item.url));
      toast.success('Imagen eliminada');
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Galería de imágenes</h1>
          <p className="text-gray-500 text-sm">{images.length} imagen{images.length !== 1 ? 'es' : ''} guardada{images.length !== 1 ? 's' : ''}</p>
        </div>
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleUpload}
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2.5 bg-accent text-primary font-semibold rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            {uploading ? 'Subiendo...' : 'Subir imagen'}
          </button>
        </div>
      </div>

      {/* Drop zone cuando no hay imágenes */}
      {!loading && images.length === 0 && (
        <label className="flex flex-col items-center justify-center gap-3 h-64 rounded-2xl border-2 border-dashed border-gray-300 cursor-pointer hover:border-accent hover:bg-accent/5 transition-colors">
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
          <ImageIcon className="w-12 h-12 text-gray-300" />
          <p className="text-gray-500 font-medium">Haz clic o arrastra imágenes aquí</p>
          <p className="text-gray-400 text-sm">PNG, JPG, SVG, WebP · máx. 5 MB por imagen</p>
        </label>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {/* Botón de subir dentro del grid */}
          {images.length > 0 && (
            <label className="aspect-square flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 cursor-pointer hover:border-accent hover:bg-accent/5 transition-colors">
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
              <Upload className="w-6 h-6 text-gray-400" />
              <span className="text-xs text-gray-400 font-medium">Subir más</span>
            </label>
          )}

          {images.map((item) => (
            <div key={item.url} className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
              <img
                src={item.url}
                alt={item.filename}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; }}
              />

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                <button
                  onClick={() => copyUrl(item.url)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-900 rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors w-full justify-center"
                >
                  {copiedUrl === item.url ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedUrl === item.url ? 'Copiada' : 'Copiar URL'}
                </button>
                <button
                  onClick={() => handleDelete(item)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors w-full justify-center"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Eliminar
                </button>
              </div>

              {/* Size badge */}
              <div className="absolute bottom-1.5 left-1.5 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-md">
                {formatSize(item.size)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
