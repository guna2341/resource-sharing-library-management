import React from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled exception:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#FAF9F6] text-slate-900 flex items-center justify-center p-6 select-none">
          <div className="max-w-lg w-full bg-white rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-900/5 border border-slate-200/80 text-center">
            {/* Warning Icon Emblem */}
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-5 border border-rose-100 shadow-sm">
              <AlertTriangle size={30} strokeWidth={2.2} />
            </div>

            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
              Something went wrong
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
              An unexpected error occurred while rendering this view. You can reload the page or return to the home screen.
            </p>

            {/* Error Details Accordion */}
            {this.state.error && (
              <details className="text-left bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 mb-6 text-xs text-slate-600 font-mono overflow-auto max-h-40">
                <summary className="cursor-pointer font-bold text-slate-700 select-none outline-none">
                  View Technical Error Details
                </summary>
                <div className="mt-2.5 pt-2.5 border-t border-slate-200 text-rose-700 whitespace-pre-wrap break-all leading-normal text-[11px]">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </div>
              </details>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={this.handleReload}
                className="btn-accent w-full sm:w-auto text-xs px-5 py-2.5 shadow-md shadow-indigo-500/20"
              >
                <RotateCcw size={14} /> Reload Page
              </button>
              <button
                onClick={this.handleReset}
                className="btn-ghost w-full sm:w-auto text-xs px-5 py-2.5 bg-white"
              >
                <Home size={14} /> Go to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
