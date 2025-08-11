import React, { useState, useEffect } from 'react';
import { useTronWeb } from '../hooks/useTronWeb.js';
import QRCodeComponent from './QRCodeComponent.jsx';

const WalletConnect = ({ onConnect }) => {
  const { 
    address, 
    isConnected, 
    connectWallet, 
    walletType, 
    getWalletName, 
    qrCodeData, 
    needsQRConnection, 
    connectionStatus 
  } = useTronWeb();
  
  const [showQR, setShowQR] = useState(false);
  const [connectionMethod, setConnectionMethod] = useState('auto');

  useEffect(() => {
    if (isConnected && address) {
      onConnect(address);
    }
  }, [isConnected, address, onConnect]);

  const handleConnect = async () => {
    try {
      const userAddress = await connectWallet();
      if (userAddress) {
        onConnect(userAddress);
      }
    } catch (error) {
      if (error.message === 'qr_connection_needed') {
        setShowQR(true);
        setConnectionMethod('qr');
      } else {
        console.error('Connection error:', error);
        alert(`Failed to connect: ${error.message}`);
      }
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('App URL copied to clipboard! Open it in your mobile wallet.');
    });
  };

  const getConnectionInstructions = () => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isTrustWallet = navigator.userAgent.includes('Trust') || window.trustwallet;
    
    if (isMobile) {
      if (isTrustWallet) {
        return {
          title: "🛡️ Trust Wallet Detected",
          instructions: [
            "Your wallet should connect automatically",
            "If not, make sure Trust Wallet is updated to the latest version",
            "Try refreshing the page or restarting the Trust Wallet app",
            "Ensure you're on the Tron network in Trust Wallet settings"
          ]
        };
      } else {
        return {
          title: "📱 Mobile Wallet Connection",
          instructions: [
            "Open Trust Wallet app",
            "Go to DApp Browser (or Browser tab)",
            "Enter this URL or scan the QR code below",
            "Connect your wallet when prompted"
          ]
        };
      }
    } else {
      return {
        title: "💻 Desktop Connection",
        instructions: [
          "Install TronLink browser extension",
          "Create or import your wallet",
          "Click connect below",
          "For mobile: scan QR code with Trust Wallet"
        ]
      };
    }
  };
    
    if (isMobile) {
      return (
        <div className="mobile-instructions">
          <h4>📱 Mobile Device Detected</h4>
          <p>You can connect directly using your mobile wallet:</p>
          <ul>
            <li><strong>Trust Wallet:</strong> Use the DApp browser</li>
            <li><strong>TronLink Mobile:</strong> Open this page in TronLink browser</li>
          </ul>
        </div>
      );
    }
    
    return (
      <div className="desktop-instructions">
        <h4>💻 Desktop Connection Options</h4>
        <div className="connection-options">
          <div className="option">
            <h5>🔌 Browser Extension</h5>
            <p>Install TronLink browser extension for seamless connection</p>
            <button 
              onClick={() => window.open('https://www.tronlink.org/', '_blank')}
              className="secondary-button"
            >
              Get TronLink Extension
            </button>
          </div>
          
          <div className="option">
            <h5>📱 Mobile Wallet QR</h5>
            <p>Connect using your mobile wallet by scanning QR code</p>
            <button 
              onClick={() => setShowQR(true)}
              className="secondary-button"
            >
              Show QR Code
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (isConnected) {
    return (
      <div className="wallet-connected">
        <h3>✅ Wallet Connected</h3>
        <div className="connection-details">
          <p><strong>Wallet:</strong> {getWalletName()}</p>
          <p><strong>Address:</strong> {address}</p>
          <p className="address-short">
            {address.slice(0, 6)}...{address.slice(-4)}
          </p>
          <div className="connection-status">
            <span className="status-indicator connected"></span>
            <span>Connected & Ready</span>
          </div>
        </div>
        
        {walletType === 'trustwallet' && (
          <div className="trust-wallet-notice">
            <p>⚠️ Trust Wallet: Automatic connection established</p>
          </div>
        )}
      </div>
    );
  }

  if (showQR || needsQRConnection) {
    const currentUrl = window.location.href;
    
    return (
      <div className="wallet-connect qr-mode">
        <h3>📱 Connect Mobile Wallet</h3>
        
        <div className="qr-section">
          <div className="qr-container">
            <QRCodeComponent data={currentUrl} size={200} />
          </div>
          
          <div className="qr-instructions">
            <h4>How to connect:</h4>
            <ol>
              <li>Open your mobile wallet (Trust Wallet, TronLink)</li>
              <li>Go to DApp browser or scan QR feature</li>
              <li>Scan this QR code or enter URL manually</li>
              <li>Connect your wallet when prompted</li>
            </ol>
          </div>
        </div>
        
        <div className="manual-options">
          <h4>Alternative Options:</h4>
          <div className="url-copy">
            <p><strong>App URL:</strong></p>
            <div className="url-display">
              <span className="url-text">{currentUrl}</span>
              <button 
                onClick={() => copyToClipboard(currentUrl)}
                className="copy-button"
              >
                � Copy
              </button>
            </div>
          </div>
          
          <div className="deep-links">
            <h5>Direct Wallet Links:</h5>
            <button 
              onClick={() => window.open(`tronlink://open?url=${encodeURIComponent(currentUrl)}`, '_blank')}
              className="deep-link-button"
            >
              🔗 Open in TronLink
            </button>
            <button 
              onClick={() => window.open(`trust://open_url?coin_id=195&url=${encodeURIComponent(currentUrl)}`, '_blank')}
              className="deep-link-button"
            >
              🔗 Open in Trust Wallet
            </button>
          </div>
        </div>
        
        <button 
          onClick={() => setShowQR(false)}
          className="back-button"
        >
          ← Back to Connection Options
        </button>
      </div>
    );
  }

  return (
    <div className="wallet-connect">
      <h3>Connect Your Tron Wallet</h3>
      
      <div className="connection-status-display">
        <div className="status-indicator">
          <span className={`status-dot ${connectionStatus}`}></span>
          <span>
            {connectionStatus === 'connecting' && 'Connecting...'}
            {connectionStatus === 'disconnected' && 'Ready to Connect'}
            {connectionStatus === 'qr_ready' && 'QR Code Ready'}
          </span>
        </div>
      </div>
      
      {walletType && (
        <div className="detected-wallet">
          <p>📱 <strong>{getWalletName()}</strong> detected</p>
          <button onClick={handleConnect} className="connect-button primary">
            Connect {getWalletName()}
          </button>
        </div>
      )}
      
      {!walletType && (
        <div className="no-wallet-detected">
          <p>No wallet detected on this device</p>
          <button onClick={handleConnect} className="connect-button primary">
            🔍 Detect Wallet
          </button>
        </div>
      )}
      
      {getConnectionInstructions()}
      
      <div className="security-notice">
        <h4>🔒 Security Note</h4>
        <p>This DApp will never ask for your private keys or seed phrases. 
           Only connect through official wallet applications.</p>
      </div>
    </div>
  );
};

export default WalletConnect;
