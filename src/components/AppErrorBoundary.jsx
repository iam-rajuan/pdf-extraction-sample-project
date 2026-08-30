import { Component } from 'react';

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError() {
    return {
      hasError: true,
    };
  }

  componentDidCatch(error) {
    // Keep logging simple while preserving a safe fallback UI.
    // eslint-disable-next-line no-console
    console.error('Output rendering failed:', error);
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="empty-state">
          <h3>Result rendering failed</h3>
          <p>
            The extraction response could not be rendered safely. Reset the view and
            try again.
          </p>
          <button type="button" className="ghost-button" onClick={this.handleReset}>
            Retry rendering
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
