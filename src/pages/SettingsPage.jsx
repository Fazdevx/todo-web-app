import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { User, ShieldCheck, Mail, LogOut, Sliders, Smartphone, Download, CheckCircle2, Sun, Moon, Monitor, Check, Circle } from 'lucide-react';

export function SettingsPage() {
  const { user, isAdmin, logout } = useAuth();
  const { themeMode, palette, density, board, PALETTES, BOARDS, changeThemeMode, changePalette, changeDensity, changeBoard } = useTheme();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setInstalled(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      <div className="glass-panel p-6 sm:p-8 rounded-3xl border flex items-center justify-between" style={{ borderColor: 'var(--outline-variant)' }}>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2" style={{ color: 'var(--on-surface)' }}>
            <Sliders className="w-6 h-6" style={{ color: 'var(--primary)' }} /> Ajustes Institucionales
          </h1>
          <p className="text-xs sm:text-sm font-medium mt-1" style={{ color: 'var(--on-surface-variant)' }}>
            Galileo Colegio y Academia - Perfil de Usuario y Aplicación Web
          </p>
        </div>

        <div className="hidden sm:block px-4 py-2 rounded-2xl border shadow-md" style={{ 
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--primary)20'
        }}>
          <img src="/logo.png" alt="Galileo Logo" className="h-8 object-contain" />
        </div>
      </div>

      {/* PWA Installation Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border space-y-4" style={{ borderColor: 'var(--outline-variant)' }}>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl border" style={{ 
            backgroundColor: 'var(--primary)10', 
            color: 'var(--primary)',
            borderColor: 'var(--primary)20'
          }}>
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--on-surface)' }}>Instalar Aplicación Web (PWA)</h2>
            <p className="text-xs" style={{ color: 'var(--on-surface-variant)' }}>Instala Galileo Agenda como App nativa en Android, iPhone o PC</p>
          </div>
        </div>

        {installed ? (
          <div className="p-4 rounded-2xl border text-xs font-semibold flex items-center gap-2" style={{ 
            backgroundColor: 'rgba(16, 185, 129, 0.05)',
            borderColor: 'rgba(16, 185, 129, 0.15)',
            color: '#10b981'
          }}>
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>¡La aplicación ya se encuentra instalada en este dispositivo!</span>
          </div>
        ) : deferredPrompt ? (
          <button
            onClick={handleInstallClick}
            className="w-full sm:w-auto px-6 py-3 rounded-xl text-white font-extrabold text-sm shadow-lg transition-all flex items-center justify-center gap-2"
            style={{ 
              background: 'var(--primary)',
              boxShadow: '0 10px 25px -5px var(--primary)40'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}
          >
            <Download className="w-4 h-4" /> Instalar Galileo Agenda
          </button>
        ) : (
          <div className="p-4 rounded-2xl border text-xs space-y-2 leading-relaxed" style={{ 
            backgroundColor: 'var(--surface-variant)',
            borderColor: 'var(--outline)',
            color: 'var(--on-surface-variant)'
          }}>
            <p className="font-bold" style={{ color: 'var(--primary)' }}>¿Cómo instalar manualmente?</p>
            <ul className="list-disc list-inside space-y-1" style={{ color: 'var(--on-surface-variant)' }}>
              <li><strong style={{ color: 'var(--on-surface)' }}>En Android (Chrome/Edge):</strong> Toca los 3 puntos del navegador → <em>"Agregar a la pantalla principal"</em> o <em>"Instalar aplicación"</em>.</li>
              <li><strong style={{ color: 'var(--on-surface)' }}>En iPhone / iPad (Safari)</strong> Toca el botón <em>Compartir</em> (icono cuadrado con flecha hacia arriba) → <em>"Agregar a inicio"</em>.</li>
              <li><strong style={{ color: 'var(--on-surface)' }}>En PC (Windows/Mac):</strong> Haz clic en el icono de instalación (+) situado a la derecha de la barra de direcciones del navegador.</li>
            </ul>
          </div>
        )}
      </div>

      {/* Theme Settings Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border space-y-6" style={{ borderColor: 'var(--outline-variant)' }}>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl border" style={{ 
            backgroundColor: 'var(--primary)10', 
            color: 'var(--primary)',
            borderColor: 'var(--primary)20'
          }}>
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--on-surface)' }}>Personalización de Tema</h2>
            <p className="text-xs" style={{ color: 'var(--on-surface-variant)' }}>
              Ajusta la apariencia visual de la aplicación a tu preferencia
            </p>
          </div>
        </div>

        {/* Theme Mode */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold" style={{ color: 'var(--on-surface)' }}>Modo de Tema</h3>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => changeThemeMode('light')}
              className="p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2"
              style={themeMode === 'light' ? { 
                borderColor: 'var(--primary)',
                backgroundColor: 'var(--primary)10',
                color: 'var(--primary)'
              } : { 
                borderColor: 'var(--outline)',
                backgroundColor: 'var(--surface-variant)',
                color: 'var(--on-surface-variant)'
              }}
            >
              <Sun className="w-6 h-6" />
              <span className="text-xs font-semibold">Claro</span>
            </button>

            <button
              onClick={() => changeThemeMode('dark')}
              className="p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2"
              style={themeMode === 'dark' ? { 
                borderColor: 'var(--primary)',
                backgroundColor: 'var(--primary)10',
                color: 'var(--primary)'
              } : { 
                borderColor: 'var(--outline)',
                backgroundColor: 'var(--surface-variant)',
                color: 'var(--on-surface-variant)'
              }}
            >
              <Moon className="w-6 h-6" />
              <span className="text-xs font-semibold">Oscuro</span>
            </button>

            <button
              onClick={() => changeThemeMode('system')}
              className="p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2"
              style={themeMode === 'system' ? { 
                borderColor: 'var(--primary)',
                backgroundColor: 'var(--primary)10',
                color: 'var(--primary)'
              } : { 
                borderColor: 'var(--outline)',
                backgroundColor: 'var(--surface-variant)',
                color: 'var(--on-surface-variant)'
              }}
            >
              <Monitor className="w-6 h-6" />
              <span className="text-xs font-semibold">Sistema</span>
            </button>
          </div>
        </div>

        {/* Palette Selection */}
        {PALETTES && PALETTES.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold" style={{ color: 'var(--on-surface)' }}>Paleta de Colores</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {PALETTES.map((p) => {
                const dots = p.colors || (p.color ? [p.color] : []);
                return (
                <button
                  key={p.id}
                  onClick={() => changePalette(p.id)}
                  className="p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2"
                  style={palette === p.id ? {
                    borderColor: 'var(--primary)',
                    backgroundColor: 'var(--primary)10',
                    color: 'var(--primary)'
                  } : {
                    borderColor: 'var(--outline)',
                    backgroundColor: 'var(--surface-variant)',
                    color: 'var(--on-surface-variant)'
                  }}
                >
                  <div className="flex items-center gap-1">
                    {dots?.map((c, i) => (
                      <span
                        key={i}
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: c, borderColor: 'var(--outline)' }}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-semibold">{p.icon ? `${p.icon} ` : ''}{p.name}</span>
                  {palette === p.id && <Check className="w-4 h-4" />}
                </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Density */}
        {density !== undefined && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold" style={{ color: 'var(--on-surface)' }}>Densidad de Interfaz</h3>
            <div className="grid grid-cols-3 gap-3">
              {['compact', 'comfortable', 'spacious'].map((d) => (
                <button
                  key={d}
                  onClick={() => changeDensity(d)}
                  className="p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2"
                  style={density === d ? {
                    borderColor: 'var(--primary)',
                    backgroundColor: 'var(--primary)10',
                    color: 'var(--primary)'
                  } : {
                    borderColor: 'var(--outline)',
                    backgroundColor: 'var(--surface-variant)',
                    color: 'var(--on-surface-variant)'
                  }}
                >
                  {density === d ? <Check className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                  <span className="text-xs font-semibold capitalize">
                    {d === 'compact' ? 'Compacta' : d === 'comfortable' ? 'Cómoda' : 'Amplia'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Board / Layout */}
        {BOARDS && BOARDS.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold" style={{ color: 'var(--on-surface)' }}>Estilo de Tablero</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {BOARDS.map((b) => (
                <button
                  key={b.id}
                  onClick={() => changeBoard(b.id)}
                  title={`Cambiar fondo a ${b.name} (actual: ${board})`}
                  className="p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2"
                  style={board === b.id ? {
                    borderColor: 'var(--primary)',
                    backgroundColor: 'var(--primary)10',
                    color: 'var(--primary)'
                  } : {
                    borderColor: 'var(--outline)',
                    backgroundColor: 'var(--surface-variant)',
                    color: 'var(--on-surface-variant)'
                  }}
                >
                  <span
                    className="w-full h-10 rounded-lg border"
                    style={{ background: b.preview || 'var(--surface-variant)', borderColor: 'var(--outline)' }}
                    aria-hidden="true"
                  />
                  <span className="text-xs font-semibold">{b.icon ? `${b.icon} ` : ''}{b.name}</span>
                  {board === b.id && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
            <p className="text-[11px]" style={{ color: 'var(--on-surface-variant)' }}>
              El fondo activo es: <strong style={{ color: 'var(--on-surface)' }}>{board}</strong>. Si no ves el cambio,
              abre la consola y verifica que <code>&lt;html data-board=&quot;...&quot;&gt;</code> cambie al hacer clic.
            </p>
          </div>
        )}
      </div>

      {/* User Profile Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border space-y-6" style={{ borderColor: 'var(--outline-variant)' }}>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl border" style={{ 
            backgroundColor: 'var(--primary)10', 
            color: 'var(--primary)',
            borderColor: 'var(--primary)20'
          }}>
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--on-surface)' }}>Perfil de Usuario</h2>
            <p className="text-xs" style={{ color: 'var(--on-surface-variant)' }}>Información de tu cuenta institucional</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 p-4 rounded-2xl border" style={{
            backgroundColor: 'var(--surface-variant)',
            borderColor: 'var(--outline)'
          }}>
            <Mail className="w-5 h-5 shrink-0" style={{ color: 'var(--primary)' }} />
            <div className="min-w-0">
              <p className="text-xs font-medium" style={{ color: 'var(--on-surface-variant)' }}>Correo electrónico</p>
              <p className="text-sm font-bold truncate" style={{ color: 'var(--on-surface)' }}>
                {user?.email || 'No disponible'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl border" style={{
            backgroundColor: 'var(--surface-variant)',
            borderColor: 'var(--outline)'
          }}>
            <ShieldCheck className="w-5 h-5 shrink-0" style={{ color: isAdmin ? '#10b981' : 'var(--on-surface-variant)' }} />
            <div className="min-w-0">
              <p className="text-xs font-medium" style={{ color: 'var(--on-surface-variant)' }}>Rol de acceso</p>
              <p className="text-sm font-bold" style={{ color: 'var(--on-surface)' }}>
                {isAdmin ? 'Administrador' : 'Usuario estándar'}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full sm:w-auto px-6 py-3 rounded-xl font-extrabold text-sm shadow-lg transition-all flex items-center justify-center gap-2 border-2"
          style={{
            backgroundColor: 'transparent',
            borderColor: 'var(--error, #ef4444)',
            color: 'var(--error, #ef4444)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--error, #ef4444)';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--error, #ef4444)';
          }}
        >
          <LogOut className="w-4 h-4" /> Cerrar Sesión
        </button>
      </div>

      {/* Footer */}
      <div className="text-center py-4">
        <p className="text-xs font-medium" style={{ color: 'var(--on-surface-variant)' }}>
          Galileo Colegio y Academia &copy; {new Date().getFullYear()} — Todos los derechos reservados.
        </p>
      </div>

    </div>
  );
}