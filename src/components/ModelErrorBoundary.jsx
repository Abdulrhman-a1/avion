import { Component } from 'react';
import OrbFallback from './OrbFallback';

export default class ModelErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.warn('[CarModel] Failed to load 3D model:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <OrbFallback />;
    }
    return this.props.children;
  }
}
