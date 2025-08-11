import React from 'react';
import { useWalletConnect } from '../hooks/useWalletConnect.js';

const WalletConnectV2 = ({ onConnect }) => {
  const {
    isConnected,
    isConnecting,
    accounts,
    error,
    connect,
    disconnect
  } = useWalletConnect();

  // Handle successful connection
  React.useEffect(() => {
    if (isConnected && accounts.length > 0 && onConnect) {
      onConnect(accounts[0]);
    }
  }, [isConnected, accounts, onConnect]);

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error('Disconnection failed:', error);
    }
  };

  if (isConnected) {
    return (
      <div className="wallet-connect-container">
        <div className="connection-status connected">
          <div className="status-header">
            <span className="status-indicator">🟢</span>
            <h3>Wallet Connected</h3>
          </div>
          
          <div className="wallet-info">
            <p><strong>Address:</strong></p>
            <p className="address">{accounts[0]}</p>
            <p><strong>Connection:</strong> WalletConnect v2</p>
          </div>
          
          <button 
            onClick={handleDisconnect}
            className="disconnect-btn"
          >
            Disconnect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wallet-connect-container">
      <div className="connection-status disconnected">
        {error && (
          <div className="error-message">
            <p>❌ Connection Error: {error}</p>
          </div>
        )}
        
        <button 
          onClick={handleConnect}
          disabled={isConnecting}
          className="connect-btn"
        >
          {isConnecting ? 'Connecting...' : 'Connect with WalletConnect'}
        </button>
        
        <div className="connection-help">
          <p>📱 <strong>Mobile:</strong> Scan QR code with your wallet app</p>
          <p>💻 <strong>Desktop:</strong> Choose from available wallets</p>
        </div>
      </div>
      
      <style jsx>{`
        .wallet-connect-container {
          text-align: center;
          padding: 20px;
        }

        .connection-status {
          width: 100%;
        }

        .connect-btn {
          width: 100%;
          padding: 16px 24px;
          font-size: 18px;
          font-weight: 600;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 20px;
        }

        .connect-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(78, 205, 196, 0.3);
        }

        .connect-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .connection-help {
          margin-top: 20px;
          padding: 16px;
          background: rgba(78, 205, 196, 0.1);
          border-radius: 8px;
          border-left: 4px solid #4ecdc4;
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

        .connected {
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
          margin: 8px 0;
        }

        .disconnect-btn {
          width: 100%;
          padding: 12px 20px;
          font-size: 16px;
          font-weight: 600;
          border: none;
          border-radius: 8px;
          background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 12px;
        }

        .disconnect-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
        }
      `}</style>
    </div>
  );
};

export default WalletConnectV2;
