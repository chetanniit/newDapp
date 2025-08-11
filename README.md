# Tron USDT DApp

A React.js decentralized application (DApp) for approving USDT transactions on the Tron blockchain. This DApp allows users to connect their TronLink wallet, check their USDT balance, and approve USDT spending for specific addresses.

## Features

- 🔗 **Wallet Connection**: Connect with TronLink wallet
- 💰 **Balance Display**: View your USDT (TRC20) balance
- ✅ **USDT Approval**: Approve USDT spending for specific addresses
- 🔍 **Allowance Tracking**: Check current allowances for spender addresses
- 🌟 **Modern UI**: Beautiful gradient design with responsive layout
- 🔒 **Security**: Transaction signing with user's wallet

## Prerequisites

Before running this DApp, make sure you have:

1. **Wallet Support**:
   - **TronLink Wallet Extension** (Chrome/Firefox/Edge) - Full native support
   - **Trust Wallet Mobile App** - Supported via DApp browser
2. **Node.js** (version 16 or higher)
3. **npm** or **yarn** package manager

## Wallet Compatibility

### TronLink (Recommended)
- ✅ Full native support
- ✅ Automatic transaction signing
- ✅ Real-time balance updates
- ✅ Seamless user experience

### Trust Wallet
- ✅ Supported via DApp browser
- ⚠️ Manual Tron address entry required
- ⚠️ Transaction signing through Trust Wallet interface
- ⚠️ Limited automatic updates

**Note for Trust Wallet users**: Since Trust Wallet doesn't inject TronWeb directly into the DApp browser for Tron network, you'll need to manually enter your Tron address when connecting.

## Installation

1. Clone or download this repository
2. Navigate to the project directory
3. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser and go to `http://localhost:5173`

3. Make sure TronLink is installed and unlocked

## How to Use

### Step 1: Connect Your Wallet

**For TronLink:**
- Click "Connect TronLink" button
- Approve the connection in your TronLink wallet
- Your wallet address and USDT balance will be displayed automatically

**For Trust Wallet:**
- Open this DApp in Trust Wallet's DApp browser
- Click "Connect Trust Wallet" button
- Enter your Tron address when prompted (starts with 'T')
- Your USDT balance will be loaded

### Step 2: Approve USDT
- Enter the **Spender Address** (the address you want to approve)
- Enter the **Approval Amount** (amount of USDT to approve)
- Click "Approve USDT"
- Confirm the transaction in your TronLink wallet

### Step 3: Transaction Confirmation

**For TronLink:**
- Wait for the transaction to be processed on the Tron network
- The transaction hash will be displayed upon success
- Current allowance will be updated automatically

**For Trust Wallet:**
- Review transaction details carefully in Trust Wallet
- Sign the transaction in Trust Wallet interface
- Transaction will be submitted to the Tron network
- Manual refresh may be needed for balance updates

## Smart Contract Details

- **USDT Contract Address**: `TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t`
- **Network**: Tron Mainnet
- **Token Standard**: TRC20
- **Decimals**: 6

## Project Structure

```
src/
├── components/
│   ├── WalletConnect.jsx    # Wallet connection component
│   └── ApproveUsdt.jsx      # USDT approval component
├── contracts/
│   └── usdt.js             # USDT contract interaction
├── hooks/
│   └── useTronWeb.js       # TronWeb React hook
├── config/
│   └── constants.js        # Contract addresses and ABI
├── App.jsx                 # Main application component
├── App.css                 # Application styles
├── main.jsx               # Application entry point
└── index.css              # Global styles
```

## Key Functions

### UsdtContract Class
- `getBalance(address)` - Get USDT balance for an address
- `getAllowance(owner, spender)` - Get current allowance
- `approve(spender, amount)` - Approve USDT spending

### useTronWeb Hook
- `tronWeb` - TronWeb instance
- `address` - Connected wallet address
- `isConnected` - Connection status
- `connectWallet()` - Connect to supported wallet
- `walletType` - Detected wallet type ('tronlink' or 'trustwallet')
- `getWalletName()` - Get friendly wallet name

## Security Considerations

⚠️ **Important Security Notes:**

1. **Verify Addresses**: Always double-check spender addresses before approving
2. **Approve Responsibly**: Only approve amounts you're comfortable with
3. **Revoke Unused Approvals**: Consider revoking approvals when no longer needed
4. **Test on Testnet**: Test with small amounts first

## Network Configuration

The DApp is configured for Tron Mainnet. To use on Shasta Testnet, update the configuration in `src/config/constants.js`.

## Troubleshooting

### Common Issues:

1. **TronLink Not Detected**
   - Make sure TronLink extension is installed and enabled
   - Refresh the page after installing TronLink

2. **Transaction Failed**
   - Check if you have enough TRX for transaction fees
   - Verify the spender address is valid
   - Ensure your wallet is unlocked

3. **Balance Not Loading**
   - Check your internet connection
   - Make sure you're connected to the correct network

## Development

### Build for Production
```bash
npm run build
```

### Lint Code
```bash
npm run lint
```

### Preview Production Build
```bash
npm run preview
```

## Technologies Used

- **React.js** - Frontend framework
- **Vite** - Build tool and development server
- **TronWeb** - Tron blockchain interaction
- **TronLink** - Wallet connection
- **CSS3** - Styling with modern gradients and animations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

If you encounter any issues or have questions, please:
1. Check the troubleshooting section
2. Review the Tron documentation
3. Open an issue in the repository

---

**Disclaimer**: This is a demonstration DApp. Always review and audit smart contract interactions before using in production with significant amounts.
