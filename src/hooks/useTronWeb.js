import { useState, useEffect } from 'react';
import { TRON_CONFIG, CURRENT_NETWORK } from '../config/constants.js';

// Detect wallet type and capabilities
const detectWalletEnvironment = () => {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Enhanced Trust Wallet detection
  const isTrustWallet = !!(
    window.trustwallet || 
    (window.ethereum && window.ethereum.isTrust) ||
    (window.ethereum && window.ethereum.isTrustWallet) ||
    (typeof window !== 'undefined' && window.trustWallet) ||
    (navigator.userAgent && navigator.userAgent.includes('Trust'))
  );
  
  // Enhanced TronLink detection
  const isTronLink = !!(window.tronWeb || window.tronLink);
  
  // Check for injected TronWeb (Trust Wallet also injects this)
  const hasInjectedTronWeb = !!(window.tronWeb && window.tronWeb.defaultAddress);
  
  console.log('Wallet Detection:', {
    isMobile,
    isTrustWallet,
    isTronLink,
    hasInjectedTronWeb,
    userAgent: navigator.userAgent,
    windowTronWeb: !!window.tronWeb,
    windowEthereum: !!window.ethereum
  });
  
  return {
    isMobile,
    isTrustWallet,
    isTronLink,
    hasInjectedTronWeb,
    isDesktop: !isMobile,
    hasInjectedWallet: !!(isTronLink || isTrustWallet || hasInjectedTronWeb)
  };
};

// Wait for Trust Wallet injection with timeout
const waitForTrustWalletInjection = (maxWaitTime = 5000) => {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const checkForInjection = () => {
      const currentTime = Date.now();
      
      // Check for Trust Wallet's TronWeb injection
      if (window.tronWeb && window.tronWeb.defaultAddress) {
        console.log('Trust Wallet TronWeb detected after', currentTime - startTime, 'ms');
        resolve(true);
        return;
      }
      
      // Check for Trust Wallet's Tron provider
      if (window.trustwallet && window.trustwallet.tron) {
        console.log('Trust Wallet Tron provider detected after', currentTime - startTime, 'ms');
        resolve(true);
        return;
      }
      
      // Timeout reached
      if (currentTime - startTime >= maxWaitTime) {
        console.log('Trust Wallet injection timeout after', maxWaitTime, 'ms');
        resolve(false);
        return;
      }
      
      // Continue checking
      setTimeout(checkForInjection, 100);
    };
    
    checkForInjection();
  });
};

// Enhanced TronWeb initialization
const initializeTronWeb = async () => {
  const env = detectWalletEnvironment();
  
  console.log('Initializing TronWeb with environment:', env);
  
  // Trust Wallet mobile app detection (highest priority for mobile)
  if (env.isMobile && env.isTrustWallet) {
    console.log('Trust Wallet mobile detected, waiting for injection...');
    
    // Wait for Trust Wallet to inject TronWeb
    const injected = await waitForTrustWalletInjection(5000);
    
    if (injected && window.tronWeb && window.tronWeb.defaultAddress) {
      console.log('Using Trust Wallet injected TronWeb');
      return { 
        tronWeb: window.tronWeb, 
        type: 'trustwallet',
        needsManualAddress: false 
      };
    }
    
    // If TronWeb injection failed, try Trust Wallet's Tron provider
    if (window.trustwallet && window.trustwallet.tron) {
      try {
        const address = await window.trustwallet.tron.getAddress();
        if (address) {
          const TronWeb = (await import('tronweb')).default;
          const tronWeb = new TronWeb({
            fullHost: TRON_CONFIG[CURRENT_NETWORK].fullHost,
            privateKey: false
          });
          tronWeb.setAddress(address);
          
          console.log('Using Trust Wallet Tron provider with address:', address);
          return { 
            tronWeb, 
            type: 'trustwallet',
            address,
            needsManualAddress: false 
          };
        }
      } catch (error) {
        console.error('Trust Wallet Tron provider error:', error);
      }
    }
  }
  
  // TronLink detection (for desktop or if Trust Wallet not detected)
  if (window.tronWeb && window.tronWeb.ready) {
    console.log('Using TronLink ready TronWeb');
    return { 
      tronWeb: window.tronWeb, 
      type: 'tronlink',
      needsManualAddress: false 
    };
  }
  
  if (window.tronLink) {
    console.log('Using TronLink extension');
    try {
      await window.tronLink.request({ method: 'tron_requestAccounts' });
      return { 
        tronWeb: window.tronLink.tronWeb, 
        type: 'tronlink',
        needsManualAddress: false 
      };
    } catch (error) {
      console.error('TronLink connection error:', error);
    }
  }
  
  // Generic mobile wallet with injected TronWeb
  if (env.isMobile && window.tronWeb) {
    console.log('Using generic mobile wallet TronWeb');
    return { 
      tronWeb: window.tronWeb, 
      type: env.isTrustWallet ? 'trustwallet' : 'mobile_wallet',
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
    
    // Create Trust Wallet-compatible deep link
    // Trust Wallet can open URLs directly or through their deep link protocol
    const trustWalletUrl = `https://link.trustwallet.com/open_url?coin_id=195&url=${encodeURIComponent(appUrl)}`;
    
    // For broader compatibility, we'll use the direct URL
    // Trust Wallet's QR scanner can handle regular URLs
    const qrData = appUrl;
    
    console.log('Generated QR code data:', qrData);
    console.log('Trust Wallet deep link:', trustWalletUrl);
    
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
