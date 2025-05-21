// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "./security/ReentrancyGuard.sol";


contract Jengawize is ReentrancyGuard {
    address public immutable storeOwner;
    uint256 public storeAcc;
    string public storeName;
    uint256 public immutable feePercent;
    uint256 public storeSales;

    mapping(address => uint256) public salesOf;

    event Sale(
        address indexed buyer,
        address indexed seller,
        uint256 amount,
        uint256 fee,
        uint256 timestamp
    );
    event Withdrawal(
        address indexed receiver,
        uint256 amount,
        uint256 timestamp
    );

    struct SalesStruct {
        address buyer;
        address seller;
        uint256 amount;
        string purpose;
        uint256 timestamp;
    }
    SalesStruct[] private sales;

    constructor(
        string memory _storeName,
        address _storeOwner,
        uint256 _feePercent
    ) {
        require(_storeOwner != address(0), "Owner address cannot be zero.");
        require(_feePercent <= 100, "Fee percent must be <= 100.");
        storeName = _storeName;
        storeOwner = _storeOwner;
        feePercent = _feePercent;
        storeAcc = 0;
    }

    modifier validPayment() {
        require(msg.value > 0, "Ethers cannot be zero!");
        _;
    }

    function payNow(address seller, string calldata purpose)
        external
        payable
        nonReentrant
        validPayment
        returns (bool success)
    {
        require(seller != address(0), "Invalid seller address.");
        require(msg.sender != storeOwner, "Store owner cannot initiate a sale.");

        uint256 fee = (msg.value * feePercent) / 100;
        uint256 cost = msg.value - fee;

        storeAcc += msg.value;
        storeSales += 1;
        salesOf[seller] += 1;

        _payTo(storeOwner, fee);
        _payTo(seller, cost);

        sales.push(
            SalesStruct(msg.sender, seller, cost, purpose, block.timestamp)
        );

        emit Sale(msg.sender, seller, cost, fee, block.timestamp);
        return true;
    }

    function _payTo(address _to, uint256 _amount) private {
        require(_to != address(0), "Receiver cannot be zero address.");
        (bool success, ) = payable(_to).call{value: _amount}("");
        require(success, "Transfer failed.");
    }

    function getAllSales() external view returns (SalesStruct[] memory) {
        return sales;
    }
}
