import React, { createContext, useContext } from 'react';
import { useWalletConnect } from '../hooks/useWalletConnect.js';
import { useTronWeb } from '../hooks/useTronWeb.js';

// Create wallet context
const WalletContext = createContext();

// Wallet provider component
export const WalletProvider = ({ children }) => {
  // Initialize hooks once at the top level
  const walletConnectData = useWalletConnect();
  const tronWebData = useTronWeb();
  
  // Debug logging
  console.log('WalletContext - WalletConnect data:', {
    isConnected: walletConnectData.isConnected,
    address: walletConnectData.address,
    accounts: walletConnectData.accounts
  });
  
  console.log('WalletContext - TronWeb data:', {
    isConnected: tronWebData.isConnected,
    address: tronWebData.address,
    walletType: tronWebData.walletType
  });
  
  // Determine which wallet is active
  const isWalletConnectActive = walletConnectData.isConnected;
  const isTronWebActive = tronWebData.isConnected && !walletConnectData.isConnected;
  const isAnyConnected = walletConnectData.isConnected || tronWebData.isConnected;
  
  // Get active wallet data with fallback logic
  const activeWalletData = isWalletConnectActive ? walletConnectData : tronWebData;
  
  // More robust address detection with fallbacks
  let activeAddress = null;
  if (isWalletConnectActive && walletConnectData.address) {
    activeAddress = walletConnectData.address;
  } else if (isTronWebActive && tronWebData.address) {
    activeAddress = tronWebData.address;
  } else if (walletConnectData.accounts && walletConnectData.accounts.length > 0) {
    // Fallback to first account from WalletConnect
    activeAddress = walletConnectData.accounts[0];
  } else if (tronWebData.tronWeb && tronWebData.tronWeb.defaultAddress) {
    // Fallback to TronWeb default address
    activeAddress = tronWebData.tronWeb.defaultAddress.base58;
  }

  console.log('WalletContext - Final state:', {
    isWalletConnectActive,
    isTronWebActive,
    isAnyConnected,
    activeAddress
  });

  const value = {
    // Individual wallet data
    walletConnect: walletConnectData,
    tronWeb: tronWebData,
    
    // Active wallet info
    isConnected: isAnyConnected,
    isWalletConnectActive,
    isTronWebActive,
    activeWallet: activeWalletData,
    address: activeAddress,
    
    // TronWeb instance (from active wallet)
    tronWebInstance: activeWalletData.tronWeb,
    
    // Transaction signing function
    signAndSendTransaction: isWalletConnectActive 
      ? walletConnectData.signAndSendTransaction 
      : null
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

// Hook to use wallet context
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
