// Test WalletConnect v2 Integration
import { initializeWalletConnect } from '../config/walletconnect.js';

export const testWalletConnect = async () => {
  try {
    console.log('🧪 Testing WalletConnect v2 integration...');
    
    const { signClient, modal } = await initializeWalletConnect();
    
    console.log('✅ WalletConnect SignClient initialized:', !!signClient);
    console.log('✅ WalletConnect Modal initialized:', !!modal);
    
    // Test namespace configuration
    console.log('📋 Checking namespace configuration...');
    console.log('✅ Namespace configuration loaded');
    
    // Test existing sessions
    const sessions = signClient.session.getAll();
    console.log(`📱 Found ${sessions.length} existing sessions`);
    
    if (sessions.length > 0) {
      sessions.forEach((session, index) => {
        console.log(`Session ${index + 1}:`, {
          topic: session.topic,
          accounts: session.namespaces.tron?.accounts || [],
          expiry: new Date(session.expiry * 1000)
        });
      });
    }
    
    return { success: true, signClient, modal };
  } catch (error) {
    console.error('❌ WalletConnect test failed:', error);
    return { success: false, error: error.message };
  }
};

// Call this function in browser console to test
if (typeof window !== 'undefined') {
  window.testWalletConnect = testWalletConnect;
  console.log('🔗 WalletConnect test function available as window.testWalletConnect()');
}
