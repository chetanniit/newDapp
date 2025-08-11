import { useState, useEffect } from 'react';
import { TRON_CONFIG, CURRENT_NETWORK } from '../config/constants.js';

// Detect wallet type and capabilities
const detectWalletEnvironment = () => {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isTrustWallet = window.trustwallet || (window.ethereum && window.ethereum.isTrust);
  const isTronLink = window.tronWeb || window.tronLink;
  
  return {
    isMobile,
    isTrustWallet,
    isTronLink,
    isDesktop: !isMobile,
    hasInjectedWallet: !!(isTronLink || isTrustWallet)
  };
};

// Enhanced TronWeb initialization
const initializeTronWeb = async () => {
  const env = detectWalletEnvironment();
  
  // Try TronLink first (most reliable)
  if (window.tronWeb && window.tronWeb.ready) {
    return { 
      tronWeb: window.tronWeb, 
      type: 'tronlink',
      needsManualAddress: false 
    };
  }
  
  if (window.tronLink) {
    await window.tronLink.request({ method: 'tron_requestAccounts' });
    return { 
      tronWeb: window.tronLink.tronWeb, 
      type: 'tronlink',
      needsManualAddress: false 
    };
  }
  
  // Trust Wallet with automatic address detection
  if (env.isTrustWallet && env.isMobile) {
    try {
      // Import TronWeb dynamically
      const TronWeb = (await import('tronweb')).default;
      
      const tronWeb = new TronWeb({
        fullHost: TRON_CONFIG[CURRENT_NETWORK].fullHost,
        privateKey: false
      });
      
      // Try to get address from Trust Wallet's Tron provider
      if (window.trustwallet && window.trustwallet.tron) {
        const address = await window.trustwallet.tron.getAddress();
        tronWeb.setAddress(address);
        return { 
          tronWeb, 
          type: 'trustwallet', 
          address,
          needsManualAddress: false 
        };
      }
      
      // Fallback: Use ethereum provider to derive Tron address
      if (window.ethereum && window.ethereum.isTrust) {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        
        if (accounts && accounts.length > 0) {
          // Try to derive Tron address from Ethereum account
          const tronAddress = await deriveTronAddressFromEth(accounts[0]);
          if (tronAddress) {
            tronWeb.setAddress(tronAddress);
            return { 
              tronWeb, 
              type: 'trustwallet', 
              address: tronAddress,
              needsManualAddress: false 
            };
          }
        }
      }
      
      return { 
        tronWeb, 
        type: 'trustwallet',
        needsManualAddress: true 
      };
    } catch (error) {
      console.error('Trust Wallet initialization error:', error);
      return null;
    }
  }
  
  // For desktop users without wallet, prepare for QR connection
  if (env.isDesktop && !env.hasInjectedWallet) {
    const TronWeb = (await import('tronweb')).default;
    const tronWeb = new TronWeb({
      fullHost: TRON_CONFIG[CURRENT_NETWORK].fullHost,
      privateKey: false
    });
    
    return { 
      tronWeb, 
      type: 'qr_connect',
      needsManualAddress: false,
      needsQRConnection: true 
    };
  }
  
  return null;
};

// Attempt to derive Tron address from Ethereum address (Trust Wallet specific)
const deriveTronAddressFromEth = async (ethAddress) => {
  try {
    // This is a simplified approach - in reality, you'd need Trust Wallet's specific API
    // For now, we'll try to use localStorage or Trust Wallet's Tron provider
    
    if (window.trustwallet && window.trustwallet.tron) {
      return await window.trustwallet.tron.getAddress();
    }
    
    // Check if Trust Wallet has stored Tron address
    const storedTronAddress = localStorage.getItem('trustwallet_tron_address');
    if (storedTronAddress && storedTronAddress.startsWith('T')) {
      return storedTronAddress;
    }
    
    return null;
  } catch (error) {
    console.error('Error deriving Tron address:', error);
    return null;
  }
};

export const useTronWeb = () => {
  const [tronWeb, setTronWeb] = useState(null);
  const [address, setAddress] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [walletType, setWalletType] = useState(null);
  const [qrCodeData, setQrCodeData] = useState('');
  const [needsQRConnection, setNeedsQRConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  useEffect(() => {
    const checkWallet = async () => {
      const walletInfo = await initializeTronWeb();
      
      if (walletInfo) {
        setTronWeb(walletInfo.tronWeb);
        setWalletType(walletInfo.type);
        setNeedsQRConnection(walletInfo.needsQRConnection || false);
        
        if (walletInfo.address) {
          setAddress(walletInfo.address);
          setIsConnected(true);
          setConnectionStatus('connected');
        } else if (walletInfo.needsQRConnection) {
          generateQRCode();
          setConnectionStatus('qr_ready');
        } else if (!walletInfo.needsManualAddress) {
          // Try to get address automatically
          try {
            const userAddress = walletInfo.tronWeb.defaultAddress?.base58;
            if (userAddress) {
              setAddress(userAddress);
              setIsConnected(true);
              setConnectionStatus('connected');
            }
          } catch (error) {
            console.log('No default address available');
          }
        }
      }
    };

    checkWallet();

    // Set up interval to check for wallet changes
    const interval = setInterval(checkWallet, 3000);
    return () => clearInterval(interval);
  }, []);

  const generateQRCode = () => {
    const appUrl = window.location.href;
    const qrData = `tronlink://open?url=${encodeURIComponent(appUrl)}`;
    setQrCodeData(qrData);
  };

  const connectWallet = async () => {
    try {
      setConnectionStatus('connecting');
      const env = detectWalletEnvironment();
      
      if (env.isTronLink) {
        // TronLink connection
        if (window.tronWeb) {
          try {
            if (window.tronWeb.request) {
              await window.tronWeb.request({ method: 'tron_requestAccounts' });
            }
            
            const userAddress = window.tronWeb.defaultAddress?.base58;
            if (userAddress) {
              setAddress(userAddress);
              setIsConnected(true);
              setConnectionStatus('connected');
              return userAddress;
            }
          } catch (error) {
            console.error('TronLink connection error:', error);
          }
        }
        
        if (window.tronLink) {
          await window.tronLink.request({ method: 'tron_requestAccounts' });
          const userAddress = window.tronLink.tronWeb.defaultAddress?.base58;
          if (userAddress) {
            setAddress(userAddress);
            setIsConnected(true);
            setConnectionStatus('connected');
            return userAddress;
          }
        }
      } else if (env.isTrustWallet) {
        // Trust Wallet automatic connection
        try {
          let tronAddress = null;
          
          // Method 1: Trust Wallet Tron provider
          if (window.trustwallet && window.trustwallet.tron) {
            tronAddress = await window.trustwallet.tron.getAddress();
          }
          
          // Method 2: Check if already connected via ethereum provider
          if (!tronAddress && window.ethereum && window.ethereum.isTrust) {
            const accounts = await window.ethereum.request({ 
              method: 'eth_requestAccounts' 
            });
            
            if (accounts && accounts.length > 0) {
              // Try to get corresponding Tron address
              tronAddress = await deriveTronAddressFromEth(accounts[0]);
            }
          }
          
          // Method 3: Use Trust Wallet's deep link to get Tron address
          if (!tronAddress) {
            tronAddress = await requestTronAddressFromTrustWallet();
          }
          
          if (tronAddress && tronAddress.startsWith('T')) {
            setAddress(tronAddress);
            setIsConnected(true);
            setConnectionStatus('connected');
            // Store for future use
            localStorage.setItem('trustwallet_tron_address', tronAddress);
            return tronAddress;
          } else {
            throw new Error('Could not get Tron address from Trust Wallet');
          }
        } catch (error) {
          console.error('Trust Wallet connection error:', error);
          throw new Error('Failed to connect Trust Wallet automatically');
        }
      } else if (env.isDesktop && !env.hasInjectedWallet) {
        // Desktop QR code connection
        generateQRCode();
        setConnectionStatus('qr_ready');
        throw new Error('qr_connection_needed');
      } else {
        throw new Error('No compatible wallet found');
      }
    } catch (error) {
      setConnectionStatus('disconnected');
      throw error;
    }
  };

  const requestTronAddressFromTrustWallet = async () => {
    try {
      // Try to use Trust Wallet's postMessage API
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Timeout waiting for Trust Wallet response'));
        }, 10000);
        
        const handleMessage = (event) => {
          if (event.data && event.data.type === 'TRUST_WALLET_TRON_ADDRESS') {
            clearTimeout(timeout);
            window.removeEventListener('message', handleMessage);
            resolve(event.data.address);
          }
        };
        
        window.addEventListener('message', handleMessage);
        
        // Send request to Trust Wallet
        window.postMessage({
          type: 'REQUEST_TRON_ADDRESS',
          target: 'trust-wallet'
        }, '*');
      });
    } catch (error) {
      console.error('Error requesting Tron address from Trust Wallet:', error);
      return null;
    }
  };

  const getWalletName = () => {
    switch (walletType) {
      case 'tronlink': return 'TronLink';
      case 'trustwallet': return 'Trust Wallet';
      case 'qr_connect': return 'Mobile Wallet (QR)';
      default: return 'Unknown Wallet';
    }
  };

  return {
    tronWeb,
    address,
    isConnected,
    connectWallet,
    walletType,
    getWalletName,
    qrCodeData,
    needsQRConnection,
    connectionStatus,
  };
};
