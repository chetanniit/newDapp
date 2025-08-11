# Tron USDT DApp

A React.js decentralized application (DApp) for approving USDT transactions on the Tron blockchain. This DApp uses **WalletConnect v2** for universal wallet connectivity, allowing users to connect their favorite wallets, check USDT balances, and approve USDT spending for specific addresses.

## Features

- 🔗 **Universal Wallet Connection**: Connect with 300+ wallets via WalletConnect v2
- 💰 **Balance Display**: View your USDT (TRC20) balance
- ✅ **USDT Approval**: Approve USDT spending for specific addresses
- 🔍 **Allowance Tracking**: Check current allowances for spender addresses
- 🌟 **Modern UI**: Beautiful gradient design with responsive layout
- 🔒 **Enhanced Security**: Transaction signing with WalletConnect v2 protocol
- 📱 **Cross-Platform**: Works on mobile and desktop seamlessly

## Supported Wallets

### Mobile Wallets
- ✅ **Trust Wallet** - Full support via WalletConnect
- ✅ **MetaMask Mobile** - Complete functionality
- ✅ **Coinbase Wallet** - Native support
- ✅ **Rainbow Wallet** - Full compatibility
- ✅ **1inch Wallet** - Supported
- ✅ **300+ other wallets** - Via WalletConnect protocol

### Desktop Wallets
- ✅ **TronLink Extension** - Full native support
- ✅ **MetaMask Extension** - Complete functionality
- ✅ **Any WalletConnect compatible wallet**

## Prerequisites

Before running this DApp, make sure you have:

1. **Any WalletConnect v2 compatible wallet** (Trust Wallet, MetaMask, etc.)
2. **Node.js** (version 16 or higher)
3. **npm** or **yarn** package manager
4. **WalletConnect Project ID** (free from [WalletConnect Cloud](https://cloud.walletconnect.com/))

## Quick Setup

### 1. WalletConnect Configuration
1. Visit [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Create a free account and new project
3. Copy your Project ID
4. Update `src/config/walletconnect.js`:
   ```javascript
   const PROJECT_ID = 'your-project-id-here'; // Replace with your ID
   ```

### 2. Installation

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

## 🌐 Deployment on Netlify

Your DApp is ready for deployment! The build has been successfully created.

### Quick Deploy Options

#### Option 1: Drag & Drop (Fastest)

1. **Locate your build folder**: `d:\TronApp\newDapp\dist`
2. **Go to Netlify**: Visit [netlify.com](https://netlify.com) and sign up/login
3. **Drag & Drop**: Simply drag the entire `dist` folder to the Netlify dashboard
4. **Done!** Your DApp will be live in seconds with a URL like `https://amazing-name-123456.netlify.app`

#### Option 2: Git Deployment (Recommended for updates)

1. **Initialize Git repository**:
   ```bash
   cd "d:\TronApp\newDapp"
   git init
   git add .
   git commit -m "Initial commit: Tron USDT DApp"
   ```

2. **Create GitHub repository**:
   - Go to [GitHub](https://github.com) and create a new repository
   - Copy the repository URL

3. **Push to GitHub**:
   ```bash
   git branch -M main
   git remote add origin https://github.com/yourusername/tron-usdt-dapp.git
   git push -u origin main
   ```

4. **Connect to Netlify**:
   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Choose GitHub and select your repository
   - Build settings are automatically detected from `netlify.toml`
   - Click "Deploy site"

#### Option 3: Netlify CLI

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy**:
   ```bash
   cd "d:\TronApp\newDapp"
   netlify deploy --prod --dir=dist
   ```

### Build Configuration

The project includes optimized build configuration:

- **Build Output**: `dist/` folder
- **SPA Routing**: Configured with `_redirects` for client-side routing
- **Security Headers**: HTTPS, XSS protection, content security
- **Asset Optimization**: Minified CSS/JS, compressed images
- **Performance**: Chunked bundles, cache optimization

### Environment Variables (Optional)

For production customization, you can set these in Netlify dashboard:

```
VITE_TRON_NETWORK=mainnet
VITE_APP_NAME=My Tron DApp
VITE_TRONGRID_API_KEY=your_api_key_here
```

### Post-Deployment Checklist

✅ **Test wallet connection** on mobile and desktop
✅ **Verify network settings** (mainnet/testnet)
✅ **Check USDT contract interaction**
✅ **Test QR code functionality** for mobile wallets
✅ **Validate responsive design** on different screen sizes

## Support

If you encounter any issues or have questions, please:
1. Check the troubleshooting section
2. Review the Tron documentation
3. Open an issue in the repository

---

**Disclaimer**: This is a demonstration DApp. Always review and audit smart contract interactions before using in production with significant amounts.
