// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

interface IERC721Receiver {
    
    event TokenReceived(address operator, address from, uint256 tokenId, bytes data);
    
    function onERC721Received(
        address operator,
        address to,
        uint tokenId,
        bytes calldata data
    ) external returns (bytes4);
}