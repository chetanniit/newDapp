// USDT TRC20 contract addresses
export const USDT_CONTRACT_ADDRESSES = {
  mainnet: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
  nile: 'TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR', // TetherToken (USDT) on Nile testnet
  shasta: 'TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs' // USDT on Shasta testnet
};

// Current network setting
export const CURRENT_NETWORK = 'mainnet'; // Changed to Shasta testnet - more commonly used

// Get current USDT contract address based on network
export const USDT_CONTRACT_ADDRESS = USDT_CONTRACT_ADDRESSES[CURRENT_NETWORK];

// Tron network configuration
export const TRON_CONFIG = {
  mainnet: {
    fullHost: 'https://api.trongrid.io',
    solidityNode: 'https://api.trongrid.io',
    eventServer: 'https://api.trongrid.io',
  },
  nile: {
    fullHost: 'https://nile.trongrid.io',
    solidityNode: 'https://nile.trongrid.io',
    eventServer: 'https://nile.trongrid.io',
  },
  shasta: {
    fullHost: 'https://api.shasta.trongrid.io',
    solidityNode: 'https://api.shasta.trongrid.io',
    eventServer: 'https://api.shasta.trongrid.io',
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
