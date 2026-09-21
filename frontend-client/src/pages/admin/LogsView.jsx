import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FileText, Search, RefreshCw, ChevronDown, ChevronRight, AlertTriangle, X,
} from 'lucide-react';
import { logsService } from '../../services/api';

// Colores por nivel. Los de Monolog que no listamos caen en el estilo por defecto.
const LEVEL_STYLES = {
  EMERGENCY: 'bg-red-600 text-white',
  ALERT: 'bg-red-600 text-white',
  CRITICAL: 'bg-red-600 text-white',
  ERROR: 'bg-red-100 text-red-700',
  WARNING: 'bg-amber-100 text-amber-700',
  NOTICE: 'bg-blue-100 text-blue-700',
  INFO: 'bg-blue-100 text-blue-700',
  DEBUG: 'bg-gray-100 text-gray-600',
};

const PER_PAGE = 50;

const levelStyle = (level) => LEVEL_STYLES[level] || 'bg-gray-100 text-gray-600';

const formatBytes = (bytes) => {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function LogsView() {
  const [levels, setLevels] = useState([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState(null);

  // `search` se debouncea aparte para no disparar una petición por tecla.
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(id);
  }, [search]);

  const { data, isFetching, error, refetch } = useQuery({
    queryKey: ['logs', levels, from, to, debouncedSearch, page],
    queryFn: () =>
      logsService
        .list({
          level: levels,
          from: from || undefined,
          to: to || undefined,
          q: debouncedSearch || undefined,
          page,
          per_page: PER_PAGE,
        })
        .then((res) => res.data),
    // Mantiene la lista anterior mientras llega la nueva, para que la vista no
    // parpadee a vacío en cada tecla de la búsqueda.
    placeholderData: (previous) => previous,
  });

  const entries = data?.data || [];
  const meta = data?.meta || null;

  const errorMessage = error
    ? error.response?.status === 422
      ? 'Revisa los filtros: alguna fecha no tiene un formato válido.'
      : 'No se pudieron cargar los logs.'
    : null;

  // Cualquier cambio de filtro devuelve a la primera página: quedarse en la 4
  // de un resultado que ahora tiene 1 muestra una lista vacía sin explicación.
  const resetPage = () => setPage(1);

  const toggleLevel = (level) => {
    resetPage();
    setLevels((current) =>
      current.includes(level) ? current.filter((l) => l !== level) : [...current, level]
    );
  };

  const clearFilters = () => {
    setLevels([]);
    setFrom('');
    setTo('');
    setSearch('');
    setPage(1);
  };

  const hasFilters = levels.length > 0 || from || to || search;
  const availableLevels = meta?.levels || [];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-accent-600" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">Logs del sistema</h1>
            <p className="text-sm text-gray-500">
              {meta?.file_exists === false
                ? 'No hay archivo de log todavía'
                : `${meta?.total ?? 0} entradas · ${formatBytes(meta?.file_size)}`}
            </p>
          </div>
        </div>

        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6 flex gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          Esta vista es pública y sin autenticación. Muestra rutas del servidor y el
          contexto de cada excepción, así que conviene protegerla antes de dejarla fija.
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => { resetPage(); setSearch(e.target.value); }}
            placeholder="Buscar en el mensaje, la excepción o el archivo…"
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500/30"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {availableLevels.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {availableLevels.map((level) => (
                <button
                  key={level}
                  onClick={() => toggleLevel(level)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition ${
                    levels.includes(level)
                      ? levelStyle(level)
                      : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <input
              type="date"
              value={from}
              onChange={(e) => { resetPage(); setFrom(e.target.value); }}
              className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600"
            />
            <span className="text-gray-400 text-sm">a</span>
            <input
              type="date"
              value={to}
              onChange={(e) => { resetPage(); setTo(e.target.value); }}
              className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600"
            />
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-2 py-1.5 text-xs text-gray-500 hover:text-gray-700"
              >
                <X className="w-3.5 h-3.5" />
                Limpiar
              </button>
            )}
          </div>
        </div>
      </div>

      {meta?.truncated && (
        <p className="text-xs text-gray-500 mb-3">
          El archivo supera el tope de lectura: se están mostrando solo las entradas más recientes.
        </p>
      )}

      {/* Lista */}
      <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100 overflow-hidden">
        {errorMessage && <p className="p-6 text-sm text-red-600">{errorMessage}</p>}

        {!errorMessage && isFetching && entries.length === 0 && (
          <p className="p-6 text-sm text-gray-400">Cargando…</p>
        )}

        {!errorMessage && !isFetching && entries.length === 0 && (
          <p className="p-6 text-sm text-gray-400">
            {hasFilters ? 'Ningún log coincide con esos filtros.' : 'No hay logs registrados.'}
          </p>
        )}

        {entries.map((entry) => {
          const isOpen = expanded === entry.id;
          const hasDetail = Boolean(entry.trace || entry.context);

          return (
            <div key={entry.id}>
              <button
                onClick={() => setExpanded(isOpen ? null : entry.id)}
                className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50"
              >
                <span className="pt-0.5 text-gray-400">
                  {hasDetail
                    ? (isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />)
                    : <span className="block w-4" />}
                </span>

                <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${levelStyle(entry.level)}`}>
                  {entry.level}
                </span>

                <span className="flex-1 min-w-0 text-sm text-gray-800 break-words">
                  {entry.message || '(sin mensaje)'}
                </span>

                <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                  {entry.timestamp}
                </span>
              </button>

              {isOpen && hasDetail && (
                <div className="px-4 pb-4 pl-11 space-y-3">
                  {entry.context && (
                    <pre className="text-xs bg-gray-50 border border-gray-100 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-words text-gray-700">
                      {entry.context}
                    </pre>
                  )}
                  {entry.trace && (
                    <pre className="text-xs bg-gray-900 text-gray-100 rounded-lg p-3 overflow-x-auto">
                      {entry.trace}
                    </pre>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Paginación */}
      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
          >
            Anterior
          </button>
          <span className="text-gray-500">
            Página {meta.current_page} de {meta.last_page}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
            disabled={page >= meta.last_page}
            className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
