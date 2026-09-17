content = """import React, { useState, useEffect } from 'react';
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
"""

content2 = """
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
"""


