import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Users, Target, DollarSign, TrendingUp, Plus, ChevronRight, Award } from 'lucide-react';
import api from '../../services/api';

export default function AdvisorDashboardPage() {
  const [stats, setStats] = useState({
    total_earned: 0,
    pending: 0,
    paid: 0,
    total_leads: 0,
    converted_leads: 0,
  });
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profileRes, statsRes] = await Promise.all([
        api.get('/advisors/my-profile'),
        api.get('/advisors/commissions/stats'),
      ]);
      setProfile(profileRes.data.data);
      setStats(statsRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelBadge = (level) => {
    const badges = {
      bronze: 'bg-amber-700 text-amber-100',
      silver: 'bg-gray-400 text-white',
      gold: 'bg-yellow-500 text-yellow-900',
      platinum: 'bg-purple-600 text-purple-100',
    };
    return badges[level] || 'bg-gray-600 text-white';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#FFD700] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#FFD700]">Panel de Asesor</h1>
            <p className="text-gray-400 mt-1">Gestiona tus oportunidades y comisiones</p>
          </div>
          {profile && (
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelBadge(profile.level)}`}>
                {profile.level?.toUpperCase() || 'BRONZE'}
              </span>
              <Link
                to="/dashboard/advisors/profile"
                className="px-4 py-2 bg-[#1A1A1A] border border-gray-700 rounded-lg hover:border-[#FFD700] transition"
              >
                Editar Perfil
              </Link>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1A1A1A] rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-900/30 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-500" />
              </div>
              <TrendingUp className="w-5 h-5 text-gray-500" />
            </div>
            <p className="text-gray-400 text-sm mb-1">Total Ganado</p>
            <p className="text-2xl font-bold text-white">${stats.total_earned?.toLocaleString() || 0}</p>
          </div>

          <div className="bg-[#1A1A1A] rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-900/30 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-yellow-500" />
              </div>
              <span className="text-xs text-yellow-500 bg-yellow-900/30 px-2 py-1 rounded">Pendiente</span>
            </div>
            <p className="text-gray-400 text-sm mb-1">Comisión Pendiente</p>
            <p className="text-2xl font-bold text-[#FFD700]">${stats.pending?.toLocaleString() || 0}</p>
          </div>

          <div className="bg-[#1A1A1A] rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-500" />
              </div>
              <span className="text-xs text-blue-400 bg-blue-900/30 px-2 py-1 rounded">Leads</span>
            </div>
            <p className="text-gray-400 text-sm mb-1">Leads Generados</p>
            <p className="text-2xl font-bold text-white">{stats.total_leads || 0}</p>
            <p className="text-xs text-green-500 mt-1">{stats.converted_leads || 0} convertidos</p>
          </div>

          <div className="bg-[#1A1A1A] rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-900/30 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-purple-500" />
              </div>
              <span className="text-xs text-purple-400 bg-purple-900/30 px-2 py-1 rounded">Nivel</span>
            </div>
            <p className="text-gray-400 text-sm mb-1">Tu Nivel</p>
            <p className="text-2xl font-bold capitalize text-white">{profile?.level || 'bronze'}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Link
            to="/dashboard/advisors/leads"
            className="bg-[#1A1A1A] rounded-xl p-6 border border-gray-800 hover:border-[#FFD700] transition group"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="w-12 h-12 bg-[#FFD700]/10 rounded-xl flex items-center justify-center mb-4">
                  <Plus className="w-6 h-6 text-[#FFD700]" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">Crear Nuevo Lead</h3>
                <p className="text-gray-400 text-sm">Registra un nuevo cliente potencial</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-[#FFD700] transition" />
            </div>
          </Link>

          <Link
            to="/dashboard/advisors/opportunities"
            className="bg-[#1A1A1A] rounded-xl p-6 border border-gray-800 hover:border-[#FFD700] transition group"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="w-12 h-12 bg-blue-900/30 rounded-xl flex items-center justify-center mb-4">
                  <Briefcase className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">Ver Oportunidades</h3>
                <p className="text-gray-400 text-sm">Explora tiendas disponibles para promover</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-[#FFD700] transition" />
            </div>
          </Link>
        </div>

        {/* No Profile Banner */}
        {!profile && (
          <div className="bg-gradient-to-r from-[#FFD700]/20 to-transparent border border-[#FFD700]/30 rounded-xl p-8 mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Award className="w-12 h-12 text-[#FFD700]" />
              <div>
                <h2 className="text-xl font-bold text-white">Conviértete en Asesor</h2>
                <p className="text-gray-400">Crea tu perfil de asesor y comienza a ganar comisiones promoviendo productos</p>
              </div>
            </div>
            <Link
              to="/dashboard/advisors/profile/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#FFD700] text-black font-semibold rounded-lg hover:bg-yellow-400 transition"
            >
              <Plus className="w-5 h-5" />
              Crear Mi Perfil
            </Link>
          </div>
        )}

        {/* Navigation Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/dashboard/advisors/leads"
            className="bg-[#1A1A1A] rounded-xl p-4 border border-gray-800 hover:border-gray-700 transition text-center"
          >
            <Users className="w-8 h-8 text-[#FFD700] mx-auto mb-2" />
            <p className="text-white font-medium">Mis Leads</p>
          </Link>
          <Link
            to="/dashboard/advisors/commissions"
            className="bg-[#1A1A1A] rounded-xl p-4 border border-gray-800 hover:border-gray-700 transition text-center"
          >
            <DollarSign className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-white font-medium">Comisiones</p>
          </Link>
          <Link
            to="/dashboard/advisors/applications"
            className="bg-[#1A1A1A] rounded-xl p-4 border border-gray-800 hover:border-gray-700 transition text-center"
          >
            <Briefcase className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-white font-medium">Aplicaciones</p>
          </Link>
          <Link
            to="/dashboard/advisors/profile"
            className="bg-[#1A1A1A] rounded-xl p-4 border border-gray-800 hover:border-gray-700 transition text-center"
          >
            <Award className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className="text-white font-medium">Mi Perfil</p>
          </Link>
        </div>
      </div>
    </div>
  );
}