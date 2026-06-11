import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock, AlertCircle, X } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, user, isSuperAdmin } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: '',
  });
  const [serverError, setServerError] = useState('');

  const validateForm = () => {
    const errors = { email: '', password: '' };
    let isValid = true;

    if (!formData.email) {
      errors.email = 'El correo electrónico es requerido';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Ingresa un correo electrónico válido';
      isValid = false;
    }

    if (!formData.password) {
      errors.password = 'La contraseña es requerida';
      isValid = false;
    } else if (formData.password.length < 4) {
      errors.password = 'La contraseña debe tener al menos 4 caracteres';
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear field error when user types
    setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) {
      return;
    }

    const result = await login(formData.email, formData.password);

    if (result.success) {
      toast.success('Bienvenido de vuelta');
      // Check if user is super admin, redirect to admin
      if (isSuperAdmin()) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      const message = result.message || '';
      if (message.toLowerCase().includes('invalid') || message.toLowerCase().includes('credential')) {
        setServerError('Correo o contraseña incorrectos. Verifica tus datos e intenta nuevamente.');
      } else if (message.toLowerCase().includes('not found') || message.toLowerCase().includes('not exist')) {
        setServerError('No existe una cuenta con este correo electrónico.');
      } else if (message.toLowerCase().includes('blocked') || message.toLowerCase().includes('disabled') || message.toLowerCase().includes('inactive')) {
        setServerError('Tu cuenta está desactivada. Contacta al soporte.');
      } else if (message.toLowerCase().includes('verify')) {
        setServerError('Por favor verifica tu correo electrónico antes de iniciar sesión.');
      } else if (message.includes('Network Error')) {
        setServerError('Error de conexión. Verifica tu red e intenta nuevamente.');
      } else {
        setServerError(message || 'Ocurrió un error inesperado. Intenta nuevamente.');
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary mb-2">Iniciar sesión</h1>
          <p className="text-text-secondary">Bienvenido de nuevo a ConImpulso</p>
        </div>

        {/* Error Alert */}
        {serverError && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-xl flex items-start gap-3 shadow-sm">
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-700 font-bold text-lg">Error de autenticación</p>
              <p className="text-red-600 text-sm mt-1">{serverError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-primary mb-2">Correo electrónico</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`input-field pl-12 pr-4 py-3 rounded-lg transition-all ${
                  fieldErrors.email
                    ? 'border-2 border-red-500 bg-red-50 ring-2 ring-red-200'
                    : 'border border-gray-300'
                }`}
                placeholder="tu@correo.com"
              />
            </div>
            {fieldErrors.email && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-2">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`input-field pl-12 pr-12 py-3 rounded-lg transition-all ${
                  fieldErrors.password
                    ? 'border-2 border-red-500 bg-red-50 ring-2 ring-red-200'
                    : 'border border-gray-300'
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                {fieldErrors.password}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded border-gray-300 text-accent focus:ring-accent" />
              <span className="text-sm text-text-secondary">Recordarme</span>
            </label>
            <Link to="/forgot-password" className="text-sm text-accent hover:text-accent-hover">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full py-3 text-base font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gas justify-center gap-2">
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                Verificando...
              </span>
            ) : (
              'Iniciar sesión'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-text-secondary text-sm">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-accent hover:text-accent-hover font-medium">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}