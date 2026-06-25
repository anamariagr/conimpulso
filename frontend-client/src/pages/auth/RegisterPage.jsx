import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock, User, Phone, AlertCircle, CheckCircle } from 'lucide-react';

// ─── Reglas de validación ────────────────────────────────────────────────────

const RULES = {
  name: (v) => {
    if (!v?.trim()) return 'El nombre es requerido';
    if (v.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres';
    if (v.trim().length > 100) return 'El nombre no puede tener más de 100 caracteres';
    if (!/^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s'-]+$/.test(v.trim()))
      return 'El nombre solo puede contener letras, espacios y guiones';
    return '';
  },
  email: (v) => {
    if (!v?.trim()) return 'El correo electrónico es requerido';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()))
      return 'Ingresa un correo electrónico válido (ej: usuario@dominio.com)';
    return '';
  },
  phone: (v) => {
    if (!v?.trim()) return ''; // opcional
    const digits = v.replace(/[\s\-().+]/g, '');
    if (!/^\d+$/.test(digits)) return 'El teléfono solo puede contener números';
    if (digits.length < 7) return 'El teléfono debe tener al menos 7 dígitos';
    if (digits.length > 15) return 'El teléfono no puede tener más de 15 dígitos';
    return '';
  },
  password: (v) => {
    if (!v) return 'La contraseña es requerida';
    if (v.length < 8) return 'Debe tener al menos 8 caracteres';
    if (!/[A-Z]/.test(v)) return 'Debe tener al menos una letra mayúscula';
    if (!/[a-z]/.test(v)) return 'Debe tener al menos una letra minúscula';
    if (!/[\d!@#$%^&*(),.?":{}|<>_\-+=/\\]/.test(v))
      return 'Debe tener al menos un número o símbolo (!@#$...)';
    return '';
  },
  password_confirmation: (v, formData) => {
    if (!v) return 'Confirma tu contraseña';
    if (v !== formData.password) return 'Las contraseñas no coinciden';
    return '';
  },
};

// ─── Fuerza de contraseña ────────────────────────────────────────────────────

function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>_\-+=/\\]/.test(password)) score++;

  if (score <= 2) return { score, label: 'Débil', color: 'bg-red-500' };
  if (score <= 3) return { score, label: 'Regular', color: 'bg-orange-400' };
  if (score <= 4) return { score, label: 'Buena', color: 'bg-yellow-400' };
  return { score, label: 'Fuerte', color: 'bg-green-500' };
}

function PasswordStrengthBar({ password }) {
  const { score, label, color } = getPasswordStrength(password);
  if (!password) return null;
  const pct = Math.min(Math.round((score / 6) * 100), 100);
  return (
    <div className="mt-2">
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className={`text-xs mt-1 font-medium ${
        score <= 2 ? 'text-red-500' : score <= 3 ? 'text-orange-500' : score <= 4 ? 'text-yellow-600' : 'text-green-600'
      }`}>
        Contraseña {label}
      </p>
    </div>
  );
}

// ─── Componentes reutilizables ────────────────────────────────────────────────

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
  const base = 'input-field pl-11 pr-10 py-3 rounded-lg transition-all w-full';
  if (!touched || !value) return `${base} border border-gray-300`;
  if (error) return `${base} border-2 border-red-400 bg-red-50 ring-1 ring-red-200`;
  return `${base} border-2 border-green-400 bg-green-50 ring-1 ring-green-200`;
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, loginWithGoogle, isLoading, isAuthenticated } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  const validateField = (name, value, data = formData) => {
    const rule = RULES[name];
    return rule ? rule(value, data) : '';
  };

  const validateAll = (data = formData) => {
    const e = {};
    Object.keys(RULES).forEach((k) => {
      const err = RULES[k](data[k], data);
      if (err) e[k] = err;
    });
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const next = { ...formData, [name]: value };
    setFormData(next);
    setServerError('');
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value, next) }));
    }
    // Si cambia password, re-valida confirmación si ya fue tocada
    if (name === 'password' && touched.password_confirmation) {
      setErrors((prev) => ({
        ...prev,
        password_confirmation: RULES.password_confirmation(next.password_confirmation, next),
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  // Solo permite dígitos y caracteres de formato en el teléfono
  const handlePhoneChange = (e) => {
    const raw = e.target.value;
    // Permite números, +, espacios, guiones y paréntesis
    const filtered = raw.replace(/[^\d\s+\-().]/g, '');
    const syntheticEvent = { target: { name: 'phone', value: filtered } };
    handleChange(syntheticEvent);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const allTouched = Object.fromEntries(Object.keys(RULES).map((k) => [k, true]));
    setTouched(allTouched);
    const errs = validateAll();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const result = await register(formData);
    if (result.success) {
      toast.success('¡Cuenta creada exitosamente!');
      navigate('/onboarding');
    } else {
      if (result.errors && Object.keys(result.errors).length > 0) {
        const mapped = {};
        Object.entries(result.errors).forEach(([k, msgs]) => {
          mapped[k] = Array.isArray(msgs) ? msgs[0] : msgs;
        });
        setErrors((prev) => ({ ...prev, ...mapped }));
        setServerError('Corrige los errores marcados en rojo.');
      } else if (/already|exists|duplicate/i.test(result.message)) {
        setErrors((prev) => ({ ...prev, email: 'Este correo ya está registrado.' }));
        setServerError('Este correo ya tiene una cuenta. ¿Quieres iniciar sesión?');
      } else if (/Network Error/i.test(result.message)) {
        setServerError('Error de conexión. Verifica tu red e intenta nuevamente.');
      } else {
        setServerError(result.message || 'Error al crear cuenta. Intenta nuevamente.');
      }
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const result = await loginWithGoogle(credentialResponse.credential);
    if (result.success) {
      if (result.isNew) {
        toast.success('Cuenta creada — cuéntanos quién eres');
        navigate('/onboarding');
      } else {
        toast.success('Bienvenido de nuevo');
        navigate('/dashboard');
      }
    } else {
      toast.error(result.message || 'Error al registrarse con Google');
    }
  };

  const isOk = (name) => touched[name] && !errors[name] && formData[name];

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary mb-2">Crear cuenta</h1>
          <p className="text-text-secondary">Únete a ConImpulso y empieza a explorar</p>
        </div>

        {serverError && (
          <div className="mb-5 p-4 bg-red-50 border border-red-300 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-700 text-sm font-medium">{serverError}</p>
              {/correo ya/.test(serverError) && (
                <Link to="/login" className="text-accent text-sm underline mt-1 inline-block">
                  Ir a iniciar sesión
                </Link>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-primary mb-1.5">
              Nombre completo <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="name"
                placeholder="Tu nombre completo"
                maxLength={100}
                className={inputClass(errors.name, touched.name, formData.name)}
              />
              {isOk('name') && (
                <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
              )}
            </div>
            <FieldError msg={errors.name} />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-primary mb-1.5">
              Correo electrónico <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
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
              {isOk('email') && (
                <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
              )}
            </div>
            <FieldError msg={errors.email} />
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-primary mb-1.5">
              Teléfono <span className="text-text-secondary text-xs font-normal">(opcional)</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handlePhoneChange}
                onBlur={handleBlur}
                autoComplete="tel"
                placeholder="+57 300 123 4567"
                inputMode="tel"
                maxLength={20}
                className={inputClass(errors.phone, touched.phone, formData.phone)}
              />
              {isOk('phone') && (
                <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
              )}
            </div>
            <FieldError msg={errors.phone} />
            {!errors.phone && (
              <p className="mt-1 text-xs text-text-secondary">
                Solo números, +, espacios y guiones. Ej: +57 300 123 4567
              </p>
            )}
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-sm font-medium text-primary mb-1.5">
              Contraseña <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="new-password"
                placeholder="Mín. 8 caracteres"
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
            <PasswordStrengthBar password={formData.password} />
            <FieldError msg={errors.password} />
            {!errors.password && !formData.password && (
              <p className="mt-1 text-xs text-text-secondary">
                Mínimo 8 caracteres, mayúscula, minúscula y número o símbolo
              </p>
            )}
          </div>

          {/* Confirmar contraseña */}
          <div>
            <label className="block text-sm font-medium text-primary mb-1.5">
              Confirmar contraseña <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input
                type={showConfirm ? 'text' : 'password'}
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="new-password"
                placeholder="Repite la contraseña"
                className={inputClass(
                  errors.password_confirmation,
                  touched.password_confirmation,
                  formData.password_confirmation,
                )}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary transition-colors"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <FieldError msg={errors.password_confirmation} />
          </div>

          {/* Términos */}
          <div className="flex items-start gap-2 pt-1">
            <input
              type="checkbox"
              required
              id="terms"
              className="mt-0.5 rounded border-gray-300 text-accent focus:ring-accent cursor-pointer"
            />
            <label htmlFor="terms" className="text-sm text-text-secondary cursor-pointer leading-relaxed">
              Acepto los{' '}
              <Link to="/terminos" className="text-accent hover:text-accent-hover underline">
                Términos de servicio
              </Link>
              {' '}y la{' '}
              <Link to="/privacidad" className="text-accent hover:text-accent-hover underline">
                Política de privacidad
              </Link>
            </label>
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
                Creando cuenta...
              </span>
            ) : 'Crear cuenta'}
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

        <p className="mt-4 text-center text-text-secondary text-sm">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-accent hover:text-accent-hover font-medium">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
