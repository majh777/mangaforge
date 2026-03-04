'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('MangaForge caught error:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">MangaForge</h1>
            <p className="text-gray-400 mb-6">Something went wrong. Please refresh the page.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-[#FF6B9D] text-white rounded-xl"
            >
              Refresh
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
