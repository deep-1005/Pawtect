# MetaMask Crypto Payment Integration - Setup Guide

## ✅ What's Been Implemented

### Frontend Integration
1. **ethers.js library** installed for Web3 interactions
2. **MetaMask utility** (`src/utils/metamask.js`) with functions for:
   - Wallet connection
   - Payment processing
   - ETH/INR conversion
   - Transaction verification
3. **Updated Donate page** with:
   - Connect Wallet button
   - Real-time ETH conversion display
   - Transaction processing
   - Success screen with blockchain details

### Backend Integration
1. **Donation model** (`models/Donation.js`) tracking:
   - Donation details (amount, type, donor info)
   - Blockchain data (transaction hash, wallet addresses, block number)
   - Payment method and status
2. **Donation controller** (`controllers/donationController.js`) with endpoints:
   - POST /api/donations - Record new donation
   - GET /api/donations - List all donations
   - GET /api/donations/stats - Get donation statistics
   - GET /api/donations/transaction/:hash - Get by transaction hash
3. **Updated Shelter model** with `walletAddress` field for receiving crypto

## 🔧 Setup Instructions

### 1. Install MetaMask
- Users need MetaMask browser extension: https://metamask.io/download/
- Available for Chrome, Firefox, Brave, Edge

### 2. Configure Platform Wallet
Edit `frontend/src/utils/metamask.js` line 4:
```javascript
export const PLATFORM_WALLET = '0xYourActualWalletAddress';
```
Replace with your Ethereum wallet address for receiving platform donations.

### 3. Configure Shelter Wallets
For each shelter to receive crypto donations, add their wallet address:

**Option A: Through Database**
```javascript
db.shelters.updateOne(
  { _id: ObjectId("shelter_id_here") },
  { $set: { "funding.walletAddress": "0xShelterWalletAddress" } }
)
```

**Option B: Through Admin Interface** (TODO - add to shelter settings page)

### 4. Test Network Setup (For Development)
1. Switch MetaMask to **Sepolia Testnet** or **Goerli Testnet**
2. Get free test ETH from faucets:
   - Sepolia: https://sepoliafaucet.com/
   - Goerli: https://goerlifaucet.com/

### 5. Production Network
For real payments, use:
- **Ethereum Mainnet** (most popular, higher gas fees)
- **Polygon Mainnet** (lower fees, faster - recommended for donations)
- **BSC** (Binance Smart Chain - very low fees)

To switch networks, update connection code or add network selection UI.

## 💰 How It Works

### User Flow
1. User fills donation form
2. Clicks "Connect MetaMask"
3. MetaMask popup opens → User authorizes connection
4. Amount displays in both INR and ETH
5. User clicks "Pay" button
6. MetaMask prompts for transaction confirmation
7. User confirms → Payment sent on blockchain
8. Success screen shows transaction hash with Etherscan link

### Backend Flow
1. Frontend sends transaction details to backend
2. Backend creates Donation record with:
   - Transaction hash (verifiable on blockchain)
   - Wallet addresses
   - Block number
   - Donor information
3. If shelter donation, updates shelter's `funding.donationsReceived`
4. Returns confirmation to frontend

## 🔍 Verification

Users can verify their donation on blockchain:
- **Etherscan** (Ethereum): https://etherscan.io/tx/TRANSACTION_HASH
- **PolygonScan** (Polygon): https://polygonscan.com/tx/TRANSACTION_HASH
- 100% transparent and immutable!

## 📊 Features

### Implemented
✅ MetaMask wallet connection
✅ ETH to INR conversion (live rates from CoinGecko API)
✅ Direct wallet-to-wallet transfers
✅ Transaction tracking on blockchain
✅ Donation record storage in database
✅ Shelter donation tracking
✅ Platform & sponsorship donations

### Future Enhancements (Optional)
- [ ] Multi-chain support (Polygon, BSC)
- [ ] WalletConnect (for mobile wallets)
- [ ] Smart contract escrow
- [ ] Automatic tax receipts
- [ ] Recurring donations (subscription model)
- [ ] Token rewards for donors (NFTs/loyalty points)

## 🚨 Important Security Notes

1. **NEVER commit private keys** to git
2. **Validate all transactions** on backend
3. **Use environment variables** for sensitive data
4. **Rate limit** donation endpoint to prevent spam
5. **Add CAPTCHA** for production (prevent bot attacks)
6. **Verify wallet ownership** before large donations

## 🧪 Testing Checklist

Before going live:
- [ ] Test on testnet (Sepolia/Goerli)
- [ ] Verify donations appear in database
- [ ] Check shelter funding updates correctly
- [ ] Test with small amounts first
- [ ] Verify transaction on blockchain explorer
- [ ] Test error cases (insufficient funds, rejected tx)
- [ ] Check mobile MetaMask app compatibility

## 💡 Cost Comparison

**Traditional Payment Gateway (Razorpay/Stripe)**
- Transaction fee: 2-3%
- Settlement: 2-7 days
- Chargeback risk: Yes
- International: High fees

**Crypto (MetaMask)**
- Transaction fee: Gas fees only (~$1-10 depending on network)
- Settlement: Instant (10-30 seconds)
- Chargeback risk: No (immutable)
- International: Same cost worldwide

**Recommendation for Donations:**
Use **Polygon network** for best user experience:
- Gas fees: ~$0.01-0.10 per transaction
- Speed: 2-3 seconds
- Easy MetaMask setup

## 📞 Support

If donors have issues:
1. Check MetaMask is installed and unlocked
2. Ensure sufficient ETH balance (+ gas fees)
3. Switch to correct network
4. Try refreshing page and reconnecting
5. Check transaction on Etherscan for status

## 🎉 Benefits for Pawtect

- **Lower fees** = More money to animals
- **Instant settlement** = Better cash flow
- **Global reach** = International donors easily
- **Transparency** = Donors can verify on blockchain
- **Modern** = Appeals to crypto-savvy donors
- **No KYC hassles** = Start accepting immediately

---

**Note:** Keep traditional payment options (UPI, cards) for users without crypto. MetaMask is an additional option, not replacement!
