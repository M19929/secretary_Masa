import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2, Home, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends (React.Component as any) {
  public state: State;
  public props: Props;

  constructor(props: Props) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetCache = () => {
    try {
      // Clear potentially corrupted cached state
      localStorage.clear();
      sessionStorage.clear();
      // Keep basic lock state clean
      window.location.reload();
    } catch (e) {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          dir="rtl"
          className="min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-['Cairo',sans-serif]"
        >
          <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-black text-white">
                مركز د. محمد فوزي الماسة لطب وزراعة الأسنان
              </h2>
              <p className="text-sm font-bold text-amber-400">
                تعذر تحميل الصفحة أو حدث خطأ غير متوقع مؤقتاً
              </p>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              لمنع ظهور شاشة بيضاء، قام نظام الأمان بحماية الصفحة. يمكنك إعادة التحميل أو إعادة ضبط الذاكرة المؤقتة لإصلاح أي تعارض في البيانات.
            </p>

            {this.state.error && (
              <div className="w-full bg-slate-950 border border-slate-800/80 rounded-xl p-3 text-right text-xs font-mono text-rose-400 overflow-x-auto max-h-32">
                <span className="block font-bold text-slate-400 mb-1">تفاصيل الخطأ التقني:</span>
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="w-full flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>إعادة تحميل الصفحة الآن</span>
              </button>

              <button
                type="button"
                onClick={this.handleResetCache}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition cursor-pointer"
                title="مسح الذاكرة المؤقتة التالفة وإعادة التحميل"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>إصلاح وتصفير التخزين المؤقت</span>
              </button>
            </div>

            <div className="pt-2 text-[11px] text-slate-500">
              إذا كنت تفتح المشروع من GitHub Pages، تأكد من اختيار <span className="text-amber-400 font-bold">GitHub Actions</span> من إعدادات Pages.
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
