# Trust Wallet Testing Guide

This guide explains how to test the Tron USDT DApp with Trust Wallet.

## Setup for Trust Wallet Testing

### 1. Deploy the DApp

Since Trust Wallet's DApp browser requires HTTPS for security, you'll need to deploy the DApp to a public URL. Here are some options:

#### Option A: Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Build the project
npm run build

# Deploy to Vercel
vercel --prod
```

#### Option B: Netlify
```bash
# Build the project
npm run build

# Drag and drop the 'dist' folder to Netlify
```

#### Option C: GitHub Pages
1. Push your code to GitHub
2. Enable GitHub Pages in repository settings
3. Select the `gh-pages` branch or `dist` folder

### 2. Testing with Trust Wallet

1. **Install Trust Wallet** on your mobile device
2. **Add Tron network** if not already added
3. **Get some test USDT** on Tron mainnet or use Shasta testnet
4. **Open DApp browser** in Trust Wallet
5. **Navigate to your deployed DApp URL**
6. **Test the connection and approval flow**

### 3. Trust Wallet Specific Considerations

#### Address Entry
- Trust Wallet users will need to manually enter their Tron address
- The address should start with 'T' and be 34 characters long
- Example: `TYWnLjqiNzLqSDGWdD5xjHnqx5VjCEuQcY`

#### Transaction Signing
- Trust Wallet will show transaction details for review
- Users must carefully verify:
  - Contract address (USDT: TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t)
  - Spender address
  - Approval amount
  - Network fees

#### Network Configuration
Make sure Trust Wallet is configured for:
- **Mainnet**: For real USDT transactions
- **Shasta Testnet**: For testing (update constants.js accordingly)

### 4. Troubleshooting Trust Wallet Issues

#### Common Issues:

1. **"Wallet not detected"**
   - Ensure you're using Trust Wallet's DApp browser
   - Try refreshing the page
   - Check if Tron network is selected

2. **"Transaction failed"**
   - Verify sufficient TRX balance for gas fees
   - Check network connectivity
   - Ensure contract address is correct

3. **"Address not valid"**
   - Tron addresses must start with 'T'
   - Must be exactly 34 characters
   - Copy address carefully from Trust Wallet

#### Debug Steps:

1. **Check Console Logs**
   - Open browser dev tools in Trust Wallet
   - Look for JavaScript errors
   - Check network requests

2. **Verify Network**
   - Confirm Tron mainnet is selected
   - Check if custom RPC is needed

3. **Test with Small Amounts**
   - Always test with minimal USDT amounts first
   - Verify transaction on Tronscan

### 5. Testing Checklist

- [ ] DApp loads correctly in Trust Wallet browser
- [ ] Wallet detection works
- [ ] Address entry accepts valid Tron address
- [ ] USDT balance loads correctly
- [ ] Spender address validation works
- [ ] Approval amount input functions
- [ ] Transaction builds without errors
- [ ] Trust Wallet shows transaction details
- [ ] Transaction can be signed and broadcast
- [ ] Transaction appears on Tronscan
- [ ] Allowance updates after confirmation

### 6. Production Considerations

When deploying for production with Trust Wallet support:

1. **Error Handling**: Implement robust error handling for Trust Wallet specific issues
2. **User Guidance**: Provide clear instructions for Trust Wallet users
3. **Fallback Options**: Consider alternative wallet options
4. **Testing**: Thoroughly test on both mainnet and testnet
5. **Security**: Always validate user inputs and transaction parameters

### 7. Alternative Testing Methods

If Trust Wallet testing is challenging, consider:

1. **TronLink**: Primary wallet with full native support
2. **Browser Extension Testing**: Use TronLink for development
3. **Mobile Testing**: Test responsive design on mobile devices
4. **Cross-Platform**: Ensure compatibility across different platforms

## Deployment URLs

Remember to update these in your documentation once deployed:

- **Production**: `https://your-app.vercel.app`
- **Staging**: `https://staging-your-app.vercel.app`
- **GitHub Pages**: `https://yourusername.github.io/repo-name`

## Support

For Trust Wallet specific issues:
- Check Trust Wallet documentation
- Visit Trust Wallet community forums
- Test with TronLink as alternative
