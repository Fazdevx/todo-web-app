import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

/**
 * Red de seguridad de la app: si una sección falla al dibujarse, en vez de
 * dejar la pantalla en blanco se muestra una hoja con el error y un botón
 * para recargar. Se usa dos veces en App: una alrededor del <main> (con
 * `key={activeTab}`, asi al cambiar de pestaña se reinicia el error) y otra
 * como última barrera alrededor de todos los providers.
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[GalileoAgenda] Error capturado por el ErrorBoundary:', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const isDev = Boolean(import.meta.env?.DEV);

    return (
      <div className="app-board min-h-screen flex items-center justify-center p-4">
        <div className="board-chalk-texture" aria-hidden="true"></div>
        <div className="chalk-panel w-full max-w-lg px-6 py-7 text-center relative z-10">
          <div
            className="chalk-pill w-14 h-14 flex items-center justify-center mx-auto mb-4"
            style={{ color: '#ffb3c4' }}
          >
            <AlertTriangle className="w-7 h-7" />
          </div>

          <h1 className="chalk-title" style={{ color: 'var(--on-surface)', fontSize: '2rem' }}>
            Algo se salió de la hoja
          </h1>

          <p className="chalk-text text-[16px] mt-2" style={{ color: 'var(--on-surface-variant)' }}>
            Esta sección no pudo dibujarse. Recarga la app para volver a empezar la hoja del día.
          </p>

          {isDev && (
            <p className="mt-3 text-[11px] font-mono break-words" style={{ color: '#ffb3c4' }}>
              {String(error?.message || error)}
            </p>
          )}

          <button
            onClick={this.handleReload}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold transition-all hover:scale-105"
            style={{ background: 'var(--primary)', color: 'var(--on-primary)', borderRadius: '14px' }}
          >
            <RotateCcw className="w-4 h-4" /> Recargar la app
          </button>
        </div>
      </div>
    );
  }
}
