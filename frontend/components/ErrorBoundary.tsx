import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  sectionName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`ErrorBoundary caught error in ${this.props.sectionName ?? 'section'}:`, error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="rounded-xl border border-red-800/40 bg-red-900/10 px-6 py-8 text-center">
          <p className="text-sm text-red-400 font-medium">
            {this.props.sectionName
              ? `Failed to load ${this.props.sectionName}`
              : 'This section failed to load'}
          </p>
          <p className="text-xs text-gray-500 mt-1">Please refresh the page to try again.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
