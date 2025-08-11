import React, { useEffect, useState } from 'react';
import { WALLETCONNECT_CONFIG } from '../config/walletconnect.js';

const EnvironmentDebug = () => {
  const [envInfo, setEnvInfo] = useState(null);

  useEffect(() => {
    // Only show in development
    if (import.meta.env.DEV) {
      setEnvInfo({
        projectId: WALLETCONNECT_CONFIG.projectId,
        appName: WALLETCONNECT_CONFIG.metadata.name,
        appDescription: WALLETCONNECT_CONFIG.metadata.description,
        appUrl: WALLETCONNECT_CONFIG.metadata.url,
        isDev: import.meta.env.DEV,
        mode: import.meta.env.MODE
      });
    }
  }, []);

  // Only render in development mode
  if (!import.meta.env.DEV || !envInfo) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '8px',
      fontSize: '12px',
      maxWidth: '300px',
      zIndex: 9999,
      fontFamily: 'monospace'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>🔧 Dev Info</div>
      <div>Project ID: {envInfo.projectId?.substring(0, 8)}...</div>
      <div>App: {envInfo.appName}</div>
      <div>Mode: {envInfo.mode}</div>
      <div style={{ marginTop: '5px', fontSize: '10px', opacity: 0.7 }}>
        Environment variables loaded successfully ✅
      </div>
    </div>
  );
};

export default EnvironmentDebug;
