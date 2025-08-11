// Test script to find working USDT contracts on different Tron networks
import TronWeb from 'tronweb';

// Known USDT/TRC20 contract addresses to test
const POTENTIAL_CONTRACTS = {
  nile: [
    'TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR', // TetherToken (USDT)
    'TXYZopYRdj2D9XRtbG411Z78mEb5AoWi6a', // Previous address
    'TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj', // Another common test token
    'TRX', // Native TRX (for testing)
  ],
  shasta: [
    'TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs',
    'TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj',
  ]
};

export async function testContractExists(network = 'nile') {
  const networkConfig = {
    nile: 'https://nile.trongrid.io',
    shasta: 'https://api.shasta.trongrid.io',
    mainnet: 'https://api.trongrid.io'
  };

  const tronWeb = new TronWeb({
    fullHost: networkConfig[network],
    privateKey: false
  });

  console.log(`\n🔍 Testing contracts on ${network.toUpperCase()} network...\n`);

  const contracts = POTENTIAL_CONTRACTS[network] || [];
  
  for (const contractAddress of contracts) {
    try {
      console.log(`Testing: ${contractAddress}`);
      
      if (contractAddress === 'TRX') {
        console.log('✅ TRX (native token) - always available\n');
        continue;
      }

      const contractInfo = await tronWeb.trx.getContract(contractAddress);
      
      if (contractInfo && contractInfo.contract_address) {
        console.log('✅ Contract exists!');
        console.log(`   Name: ${contractInfo.name || 'Unknown'}`);
        console.log(`   Type: ${contractInfo.contract_type || 'Unknown'}`);
        
        // Try to get contract ABI
        try {
          const contract = await tronWeb.contract().at(contractAddress);
          console.log('✅ Contract is accessible via TronWeb');
          
          // Try to call a basic function
          if (contract.balanceOf) {
            console.log('✅ Has balanceOf function');
          }
          if (contract.approve) {
            console.log('✅ Has approve function');
          }
        } catch (abiError) {
          console.log('⚠️  Contract exists but may have compatibility issues');
        }
      } else {
        console.log('❌ Contract not found');
      }
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
    console.log('');
  }
}

// For use in browser console
window.testContracts = testContractExists;

export default testContractExists;
