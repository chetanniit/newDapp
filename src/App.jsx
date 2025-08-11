import React, { useState } from 'react';
import WalletConnect from './components/WalletConnect.jsx';
import ApproveUsdt from './components/ApproveUsdt.jsx';
import { CURRENT_NETWORK } from './config/constants.js';
import './App.css';

function App() {
  const [connectedAddress, setConnectedAddress] = useState('');

  const handleWalletConnect = (address) => {
    setConnectedAddress(address);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🌟 Tron USDT DApp</h1>
        <p>Approve USDT transactions on the Tron blockchain</p>
        <div className="network-indicator">
          <span className={`network-badge ${CURRENT_NETWORK}`}>
            📡 {CURRENT_NETWORK.toUpperCase()} Network
          </span>
        </div>
      </header>

      <main className="App-main">
        <div className="container">
          <WalletConnect onConnect={handleWalletConnect} />
          
          {connectedAddress && (
            <ApproveUsdt userAddress={connectedAddress} />
          )}
        </div>
      </main>

      <footer className="App-footer">
        <p>Built on Tron Network | Always verify transaction details before signing</p>
      </footer>
    </div>
  );
}

export default App;
