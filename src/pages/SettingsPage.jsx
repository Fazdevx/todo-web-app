import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, ShieldCheck, Mail, LogOut, Sliders, Smartphone, Download, CheckCircle2 } from 'lucide-react';

export function SettingsPage() {
  const { user, isAdmin, logout } = useAuth();
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
      
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Sliders className="w-6 h-6 text-orange-400" /> Ajustes Institucionales
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
            Galileo Colegio y Academia - Perfil de Usuario y Aplicación Web
          </p>
        </div>

        <div className="hidden sm:block px-4 py-2 bg-white rounded-2xl border border-orange-500/20 shadow-md">
          <img src="/logo.png" alt="Galileo Logo" className="h-8 object-contain" />
        </div>
      </div>

      {/* PWA Installation Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Instalar Aplicación Web (PWA)</h2>
            <p className="text-xs text-slate-400">Instala Galileo Agenda como App nativa en Android, iPhone o PC</p>
          </div>
        </div>

        {installed ? (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>¡La aplicación ya se encuentra instalada en este dispositivo!</span>
          </div>
        ) : deferredPrompt ? (
          <button
            onClick={handleInstallClick}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-extrabold text-sm shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Instalar Galileo Agenda
          </button>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 space-y-2 leading-relaxed">
            <p className="font-bold text-orange-400">¿Cómo instalar manualmente?</p>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li><strong className="text-slate-200">En Android (Chrome/Edge):</strong> Toca los 3 puntos del navegador → <em>"Agregar a la pantalla principal"</em> o <em>"Instalar aplicación"</em>.</li>
              <li><strong className="text-slate-200">En iPhone / iPad (Safari):</strong> Toca el botón <em>Compartir</em> (icono cuadrado con flecha hacia arriba) → <em>"Agregar a inicio"</em>.</li>
              <li><strong className="text-slate-200">En PC (Windows/Mac):</strong> Haz clic en el icono de instalación (+) situado a la derecha de la barra de direcciones del navegador.</li>
            </ul>
          </div>
        )}
      </div>

      {/* User Profile Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/20 text-orange-400 font-bold text-2xl flex items-center justify-center border border-orange-500/30">
            {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-8 h-8" />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">{user?.name}</h2>
              {isAdmin ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20 uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" /> Administrador
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider">
                  <User className="w-3.5 h-3.5" /> Docente / Miembro
                </span>
              )}
            </div>
            <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-1">
              <Mail className="w-4 h-4 text-slate-500" /> {user?.email}
            </p>
          </div>
        </div>

        {/* Roles Details */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <h3 className="text-sm font-bold text-slate-200 mb-1">Permisos de Tu Cuenta en Galileo</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {isAdmin
              ? 'Como Administrador de Galileo, tienes acceso completo al Panel de Control para supervisar todas las tareas del colegio y academia, filtrar por docente/miembro y gestionar la actividad global.'
              : 'Como Miembro del equipo Galileo, tienes acceso a tu agenda personal para gestionar tus actividades y entregas académicas.'}
          </p>
        </div>

        {/* Actions */}
        <div className="pt-2">
          <button
            onClick={logout}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-sm border border-rose-500/20 transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Cerrar Sesión
          </button>
        </div>

      </div>

    </div>
  );
}
