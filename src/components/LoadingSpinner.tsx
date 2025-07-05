import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className='loading-screen'>
      <div className='text-center'>
        <h1
          className='text-6xl font-bold mb-4 tracking-wider neon-text'
          style={{
            background: 'linear-gradient(135deg, #00ffcc 0%, #7c3aed 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          BASSQUAKE
        </h1>
        <div className='flex justify-center items-center space-x-2 mb-6'>
          <div className='w-3 h-3 bg-neon-cyan rounded-full animate-bounce'></div>
          <div
            className='w-3 h-3 bg-neon-pink rounded-full animate-bounce'
            style={{ animationDelay: '0.1s' }}
          ></div>
          <div
            className='w-3 h-3 bg-neon-purple rounded-full animate-bounce'
            style={{ animationDelay: '0.2s' }}
          ></div>
        </div>
        <p className='text-text-dim text-sm tracking-widest'>INITIALIZING AUDIO ENGINE...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
