import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, ArrowRight, ShieldAlert } from 'lucide-react';

export function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        if (!name.trim()) {
          throw new Error('Por favor ingresa tu nombre');
        }
        await register(name, email, password);
      }
    } catch (err) {
      setError(err.message || 'Ocurrió un error al autenticar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="w-full max-w-md">

        {/* Galileo Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center px-6 py-4 rounded-3xl shadow-2xl border" style={{ 
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--primary)20',
            boxShadow: '0 20px 40px -10px var(--primary)20'
          }}>
            <img
              src="/logo.png"
              alt="Galileo Colegio y Academia"
              className="h-14 sm:h-16 object-contain"
            />
          </div>
          <h1 className="text-3xl font-extrabold mt-5" style={{ color: 'var(--on-surface)' }}>
            Galileo<span style={{ color: 'var(--primary)' }}>Agenda</span>
          </h1>
          <p className="text-xs font-bold uppercase tracking-wider mt-1" style={{ color: 'var(--primary)' }}>
            Colegio y Academia
          </p>
        </div>

        {/* Auth Glass Card */}
        <div className="glass-panel rounded-3xl p-8 border shadow-2xl relative overflow-hidden">

          <div className="text-center mb-6">
            <h2 className="text-xl font-bold" style={{ color: 'var(--on-surface)' }}>
              {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </h2>
            <p className="text-xs mt-1" style={{ color: 'var(--on-surface-variant)' }}>
              {mode === 'login'
                ? 'Ingresa tus credenciales institucionales'
                : 'Completa tus datos para registrarte'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl border text-sm font-medium flex items-start gap-3" style={{ 
              backgroundColor: 'rgba(244, 63, 94, 0.05)',
              borderColor: 'rgba(244, 63, 94, 0.15)',
              color: '#f43f5e'
            }}>
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--on-surface-variant)' }}>
                  Nombre Completo
                </label>
                <div className="relative">
                  <User className="w-5 h-5 absolute left-3.5 top-3.5" style={{ color: 'var(--on-surface-variant)' }} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu Nombre"
                    className="w-full pl-11 pr-4 py-3 rounded-xl text-sm font-medium transition-all focus:outline-none"
                    style={{ 
                      backgroundColor: 'var(--surface-variant)',
                      borderColor: 'var(--outline)',
                      color: 'var(--on-surface)',
                      borderWidth: '1px',
                      borderStyle: 'solid'
                    }}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--outline)'; }}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--on-surface-variant)' }}>
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3.5 top-3.5" style={{ color: 'var(--on-surface-variant)' }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@galileo.edu.pe"
                  className="w-full pl-11 pr-4 py-3 rounded-xl text-sm font-medium transition-all focus:outline-none"
                  style={{ 
                    backgroundColor: 'var(--surface-variant)',
                    borderColor: 'var(--outline)',
                    color: 'var(--on-surface)',
                    borderWidth: '1px',
                    borderStyle: 'solid'
                  }}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--outline)'; }}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--on-surface-variant)' }}>
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3.5 top-3.5" style={{ color: 'var(--on-surface-variant)' }} />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full pl-11 pr-4 py-3 rounded-xl text-sm font-medium transition-all focus:outline-none"
                  style={{ 
                    backgroundColor: 'var(--surface-variant)',
                    borderColor: 'var(--outline)',
                    color: 'var(--on-surface)',
                    borderWidth: '1px',
                    borderStyle: 'solid'
                  }}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--outline)'; }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-50 mt-2"
              style={{ 
                background: 'var(--primary)',
                boxShadow: '0 10px 25px -5px var(--primary)40'
              }}
              onMouseEnter={(e) => { e.target.style.filter = 'brightness(1.1)'; }}
              onMouseLeave={(e) => { e.target.style.filter = 'brightness(1)'; }}
            >
              {loading ? (
                'Procesando...'
              ) : (
                <>
                  <span>{mode === 'login' ? 'Ingresar a Galileo' : 'Registrar Cuenta'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

          </form>

          <div className="mt-6 pt-6 border-t text-center" style={{ borderColor: 'var(--outline-variant)' }}>
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError('');
              }}
              className="text-xs font-bold transition-colors"
              style={{ color: 'var(--primary)' }}
              onMouseEnter={(e) => { e.target.style.opacity = '0.8'; }}
              onMouseLeave={(e) => { e.target.style.opacity = '1'; }}
            >
              {mode === 'login'
                ? '¿No tienes cuenta? Regístrate aquí'
                : '¿Ya tienes una cuenta? Inicia sesión'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}