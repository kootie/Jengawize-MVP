import React, { useState } from 'react';
import { Wallet } from 'lucide-react';
import ProductCard from './components/ProductCard';
import PurchaseModal from './components/PurchaseModal';
import itemsData from './data/items.json';
import Logo from './assets/images/jengawize.png'; // Import logo

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
}

function App() {
  const [connected, setConnected] = useState(false);
  const [account, setAccount] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        setAccount(accounts[0]);
        setConnected(true);
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
      alert('Please install MetaMask to use this application');
    }
  };

  const handlePurchase = (product: Product) => {
    if (!connected) {
      alert('Please connect your wallet first');
      return;
    }
    setSelectedProduct(product);
  };

  const confirmPurchase = async () => {
    if (!selectedProduct || !connected) return;

    try {
      alert(`Purchase successful! You bought ${selectedProduct.name}`);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error processing purchase:', error);
      alert('Error processing purchase. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <img src={Logo} alt="Jengawize Logo" className="h-12 w-auto" />
            <button
              onClick={connectWallet}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                connected
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Wallet size={20} />
              {connected ? 'Connected' : 'Connect Wallet'}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {itemsData.items.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onPurchase={handlePurchase}
            />
          ))}
        </div>
      </main>

      <PurchaseModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onConfirm={confirmPurchase}
      />
    </div>
  );
}

export default App;
