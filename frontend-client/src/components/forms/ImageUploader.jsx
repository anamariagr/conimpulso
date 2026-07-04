import { useRef, useState } from 'react';
import { Upload, X, Loader2, ImageIcon } from 'lucide-react';
import api from '../../services/api';

async function uploadFile(file) {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('type', 'image');
  const res = await api.post('/media/upload', fd);
  return res.data.data.url;
}

/** Single image upload (logo, banner, etc.) */
export function SingleImageUploader({ value, onChange, label, hint, aspectClass = 'aspect-square', required = false }) {
  const inputRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Solo se permiten imágenes.'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('La imagen no debe superar 5 MB.'); return; }
    setError('');
    setUploading(true);
    try {
      const url = await uploadFile(file);
      onChange(url);
    } catch {
      setError('Error al subir la imagen. Intenta de nuevo.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      {hint && <p className="text-xs text-gray-400 mb-2">{hint}</p>}

      <div
        className={`relative ${aspectClass} w-full max-w-[180px] rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 overflow-hidden cursor-pointer hover:border-accent transition-colors`}
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {value ? (
          <>
            <img src={value} alt="preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(''); }}
              className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition"
            >
              <X className="w-3.5 h-3.5 text-white" />
            </button>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-gray-400">
            {uploading ? (
              <Loader2 className="w-6 h-6 animate-spin text-accent" />
            ) : (
              <>
                <Upload className="w-6 h-6" />
                <span className="text-xs text-center px-2">Subir imagen</span>
              </>
            )}
          </div>
        )}
        {uploading && value && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-white" />
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
      />
    </div>
  );
}

/** Multiple image upload for gallery */
export function GalleryUploader({ value = [], onChange, min = 3, label = 'Galería de imágenes', hint, required = false }) {
  const inputRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFiles = async (files) => {
    const arr = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (arr.length === 0) { setError('Solo se permiten imágenes.'); return; }
    const oversize = arr.find(f => f.size > 5 * 1024 * 1024);
    if (oversize) { setError('Cada imagen no debe superar 5 MB.'); return; }
    setError('');
    setUploading(true);
    try {
      const urls = await Promise.all(arr.map(uploadFile));
      onChange([...value, ...urls]);
    } catch {
      setError('Error al subir las imágenes. Intenta de nuevo.');
    } finally {
      setUploading(false);
    }
  };

  const remove = (idx) => onChange(value.filter((_, i) => i !== idx));

  const missing = Math.max(0, min - value.length);

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <p className="text-xs text-gray-400 mb-3">
        {hint || (min > 0 ? `Mínimo ${min} imágenes. Muestra tus productos, instalaciones o lo que vendes.` : 'Puedes agregar varias imágenes a la vez.')}
        {missing > 0 && (
          <span className="text-orange-500 font-medium"> Faltan {missing} imagen{missing !== 1 ? 'es' : ''}.</span>
        )}
      </p>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {value.map((url, idx) => (
          <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-100 group">
            <img src={url} alt={`galería ${idx + 1}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => remove(idx)}
              className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
            >
              <X className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        ))}

        {/* Upload slot */}
        <button
          type="button"
          onClick={() => !uploading && inputRef.current?.click()}
          disabled={uploading}
          className="aspect-square rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-accent flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-accent transition disabled:opacity-60"
        >
          {uploading ? (
            <Loader2 className="w-5 h-5 animate-spin text-accent" />
          ) : (
            <>
              <ImageIcon className="w-5 h-5" />
              <span className="text-xs">Agregar</span>
            </>
          )}
        </button>
      </div>

      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
