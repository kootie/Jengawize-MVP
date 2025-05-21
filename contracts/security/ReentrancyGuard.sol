// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

abstract contract ReentrancyGuard {
    // Constants to represent the state
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    // Variable to track contract state
    uint256 private _status;

    constructor() {
        _status = _NOT_ENTERED;
    }

    /**
     * @dev Prevents a function from being called while it is already in execution.
     */
    modifier nonReentrant() {
        // On the first call to nonReentrant, _status will be _NOT_ENTERED
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");

        // Set the status to _ENTERED
        _status = _ENTERED;

        // Execute the function body
        _;

        // Reset status to _NOT_ENTERED after execution
        _status = _NOT_ENTERED;
    }
}
