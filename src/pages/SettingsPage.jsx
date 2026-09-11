import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { User, ShieldCheck, Mail, LogOut, Sliders, Smartphone, Download, CheckCircle2, Sun, Moon, Monitor, Check } from 'lucide-react';

export function SettingsPage() {
  const { user, isAdmin, logout } = useAuth();
  const { themeMode, palette, density, PALETTES, changeThemeMode, changePalette, changeDensity } = useTheme();
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
              <li><strong style={{ color: 'var(--on-surface)' }}>En iPhone / iPad (Safari):</strong> Toca el botón <em>Compartir</em> (icono cuadrado con flecha hacia arriba) → <em>"Agregar a inicio"</em>.</li>
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
            <p className="text-xs" style={{ color: 'var(--on-surface-variant)' }}>Colores, modo oscuro y estilo de la interfaz</p>
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

        {/* Color Palette */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold" style={{ color: 'var(--on-surface)' }}>Paleta de Colores</h3>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {PALETTES.map((p) => (
              <button
                key={p.id}
                onClick={() => changePalette(p.id)}
                className="relative p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2"
                style={{ 
                  backgroundColor: `${p.color}20`,
                  borderColor: palette === p.id ? p.color : 'var(--outline)'
                }}
                title={p.name}
              >
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                  style={{ backgroundColor: p.color }}
                >
                  {p.icon}
                </div>
                <span className="text-xs font-medium" style={{ color: 'var(--on-surface)' }}>{p.name}</span>
                {palette === p.id && (
                  <div className="absolute top-1 right-1">
                    <Check className="w-4 h-4 drop-shadow-lg" style={{ color: 'var(--primary)' }} />
                  </div>
                )}
              </button>
            ))}
          </div>
          <p className="text-xs text-center" style={{ color: 'var(--on-surface-variant)' }}>Seleccionado: {PALETTES.find(p => p.id === palette)?.name}</p>
        </div>

        {/* Density */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold" style={{ color: 'var(--on-surface)' }}>Densidad de Interfaz</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => changeDensity('comfortable')}
              className="p-4 rounded-xl border-2 transition-all"
              style={density === 'comfortable' ? { 
                borderColor: 'var(--primary)',
                backgroundColor: 'var(--primary)10',
                color: 'var(--primary)'
              } : { 
                borderColor: 'var(--outline)',
                backgroundColor: 'var(--surface-variant)',
                color: 'var(--on-surface-variant)'
              }}
            >
              <span className="text-sm font-semibold">Cómoda</span>
            </button>
            <button
              onClick={() => changeDensity('compact')}
              className="p-4 rounded-xl border-2 transition-all"
              style={density === 'compact' ? { 
                borderColor: 'var(--primary)',
                backgroundColor: 'var(--primary)10',
                color: 'var(--primary)'
              } : { 
                borderColor: 'var(--outline)',
                backgroundColor: 'var(--surface-variant)',
                color: 'var(--on-surface-variant)'
              }}
            >
              <span className="text-sm font-semibold">Compacta</span>
            </button>
          </div>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border space-y-6" style={{ borderColor: 'var(--outline-variant)' }}>
        <div className="flex items-center gap-4 pb-6 border-b" style={{ borderColor: 'var(--outline-variant)' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl border" style={{ 
            backgroundColor: 'var(--primary)10', 
            color: 'var(--primary)',
            borderColor: 'var(--primary)30'
          }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-8 h-8" />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold" style={{ color: 'var(--on-surface)' }}>{user?.name}</h2>
              {isAdmin ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider" style={{ 
                  backgroundColor: 'var(--primary)10', 
                  color: 'var(--primary)',
                  borderColor: 'var(--primary)20'
                }}>
                  <ShieldCheck className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} /> Administrador
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider" style={{ 
                  backgroundColor: 'var(--primary)10', 
                  color: 'var(--primary)',
                  borderColor: 'var(--primary)20'
                }}>
                  <User className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} /> Docente / Miembro
                </span>
              )}
            </div>
            <p className="text-sm flex items-center gap-1.5 mt-1" style={{ color: 'var(--on-surface-variant)' }}>
              <Mail className="w-4 h-4" style={{ color: 'var(--on-surface-variant)' }} /> {user?.email}
            </p>
          </div>
        </div>

        {/* Roles Details */}
        <div className="p-4 rounded-2xl border" style={{ 
          backgroundColor: 'var(--surface-variant)',
          borderColor: 'var(--outline)'
        }}>
          <h3 className="text-sm font-bold" style={{ color: 'var(--on-surface)' }}>Permisos de Tu Cuenta en Galileo</h3>
          <p className="text-xs leading-relaxed mt-1" style={{ color: 'var(--on-surface-variant)' }}>
            {isAdmin
              ? 'Como Administrador de Galileo, tienes acceso completo al Panel de Control para supervisar todas las tareas del colegio y academia, filtrar por docente/miembro y gestionar la actividad global.'
              : 'Como Miembro del equipo Galileo, tienes acceso a tu agenda personal para gestionar tus actividades y entregas académicas.'}
          </p>
        </div>

        {/* Actions */}
        <div className="pt-2">
          <button
            onClick={logout}
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm border transition-all flex items-center justify-center gap-2"
            style={{ 
              backgroundColor: 'rgba(244, 63, 94, 0.05)',
              borderColor: 'rgba(244, 63, 94, 0.15)',
              color: '#f43f5e'
            }}
            onMouseEnter={(e) => { e.target.style.backgroundColor = 'rgba(244, 63, 94, 0.1)'; }}
            onMouseLeave={(e) => { e.target.style.backgroundColor = 'rgba(244, 63, 94, 0.05)'; }}
          >
            <LogOut className="w-4 h-4" /> Cerrar Sesión
          </button>
        </div>

      </div>

    </div>
  );
}