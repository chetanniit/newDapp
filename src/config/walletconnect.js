import { SignClient } from '@walletconnect/sign-client';
import { WalletConnectModal } from '@walletconnect/modal';

// WalletConnect Project ID - Get from https://cloud.walletconnect.com/
// For demo purposes, using a public test project ID
// Replace with your own project ID for production
const PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'a01e2f3b4c5d6e7f8a9b0c1d2e3f4a5b'; // Demo ID - replace with yours

console.log('🔗 WalletConnect Project ID:', PROJECT_ID);
if (PROJECT_ID === 'a01e2f3b4c5d6e7f8a9b0c1d2e3f4a5b') {
  console.warn('⚠️ Using demo Project ID. Get your own from https://cloud.walletconnect.com/');
}

// WalletConnect configuration
export const WALLETCONNECT_CONFIG = {
  projectId: PROJECT_ID,
  metadata: {
    name: import.meta.env.VITE_APP_NAME || 'Tron USDT DApp',
    description: import.meta.env.VITE_APP_DESCRIPTION || 'A DApp for USDT approval on Tron network using WalletConnect v2',
    url: import.meta.env.VITE_APP_URL || 'https://tron-usdt-dapp.netlify.app',
    icons: ['https://tron-usdt-dapp.netlify.app/logo.png']
  },
  relayUrl: 'wss://relay.walletconnect.com'
};

// Tron namespace configuration for WalletConnect
export const TRON_NAMESPACE = {
  requiredNamespaces: {
    tron: {
      methods: [
        'tron_requestAccounts',
        'tron_signTransaction',
        'tron_signMessage',
        'tron_sendTransaction'
      ],
      chains: [
        'tron:0x2b6653dc', // Tron Mainnet
        'tron:0xcd8690dc', // Tron Shasta Testnet
        'tron:0x94a9059e'  // Tron Nile Testnet
      ],
      events: ['accountsChanged', 'chainChanged']
    }
  }
};

// WalletConnect singleton instance
let walletConnectInstance = null;
let initializationPromise = null;

// Initialize WalletConnect client (singleton pattern)
export const initializeWalletConnect = async () => {
  // If already initialized, return the existing instance
  if (walletConnectInstance) {
    console.log('WalletConnect already initialized, returning existing instance');
    return walletConnectInstance;
  }

  // If initialization is in progress, wait for it
  if (initializationPromise) {
    console.log('WalletConnect initialization in progress, waiting...');
    return initializationPromise;
  }

  // Start new initialization
  initializationPromise = (async () => {
    try {
      console.log('Initializing WalletConnect with project ID:', PROJECT_ID);
      
      const signClient = await SignClient.init({
        projectId: WALLETCONNECT_CONFIG.projectId,
        metadata: WALLETCONNECT_CONFIG.metadata
      });

      const modal = new WalletConnectModal({
        projectId: WALLETCONNECT_CONFIG.projectId,
        themeMode: 'light',
        themeVariables: {
          '--wcm-z-index': '1000',
          '--wcm-accent-color': '#3b82f6',
          '--wcm-background-color': '#ffffff'
        }
      });

      walletConnectInstance = { signClient, modal };
      console.log('WalletConnect initialized successfully');
      return walletConnectInstance;
    } catch (error) {
      console.error('Failed to initialize WalletConnect:', error);
      // Reset on error so we can try again
      walletConnectInstance = null;
      initializationPromise = null;
      throw error;
    }
  })();

  return initializationPromise;
};

// Function to reset the singleton (useful for testing or reconnection)
export const resetWalletConnect = () => {
  console.log('Resetting WalletConnect singleton');
  walletConnectInstance = null;
  initializationPromise = null;
};

// Helper function to get chain ID from network
export const getChainId = (network) => {
  switch (network) {
    case 'mainnet':
      return 'tron:0x2b6653dc';
    case 'shasta':
      return 'tron:0xcd8690dc';
    case 'nile':
      return 'tron:0x94a9059e';
    default:
      return 'tron:0xcd8690dc'; // Default to Shasta testnet
  }
};
