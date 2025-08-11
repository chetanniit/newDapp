import React, { useState, useEffect } from 'react';
import { useTronWeb } from '../hooks/useTronWeb.js';

const WalletConnect_Simple = ({ onConnect }) => {
  const { connectWallet, isConnected, address, error, connectionStatus } = useTronWeb();
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (isConnected && address && onConnect) {
      onConnect(address);
    }
  }, [isConnected, address, onConnect]);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const userAddress = await connectWallet();
      if (userAddress) {
        console.log('Connected successfully:', userAddress);
      }
    } catch (error) {
      console.error('Connection error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  if (isConnected) {
    return (
      <div className="wallet-connection">
        <div className="success-message">
          <p>✅ Wallet Connected Successfully!</p>
          <p className="address">{address}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wallet-connection">
      {error && (
        <div className="error-message">
          <p>❌ {error}</p>
        </div>
      )}
      
      <button 
        onClick={handleConnect} 
        disabled={isConnecting}
        className="connect-button"
      >
        {isConnecting ? '🔄 Connecting...' : '🔗 Connect Native Wallet'}
      </button>

      <div className="connection-help">
        <p>🛡️ <strong>TronLink:</strong> Make sure extension is installed and unlocked</p>
        <p>📱 <strong>Mobile:</strong> Use DApp browser in your wallet app</p>
      </div>

      {connectionStatus && (
        <div className="connection-status">
          <p>Status: {connectionStatus}</p>
        </div>
      )}

      <style jsx>{`
        .wallet-connection {
          text-align: center;
          padding: 20px;
        }

        .connect-button {
          width: 100%;
          padding: 16px 24px;
          font-size: 18px;
          font-weight: 600;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 20px;
        }

        .connect-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }

        .connect-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .connection-help {
          margin-top: 20px;
          padding: 16px;
          background: rgba(102, 126, 234, 0.1);
          border-radius: 8px;
          border-left: 4px solid #667eea;
        }

        .connection-help p {
          margin: 8px 0;
          color: #333;
          font-size: 14px;
        }

        .error-message {
          background: #fee;
          border: 1px solid #fcc;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 16px;
          color: #c33;
        }

        .success-message {
          background: #d4edda;
          border: 1px solid #c3e6cb;
          border-radius: 8px;
          padding: 16px;
          color: #155724;
        }

        .address {
          font-family: 'Courier New', monospace;
          font-size: 14px;
          word-break: break-all;
          background: rgba(0, 0, 0, 0.05);
          padding: 8px;
          border-radius: 4px;
          margin-top: 8px;
        }

        .connection-status {
          margin-top: 12px;
          font-size: 14px;
          color: #666;
        }
      `}</style>
    </div>
  );
};

export default WalletConnect_Simple;
