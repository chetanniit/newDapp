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
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (isConnected && address) {
      onConnect(address);
    }
  }, [isConnected, address, onConnect]);

  // Auto-detect Trust Wallet and attempt connection
  useEffect(() => {
    const autoConnectTrustWallet = async () => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isTrustWallet = navigator.userAgent.includes('Trust') || window.trustwallet;
      
      if (isMobile && isTrustWallet && !isConnected) {
        console.log('Auto-connecting Trust Wallet...');
        setTimeout(() => {
          handleConnect();
        }, 1000); // Give Trust Wallet time to inject
      }
    };

    autoConnectTrustWallet();
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      console.log('Attempting wallet connection...');
      const userAddress = await connectWallet();
      if (userAddress) {
        console.log('Connected successfully:', userAddress);
        onConnect(userAddress);
      }
    } catch (error) {
      console.error('Connection error:', error);
      if (error.message === 'qr_connection_needed') {
        setShowQR(true);
        setConnectionMethod('qr');
      } else {
        alert(`Failed to connect: ${error.message}`);
      }
    } finally {
      setIsConnecting(false);
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
            "If not, tap 'Connect Wallet' below",
            "Make sure Trust Wallet is updated to the latest version",
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

  const renderConnectionStatus = () => {
    if (isConnected && address) {
      return (
        <div className="connected-wallet">
          <h3>✅ Wallet Connected</h3>
          <p><strong>Wallet Type:</strong> {getWalletName()}</p>
          <p><strong>Address:</strong> {`${address.slice(0, 6)}...${address.slice(-4)}`}</p>
          <div className="status-indicator connected">
            🟢 Connected to {getWalletName()}
          </div>
        </div>
      );
    }

    const instructions = getConnectionInstructions();
    
    return (
      <div className="wallet-connection">
        <h3>🔗 Connect Your Wallet</h3>
        
        <div className="connection-instructions">
          <h4>{instructions.title}</h4>
          <ul>
            {instructions.instructions.map((instruction, index) => (
              <li key={index}>{instruction}</li>
            ))}
          </ul>
        </div>

        <div className="connection-actions">
          <button 
            onClick={handleConnect} 
            disabled={isConnecting}
            className="connect-button"
          >
            {isConnecting ? '🔄 Connecting...' : '🔗 Connect Wallet'}
          </button>

          {connectionStatus && (
            <div className="connection-status">
              <p>{connectionStatus}</p>
            </div>
          )}
        </div>

        {/* Enhanced QR Code Section for Trust Wallet */}
        <div className="qr-section">
          <h4>📱 Trust Wallet QR Connection</h4>
          <p>Scan with Trust Wallet for instant connection:</p>
          
          {qrCodeData && (
            <div className="qr-container">
              <QRCodeComponent 
                data={qrCodeData} 
                size={220}
              />
              
              <div className="qr-instructions">
                <h5>📋 Trust Wallet QR Instructions:</h5>
                <div className="trust-wallet-steps">
                  <div className="step">
                    <strong>Step 1:</strong> Open Trust Wallet app
                  </div>
                  <div className="step">
                    <strong>Step 2:</strong> Tap "Browser" tab at the bottom
                  </div>
                  <div className="step">
                    <strong>Step 3:</strong> Tap the scan icon (📷) in the top right
                  </div>
                  <div className="step">
                    <strong>Step 4:</strong> Scan the QR code above
                  </div>
                  <div className="step">
                    <strong>Step 5:</strong> DApp will open in Trust Wallet browser
                  </div>
                </div>
                
                <div className="qr-tips">
                  <h6>💡 QR Scanning Tips:</h6>
                  <ul>
                    <li>Hold phone steady and ensure good lighting</li>
                    <li>Make sure QR code fills the scan area</li>
                    <li>If scanning fails, try the manual URL method below</li>
                  </ul>
                </div>
              </div>
              
              <div className="manual-options">
                <h4>🔧 Alternative Connection Methods</h4>
                <p>If QR scanning doesn't work, try these options:</p>
                
                <div className="deep-links">
                  <button 
                    onClick={() => {
                      const trustWalletUrl = `https://link.trustwallet.com/open_url?coin_id=195&url=${encodeURIComponent(window.location.href)}`;
                      window.open(trustWalletUrl, '_blank');
                    }}
                    className="deep-link-button trust-wallet"
                  >
                    🛡️ Open in Trust Wallet
                  </button>
                  
                  <button 
                    onClick={() => {
                      const tronLinkUrl = `tronlinkoutside://pull.activity?param=${encodeURIComponent(JSON.stringify({url: window.location.href}))}`;
                      window.open(tronLinkUrl, '_blank');
                    }}
                    className="deep-link-button tronlink"
                  >
                    🔗 Open in TronLink
                  </button>
                </div>
                
                <div className="url-display">
                  <label>📋 Copy URL manually:</label>
                  <input 
                    type="text" 
                    value={window.location.href} 
                    readOnly 
                    className="url-input"
                  />
                  <button 
                    onClick={() => copyToClipboard(window.location.href)}
                    className="copy-button"
                  >
                    📋 Copy URL
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Troubleshooting Section */}
        <div className="troubleshooting">
          <h4>🔧 Troubleshooting</h4>
          <details>
            <summary>QR code not working?</summary>
            <ul>
              <li><strong>Trust Wallet:</strong> Make sure you're using the scanner in the Browser tab</li>
              <li><strong>Lighting:</strong> Ensure good lighting and steady hand</li>
              <li><strong>Size:</strong> QR code should fill most of the scan area</li>
              <li><strong>Alternative:</strong> Use the "Open in Trust Wallet" button above</li>
              <li><strong>Manual:</strong> Copy the URL and paste it in Trust Wallet browser</li>
            </ul>
          </details>
        </div>
      </div>
    );
  };

  return (
    <div className="wallet-connect-container">
      {renderConnectionStatus()}
    </div>
  );
};

export default WalletConnect;
