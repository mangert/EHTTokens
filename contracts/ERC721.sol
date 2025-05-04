// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "./IERC721Metadata.sol";
import "./IERC721Enumerable.sol";
import "./IERC6093.sol";

contract ERC721 is IERC721Metadata, IERC721Enumerable, IERC6093 {
    string public override name;
    string public override symbol;

    mapping(address owner => uint256 balance) public override balanceOf;
    mapping (uint256 tokenId => address owner) public override ownerOf;
    mapping (uint256 tokenId => address operator) public override getApproved;
    mapping (address owner => mapping (address operator => bool)) public override isApprovedForAll;

    uint256 public override totalSupply;




    function safeTransferFrom(address _from, address _to, uint256 _tokenId, bytes calldata data) external payable override {}

    function safeTransferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    ) external payable override {}

    function transferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    ) external payable override {}

    function approve(
        address _approved,
        uint256 _tokenId
    ) external payable override {}

    function setApprovalForAll(
        address _operator,
        bool _approved
    ) external override {}    

    function tokenURI(
        uint256 _tokenId
    ) external view override returns (string memory) {}
    
    function tokenByIndex(
        uint256 _index
    ) external view override returns (uint256) {}

    function tokenOfOwnerByIndex(
        address _owner,
        uint256 _index
    ) external view override returns (uint256) {}    
     
     //служебные функции  
    function  _transfer(address _from, address _to, uint256 tokenId)  internal {
        require(_exists(tokenId), IERC6093.ERC721NonexistentToken(tokenId));
        require (_from != _to 
                    && _to != address(0),
                    IERC6093.ERC721InvalidReceiver(_to) 
                );
        
        ownerOf[tokenId] = _to;        
        ++balanceOf[_to];
        --balanceOf[_from];
        emit IERC721.Transfer(_from, _to, tokenId);        
    }
    
    function _saveTransfer() internal {

    }

    function _isApprovedOrOwner(address spender, uint tokenId) internal view returns (bool) {
        
        address _owner = ownerOf[tokenId];

        return (
            spender == _owner ||            
                isApprovedForAll[_owner][spender] ||
                getApproved[tokenId] == spender            
        );            
    }
    
    function _exists(uint256 tokenId) internal view returns (bool) {
        return ownerOf[tokenId] != address(0);
    }  

    /*function _checkOnERC721Received(
        address from,
        address to,
        uint tokenId
    ) private returns (bool) {
        if (to.code.length > 0) {
            try
                IERC721Receiver(to).onERC721Received(
                    msg.sender,
                    from,
                    tokenId,
                    bytes("")
                )
            returns (bytes4 ret) {
                return ret == IERC721Receiver.onERC721Received.selector;
            } catch (bytes memory reason) {
                if (reason.length == 0) {
                    revert("Non erc721 reciver");
                } else {
                    assembly {
                        revert(add(32, reason), mload(reason))
                    }
                }
            }
        } else {
            return true;
        }
    }*/



    
}