import { ethers } from 'ethers';

export const JENGAWIZE_STORE_ABI = [
    "function purchaseProduct(uint256 _productId) external payable",
    "function getProduct(uint256 _productId) external view returns (uint256 id, string memory name, uint256 price, bool isActive)",
    "function products(uint256) external view returns (uint256 id, string memory name, uint256 price, bool isActive)",
    "event ProductPurchased(address indexed buyer, uint256 indexed productId, uint256 amount, uint256 timestamp)"
];

export const JENGAWIZE_STORE_ADDRESS = "0x8Ad48B3394729D5Af73a02548B2F3297b232EDe3";

export interface Product {
    id: number;
    name: string;
    price: string;
    isActive: boolean;
}

export const getContract = (providerOrSigner: ethers.Provider | ethers.Signer) => {
    return new ethers.Contract(
        JENGAWIZE_STORE_ADDRESS,
        JENGAWIZE_STORE_ABI,
        providerOrSigner
    );
}; 