import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../../services/api';

const RULES = {
  password: (v) => {
    if (!v) return 'La contraseña es requerida';
    if (v.length < 8) return 'Debe tener al menos 8 caracteres';
    return '';
  },
  password_confirmation: (v, pwd) => {
    if (!v) return 'Confirma tu contraseña';
    if (v !== pwd) return 'Las contraseñas no coinciden';
    return '';
  },
};

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';

  const [form, setForm] = useState({ password: '', password_confirmation: '' });
  const [errors, setErrors] = useState({ password: '', password_confirmation: '' });
  const [touched, setTouched] = useState({ password: false, password_confirmation: false });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = (data = form) => ({
    password: RULES.password(data.password),
    password_confirmation: RULES.password_confirmation(data.password_confirmation, data.password),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const next = { ...form, [name]: value };
    setForm(next);
    setServerError('');
    if (touched[name]) {
      setErrors((prev) => ({
        ...prev,
        password: RULES.password(next.password),
        password_confirmation: RULES.password_confirmation(next.password_confirmation, next.password),
      }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors(validate());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ password: true, password_confirmation: true });
    const errs = validate();
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;

    if (!token || !email) {
      setServerError('El enlace de recuperación no es válido. Solicita uno nuevo.');
      return;
    }

    setIsLoading(true);
    setServerError('');
    try {
      await authService.resetPassword({
        email,
        token,
        password: form.password,
        password_confirmation: form.password_confirmation,
      });
      toast.success('Contraseña actualizada correctamente');
      navigate('/login');
    } catch (error) {
      const msg = error.response?.data?.message || '';
      if (/token|invalid|expired/i.test(msg)) {
        setServerError('El enlace ha expirado o no es válido. Solicita uno nuevo.');
      } else {
        setServerError(msg || 'No pudimos restablecer la contraseña. Intenta nuevamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fieldClass = (name) => {
    if (!touched[name]) return 'input-field pl-12 pr-10 py-3 rounded-lg border border-gray-300 transition-all';
    if (errors[name]) return 'input-field pl-12 pr-10 py-3 rounded-lg border-2 border-red-400 bg-red-50 ring-1 ring-red-200 transition-all';
    return 'input-field pl-12 pr-10 py-3 rounded-lg border-2 border-green-400 bg-green-50 ring-1 ring-green-200 transition-all';
  };

  if (!token || !email) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
        <div className="card max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-primary mb-2">Enlace inválido</h1>
          <p className="text-text-secondary mb-6">
            Este enlace de recuperación no es válido o ha expirado.
          </p>
          <Link to="/forgot-password" className="btn-primary inline-block py-2.5 px-6">
            Solicitar nuevo enlace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary mb-2">Nueva contraseña</h1>
          <p className="text-text-secondary">
            Crea una contraseña segura para <span className="font-medium text-primary">{email}</span>
          </p>
        </div>

        {serverError && (
          <div className="mb-5 p-4 bg-red-50 border border-red-300 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-700 text-sm font-medium">{serverError}</p>
              {/expirado|válido/i.test(serverError) && (
                <Link to="/forgot-password" className="text-sm text-red-600 underline mt-1 inline-block">
                  Solicitar nuevo enlace
                </Link>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-primary mb-1.5">
              Nueva contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-secondary" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                className={fieldClass('password')}
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
            {touched.password && errors.password && (
              <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {errors.password}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-1.5">
              Confirmar contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-secondary" />
              <input
                type={showConfirm ? 'text' : 'password'}
                name="password_confirmation"
                value={form.password_confirmation}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="new-password"
                placeholder="Repite la contraseña"
                className={fieldClass('password_confirmation')}
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
            {touched.password_confirmation && errors.password_confirmation && (
              <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {errors.password_confirmation}
              </p>
            )}
            {touched.password_confirmation && !errors.password_confirmation && form.password_confirmation && (
              <p className="mt-1.5 text-sm text-green-600 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                Las contraseñas coinciden
              </p>
            )}
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
                Guardando...
              </span>
            ) : 'Restablecer contraseña'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-text-secondary hover:text-primary">
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
