import { ethers } from 'ethers';

// Platform wallet address for donations
export const PLATFORM_WALLET = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb2';

/**
 * Check if MetaMask is installed
 */
export const isMetaMaskInstalled = () => {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
};

/**
 * Connect to MetaMask wallet
 */
export const connectWallet = async () => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed. Please install MetaMask extension.');
  }

  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = await provider.send('eth_requestAccounts', []);
    
    if (accounts.length === 0) {
      throw new Error('No accounts found. Please unlock MetaMask.');
    }

    return {
      address: accounts[0],
      provider
    };
  } catch (error) {
    if (error.code === 4001) {
      throw new Error('User rejected the connection request');
    }
    throw error;
  }
};

/**
 * Get current network information
 */
export const getCurrentNetwork = async () => {
  if (!isMetaMaskInstalled()) {
    return null;
  }

  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const network = await provider.getNetwork();
    return {
      chainId: network.chainId,
      name: network.name
    };
  } catch (error) {
    console.error('Error getting network:', error);
    return null;
  }
};

/**
 * Get ETH to INR conversion rate from CoinGecko
 */
export const getETHtoINRRate = async () => {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=inr'
    );
    const data = await response.json();
    return data.ethereum.inr;
  } catch (error) {
    console.error('Error fetching ETH rate:', error);
    // Fallback rate (approximate)
    return 180000;
  }
};

/**
 * Send payment via MetaMask
 */
export const sendPayment = async (toAddress, amountInINR) => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }

  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    // Get ETH conversion rate
    const ethRate = await getETHtoINRRate();
    const amountInETH = (amountInINR / ethRate).toFixed(6);

    // Create transaction
    const tx = await signer.sendTransaction({
      to: toAddress,
      value: ethers.utils.parseEther(amountInETH)
    });

    // Wait for confirmation
    const receipt = await tx.wait();

    return {
      success: true,
      transactionHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      amountInETH,
      ethRate
    };
  } catch (error) {
    if (error.code === 4001) {
      throw new Error('Transaction rejected by user');
    }
    throw error;
  }
};

/**
 * Format wallet address for display
 */
export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

/**
 * Listen for account changes
 */
export const onAccountChanged = (callback) => {
  if (!isMetaMaskInstalled()) return;

  window.ethereum.on('accountsChanged', (accounts) => {
    if (accounts.length === 0) {
      callback(null);
    } else {
      callback(accounts[0]);
    }
  });
};

/**
 * Listen for network changes
 */
export const onNetworkChanged = (callback) => {
  if (!isMetaMaskInstalled()) return;

  window.ethereum.on('chainChanged', (chainId) => {
    callback(parseInt(chainId, 16));
  });
};

/**
 * Request network switch to Ethereum mainnet
 */
export const switchToMainnet = async () => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x1' }] // Mainnet
    });
  } catch (error) {
    if (error.code === 4902) {
      throw new Error('Ethereum mainnet is not available in your MetaMask');
    }
    throw error;
  }
};
