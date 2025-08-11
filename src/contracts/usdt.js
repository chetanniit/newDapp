import { USDT_CONTRACT_ADDRESS, USDT_ABI } from '../config/constants.js';

export class UsdtContract {
  constructor(tronWeb, walletType = 'tronlink') {
    this.tronWeb = tronWeb;
    this.walletType = walletType;
    
    // Validate TronWeb instance
    if (!tronWeb) {
      throw new Error('TronWeb instance is required');
    }
    
    // We'll use triggerSmartContract instead of contract instance for better compatibility
  }

  async getBalance(address) {
    try {
      // Validate address
      if (!this.isValidTronAddress(address)) {
        throw new Error('Invalid address format');
      }

      // First, validate that the contract exists
      try {
        const contractInfo = await this.tronWeb.trx.getContract(USDT_CONTRACT_ADDRESS);
        if (!contractInfo || !contractInfo.contract_address) {
          throw new Error(`Contract does not exist at address: ${USDT_CONTRACT_ADDRESS}`);
        }
      } catch (contractError) {
        console.error('Contract validation error:', contractError);
        throw new Error(`Invalid or non-existent contract: ${USDT_CONTRACT_ADDRESS}. Please check the contract address for the current network.`);
      }

      const functionSelector = 'balanceOf(address)';
      const parameter = [{ type: 'address', value: address }];

      const result = await this.tronWeb.transactionBuilder.triggerSmartContract(
        USDT_CONTRACT_ADDRESS,
        functionSelector,
        {},
        parameter
      );

      if (result.result && result.result.result && result.constant_result && result.constant_result[0]) {
        // Convert hex result to number and then to USDT (6 decimals)
        const balanceHex = result.constant_result[0];
        const balanceNum = this.tronWeb.toBigNumber('0x' + balanceHex);
        const balance = balanceNum.div(1000000).toString();
        return balance;
      }
      
      return '0';
    } catch (error) {
      console.error('Error getting balance:', error);
      return '0'; // Return 0 instead of throwing to prevent UI crashes
    }
  }

  async getAllowance(owner, spender) {
    try {
      // Validate addresses
      if (!this.isValidTronAddress(owner)) {
        throw new Error('Invalid owner address format');
      }
      if (!this.isValidTronAddress(spender)) {
        throw new Error('Invalid spender address format');
      }

      const functionSelector = 'allowance(address,address)';
      const parameter = [
        { type: 'address', value: owner },
        { type: 'address', value: spender }
      ];

      const result = await this.tronWeb.transactionBuilder.triggerSmartContract(
        USDT_CONTRACT_ADDRESS,
        functionSelector,
        {},
        parameter
      );

      if (result.result && result.result.result && result.constant_result && result.constant_result[0]) {
        // Convert hex result to number and then to USDT (6 decimals)
        const allowanceHex = result.constant_result[0];
        const allowanceNum = this.tronWeb.toBigNumber('0x' + allowanceHex);
        const allowance = allowanceNum.div(1000000).toString();
        return allowance;
      }
      
      return '0';
    } catch (error) {
      console.error('Error getting allowance:', error);
      return '0'; // Return 0 instead of throwing to prevent UI crashes
    }
  }

  async approve(spender, amount, userAddress) {
    try {
      // Validate inputs
      if (!spender || !amount || !userAddress) {
        throw new Error('Missing required parameters: spender, amount, or userAddress');
      }

      // Validate Tron address format
      if (!this.isValidTronAddress(spender)) {
        throw new Error('Invalid spender address format');
      }

      if (!this.isValidTronAddress(userAddress)) {
        throw new Error('Invalid user address format');
      }

      // Check if user account exists and is activated
      await this.validateUserAccount(userAddress);

      // Convert amount to proper format (6 decimals for USDT)
      const amountInSmallestUnit = (parseFloat(amount) * 1000000).toString();
      
      console.log('Approval parameters:', {
        spender,
        amount,
        amountInSmallestUnit,
        userAddress,
        walletType: this.walletType
      });

      // Use TronWeb's triggerSmartContract method for better compatibility
      const functionSelector = 'approve(address,uint256)';
      const parameter = [
        { type: 'address', value: spender },
        { type: 'uint256', value: amountInSmallestUnit }
      ];

      const options = {
        feeLimit: 100000000, // 100 TRX
        callValue: 0
      };

      const transaction = await this.tronWeb.transactionBuilder.triggerSmartContract(
        USDT_CONTRACT_ADDRESS,
        functionSelector,
        options,
        parameter,
        userAddress
      );

      if (!transaction.result || !transaction.result.result) {
        const errorMsg = transaction.result?.message || 'Unknown error';
        // Decode hex error message if present
        const decodedError = this.decodeHexError(errorMsg);
        throw new Error('Failed to build transaction: ' + decodedError);
      }

      // Sign and broadcast the transaction
      const signedTransaction = await this.tronWeb.trx.sign(transaction.transaction);
      const broadcastResult = await this.tronWeb.trx.sendRawTransaction(signedTransaction);

      if (broadcastResult.result) {
        return broadcastResult.txid;
      } else {
        const errorMsg = broadcastResult.message || 'Unknown error';
        // Decode hex error message if present
        const decodedError = this.decodeHexError(errorMsg);
        throw new Error('Transaction broadcast failed: ' + decodedError);
      }

    } catch (error) {
      console.error('Error in approve method:', error);
      
      // Provide user-friendly error messages
      if (error.message.includes('account') && error.message.includes('does not exist')) {
        throw new Error('Your account needs to be activated on the Tron network. Please receive some TRX first to activate your account.');
      } else if (error.message.includes('balance is not sufficient')) {
        throw new Error('Insufficient TRX balance for transaction fees. Please add some TRX to your wallet.');
      } else if (error.message.includes('energy')) {
        throw new Error('Insufficient energy for transaction. Please freeze some TRX for energy or increase fee limit.');
      }
      
      throw error;
    }
  }

  // Helper method to validate user account exists and is activated
  async validateUserAccount(address) {
    try {
      const account = await this.tronWeb.trx.getAccount(address);
      
      if (!account || Object.keys(account).length === 0) {
        throw new Error('Account does not exist on Tron network. Please activate your account by receiving some TRX first.');
      }
      
      // Check if account has enough TRX for transaction fees
      const balance = account.balance || 0;
      const minBalance = 1000000; // 1 TRX minimum for fees
      
      if (balance < minBalance) {
        throw new Error(`Insufficient TRX balance for transaction fees. Current balance: ${balance / 1000000} TRX. Minimum required: 1 TRX.`);
      }
      
      return true;
    } catch (error) {
      console.error('Account validation error:', error);
      throw error;
    }
  }

  // Helper method to decode hex error messages
  decodeHexError(hexMessage) {
    try {
      if (typeof hexMessage === 'string' && hexMessage.match(/^[0-9a-fA-F]+$/)) {
        // Try to decode as hex
        const buffer = Buffer.from(hexMessage, 'hex');
        const decoded = buffer.toString('utf8');
        
        // Only return decoded if it looks like readable text
        if (decoded.match(/^[\x20-\x7E]+$/)) {
          return decoded;
        }
      }
      return hexMessage;
    } catch (error) {
      return hexMessage;
    }
  }

  // Helper method to validate Tron addresses
  // Validate TronWeb instance and contract
  async validateContract() {
    try {
      if (!this.tronWeb) {
        throw new Error('TronWeb instance not available');
      }

      // Check if contract exists
      const contractInfo = await this.tronWeb.trx.getContract(USDT_CONTRACT_ADDRESS);
      if (!contractInfo || !contractInfo.contract_address) {
        throw new Error(`Contract not found at address: ${USDT_CONTRACT_ADDRESS}`);
      }

      return true;
    } catch (error) {
      console.error('Contract validation failed:', error);
      throw new Error(`Contract validation failed: ${error.message}`);
    }
  }

  isValidTronAddress(address) {
    if (!address || typeof address !== 'string') {
      return false;
    }
    // Tron addresses should start with 'T' and be 34 characters long
    return address.startsWith('T') && address.length === 34;
  }
}
