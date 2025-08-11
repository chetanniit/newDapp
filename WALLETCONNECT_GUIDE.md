# WalletConnect v2 Setup Guide

## Overview
This DApp now uses WalletConnect v2 for secure and universal wallet connections. WalletConnect v2 provides better performance, security, and supports a wider range of wallets compared to custom wallet integration approaches.

## Features
- 🔗 **Universal Wallet Support**: Connect with Trust Wallet, MetaMask, Coinbase Wallet, Rainbow, and 300+ other wallets
- 🔒 **Enhanced Security**: Improved encryption and authentication protocols
- 📱 **Cross-Platform**: Works seamlessly on mobile and desktop
- 🚀 **Better Performance**: Faster connection times and more reliable communication
- ⚡ **Real-time Updates**: Automatic session management and event handling

## Setup Instructions

### 1. Get Your WalletConnect Project ID
1. Visit [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Create a free account or sign in
3. Create a new project
4. Copy your Project ID
5. Replace the demo Project ID in `src/config/walletconnect.js`

### 2. Update Configuration
Create a `.env` file in the project root:
```bash
# Copy from .env.example and update with your values
cp .env.example .env
```

Then edit `.env`:
```bash
VITE_WALLETCONNECT_PROJECT_ID=your-actual-project-id-here
VITE_APP_NAME="Your DApp Name"
VITE_APP_DESCRIPTION="Your DApp Description" 
VITE_APP_URL="https://your-domain.com"
```

**Note**: The `.env` file is already in `.gitignore` to prevent accidentally committing your Project ID.

### 3. Customize Metadata
Update the metadata in `walletconnect.js` to match your DApp:
```javascript
metadata: {
  name: 'Your DApp Name',
  description: 'Your DApp Description',
  url: 'https://your-domain.com',
  icons: ['https://your-domain.com/icon.png']
}
```

## Architecture

### Components
- **WalletConnectV2.jsx**: Main wallet connection interface
- **ApproveUsdtV2.jsx**: USDT approval functionality with WalletConnect integration
- **useWalletConnect.js**: React hook for WalletConnect session management

### Flow
1. User clicks "Connect Wallet"
2. WalletConnect modal opens with QR code
3. User scans QR code with mobile wallet or selects desktop wallet
4. Wallet approves connection
5. Session is established and stored
6. DApp can now send transaction requests to wallet
7. User signs transactions in their wallet

## Supported Operations
- **Account Connection**: Request wallet addresses
- **Transaction Signing**: Sign USDT approval transactions
- **Session Management**: Automatic reconnection and session persistence
- **Network Switching**: Support for Tron mainnet and testnets

## Troubleshooting

### Common Issues
1. **"Project ID is required"**: Make sure you've set a valid Project ID from WalletConnect Cloud
2. **Connection timeout**: Ensure your wallet supports WalletConnect v2
3. **Transaction failures**: Verify you're on the correct Tron network

### Debugging
Enable debug mode by adding to your browser console:
```javascript
localStorage.setItem('WALLETCONNECT_DEBUG', true);
```

## Security Notes
- Never share your private keys
- Always verify transaction details before signing
- Use testnet for development and testing
- Keep your Project ID secure (it's not a secret but should be specific to your app)

## Migration from Custom Integration
The WalletConnect v2 integration replaces the previous custom Trust Wallet integration, providing:
- More reliable connections
- Broader wallet support
- Better error handling
- Standardized protocols
- Future-proof architecture

## Next Steps
1. Get your WalletConnect Project ID
2. Test on testnet first
3. Update metadata for your brand
4. Deploy to production
5. Monitor usage in WalletConnect Cloud dashboard
