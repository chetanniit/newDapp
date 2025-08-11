import React, { useState, useEffect } from 'react';
import WalletConnectV2 from './components/WalletConnectV2.jsx';
import WalletConnect_Simple from './components/WalletConnect_Simple.jsx';
import ApproveUsdtHybrid from './components/ApproveUsdtHybrid.jsx';
import EnvironmentDebug from './components/EnvironmentDebug.jsx';
import { WalletProvider, useWallet } from './contexts/WalletContext.jsx';
import { CURRENT_NETWORK } from './config/constants.js';
import './App.css';

// Import test utility in development
if (import.meta.env.DEV) {
  import('./utils/testWalletConnect.js');
}

// Main App content component
function AppContent() {
  const [connectionMethod, setConnectionMethod] = useState('walletconnect'); // 'walletconnect' or 'native'
  
  // Get wallet state from context
  const { isConnected, address } = useWallet();

  const handleWalletConnect = (address) => {
    // This is now handled by the context
    console.log('Wallet connected:', address);
  };

  const switchConnectionMethod = () => {
    setConnectionMethod(connectionMethod === 'walletconnect' ? 'native' : 'walletconnect');
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🌟 Tron USDT DApp</h1>
        <p>Powered by WalletConnect v2 • Approve USDT transactions on Tron</p>
        <div className="network-indicator">
          <span className={`network-badge ${CURRENT_NETWORK}`}>
            📡 {CURRENT_NETWORK.toUpperCase()} Network
          </span>
        </div>
      </header>

      <main className="App-main">
        <div className="container">
          {!isConnected ? (
            <div className="connection-selector">
              <div className="connection-tabs">
                <button 
                  className={`tab-button ${connectionMethod === 'walletconnect' ? 'active' : ''}`}
                  onClick={() => setConnectionMethod('walletconnect')}
                >
                  🔗 WalletConnect v2
                </button>
                <button 
                  className={`tab-button ${connectionMethod === 'native' ? 'active' : ''}`}
                  onClick={() => setConnectionMethod('native')}
                >
                  🛡️ Native Wallet
                </button>
              </div>
              
              <div className="connection-content">
                {connectionMethod === 'walletconnect' ? (
                  <div className="connection-option">
                    <div className="option-info">
                      <h3>Universal Wallet Connection</h3>
                      <p>Connect with 300+ wallets including Trust Wallet, MetaMask, Coinbase Wallet, and more.</p>
                      <div className="features">
                        <span className="feature">📱 Mobile & Desktop</span>
                        <span className="feature">🔒 Secure Protocol</span>
                        <span className="feature">🌍 Universal Support</span>
                      </div>
                    </div>
                    <WalletConnectV2 onConnect={handleWalletConnect} />
                  </div>
                ) : (
                  <div className="connection-option">
                    <div className="option-info">
                      <h3>Native Wallet Connection</h3>
                      <p>Connect directly with TronLink extension or other injected wallets for the fastest experience.</p>
                      <div className="features">
                        <span className="feature">⚡ Fast Connection</span>
                        <span className="feature">🔗 Direct Integration</span>
                        <span className="feature">💻 Desktop Optimized</span>
                      </div>
                    </div>
                    <WalletConnect_Simple onConnect={handleWalletConnect} />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <ApproveUsdtHybrid />
          )}
        </div>
      </main>

      <footer className="App-footer">
        <p>Built with WalletConnect v2 on Tron Network | Always verify transaction details before signing</p>
      </footer>

      <EnvironmentDebug />
    </div>
  );
}

// Main App component with provider
function App() {
  return (
    <WalletProvider>
      <AppContent />
    </WalletProvider>
  );
}

export default App;
