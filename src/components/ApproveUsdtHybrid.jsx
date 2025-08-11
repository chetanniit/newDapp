import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext.jsx';
import { USDT_CONTRACT_ADDRESSES, TRON_CONFIG, CURRENT_NETWORK, getValidatedUsdtAddress } from '../config/constants.js';

// USDT TRC20 ABI - Essential functions only
const USDT_ABI = [
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {"name": "_spender", "type": "address"},
      {"name": "_value", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {"name": "_owner", "type": "address"},
      {"name": "_spender", "type": "address"}
    ],
    "name": "allowance",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

const ApproveUsdtHybrid = () => {
  // Get wallet data from context (prevents multiple hook initializations)
  const {
    isConnected,
    address: walletAddress,
    tronWebInstance: tronWeb,
    signAndSendTransaction,
    isWalletConnectActive,
    isTronWebActive,
    walletConnect: walletConnectData,
    tronWeb: tronWebData
  } = useWallet();

  const [approveAmount, setApproveAmount] = useState('100');
  const [spenderAddress, setSpenderAddress] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState(''); // Add message state for user feedback

  const handleApprove = async () => {
    console.log('=== Starting USDT Approval ===');
    console.log('Wallet Address from context:', walletAddress);
    console.log('Is Connected:', isConnected);
    console.log('TronWeb instance:', tronWeb);
    console.log('TronWeb default address:', tronWeb?.defaultAddress);
    console.log('WalletConnect active:', isWalletConnectActive);
    console.log('TronWeb active:', isTronWebActive);
    console.log('Has signAndSendTransaction:', !!signAndSendTransaction);
    
    if (!isConnected || !tronWeb) {
      setError('Wallet not connected');
      return;
    }

    if (!walletAddress) {
      console.error('No wallet address found in context. Debug info:', {
        walletConnectActive: isWalletConnectActive,
        tronWebActive: isTronWebActive,
        walletConnectAddress: walletConnectData?.address,
        tronWebAddress: tronWebData?.address
      });
      setError('No wallet address found. Please ensure your wallet is properly connected.');
      return;
    }

    if (!spenderAddress || !approveAmount) {
      setError('Please fill in all fields');
      return;
    }

    setIsApproving(true);
    setError('');
    setMessage(''); // Clear any previous messages
    setTransactionHash('');

    try {
      // Get USDT contract address for current network
      const usdtContractAddress = getValidatedUsdtAddress(CURRENT_NETWORK, tronWeb);
      
      console.log('Network:', CURRENT_NETWORK);
      console.log('Using USDT contract address:', usdtContractAddress);
      console.log('Wallet address:', walletAddress);
      console.log('Spender address:', spenderAddress);
      console.log('Approve amount:', approveAmount);

      console.log('Preparing USDT approval transaction...');

      // Convert amount to contract units (USDT has 6 decimals)
      const amountInUnits = tronWeb.toBigNumber(approveAmount).multipliedBy(1000000);

      let result;

      // Prefer native TronWeb approach for better compatibility
      if (!signAndSendTransaction || !isWalletConnectActive) {
        // Use native TronWeb approach (TronLink, etc.)
        console.log('Using native TronWeb signing...');
        console.log('Wallet address for transaction:', walletAddress);
        console.log('TronWeb default address before:', tronWeb.defaultAddress);
        
        // Force TronWeb to use the correct address
        if (walletAddress) {
          // Validate the address format first
          if (!tronWeb.isAddress(walletAddress)) {
            throw new Error(`Invalid wallet address format: ${walletAddress}`);
          }
          
          tronWeb.setAddress(walletAddress);
          console.log('Set TronWeb default address to:', walletAddress);
          console.log('TronWeb default address after:', tronWeb.defaultAddress);
          
          // Wait a moment for the address to be set
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Double-check the address is set correctly
        const currentAddress = tronWeb.defaultAddress?.base58;
        if (!currentAddress || currentAddress !== walletAddress) {
          console.error('Address validation failed:', {
            expected: walletAddress,
            actual: currentAddress,
            tronWebDefaultAddress: tronWeb.defaultAddress
          });
          
          // Try one more time to set the address
          tronWeb.setAddress(walletAddress);
          await new Promise(resolve => setTimeout(resolve, 200));
          
          const retryAddress = tronWeb.defaultAddress?.base58;
          if (!retryAddress || retryAddress !== walletAddress) {
            throw new Error(`Address mismatch: Expected ${walletAddress}, but TronWeb has ${retryAddress}. Please try reconnecting your wallet.`);
          }
        }
        
        const contract = await tronWeb.contract(USDT_ABI, usdtContractAddress);
        
        // Use the contract's methods directly without specifying 'from'
        result = await contract.approve(spenderAddress, amountInUnits.toString()).send({
          feeLimit: 100000000 // 100 TRX fee limit
        });
      } else {
        // Try WalletConnect approach with fallback
        console.log('Attempting WalletConnect signing...');
        
        try {
          // Build the transaction without sending it
          console.log('Building transaction with params:', {
            contractAddress: usdtContractAddress,
            spenderAddress,
            amount: amountInUnits.toString(),
            walletAddress
          });
          
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

          if (!transaction?.result?.result) {
            const error = transaction?.result?.message || 'Unknown transaction build error';
            throw new Error(`Failed to build transaction: ${error}`);
          }

          console.log('Sending transaction for signing...');
          result = await signAndSendTransaction(transaction.transaction);
        } catch (wcError) {
          const errorMessage = wcError?.message || wcError?.toString() || 'Unknown WalletConnect error';
          console.warn('WalletConnect signing failed:', errorMessage);
          console.error('Full error object:', wcError);
          
          // Show user-friendly message for WalletConnect failures
          if (wcError?.isWalletConnectFailure) {
            setMessage('WalletConnect signing failed. Automatically switching to native wallet method...');
          } else {
            setMessage(`WalletConnect error: ${errorMessage}. Switching to native wallet method...`);
          }
          
          // Add delay to show message
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Fallback to native TronWeb if WalletConnect fails
          console.log('Falling back to native TronWeb...');
          console.log('Wallet address for fallback:', walletAddress);
          console.log('TronWeb default address before fallback:', tronWeb.defaultAddress);
          
          // Force TronWeb to use the correct address
          if (walletAddress) {
            // Validate the address format first
            if (!tronWeb.isAddress(walletAddress)) {
              throw new Error(`Invalid wallet address format: ${walletAddress}`);
            }
            
            tronWeb.setAddress(walletAddress);
            console.log('Set TronWeb default address to:', walletAddress);
            console.log('TronWeb default address after fallback:', tronWeb.defaultAddress);
            
            // Wait a moment for the address to be set
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          
          // Double-check the address is set correctly
          const currentAddress = tronWeb.defaultAddress?.base58;
          if (!currentAddress || currentAddress !== walletAddress) {
            console.error('Address validation failed in fallback:', {
              expected: walletAddress,
              actual: currentAddress,
              tronWebDefaultAddress: tronWeb.defaultAddress
            });
            
            // Try one more time to set the address
            tronWeb.setAddress(walletAddress);
            await new Promise(resolve => setTimeout(resolve, 200));
            
            const retryAddress = tronWeb.defaultAddress?.base58;
            if (!retryAddress || retryAddress !== walletAddress) {
              throw new Error(`Address mismatch in fallback: Expected ${walletAddress}, but TronWeb has ${retryAddress}. Please try reconnecting your wallet.`);
            }
          }
          
          const contract = await tronWeb.contract(USDT_ABI, usdtContractAddress);
          
          // Use the contract's methods directly without specifying 'from'
          result = await contract.approve(spenderAddress, amountInUnits.toString()).send({
            feeLimit: 100000000 // 100 TRX fee limit
          });
        }
      }

      if (result && (result.result === true || result.txid)) {
        const txid = result.txid || result.transaction?.txID;
        setTransactionHash(txid);
        console.log('USDT approval successful!');
        console.log('Transaction ID:', txid);
        
        // Show success message
        setTimeout(() => {
          alert(`USDT approval successful!\nTransaction: ${txid}\n\nView on Tronscan: ${TRON_CONFIG[CURRENT_NETWORK].explorer}/transaction/${txid}`);
        }, 1000);
      } else {
        throw new Error(result?.message || 'Transaction failed');
      }

    } catch (error) {
      console.error('Approval failed:', error);
      setError(error.message || 'Failed to approve USDT');
    } finally {
      setIsApproving(false);
      // Keep message and error states to show user feedback
    }
  };

  const checkAllowance = async () => {
    if (!isConnected || !tronWeb || !spenderAddress) {
      setError('Please connect wallet and enter spender address');
      return;
    }

    try {
      const usdtContractAddress = getValidatedUsdtAddress(CURRENT_NETWORK, tronWeb);
      console.log('Network:', CURRENT_NETWORK);
      console.log('Using USDT contract address:', usdtContractAddress);
      console.log('Wallet address:', walletAddress);
      console.log('Spender address:', spenderAddress);
      
      // Ensure TronWeb has the default address set
      if (!tronWeb.defaultAddress || !tronWeb.defaultAddress.base58) {
        if (walletAddress) {
          tronWeb.setAddress(walletAddress);
          console.log('Set TronWeb default address to:', walletAddress);
        } else {
          throw new Error('No wallet address available for TronWeb');
        }
      }
      
      const contract = await tronWeb.contract(USDT_ABI, usdtContractAddress);
      
      const allowance = await contract.allowance(walletAddress, spenderAddress).call({
        from: walletAddress
      });
      
      const allowanceInUsdt = tronWeb.toBigNumber(allowance).dividedBy(1000000);
      
      alert(`Current allowance: ${allowanceInUsdt.toString()} USDT`);
    } catch (error) {
      console.error('Failed to check allowance:', error);
      setError(`Failed to check allowance: ${error.message}`);
    }
  };

  const getUsdtBalance = async () => {
    if (!isConnected || !tronWeb) {
      setError('Please connect wallet');
      return;
    }

    try {
      const usdtContractAddress = getValidatedUsdtAddress(CURRENT_NETWORK, tronWeb);
      console.log('Network:', CURRENT_NETWORK);
      console.log('Using USDT contract address:', usdtContractAddress);
      console.log('Wallet address:', walletAddress);
      
      // Additional validation before creating contract
      if (!usdtContractAddress) {
        throw new Error('No USDT contract address available');
      }
      
      // Validate address format one more time
      
      
      console.log('Creating contract instance...');
      
      // Ensure TronWeb has the default address set
      if (!tronWeb.defaultAddress || !tronWeb.defaultAddress.base58) {
        if (walletAddress) {
          tronWeb.setAddress(walletAddress);
          console.log('Set TronWeb default address to:', walletAddress);
        } else {
          throw new Error('No wallet address available for TronWeb');
        }
      }
      
      const contract = await tronWeb.contract(USDT_ABI, usdtContractAddress);
      
      if (!contract) {
        throw new Error('Failed to create contract instance');
      }
      
      console.log('Contract instance created successfully');
      console.log('Calling balanceOf...');
      
      // Call balanceOf with explicit parameters
      const balance = await contract.balanceOf(walletAddress).call({
        from: walletAddress
      });
      
      const balanceInUsdt = tronWeb.toBigNumber(balance).dividedBy(1000000);
      
      alert(`Your USDT balance: ${balanceInUsdt.toString()} USDT`);
    } catch (error) {
      console.error('Failed to check balance:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      setError(`Failed to check USDT balance: ${error.message}`);
    }
  };

  if (!isConnected) {
    return (
      <div className="approve-usdt-container">
        <div className="not-connected">
          <h3>⚠️ Wallet Not Connected</h3>
          <p>Please connect your wallet to approve USDT transactions.</p>
          <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
            <details>
              <summary>Debug Info</summary>
              <p>WalletConnect Active: {isWalletConnectActive ? 'Yes' : 'No'}</p>
              <p>TronWeb Active: {isTronWebActive ? 'Yes' : 'No'}</p>
              <p>Address: {walletAddress || 'Not found'}</p>
            </details>
          </div>
        </div>
      </div>
    );
  }

  // Show a warning if connected but no address
  if (isConnected && !walletAddress) {
    return (
      <div className="approve-usdt-container">
        <div className="not-connected" style={{ backgroundColor: '#fff3cd', borderColor: '#ffeaa7' }}>
          <h3>⚠️ Address Not Available</h3>
          <p>Wallet is connected but address is not available. Please try reconnecting.</p>
          <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
            <p><strong>Debug Info:</strong></p>
            <p>WalletConnect Active: {isWalletConnectActive ? 'Yes' : 'No'}</p>
            <p>TronWeb Active: {isTronWebActive ? 'Yes' : 'No'}</p>
            <p>WalletConnect Address: {walletConnectData?.address || 'None'}</p>
            <p>TronWeb Address: {tronWebData?.address || 'None'}</p>
          </div>
        </div>
      </div>
    );
  }

  const connectionType = isWalletConnectActive ? 'WalletConnect v2' : 'Native Wallet';

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
          <p><strong>Connection Type:</strong> {connectionType}</p>
          <p><strong>USDT Contract:</strong></p>
          <p className="contract-address">{USDT_CONTRACT_ADDRESSES[CURRENT_NETWORK]}</p>
        </div>

        {/* Wallet Recommendation Section */}
        <div style={{ 
          background: isWalletConnectActive ? '#fff3cd' : '#d4edda', 
          padding: '12px', 
          margin: '10px 0', 
          borderRadius: '8px', 
          border: `1px solid ${isWalletConnectActive ? '#ffeaa7' : '#c3e6cb'}`
        }}>
          {isWalletConnectActive ? (
            <div>
              <div style={{ color: '#856404', fontWeight: 'bold', marginBottom: '5px' }}>
                ⚠️ WalletConnect Connection
              </div>
              <div style={{ color: '#856404', fontSize: '14px' }}>
                <strong>Current:</strong> Using WalletConnect v2<br />
                <strong>Note:</strong> Many wallets have limited Tron support via WalletConnect. If transaction signing fails, the app will automatically switch to native wallet method.<br />
                <strong>Recommendation:</strong> For best Tron experience, consider using TronLink browser extension directly.
              </div>
            </div>
          ) : (
            <div>
              <div style={{ color: '#155724', fontWeight: 'bold', marginBottom: '5px' }}>
                ✅ Native Tron Wallet
              </div>
              <div style={{ color: '#155724', fontSize: '14px' }}>
                <strong>Current:</strong> Using native Tron wallet<br />
                <strong>Status:</strong> Recommended connection method for Tron transactions<br />
                <strong>Compatibility:</strong> Full support for all Tron features
              </div>
            </div>
          )}
        </div>

        <div className="debug-info" style={{background: '#f8f9fa', padding: '10px', margin: '10px 0', borderRadius: '5px', fontSize: '12px'}}>
          <details>
            <summary style={{cursor: 'pointer', fontWeight: 'bold'}}>🔍 Debug Information</summary>
            <div style={{marginTop: '10px'}}>
              <p><strong>Environment Network:</strong> {import.meta.env.VITE_TRON_NETWORK || 'not set (defaulting to mainnet)'}</p>
              <p><strong>Current Network:</strong> {CURRENT_NETWORK}</p>
              <p><strong>TronWeb Available:</strong> {tronWeb ? '✅ Yes' : '❌ No'}</p>
              <p><strong>TronWeb Connection:</strong> {isConnected ? '✅ Connected' : '❌ Not Connected'}</p>
              <p><strong>Contract Address:</strong> {(() => {
                try {
                  const address = getValidatedUsdtAddress(CURRENT_NETWORK);
                  return `✅ ${address}`;
                } catch (error) {
                  return `❌ ${error.message}`;
                }
              })()}</p>
              <p><strong>Wallet Address Valid:</strong> {tronWeb && walletAddress && tronWeb.isAddress(walletAddress) ? '✅ Valid' : '❌ Invalid'}</p>
            </div>
          </details>
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

        {message && (
          <div className="info-message" style={{
            backgroundColor: '#e3f2fd',
            border: '1px solid #bbdefb',
            borderRadius: '8px',
            padding: '12px',
            margin: '10px 0',
            color: '#1976d2'
          }}>
            <p>ℹ️ {message}</p>
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

        {isWalletConnectActive && (
          <div style={{ 
            marginTop: '15px', 
            padding: '12px', 
            backgroundColor: '#e3f2fd', 
            borderRadius: '8px', 
            fontSize: '14px',
            color: '#1976d2',
            border: '1px solid #bbdefb'
          }}>
            💡 <strong>WalletConnect Note:</strong> Many wallets have limited Tron support via WalletConnect. 
            If transaction signing fails, the app will automatically switch to native wallet method for better compatibility.
          </div>
        )}

        <div className="info-section">
          <h4>ℹ️ About USDT Approval</h4>
          <ul>
            <li>Approval allows another address to spend your USDT tokens</li>
            <li>You can approve any amount up to your available balance</li>
            <li>This is commonly used for DeFi protocols and smart contracts</li>
            <li>You can revoke approval by setting amount to 0</li>
          </ul>
          <p><strong>Connection:</strong> Using {connectionType} for transaction signing</p>
        </div>
      </div>

      <style jsx>{`
        /* Same styles as ApproveUsdtV2 */
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

export default ApproveUsdtHybrid;
