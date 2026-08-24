import { Component, ReactNode } from 'react';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';
import { Button } from '../ui';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  declare props: AppErrorBoundaryProps;
  declare setState: (state: Partial<AppErrorBoundaryState>) => void;

  state: AppErrorBoundaryState = {
    hasError: false
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('Application render error:', error);
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
  };

  private handleDashboard = () => {
    window.location.assign('/admin/dashboard');
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-slate-100 p-6">
        <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-lg">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-700">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-xl font-extrabold text-slate-900">Something went wrong</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            The page could not be displayed. You can retry the current page or return to the admin dashboard.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button type="button" variant="outline" icon={RotateCcw} onClick={this.handleRetry}>
              Retry
            </Button>
            <Button type="button" variant="primary" icon={Home} onClick={this.handleDashboard}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
