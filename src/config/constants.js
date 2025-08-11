// USDT TRC20 contract addresses
export const USDT_CONTRACT_ADDRESSES = {
  mainnet: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', // Official USDT on Mainnet
  nile: 'TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR', // TetherToken (USDT) on Nile testnet
  shasta: 'TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs' // USDT on Shasta testnet
};

// Backup/alternative USDT contract addresses for testing
export const BACKUP_USDT_ADDRESSES = {
  mainnet: [
    'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', // Official USDT on Mainnet (backup)
  ],
  nile: [
    'TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR', // Primary Nile USDT
    'TGWCUDjPWZHs3kXPjMF4FgkKxr1bKa5crs', // Alternative Nile USDT contract
  ],
  shasta: [
    'TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs',
    'TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf', // Alternative Shasta contract
  ]
};

// Current network setting (can be overridden by environment variable)
export const CURRENT_NETWORK = import.meta.env.VITE_TRON_NETWORK || 'mainnet';

// Get current USDT contract address based on network
export const USDT_CONTRACT_ADDRESS = USDT_CONTRACT_ADDRESSES[CURRENT_NETWORK];

// Helper function to get USDT contract address
export const getValidatedUsdtAddress = (network, tronWeb = null) => {
  const primaryAddress = USDT_CONTRACT_ADDRESSES[network];
  
  if (!primaryAddress) {
    throw new Error(`No USDT contract address configured for network: ${network}`);
  }
  
  return primaryAddress;
};

// Tron network configuration
export const TRON_CONFIG = {
  mainnet: {
    fullHost: 'https://api.trongrid.io',
    solidityNode: 'https://api.trongrid.io',
    eventServer: 'https://api.trongrid.io',
    explorer: 'https://tronscan.org'
  },
  nile: {
    fullHost: 'https://nile.trongrid.io',
    solidityNode: 'https://nile.trongrid.io',
    eventServer: 'https://nile.trongrid.io',
    explorer: 'https://nile.tronscan.org'
  },
  shasta: {
    fullHost: 'https://api.shasta.trongrid.io',
    solidityNode: 'https://api.shasta.trongrid.io',
    eventServer: 'https://api.shasta.trongrid.io',
    explorer: 'https://shasta.tronscan.org'
  },
};

// USDT contract ABI (minimal required functions)
export const USDT_ABI = [
  {
    "constant": true,
    "inputs": [
      {"name": "_owner", "type": "address"},
      {"name": "_spender", "type": "address"}
    ],
    "name": "allowance",
    "outputs": [{"name": "", "type": "uint256"}],
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
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
    "type": "function"
  }
];
