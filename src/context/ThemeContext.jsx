import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const PALETTES = [
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

// Fondos de la app: el verde pizarra original + tonos pastel.
// `preview` es el degradado que se muestra en el selector de Ajustes y
// cada id se aplica como [data-board="id"] en <html> (ver index.css).
export const BOARDS = [
  {
    id: 'menta',
    name: 'Menta Pastel',
    icon: '🌿',
    preview: 'linear-gradient(140deg, #effbf5, #c9ecdc)',
  },
  {
    id: 'cielo',
    name: 'Cielo Pastel',
    icon: '️',
    preview: 'linear-gradient(140deg, #f4faff, #cfe5f9)',
  },
  {
    id: 'lavanda',
    name: 'Lavanda Pastel',
    icon: '💜',
    preview: 'linear-gradient(140deg, #f8f5ff, #ddd1f6)',
  },
  {
    id: 'rosa',
    name: 'Rosa Pastel',
    icon: '🌸',
    preview: 'linear-gradient(140deg, #fff6fa, #fbd0e0)',
  },
  {
    id: 'durazno',
    name: 'Durazno Pastel',
    icon: '🍑',
    preview: 'linear-gradient(140deg, #fff8f1, #fbd8ba)',
  },
  {
    id: 'crema',
    name: 'Crema Pastel',
    icon: '',
    preview: 'linear-gradient(140deg, #fffdf3, #f4e6ae)',
  },
  {
    id: 'perla',
    name: 'Gris Perla',
    icon: '🩶',
    preview: 'linear-gradient(140deg, #fafbfd, #dde3ea)',
  },
  {
    id: 'verde',
    name: 'Pizarra Verde',
    icon: '🟩',
    preview: 'linear-gradient(140deg, #35493d, #1a2921)',
  },
];

export function ThemeProvider({ children }) {
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('agenda.themeMode') || 'system';
  });
  const [palette, setPalette] = useState(() => {
    return parseInt(localStorage.getItem('agenda.palette') ?? '0', 10);
  });
  const [board, setBoard] = useState(() => {
    const saved = localStorage.getItem('agenda.board');
    return BOARDS.some((b) => b.id === saved) ? saved : 'menta';
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

  // Aplica el plano de fondo elegido como atributo data-board en <html> y
  // también directo en .app-board (el CSS define las variables --board-*
  // sobre .app-board, así que ponerlo solo en <html> no lo sobrescribe).
  useEffect(() => {
    document.documentElement.setAttribute('data-board', board);
    document.querySelectorAll('.app-board').forEach((el) => {
      el.setAttribute('data-board', board);
    });
  }, [board]);

  const changeBoard = (boardId) => {
    if (!BOARDS.some((b) => b.id === boardId)) return;
    setBoard(boardId);
    localStorage.setItem('agenda.board', boardId);
  };

  return (
    <ThemeContext.Provider value={{
      themeMode,
      palette,
      density,
      board,
      PALETTES,
      BOARDS,
      changeThemeMode,
      changePalette,
      changeDensity,
      changeBoard,
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