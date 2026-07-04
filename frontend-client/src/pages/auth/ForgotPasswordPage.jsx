import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { authService } from '../../services/api';

const emailRule = (v) => {
  if (!v) return 'El correo electrónico es requerido';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())) return 'Ingresa un correo electrónico válido';
  return '';
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [touched, setTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    setServerError('');
    if (touched) setEmailError(emailRule(val));
  };

  const handleBlur = () => {
    setTouched(true);
    setEmailError(emailRule(email));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    const err = emailRule(email);
    setEmailError(err);
    if (err) return;

    setIsLoading(true);
    setServerError('');
    try {
      await authService.sendResetLink({ email: email.trim() });
      setSent(true);
    } catch (error) {
      const msg = error.response?.data?.message || '';
      setServerError(msg || 'No pudimos enviar el correo. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
        <div className="card max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-primary mb-2">Revisa tu correo</h1>
          <p className="text-text-secondary mb-2">
            Si existe una cuenta con <span className="font-medium text-primary">{email}</span>, recibirás un enlace para restablecer tu contraseña.
          </p>
          <p className="text-sm text-text-secondary mb-6">
            El enlace expira en 60 minutos. Revisa también tu carpeta de spam.
          </p>
          <button
            onClick={() => { setSent(false); setEmail(''); setTouched(false); }}
            className="text-sm text-accent hover:text-accent-hover"
          >
            Enviar a otro correo
          </button>
          <div className="mt-4">
            <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-text-secondary hover:text-primary">
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const inputClass = touched && emailError
    ? 'input-field pl-12 py-3 rounded-lg border-2 border-red-400 bg-red-50 ring-1 ring-red-200 transition-all'
    : touched && email && !emailError
    ? 'input-field pl-12 py-3 rounded-lg border-2 border-green-400 bg-green-50 ring-1 ring-green-200 transition-all'
    : 'input-field pl-12 py-3 rounded-lg border border-gray-300 transition-all';

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary mb-2">¿Olvidaste tu contraseña?</h1>
          <p className="text-text-secondary">
            Ingresa tu correo y te enviaremos un enlace para restablecerla.
          </p>
        </div>

        {serverError && (
          <div className="mb-5 p-4 bg-red-50 border border-red-300 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm font-medium">{serverError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-primary mb-1.5">
              Correo electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-secondary" />
              <input
                type="email"
                value={email}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="email"
                placeholder="tu@correo.com"
                className={inputClass}
              />
              {touched && !emailError && email && (
                <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
              )}
            </div>
            {touched && emailError && (
              <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {emailError}
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
                Enviando...
              </span>
            ) : 'Enviar enlace de recuperación'}
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
