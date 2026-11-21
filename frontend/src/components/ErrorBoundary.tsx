'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Error no controlado atrapado:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-[#121417] text-slate-800 dark:text-slate-100 text-center">
          <div className="p-3 bg-red-100 dark:bg-red-950/60 border border-red-200 dark:border-red-800 rounded-2xl mb-3 text-red-600 dark:text-red-400">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-bold mb-1">Inconveniente al renderizar la vista interactiva</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mb-4">
            {this.state.error?.message || 'Error en componente visual'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold shadow-sm transition"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reintentar Vista
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
