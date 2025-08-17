'use client';
import React from 'react';

export default class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props:any){ super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError(){ return { hasError: true }; }
  componentDidCatch(error: any, info: any) {
    fetch('/api/client-error', {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({
        type: 'boundary',
        message: String(error?.message || error),
        stack: String(error?.stack || ''),
        componentStack: String(info?.componentStack || ''),
        path: typeof window !== 'undefined' ? window.location.href : '',
      }),
    }).catch(()=>{});
  }
  render(){ return this.state.hasError ? null : this.props.children as any; }
}
