import { useState, useEffect, useCallback } from 'react';
import { TRON_CONFIG, CURRENT_NETWORK } from '../config/constants.js';
import { 
  initializeWalletConnect, 
  TRON_NAMESPACE, 
  getChainId 
} from '../config/walletconnect.js';

export const useWalletConnect = () => {
  const [signClient, setSignClient] = useState(null);
  const [modal, setModal] = useState(null);
  const [session, setSession] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [tronWeb, setTronWeb] = useState(null);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize WalletConnect (only once)
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      // Prevent multiple initializations
      if (isInitialized) {
        console.log('WalletConnect hook already initialized, skipping...');
        return;
      }

      try {
        console.log('Initializing WalletConnect hook...');
        const { signClient: client, modal: wcModal } = await initializeWalletConnect();
        
        if (!isMounted) return; // Component unmounted during initialization
        
        setSignClient(client);
        setModal(wcModal);
        setIsInitialized(true);

        // Check for existing sessions
        const sessions = client.session.getAll();
        if (sessions.length > 0) {
          const lastSession = sessions[sessions.length - 1];
          setSession(lastSession);
          
          const sessionAccounts = lastSession.namespaces.tron?.accounts || [];
          const tronAccounts = sessionAccounts.map(account => account.split(':')[2]);
          setAccounts(tronAccounts);
          setIsConnected(true);
          
          // Initialize TronWeb with session
          await initializeTronWebWithSession(lastSession);
        }

        // Listen for session events
        client.on('session_event', handleSessionEvent);
        client.on('session_update', handleSessionUpdate);
        client.on('session_delete', handleSessionDelete);
        
      } catch (error) {
        if (!isMounted) return;
        console.error('Failed to initialize WalletConnect:', error);
        setError(error.message);
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array to run only once

  // Initialize TronWeb with WalletConnect session
  const initializeTronWebWithSession = async (session) => {
    try {
      const TronWeb = (await import('tronweb')).default;
      
      // Create TronWeb instance without private key
      const tronWebInstance = new TronWeb({
        fullHost: TRON_CONFIG[CURRENT_NETWORK].fullHost,
        privateKey: false
      });

      // Set default address if available
      if (accounts.length > 0) {
        tronWebInstance.setAddress(accounts[0]);
      }

      // Store reference to sign client and session for later use
      tronWebInstance._walletConnect = {
        signClient,
        session,
        chainId: getChainId(CURRENT_NETWORK)
      };

      setTronWeb(tronWebInstance);
      return tronWebInstance;
    } catch (error) {
      console.error('Failed to initialize TronWeb:', error);
      throw error;
    }
  };

  // Connect wallet
  const connect = useCallback(async () => {
    if (!signClient || !modal) {
      throw new Error('WalletConnect not initialized');
    }

    setIsConnecting(true);
    setError(null);

    try {
        // Create connection
        const { uri, approval } = await signClient.connect(TRON_NAMESPACE);      if (uri) {
        // Open modal with QR code
        modal.openModal({ uri });
        
        // Wait for session approval
        const session = await approval();
        
        // Close modal
        modal.closeModal();
        
        // Update state
        setSession(session);
        const sessionAccounts = session.namespaces.tron?.accounts || [];
        const tronAccounts = sessionAccounts.map(account => account.split(':')[2]);
        setAccounts(tronAccounts);
        setIsConnected(true);
        
        // Initialize TronWeb
        await initializeTronWebWithSession(session);
        
        return tronAccounts[0];
      }
    } catch (error) {
      console.error('Connection failed:', error);
      setError(error.message);
      modal.closeModal();
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [signClient, modal, accounts]);

  // Disconnect wallet
  const disconnect = useCallback(async () => {
    if (!signClient || !session) return;

    try {
      await signClient.disconnect({
        topic: session.topic,
        reason: {
          code: 6000,
          message: 'User disconnected'
        }
      });
      
      // Reset state
      setSession(null);
      setAccounts([]);
      setIsConnected(false);
      setTronWeb(null);
    } catch (error) {
      console.error('Disconnect failed:', error);
      setError(error.message);
    }
  }, [signClient, session]);

  // Sign and send transaction
  const signAndSendTransaction = useCallback(async (transaction) => {
    if (!signClient || !session || !tronWeb) {
      throw new Error('Wallet not connected - missing signClient, session, or tronWeb');
    }

    if (!transaction) {
      throw new Error('No transaction provided for signing');
    }

    // Verify session is still valid
    if (!session.topic || !session.namespaces?.tron) {
      throw new Error('WalletConnect session is invalid or expired');
    }

    try {
      console.log('Signing transaction with WalletConnect:', transaction);

      // Ensure transaction is properly formatted
      let transactionParam = transaction;
      
      // If it's a TronWeb transaction object, ensure it has required fields
      if (transaction && typeof transaction === 'object') {
        // Add required fields if missing
        if (!transaction.raw_data_hex && transaction.raw_data) {
          transactionParam = {
            ...transaction,
            raw_data_hex: Buffer.from(JSON.stringify(transaction.raw_data)).toString('hex')
          };
        }
      }

      console.log('Formatted transaction for signing:', transactionParam);

      // Try multiple signing methods
      let result;
      
      try {
        // Method 1: Standard tron_signTransaction
        result = await signClient.request({
          topic: session.topic,
          chainId: getChainId(CURRENT_NETWORK),
          request: {
            method: 'tron_signTransaction',
            params: [transactionParam]
          }
        });
        console.log('Method 1 (tron_signTransaction) result:', result);
      } catch (error1) {
        console.warn('Method 1 failed:', error1?.message || error1);
        
        try {
          // Method 2: Try with different parameter format
          result = await signClient.request({
            topic: session.topic,
            chainId: getChainId(CURRENT_NETWORK),
            request: {
              method: 'tron_signTransaction',
              params: {
                transaction: transactionParam
              }
            }
          });
          console.log('Method 2 (object params) result:', result);
        } catch (error2) {
          console.warn('Method 2 failed:', error2?.message || error2);
          
          try {
            // Method 3: Try tron_sign method
            result = await signClient.request({
              topic: session.topic,
              chainId: getChainId(CURRENT_NETWORK),
              request: {
                method: 'tron_sign',
                params: [transactionParam]
              }
            });
            console.log('Method 3 (tron_sign) result:', result);
          } catch (error3) {
            console.warn('Method 3 failed:', error3?.message || error3);
            const errorMsg = error3?.message || error3?.toString() || 'Unknown signing error';
            throw new Error(`All signing methods failed. Last error: ${errorMsg}`);
          }
        }
      }

      // Handle different response formats
      if (result && result.txid) {
        // Transaction was already broadcast by the wallet
        return result;
      } else if (result && typeof result === 'string') {
        // We got a signed transaction, broadcast it
        const broadcastResult = await tronWeb.trx.sendRawTransaction(result);
        return broadcastResult;
      } else if (result && result.signature) {
        // We got a signature, need to apply it and broadcast
        const signedTx = { ...transaction, signature: result.signature };
        const broadcastResult = await tronWeb.trx.sendRawTransaction(signedTx);
        return broadcastResult;
      } else if (result && result.transaction) {
        // Wallet returned a transaction object
        const broadcastResult = await tronWeb.trx.sendRawTransaction(result.transaction);
        return broadcastResult;
      } else {
        // Try to broadcast the result as-is
        console.log('Attempting to broadcast result as-is:', result);
        const broadcastResult = await tronWeb.trx.sendRawTransaction(result);
        return broadcastResult;
      }
    } catch (error) {
      console.error('Transaction failed:', error);
      
      const errorMessage = error?.message || error?.toString() || 'Unknown transaction error';
      
      // If the WalletConnect signing failed, try alternative approaches
      if (errorMessage.includes('method not supported')) {
        const wcError = new Error('This wallet does not support Tron transactions via WalletConnect. Please use a Tron-compatible wallet like TronLink.');
        wcError.isWalletConnectFailure = true;
        throw wcError;
      }
      
      // Mark general WalletConnect failures for fallback handling
      if (errorMessage.includes('Transaction is not signed') ||
          errorMessage.includes('signing failed') ||
          errorMessage.includes('Invalid signature') ||
          errorMessage.includes('User rejected') ||
          errorMessage.includes('User denied')) {
        const wcError = new Error(`WalletConnect transaction signing failed: ${errorMessage}. This wallet may not fully support Tron transactions through WalletConnect.`);
        wcError.isWalletConnectFailure = true;
        throw wcError;
      }
      
      // Re-throw with better error message
      const enhancedError = new Error(`Transaction failed: ${errorMessage}`);
      enhancedError.originalError = error;
      throw enhancedError;
    }
  }, [signClient, session, tronWeb]);

  // Request accounts
  const requestAccounts = useCallback(async () => {
    if (!signClient || !session) {
      throw new Error('Wallet not connected');
    }

    try {
      const result = await signClient.request({
        topic: session.topic,
        chainId: getChainId(CURRENT_NETWORK),
        request: {
          method: 'tron_requestAccounts',
          params: {}
        }
      });

      return result;
    } catch (error) {
      console.error('Request accounts failed:', error);
      throw error;
    }
  }, [signClient, session]);

  // Event handlers
  const handleSessionEvent = (event) => {
    console.log('Session event:', event);
  };

  const handleSessionUpdate = ({ topic, params }) => {
    console.log('Session update:', { topic, params });
    const { namespaces } = params;
    const updatedSession = signClient.session.get(topic);
    setSession(updatedSession);
  };

  const handleSessionDelete = () => {
    console.log('Session deleted');
    setSession(null);
    setAccounts([]);
    setIsConnected(false);
    setTronWeb(null);
  };

  return {
    // State
    isConnected,
    isConnecting,
    accounts,
    address: accounts.length > 0 ? accounts[0] : null, // Add address field
    session,
    tronWeb,
    error,
    
    // Actions
    connect,
    disconnect,
    signAndSendTransaction,
    requestAccounts
  };
};
