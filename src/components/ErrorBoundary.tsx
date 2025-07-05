import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('Uncaught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className='min-h-screen flex items-center justify-center bg-cyber-gradient p-6'>
          <div className='max-w-md mx-auto text-center'>
            <div className='mb-8'>
              <h1
                className='text-4xl font-bold mb-4 tracking-wider'
                style={{
                  background: 'linear-gradient(135deg, #ff0080 0%, #7c3aed 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                SYSTEM ERROR
              </h1>
              <div className='text-6xl mb-4'>⚡</div>
              <p className='text-text-dim mb-6'>
                Something went wrong with the audio engine. Please refresh to restart BASSQUAKE.
              </p>
            </div>

            <div className='space-y-4'>
              <button
                onClick={() => window.location.reload()}
                className='w-full px-6 py-3 rounded-full font-medium tracking-wider transition-all duration-300 transform hover:scale-105'
                style={{
                  background: 'linear-gradient(135deg, #00ffcc 0%, #7c3aed 100%)',
                  color: '#0a0a0f',
                  boxShadow: '0 0 20px rgba(0, 255, 204, 0.4)',
                }}
              >
                RESTART BASSQUAKE
              </button>

              <details className='text-left'>
                <summary className='cursor-pointer text-text-dim text-sm hover:text-white transition-colors'>
                  Show Technical Details
                </summary>
                <div className='mt-4 p-4 bg-dark-surface rounded-lg text-xs font-mono'>
                  <div className='mb-2 text-neon-pink'>Error:</div>
                  <div className='mb-4 text-white'>{this.state.error?.message}</div>

                  {this.state.errorInfo && (
                    <>
                      <div className='mb-2 text-neon-cyan'>Stack Trace:</div>
                      <pre className='text-text-dim whitespace-pre-wrap overflow-x-auto'>
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </>
                  )}
                </div>
              </details>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
