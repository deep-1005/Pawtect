import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Heart, Building, DollarSign, CreditCard, CheckCircle, ArrowLeft, Wallet, AlertCircle } from 'lucide-react';
import { 
  connectWallet, 
  sendPayment, 
  getETHtoINRRate, 
  isMetaMaskInstalled,
  formatAddress,
  getCurrentNetwork,
  PLATFORM_WALLET 
} from '../utils/metamask.js';

const Donate = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const donationType = searchParams.get('type') || 'shelter';
  
  const [amount, setAmount] = useState('');
  const [selectedShelter, setSelectedShelter] = useState('');
  const [selectedDog, setSelectedDog] = useState('');
  const [shelters, setShelters] = useState([]);
  const [dogs, setDogs] = useState([]);
  const [donorInfo, setDonorInfo] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');
  
  // MetaMask states
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [ethRate, setEthRate] = useState(200000);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (donationType === 'shelter' || donationType === 'sponsor') {
      fetchShelters();
    }
    if (donationType === 'sponsor') {
      fetchDogs();
    }
    // Fetch ETH rate
    fetchETHRate();
  }, [donationType]);

  const fetchETHRate = async () => {
    try {
      const rate = await getETHtoINRRate();
      setEthRate(rate);
    } catch (error) {
      console.error('Error fetching ETH rate:', error);
    }
  };

  const fetchShelters = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/shelters');
      const data = await response.json();
      if (data.success) {
        setShelters(data.data);
      }
    } catch (error) {
      console.error('Error fetching shelters:', error);
    }
  };

  const fetchDogs = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/rescued-dogs');
      const data = await response.json();
      if (data.success) {
        setDogs(data.data.filter(dog => dog.status !== 'Adopted'));
      }
    } catch (error) {
      console.error('Error fetching dogs:', error);
    }
  };

  const handleConnectWallet = async () => {
    try {
      setError('');
      if (!isMetaMaskInstalled()) {
        setError('MetaMask is not installed. Please install MetaMask extension.');
        window.open('https://metamask.io/download/', '_blank');
        return;
      }

      const { address } = await connectWallet();
      setWalletAddress(address);
      setWalletConnected(true);
      
      // Get network info
      const network = await getCurrentNetwork();
      console.log('Connected to:', network.name);
    } catch (error) {
      console.error('Wallet connection error:', error);
      setError(error.message || 'Failed to connect wallet');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setProcessing(true);

    try {
      if (!walletConnected) {
        throw new Error('Please connect your wallet first');
      }

      // Determine recipient wallet
      let recipientWallet = PLATFORM_WALLET; // Default to platform
      
      if (donationType === 'shelter' && selectedShelter) {
        const shelter = shelters.find(s => s._id === selectedShelter);
        if (shelter?.funding?.walletAddress) {
          recipientWallet = shelter.funding.walletAddress;
        } else {
          setError('Selected shelter does not have a wallet address configured. Please contact the shelter.');
          setProcessing(false);
          return;
        }
      }

      // Send payment via MetaMask
      const result = await sendPayment(recipientWallet, parseFloat(amount), ethRate);
      
      console.log('Payment successful:', result);
      setTransactionHash(result.hash);
      
      // Save donation record to backend
      await saveDonationRecord(result);
      
      setShowSuccess(true);
    } catch (error) {
      console.error('Payment error:', error);
      setError(error.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const saveDonationRecord = async (transactionData) => {
    try {
      const donationData = {
        type: donationType,
        amount: parseFloat(amount),
        amountETH: transactionData.amountETH,
        shelter: selectedShelter || null,
        dog: selectedDog || null,
        donor: donorInfo,
        transactionHash: transactionData.hash,
        fromWallet: transactionData.from,
        toWallet: transactionData.to,
        blockNumber: transactionData.blockNumber,
        paymentMethod: 'crypto'
      };

      const response = await fetch('http://localhost:5000/api/donations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(donationData)
      });

      const data = await response.json();
      console.log('Donation recorded:', data);
    } catch (error) {
      console.error('Error saving donation record:', error);
      // Don't throw - payment was successful even if record fails
    }
  };

  const getDonationTitle = () => {
    switch (donationType) {
      case 'shelter':
        return '🏠 Donate to Shelters';
      case 'platform':
        return '💚 Support Pawtect Platform';
      case 'sponsor':
        return '🐾 Sponsor a Dog';
      default:
        return 'Make a Donation';
    }
  };

  const getDonationDescription = () => {
    switch (donationType) {
      case 'shelter':
        return 'Help shelters provide food, medical care, and safe housing for rescued animals.';
      case 'platform':
        return 'Support Pawtect in connecting more animals with loving homes and building a better future for street animals.';
      case 'sponsor':
        return 'Become a monthly sponsor and make a lasting impact on a rescued dog\'s life.';
      default:
        return '';
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful! 💚</h2>
          <p className="text-gray-600 mb-4">
            Your generous donation of <strong>₹{amount}</strong> has been processed successfully!
          </p>
          
          {/* Transaction Details */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-xs font-semibold text-blue-900 mb-2">Transaction Details</p>
            <div className="space-y-1">
              <p className="text-xs text-blue-800">
                <strong>Tx Hash:</strong> {transactionHash ? formatAddress(transactionHash) : 'N/A'}
              </p>
              <p className="text-xs text-blue-800">
                <strong>Amount (ETH):</strong> ~{(parseFloat(amount) / ethRate).toFixed(6)} ETH
              </p>
              {transactionHash && (
                <a
                  href={`https://etherscan.io/tx/${transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 underline block mt-2"
                >
                  View on Etherscan →
                </a>
              )}
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-800">
              Thank you for supporting the welfare of rescued animals! 🐾
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => {
                setShowSuccess(false);
                setAmount('');
                setTransactionHash('');
                setDonorInfo({ name: '', email: '', phone: '', message: '' });
              }}
              className="flex-1 border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Donate Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const amountInETH = amount ? (parseFloat(amount) / ethRate).toFixed(6) : '0';

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{getDonationTitle()}</h1>
          <p className="text-gray-600">{getDonationDescription()}</p>
        </div>

        {/* Donation Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
          {/* Quick Amount Selection */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Select Amount</h3>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-4">
              {['500', '1000', '2000', '5000', '10000'].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmount(amt)}
                  className={`py-3 px-4 rounded-lg font-semibold transition ${
                    amount === amt
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Or enter custom amount"
                required
                min="100"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Shelter Selection (for shelter donations) */}
          {donationType === 'shelter' && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                <Building className="inline h-5 w-5 mr-2" />
                Select Shelter
              </h3>
              <select
                value={selectedShelter}
                onChange={(e) => setSelectedShelter(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">-- Choose a shelter to support --</option>
                {shelters.map((shelter) => (
                  <option key={shelter._id} value={shelter._id}>
                    {shelter.name} - {shelter.address?.city}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Dog Selection (for sponsorship) */}
          {donationType === 'sponsor' && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                <Heart className="inline h-5 w-5 mr-2" />
                Select Dog to Sponsor
              </h3>
              <select
                value={selectedDog}
                onChange={(e) => setSelectedDog(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">-- Choose a dog to sponsor --</option>
                {dogs.map((dog) => (
                  <option key={dog._id} value={dog._id}>
                    {dog.name || `Dog ${dog.paw_id}`} - {dog.breed || dog.type}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-600 mt-2">
                Monthly sponsorship helps cover food, medical care, and shelter costs.
              </p>
            </div>
          )}

          {/* Donor Information */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Your Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={donorInfo.name}
                  onChange={(e) => setDonorInfo({ ...donorInfo, name: e.target.value })}
                  required
                  placeholder="Your name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={donorInfo.email}
                  onChange={(e) => setDonorInfo({ ...donorInfo, email: e.target.value })}
                  required
                  placeholder="your@email.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={donorInfo.phone}
                  onChange={(e) => setDonorInfo({ ...donorInfo, phone: e.target.value })}
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  value={donorInfo.message}
                  onChange={(e) => setDonorInfo({ ...donorInfo, message: e.target.value })}
                  rows="3"
                  placeholder="Leave a message..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* MetaMask Connection & Payment */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              <Wallet className="inline h-5 w-5 mr-2" />
              Payment Method
            </h3>
            
            {!walletConnected ? (
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <Wallet className="h-8 w-8 text-orange-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">Connect Your Wallet</h4>
                    <p className="text-sm text-gray-700 mb-4">
                      We accept crypto payments via MetaMask. Click below to connect your wallet and complete the donation.
                    </p>
                    <button
                      type="button"
                      onClick={handleConnectWallet}
                      className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-yellow-600 transition flex items-center gap-2 shadow-lg"
                    >
                      <Wallet className="h-5 w-5" />
                      Connect MetaMask
                    </button>
                    {!isMetaMaskInstalled() && (
                      <p className="text-xs text-gray-600 mt-2">
                        Don't have MetaMask? <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">Download here</a>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-600 p-2 rounded-full">
                      <Wallet className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Wallet Connected</p>
                      <p className="text-sm text-gray-600">{formatAddress(walletAddress)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setWalletConnected(false);
                      setWalletAddress('');
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Disconnect
                  </button>
                </div>
                
                {/* Conversion Info */}
                {amount && (
                  <div className="bg-white border border-green-200 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Amount (INR):</span>
                      <span className="font-semibold">₹{amount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Amount (ETH):</span>
                      <span className="font-semibold">~{amountInETH} ETH</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 pt-2 border-t border-gray-200">
                      <span>Exchange Rate:</span>
                      <span>1 ETH = ₹{ethRate.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-900">Payment Error</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!walletConnected || !amount || processing || (donationType === 'shelter' && !selectedShelter) || (donationType === 'sponsor' && !selectedDog)}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-lg font-bold text-lg hover:from-green-700 hover:to-green-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
          >
            {processing ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                Processing...
              </>
            ) : (
              <>
                <Heart className="h-6 w-6" />
                {walletConnected ? `Pay ${amountInETH} ETH (₹${amount || '0'})` : 'Connect Wallet to Donate'}
              </>
            )}
          </button>

          {/* Info Note */}
          <p className="text-xs text-gray-500 text-center mt-4">
            🔒 Secure crypto payments powered by Ethereum blockchain via MetaMask
          </p>
        </form>
      </div>
    </div>
  );
};

export default Donate;
