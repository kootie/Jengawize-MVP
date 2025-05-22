// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract JengawizeStore is ReentrancyGuard, Ownable {
    // Product structure
    struct Product {
        uint256 id;
        string name;
        uint256 price; // Price in wei
        bool isActive;
    }

    // Mapping of product ID to Product
    mapping(uint256 => Product) public products;
    
    // Events
    event ProductPurchased(
        address indexed buyer,
        uint256 indexed productId,
        uint256 amount,
        uint256 timestamp
    );
    
    event ProductAdded(
        uint256 indexed productId,
        string name,
        uint256 price
    );
    
    event ProductUpdated(
        uint256 indexed productId,
        string name,
        uint256 price,
        bool isActive
    );

    constructor() {
        // Initialize with some default products
        _addProduct(1, "Wood", 0.01 ether);
        _addProduct(2, "Sand", 0.005 ether);
        _addProduct(3, "Stone", 0.015 ether);
        _addProduct(4, "Cement", 0.02 ether);
        _addProduct(5, "Steel", 0.03 ether);
    }

    function _addProduct(uint256 _id, string memory _name, uint256 _price) private {
        products[_id] = Product({
            id: _id,
            name: _name,
            price: _price,
            isActive: true
        });
        emit ProductAdded(_id, _name, _price);
    }

    function addProduct(uint256 _id, string memory _name, uint256 _price) external onlyOwner {
        require(_id > 0, "Invalid product ID");
        require(_price > 0, "Price must be greater than 0");
        require(products[_id].id == 0, "Product ID already exists");
        
        _addProduct(_id, _name, _price);
    }

    function updateProduct(uint256 _id, string memory _name, uint256 _price, bool _isActive) external onlyOwner {
        require(products[_id].id != 0, "Product does not exist");
        
        products[_id].name = _name;
        products[_id].price = _price;
        products[_id].isActive = _isActive;
        
        emit ProductUpdated(_id, _name, _price, _isActive);
    }

    function purchaseProduct(uint256 _productId) external payable nonReentrant {
        Product memory product = products[_productId];
        require(product.id != 0, "Product does not exist");
        require(product.isActive, "Product is not active");
        require(msg.value >= product.price, "Insufficient payment");

        // Refund excess payment if any
        if (msg.value > product.price) {
            uint256 refund = msg.value - product.price;
            (bool refundSuccess, ) = payable(msg.sender).call{value: refund}("");
            require(refundSuccess, "Refund failed");
        }

        emit ProductPurchased(msg.sender, _productId, product.price, block.timestamp);
    }

    function getProduct(uint256 _productId) external view returns (
        uint256 id,
        string memory name,
        uint256 price,
        bool isActive
    ) {
        Product memory product = products[_productId];
        return (product.id, product.name, product.price, product.isActive);
    }

    // Function to withdraw contract balance (only owner)
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    // Function to receive ETH
    receive() external payable {
        revert("Please use purchaseProduct function");
    }
} 