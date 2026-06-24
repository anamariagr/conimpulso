import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';

const RULES = {
  email: (v) => {
    if (!v) return 'El correo electrónico es requerido';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())) return 'Ingresa un correo electrónico válido';
    return '';
  },
  password: (v) => {
    if (!v) return 'La contraseña es requerida';
    if (v.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
    return '';
  },
};

function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1.5">
      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
      {msg}
    </p>
  );
}

function inputClass(error, touched, value) {
  if (!touched || !value) return 'input-field pl-12 pr-10 py-3 rounded-lg border border-gray-300 transition-all';
  if (error) return 'input-field pl-12 pr-10 py-3 rounded-lg border-2 border-red-400 bg-red-50 ring-1 ring-red-200 transition-all';
  return 'input-field pl-12 pr-10 py-3 rounded-lg border-2 border-green-400 bg-green-50 ring-1 ring-green-200 transition-all';
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loginWithGoogle, isLoading, isSuperAdmin } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({ email: false, password: false });
  const [serverError, setServerError] = useState('');

  const validate = (data = formData) => {
    const e = {};
    Object.keys(RULES).forEach((k) => { e[k] = RULES[k](data[k]); });
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const next = { ...formData, [name]: value };
    setFormData(next);
    setServerError('');
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: RULES[name](value) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: RULES[name](value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const allTouched = { email: true, password: true };
    setTouched(allTouched);
    const errs = validate();
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;

    const result = await login(formData.email, formData.password);
    if (result.success) {
      toast.success('Bienvenido de vuelta');
      navigate(isSuperAdmin() ? '/admin' : '/dashboard');
    } else {
      const msg = result.message || '';
      if (/invalid|credential|incorrect/i.test(msg)) {
        setServerError('Correo o contraseña incorrectos.');
      } else if (/not found|not exist/i.test(msg)) {
        setServerError('No existe una cuenta con este correo.');
      } else if (/blocked|disabled|inactive|suspend/i.test(msg)) {
        setServerError('Tu cuenta está desactivada. Contacta al soporte.');
      } else if (/Network Error/i.test(msg)) {
        setServerError('Error de conexión. Verifica tu red e intenta nuevamente.');
      } else {
        setServerError(msg || 'Ocurrió un error. Intenta nuevamente.');
      }
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const result = await loginWithGoogle(credentialResponse.credential);
    if (result.success) {
      toast.success('Bienvenido');
      navigate(isSuperAdmin() ? '/admin' : '/dashboard');
    } else {
      toast.error(result.message || 'Error al iniciar sesión con Google');
    }
  };

  const isFieldOk = (name) => touched[name] && !errors[name] && formData[name];

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary mb-2">Iniciar sesión</h1>
          <p className="text-text-secondary">Bienvenido de nuevo a ConImpulso</p>
        </div>

        {serverError && (
          <div className="mb-5 p-4 bg-red-50 border border-red-300 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm font-medium">{serverError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-primary mb-1.5">
              Correo electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-secondary" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="email"
                placeholder="tu@correo.com"
                className={inputClass(errors.email, touched.email, formData.email)}
              />
              {isFieldOk('email') && (
                <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
              )}
            </div>
            <FieldError msg={errors.email} />
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-sm font-medium text-primary mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-secondary" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="current-password"
                placeholder="••••••••"
                className={inputClass(errors.password, touched.password, formData.password)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <FieldError msg={errors.password} />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none">
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
            className="btn-primary w-full py-3 text-base font-semibold transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Verificando...
              </span>
            ) : 'Iniciar sesión'}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 flex-shrink-0">o continúa con</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Error al conectar con Google')}
              text="signin_with"
              shape="rectangular"
              locale="es"
              width="100%"
            />
          </div>
        </div>

        <p className="mt-4 text-center text-text-secondary text-sm">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-accent hover:text-accent-hover font-medium">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
