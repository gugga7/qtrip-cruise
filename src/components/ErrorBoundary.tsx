import React from 'react';
import i18n from 'i18next';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { tc } from '../config/themeClasses';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const t = (key: string) => i18n.t(key);
      return (
        <div className={`flex min-h-screen items-center justify-center bg-gradient-to-br ${tc.loginBg} px-4`}>
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg">
            <div className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full ${tc.bgPrimaryMuted}`}>
              <AlertTriangle className={tc.textPrimary} size={28} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">{t('common.error')}</h2>
            <p className="mt-2 text-sm text-slate-500">
              {t('error.unexpectedMessage')}
            </p>
            {this.state.error && (
              <pre className="mt-4 max-h-32 overflow-auto rounded-xl bg-slate-50 p-3 text-left text-xs text-slate-600">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={() => window.location.reload()}
              className={`mt-6 inline-flex items-center gap-2 rounded-2xl ${tc.btnGradient} px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:shadow-lg`}
            >
              <RefreshCw size={16} />
              {t('error.reloadPage')}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
