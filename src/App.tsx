import React, { useState, useEffect } from 'react';
import { Wallet } from 'lucide-react';
import { ethers } from 'ethers';
import ProductCard from './components/ProductCard';
import PurchaseModal from './components/PurchaseModal';
import { getContract } from './contracts/JengawizeStore';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
}

function App() {
  const [connected, setConnected] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      console.log('Loading products...');
      if (!window.ethereum) {
        throw new Error('No ethereum provider found');
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = getContract(provider);
      
      // Load products from the contract
      const loadedProducts: Product[] = [];
      for (let i = 1; i <= 5; i++) {
        console.log(`Loading product ${i}...`);
        const product = await contract.getProduct(i);
        console.log('Product loaded:', product);
        
        if (product.id.toString() !== '0') {  // Only add if product exists
          loadedProducts.push({
            id: Number(product.id),
            name: product.name,
            price: Number(ethers.formatEther(product.price)),
            image: `/assets/images/${product.name.toLowerCase()}.jpg`,
            description: `High-quality ${product.name.toLowerCase()} for construction`
          });
        }
      }
      console.log('All products loaded:', loadedProducts);
      setProducts(loadedProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      // Fallback to static products if contract interaction fails
      setProducts([
        {
          id: 1,
          name: "Wood",
          price: 0.01,
          image: "/assets/images/wood.jpg",
          description: "High-quality construction wood"
        },
        {
          id: 2,
          name: "Sand",
          price: 0.005,
          image: "/assets/images/sand.jpg",
          description: "Fine construction sand"
        },
        {
          id: 3,
          name: "Stone",
          price: 0.015,
          image: "/assets/images/stone.jpg",
          description: "Durable construction stone"
        },
        {
          id: 4,
          name: "Cement",
          price: 0.02,
          image: "/assets/images/cement.jpg",
          description: "Premium quality cement"
        },
        {
          id: 5,
          name: "Steel",
          price: 0.03,
          image: "/assets/images/steel.jpg",
          description: "Industrial grade steel"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
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
    if (!selectedProduct || !connected || !window.ethereum) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = getContract(signer);

      // Convert price to wei
      const priceInWei = ethers.parseEther(selectedProduct.price.toString());

      // Send transaction
      const tx = await contract.purchaseProduct(selectedProduct.id, {
        value: priceInWei
      });

      // Wait for transaction to be mined
      await tx.wait();

      alert(`Purchase successful! You bought ${selectedProduct.name}`);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error processing purchase:', error);
      alert('Error processing purchase. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <img src="/assets/images/jengawize.png" alt="Jengawize Logo" className="h-12 w-auto" />
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
          {products.map((product) => (
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
