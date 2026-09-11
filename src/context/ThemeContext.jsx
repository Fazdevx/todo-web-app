import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

const PALETTES = [
  { id: 0, name: 'Azul', color: '#1976D2', icon: '🔵' },
  { id: 1, name: 'Verde', color: '#388E3C', icon: '🟢' },
  { id: 2, name: 'Morado', color: '#7B1FA2', icon: '🟣' },
  { id: 3, name: 'Naranja', color: '#E64A19', icon: '🟠' },
  { id: 4, name: 'Rosa', color: '#C2185B', icon: '🌸' },
  { id: 5, name: 'Lavanda Pastel', color: '#B39DDB', icon: '💜' },
  { id: 6, name: 'Rosa Suave', color: '#F8BBD0', icon: '🌷' },
  { id: 7, name: 'Verde Menta', color: '#81C784', icon: '🌿' },
  { id: 8, name: 'Azul Cielo', color: '#64B5F6', icon: '☁️' },
  { id: 9, name: 'Violeta Flores', color: '#CE93D8', icon: '🌺' },
  { id: 10, name: 'Rosa Claro', color: '#FFB6C1', icon: '🌹' },
  { id: 11, name: 'Azul Suave', color: '#87CEEB', icon: '🦋' },
  { id: 12, name: 'Rosa Pastel', color: '#FFC0CB', icon: '🌼' },
  { id: 13, name: 'Azul Real', color: '#4169E1', icon: '👑' },
  { id: 14, name: 'Lavanda', color: '#E6E6FA', icon: '🪻' },
];

export function ThemeProvider({ children }) {
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('agenda.themeMode') || 'system';
  });
  const [palette, setPalette] = useState(() => {
    return parseInt(localStorage.getItem('agenda.palette') ?? '0', 10);
  });
  const [density, setDensity] = useState(() => {
    return localStorage.getItem('agenda.density') || 'comfortable';
  });

  useEffect(() => {
    const applyTheme = () => {
      const resolvedTheme = themeMode === 'system'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : themeMode;
      document.documentElement.setAttribute('data-theme', resolvedTheme);
    };

    applyTheme();
  }, [themeMode]);

  useEffect(() => {
    document.documentElement.setAttribute('data-palette', palette);
  }, [palette]);

  useEffect(() => {
    document.documentElement.setAttribute('data-density', density);
  }, [density]);

  const changeThemeMode = (mode) => {
    setThemeMode(mode);
    localStorage.setItem('agenda.themeMode', mode);
  };

  const changePalette = (paletteId) => {
    setPalette(paletteId);
    localStorage.setItem('agenda.palette', paletteId);
  };

  const changeDensity = (densityValue) => {
    setDensity(densityValue);
    localStorage.setItem('agenda.density', densityValue);
  };

  return (
    <ThemeContext.Provider value={{
      themeMode,
      palette,
      density,
      PALETTES,
      changeThemeMode,
      changePalette,
      changeDensity,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}