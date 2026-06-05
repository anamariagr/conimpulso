import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function B2BProfilesPage() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchProfiles();
  }, [search, type]);

  const fetchProfiles = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, search, type }).toString();
      const response = await api.get(`/b2b/profiles?${params}`);
      setProfiles(response.data.data);
      setPagination(response.data.meta || {});
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-[#FFD700]">Directorio Empresarial</h1>
          <button className="px-6 py-2 bg-[#FFD700] text-black font-semibold rounded-lg hover:bg-yellow-400 transition">
            Mi Perfil B2B
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <input
            type="text"
            placeholder="Buscar empresas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-3 bg-[#1A1A1A] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-[#FFD700] focus:outline-none"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="px-4 py-3 bg-[#1A1A1A] border border-gray-700 rounded-lg text-white focus:border-[#FFD700] focus:outline-none"
          >
            <option value="">Todos los tipos</option>
            <option value="manufacturer">Fabricante</option>
            <option value="distributor">Distribuidor</option>
            <option value="importer">Importador</option>
            <option value="exporter">Exportador</option>
            <option value="service_provider">Proveedor de Servicios</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-[#FFD700] border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profiles.map((profile) => (
                <div key={profile.id} className="bg-[#1A1A1A] rounded-xl p-6 border border-gray-800 hover:border-[#FFD700] transition">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white">{profile.company_name}</h3>
                      <span className="text-sm text-[#FFD700]">{profile.business_type}</span>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded ${profile.verification_status === 'verified' ? 'bg-green-900 text-green-400' : 'bg-yellow-900 text-yellow-400'}`}>
                      {profile.verification_status === 'verified' ? 'Verificado' : 'Pendiente'}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">{profile.description}</p>
                  {profile.certifications?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {profile.certifications.map((cert, idx) => (
                        <span key={idx} className="px-2 py-1 bg-[#2A2A2A] text-xs rounded text-gray-300">{cert}</span>
                      ))}
                    </div>
                  )}
                  <button className="w-full mt-4 px-4 py-2 border border-[#FFD700] text-[#FFD700] rounded-lg hover:bg-[#FFD700] hover:text-black transition">
                    Conectar
                  </button>
                </div>
              ))}
            </div>

            {pagination.last_page > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: pagination.last_page }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => fetchProfiles(i + 1)}
                    className={`px-4 py-2 rounded-lg ${pagination.current_page === i + 1 ? 'bg-[#FFD700] text-black' : 'bg-[#1A1A1A] text-white'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}