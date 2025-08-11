import React, { useState, useEffect } from 'react';
import { UsdtContract } from '../contracts/usdt.js';
import { useTronWeb } from '../hooks/useTronWeb.js';

const ApproveUsdt = ({ userAddress }) => {
  const { tronWeb, walletType } = useTronWeb();
  const [usdtBalance, setUsdtBalance] = useState('0');
  const [approveAmount, setApproveAmount] = useState('');
  const [spenderAddress, setSpenderAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentAllowance, setCurrentAllowance] = useState('0');
  const [error, setError] = useState('');

  useEffect(() => {
    if (tronWeb && userAddress) {
      loadUsdtBalance();
    }
  }, [tronWeb, userAddress]);

  useEffect(() => {
    if (tronWeb && userAddress && spenderAddress) {
      loadCurrentAllowance();
    }
  }, [tronWeb, userAddress, spenderAddress]);

  const loadUsdtBalance = async () => {
    try {
      const usdtContract = new UsdtContract(tronWeb, walletType);
      
      // First validate the contract exists
      await usdtContract.validateContract();
      
      const balance = await usdtContract.getBalance(userAddress);
      setUsdtBalance(balance);
      setError(''); // Clear any previous errors
    } catch (error) {
      console.error('Error loading USDT balance:', error);
      
      // Provide specific error message for contract issues
      if (error.message.includes('Contract not found') || error.message.includes('not a valid smart contract')) {
        setUsdtBalance('❌ USDT contract not available on this network');
        setError(`The USDT contract is not available on the current testnet. This may be because:
        
• The contract address is incorrect for this network
• The contract hasn't been deployed on this testnet
• Network connectivity issues

You can still test the wallet connection functionality, but USDT operations won't work until a valid contract is configured.`);
      } else {
        setUsdtBalance('Error loading balance');
        setError(error.message);
      }
    }
  };

  const loadCurrentAllowance = async () => {
    try {
      const usdtContract = new UsdtContract(tronWeb, walletType);
      
      // Validate contract first
      await usdtContract.validateContract();
      
      const allowance = await usdtContract.getAllowance(userAddress, spenderAddress);
      setCurrentAllowance(allowance);
    } catch (error) {
      console.error('Error loading allowance:', error);
      if (error.message.includes('Contract not found') || error.message.includes('not a valid smart contract')) {
        setCurrentAllowance('N/A (Contract unavailable)');
      } else {
        setCurrentAllowance('Error loading allowance');
      }
    }
  };

  const handleApprove = async () => {
    if (!approveAmount || !spenderAddress || !tronWeb) {
      alert('Please fill in all fields');
      return;
    }

    if (parseFloat(approveAmount) <= 0) {
      alert('Amount must be greater than 0');
      return;
    }

    // Validate Tron address format
    if (!spenderAddress.startsWith('T') || spenderAddress.length !== 34) {
      alert('Please enter a valid Tron address (starts with T and 34 characters long)');
      return;
    }

    // Validate user address
    if (!userAddress.startsWith('T') || userAddress.length !== 34) {
      alert('Invalid user address. Please reconnect your wallet.');
      return;
    }

    setIsLoading(true);

    try {
      const usdtContract = new UsdtContract(tronWeb, walletType);
      
      if (walletType === 'trustwallet') {
        alert(`Trust Wallet detected. Please confirm the transaction:\n\nSpender: ${spenderAddress}\nAmount: ${approveAmount} USDT\n\nMake sure to review all details carefully before signing.`);
      }
      
      console.log('Attempting approval with:', {
        spender: spenderAddress,
        amount: approveAmount,
        userAddress: userAddress,
        walletType: walletType
      });
      
      const txHash = await usdtContract.approve(spenderAddress, approveAmount, userAddress);
      
      if (walletType === 'trustwallet') {
        alert(`Approval initiated! If you signed the transaction in Trust Wallet, it should be processed shortly. Transaction details have been submitted to the network.`);
      } else {
        alert(`Approval transaction sent successfully! Transaction Hash: ${txHash}`);
      }
      
      // Reload allowance after approval (with delay for Trust Wallet)
      setTimeout(async () => {
        try {
          await loadCurrentAllowance();
        } catch (error) {
          console.error('Error reloading allowance:', error);
        }
      }, walletType === 'trustwallet' ? 5000 : 2000);
      
    } catch (error) {
      console.error('Approval failed:', error);
      
      let errorMessage = 'Approval failed: ';
      
      if (error.message.includes('User rejected') || error.message.includes('user rejected')) {
        errorMessage += 'Transaction was rejected by user';
      } else if (error.message.includes('insufficient')) {
        errorMessage += 'Insufficient balance or energy';
      } else if (error.message.includes('Invalid') && error.message.includes('address')) {
        errorMessage += 'Invalid address format. Please check the spender address.';
      } else if (error.message.includes('contract')) {
        errorMessage += 'Contract interaction failed. Please check your network connection.';
      } else if (walletType === 'trustwallet') {
        errorMessage += 'Trust Wallet transaction failed. Please ensure you signed the transaction and have sufficient TRX for fees.';
      } else {
        errorMessage += error.message || 'Unknown error occurred';
      }
      
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="approve-usdt">
      <h3>USDT Approval</h3>
      
      <div className="balance-info">
        <p><strong>Your USDT Balance:</strong> {usdtBalance} USDT</p>
        {spenderAddress && (
          <p><strong>Current Allowance:</strong> {currentAllowance} USDT</p>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="spender">Spender Address:</label>
        <input
          type="text"
          id="spender"
          value={spenderAddress}
          onChange={(e) => setSpenderAddress(e.target.value)}
          placeholder="Enter the address you want to approve"
          className="address-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="amount">Approval Amount (USDT):</label>
        <input
          type="number"
          id="amount"
          value={approveAmount}
          onChange={(e) => setApproveAmount(e.target.value)}
          placeholder="Enter amount to approve"
          step="0.000001"
          min="0"
          className="amount-input"
        />
      </div>

      <button
        onClick={handleApprove}
        disabled={isLoading || !approveAmount || !spenderAddress}
        className="approve-button"
      >
        {isLoading ? 'Processing...' : 'Approve USDT'}
      </button>

      <div className="info-box">
        <h4>ℹ️ What is USDT Approval?</h4>
        <p>
          By approving USDT, you allow the specified address to spend up to the approved amount 
          of USDT from your wallet. This is commonly used for DeFi protocols, exchanges, and smart contracts.
        </p>
        <p><strong>⚠️ Security Note:</strong> Only approve amounts you're comfortable with and verify the spender address carefully.</p>
        
        <h4>🔋 Account Requirements:</h4>
        <ul>
          <li><strong>Activated Account:</strong> Your Tron account must be activated (receive TRX first)</li>
          <li><strong>TRX for Fees:</strong> Minimum 1 TRX required for transaction fees</li>
          <li><strong>Energy/Bandwidth:</strong> Sufficient resources for contract interaction</li>
          <li><strong>Testnet Note:</strong> Using Shasta testnet - get test TRX from faucet if needed</li>
        </ul>
        
        <div className="testnet-info">
          <h5>🚰 Need Test TRX?</h5>
          <p>Visit the <a href="https://www.trongrid.io/shasta" target="_blank" rel="noopener noreferrer">
            Shasta Testnet Faucet</a> to get free test TRX for your account.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApproveUsdt;
