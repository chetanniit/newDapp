import React, { useState } from 'react';
import { useWalletConnect } from '../hooks/useWalletConnect.js';
import { USDT_CONTRACT_ADDRESSES, TRON_CONFIG, CURRENT_NETWORK } from '../config/constants.js';

const ApproveUsdtV2 = ({ walletAddress }) => {
  const { tronWeb, signAndSendTransaction, isConnected } = useWalletConnect();
  const [approveAmount, setApproveAmount] = useState('100');
  const [spenderAddress, setSpenderAddress] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');
  const [error, setError] = useState('');

  const handleApprove = async () => {
    if (!isConnected || !tronWeb) {
      setError('Wallet not connected');
      return;
    }

    if (!spenderAddress || !approveAmount) {
      setError('Please fill in all fields');
      return;
    }

    setIsApproving(true);
    setError('');
    setTransactionHash('');

    try {
      // Get USDT contract address for current network
      const usdtContractAddress = USDT_CONTRACT_ADDRESSES[CURRENT_NETWORK];
      
      if (!usdtContractAddress) {
        throw new Error(`USDT contract not available for ${CURRENT_NETWORK} network`);
      }

      console.log('Preparing USDT approval transaction...');
      console.log('Contract:', usdtContractAddress);
      console.log('Spender:', spenderAddress);
      console.log('Amount:', approveAmount);

      // Get the USDT contract instance
      const contract = await tronWeb.contract().at(usdtContractAddress);

      // Convert amount to contract units (USDT has 6 decimals)
      const amountInUnits = tronWeb.toBigNumber(approveAmount).multipliedBy(1000000);

      // Build the transaction without sending it
      const transaction = await tronWeb.transactionBuilder.triggerSmartContract(
        usdtContractAddress,
        'approve(address,uint256)',
        {
          feeLimit: 100000000, // 100 TRX fee limit
        },
        [
          { type: 'address', value: spenderAddress },
          { type: 'uint256', value: amountInUnits.toString() }
        ],
        walletAddress
      );

      console.log('Transaction built:', transaction);

      if (!transaction.result || !transaction.result.result) {
        throw new Error('Failed to build transaction');
      }

      // Sign and send using WalletConnect
      const result = await signAndSendTransaction(transaction.transaction);

      if (result.result === true) {
        setTransactionHash(result.txid);
        console.log('USDT approval successful!');
        console.log('Transaction ID:', result.txid);
        
        // Show success message
        setTimeout(() => {
          alert(`USDT approval successful!\nTransaction: ${result.txid}\n\nView on Tronscan: ${TRON_CONFIG[CURRENT_NETWORK].explorer}/transaction/${result.txid}`);
        }, 1000);
      } else {
        throw new Error(result.message || 'Transaction failed');
      }

    } catch (error) {
      console.error('Approval failed:', error);
      setError(error.message || 'Failed to approve USDT');
    } finally {
      setIsApproving(false);
    }
  };

  const checkAllowance = async () => {
    if (!isConnected || !tronWeb || !spenderAddress) {
      setError('Please connect wallet and enter spender address');
      return;
    }

    try {
      const usdtContractAddress = USDT_CONTRACT_ADDRESSES[CURRENT_NETWORK];
      const contract = await tronWeb.contract().at(usdtContractAddress);
      
      const allowance = await contract.allowance(walletAddress, spenderAddress).call();
      const allowanceInUsdt = tronWeb.toBigNumber(allowance).dividedBy(1000000);
      
      alert(`Current allowance: ${allowanceInUsdt.toString()} USDT`);
    } catch (error) {
      console.error('Failed to check allowance:', error);
      setError('Failed to check allowance');
    }
  };

  const getUsdtBalance = async () => {
    if (!isConnected || !tronWeb) {
      setError('Please connect wallet');
      return;
    }

    try {
      const usdtContractAddress = USDT_CONTRACT_ADDRESSES[CURRENT_NETWORK];
      const contract = await tronWeb.contract().at(usdtContractAddress);
      
      const balance = await contract.balanceOf(walletAddress).call();
      const balanceInUsdt = tronWeb.toBigNumber(balance).dividedBy(1000000);
      
      alert(`Your USDT balance: ${balanceInUsdt.toString()} USDT`);
    } catch (error) {
      console.error('Failed to check balance:', error);
      setError('Failed to check USDT balance');
    }
  };

  if (!isConnected) {
    return (
      <div className="approve-usdt-container">
        <div className="not-connected">
          <h3>⚠️ Wallet Not Connected</h3>
          <p>Please connect your wallet using WalletConnect to approve USDT transactions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="approve-usdt-container">
      <div className="approve-usdt-card">
        <div className="card-header">
          <h2>💰 USDT Approval</h2>
          <div className="network-badge">
            <span className="network-indicator">🌐</span>
            {CURRENT_NETWORK.toUpperCase()} Network
          </div>
        </div>

        <div className="wallet-info">
          <p><strong>Connected Wallet:</strong></p>
          <p className="address">{walletAddress}</p>
          <p><strong>USDT Contract:</strong></p>
          <p className="contract-address">{USDT_CONTRACT_ADDRESSES[CURRENT_NETWORK]}</p>
        </div>

        <div className="form-section">
          <div className="input-group">
            <label htmlFor="spender">Spender Address:</label>
            <input
              id="spender"
              type="text"
              value={spenderAddress}
              onChange={(e) => setSpenderAddress(e.target.value)}
              placeholder="Enter the address to approve for spending USDT"
              className="input-field"
            />
          </div>

          <div className="input-group">
            <label htmlFor="amount">Approval Amount (USDT):</label>
            <input
              id="amount"
              type="number"
              value={approveAmount}
              onChange={(e) => setApproveAmount(e.target.value)}
              placeholder="Enter amount to approve"
              className="input-field"
              min="0"
              step="0.000001"
            />
          </div>
        </div>

        {error && (
          <div className="error-message">
            <p>❌ {error}</p>
          </div>
        )}

        {transactionHash && (
          <div className="success-message">
            <p>✅ Transaction successful!</p>
            <p className="tx-hash">TX: {transactionHash}</p>
            <a 
              href={`${TRON_CONFIG[CURRENT_NETWORK].explorer}/transaction/${transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="explorer-link"
            >
              View on Tronscan →
            </a>
          </div>
        )}

        <div className="button-group">
          <button
            onClick={handleApprove}
            disabled={isApproving || !spenderAddress || !approveAmount}
            className="approve-btn primary"
          >
            {isApproving ? 'Approving...' : 'Approve USDT'}
          </button>

          <button
            onClick={checkAllowance}
            disabled={!spenderAddress}
            className="check-btn secondary"
          >
            Check Allowance
          </button>

          <button
            onClick={getUsdtBalance}
            className="balance-btn secondary"
          >
            Check USDT Balance
          </button>
        </div>

        <div className="info-section">
          <h4>ℹ️ About USDT Approval</h4>
          <ul>
            <li>Approval allows another address to spend your USDT tokens</li>
            <li>You can approve any amount up to your available balance</li>
            <li>This is commonly used for DeFi protocols and smart contracts</li>
            <li>You can revoke approval by setting amount to 0</li>
          </ul>
        </div>
      </div>

      <style jsx>{`
        .approve-usdt-container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }

        .not-connected {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 8px;
          padding: 24px;
          text-align: center;
        }

        .approve-usdt-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border: 2px solid #e1e5e9;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 2px solid #f1f3f4;
        }

        .card-header h2 {
          margin: 0;
          color: #333;
          font-size: 24px;
        }

        .network-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 14px;
        }

        .wallet-info {
          margin: 20px 0;
          padding: 16px;
          background: #f8f9fa;
          border-radius: 8px;
          border-left: 4px solid #28a745;
        }

        .address, .contract-address {
          font-family: 'Courier New', monospace;
          font-size: 14px;
          word-break: break-all;
          background: white;
          padding: 8px;
          border-radius: 4px;
          border: 1px solid #dee2e6;
          margin: 4px 0 12px 0;
        }

        .form-section {
          margin: 24px 0;
        }

        .input-group {
          margin-bottom: 20px;
        }

        .input-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #333;
        }

        .input-field {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }

        .input-field:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .error-message {
          margin: 16px 0;
          padding: 12px;
          background: #fee;
          border: 1px solid #fcc;
          border-radius: 6px;
          color: #c33;
        }

        .success-message {
          margin: 16px 0;
          padding: 16px;
          background: #d4edda;
          border: 1px solid #c3e6cb;
          border-radius: 6px;
          color: #155724;
        }

        .tx-hash {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          word-break: break-all;
          margin: 8px 0;
        }

        .explorer-link {
          color: #007bff;
          text-decoration: none;
          font-weight: 600;
        }

        .explorer-link:hover {
          text-decoration: underline;
        }

        .button-group {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          margin: 24px 0;
        }

        @media (min-width: 768px) {
          .button-group {
            grid-template-columns: 2fr 1fr 1fr;
          }
        }

        .approve-btn, .check-btn, .balance-btn {
          padding: 14px 24px;
          font-size: 16px;
          font-weight: 600;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .primary {
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
          color: white;
        }

        .primary:hover:not(:disabled) {
          background: linear-gradient(135deg, #218838 0%, #1e7e34 100%);
          transform: translateY(-1px);
        }

        .secondary {
          background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
          color: white;
        }

        .secondary:hover:not(:disabled) {
          background: linear-gradient(135deg, #5a6268 0%, #343a40 100%);
          transform: translateY(-1px);
        }

        .approve-btn:disabled, .check-btn:disabled {
          background: #9ca3af;
          cursor: not-allowed;
          transform: none;
        }

        .info-section {
          margin-top: 24px;
          padding: 20px;
          background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
          border-radius: 8px;
          border-left: 4px solid #2196f3;
        }

        .info-section h4 {
          margin-top: 0;
          color: #1976d2;
        }

        .info-section ul {
          margin: 12px 0;
          padding-left: 20px;
        }

        .info-section li {
          margin: 6px 0;
          color: #555;
        }

        @media (max-width: 768px) {
          .approve-usdt-container {
            padding: 16px;
          }

          .approve-usdt-card {
            padding: 20px;
          }

          .card-header {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }

          .address, .contract-address {
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default ApproveUsdtV2;
