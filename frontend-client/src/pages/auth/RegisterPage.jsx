import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock, User, Phone, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, loginWithGoogle, isLoading, isAuthenticated } = useAuthStore();

  const handleGoogleSuccess = async (credentialResponse) => {
    const result = await loginWithGoogle(credentialResponse.credential);
    if (result.success) {
      toast.success('Cuenta creada con Google');
      navigate('/onboarding');
    } else {
      toast.error(result.message || 'Error al registrarse con Google');
    }
  };
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    const errors = {};
    if (!formData.name || formData.name.length < 2) {
      errors.name = 'El nombre debe tener al menos 2 caracteres';
    }
    if (!formData.email) {
      errors.email = 'El correo electrónico es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Ingresa un correo electrónico válido';
    }
    if (!formData.password) {
      errors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 8) {
      errors.password = 'La contraseña debe tener al menos 8 caracteres';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d|.*[!@#$%^&*(),.?":{}|<>])/.test(formData.password)) {
      errors.password = 'La contraseña debe tener mayúsculas, minúsculas y un número o símbolo';
    }
    if (formData.password !== formData.password_confirmation) {
      errors.password_confirmation = 'Las contraseñas no coinciden';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear field error when user types
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
    }
    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) {
      return;
    }

    const result = await register(formData);

    if (result.success) {
      toast.success('¡Cuenta creada exitosamente!');
      navigate('/onboarding');
    } else {
      const message = result.message || '';
      const errors = result.errors || {};

      // Handle validation errors from server
      if (result.errors && Object.keys(result.errors).length > 0) {
        const firstErrorField = Object.keys(result.errors)[0];
        const errorMsg = result.errors[firstErrorField][0] || 'Error de validación';
        setFieldErrors({ ...fieldErrors, [firstErrorField]: errorMsg });
        setServerError(errorMsg);
      } else if (message.toLowerCase().includes('already') || message.toLowerCase().includes('exists')) {
        setServerError('Este correo electrónico ya está registrado. Intenta con otro o inicia sesión.');
      } else if (message.includes('Network Error')) {
        setServerError('Error de conexión. Verifica tu red e intenta nuevamente.');
      } else {
        setServerError(message || 'Error al crear cuenta. Intenta nuevamente.');
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary mb-2">Crear cuenta</h1>
          <p className="text-text-secondary">Únete a ConImpulso y empieza a explorar</p>
        </div>

        {/* Error Alert */}
        {serverError && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-xl flex items-start gap-3 shadow-sm">
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-700 font-bold text-lg">No se pudo crear la cuenta</p>
              <p className="text-red-600 text-sm mt-1">{serverError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-primary mb-2">Nombre completo</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`input-field pl-12 pr-4 py-3 rounded-lg transition-all ${
                  fieldErrors.name ? 'border-2 border-red-500 bg-red-50' : 'border border-gray-300'
                }`}
                placeholder="Tu nombre"
              />
            </div>
            {fieldErrors.name && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-2">{fieldErrors.name}</p>
            )}
          </div>

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
                  fieldErrors.email ? 'border-2 border-red-500 bg-red-50' : 'border border-gray-300'
                }`}
                placeholder="tu@correo.com"
              />
            </div>
            {fieldErrors.email && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-2">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-2">Teléfono (opcional)</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input-field pl-12 pr-4 py-3 rounded-lg border border-gray-300"
                placeholder="+57 300 123 4567"
              />
            </div>
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
                  fieldErrors.password ? 'border-2 border-red-500 bg-red-50' : 'border border-gray-300'
                }`}
                placeholder="Ej: ConImpulso2024!"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="mt-1 text-xs text-text-secondary">Mínimo 8 caracteres con mayúsculas, minúsculas y números</p>
            {fieldErrors.password && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-2">{fieldErrors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-2">Confirmar contraseña</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleChange}
                className={`input-field pl-12 pr-4 py-3 rounded-lg transition-all ${
                  fieldErrors.password_confirmation ? 'border-2 border-red-500 bg-red-50' : 'border border-gray-300'
                }`}
                placeholder="Repite la contraseña"
              />
            </div>
            {fieldErrors.password_confirmation && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-2">{fieldErrors.password_confirmation}</p>
            )}
          </div>

          <div className="flex items-start gap-2">
            <input type="checkbox" required className="mt-1 rounded border-gray-300 text-accent focus:ring-accent" />
            <span className="text-sm text-text-secondary">
              Acepto los{' '}
              <Link to="/terms" className="text-accent hover:text-accent-hover">Términos de servicio</Link>
              {' '}y la{' '}
              <Link to="/privacy" className="text-accent hover:text-accent-hover">Política de privacidad</Link>
            </span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full py-3 text-base font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 flex-shrink-0">o regístrate con</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Error al conectar con Google')}
              text="signup_with"
              shape="rectangular"
              locale="es"
              width="100%"
            />
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-text-secondary text-sm">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-accent hover:text-accent-hover font-medium">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}