// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "./IERC721Metadata.sol";
import "./IERC721Enumerable.sol";
import "./ERC721Errors.sol";
import "./IERC721Reciever.sol";
import "@openzeppelin/contracts/utils/Strings.sol";


contract ERC721 is IERC721Metadata, IERC721Enumerable, ERC721Errors {
    string public override name;
    string public override symbol;

    using Strings for uint256;
    string private baseURI;

    mapping(address owner => uint256 balance) public override balanceOf;
    mapping (uint256 tokenId => address owner) public override ownerOf;
    mapping (uint256 tokenId => address operator) public override getApproved;
    mapping (address owner => mapping (address operator => bool)) public override isApprovedForAll;

    uint256 public override totalSupply;


    constructor(string memory _name, string memory _symbol, string memory _baseURI){
        name = _name;
        symbol = _symbol;
        baseURI = _baseURI;
    }


    function safeTransferFrom(address _from, address _to, uint256 _tokenId, bytes calldata data) external payable override {
        require(_isApprovedOrOwner(msg.sender, _tokenId), ERC721Errors.ERC721InsufficientApproval(_from, _tokenId));
        require(_checkOnERC721Received(_from, _to, _tokenId), ERC721Errors.ERC721InvalidReceiver(_to));
        _transfer(_from, _to, _tokenId);   
    }

    function safeTransferFrom(address _from, address _to, uint256 _tokenId) external payable override {
        require(_isApprovedOrOwner(msg.sender, _tokenId), ERC721Errors.ERC721InsufficientApproval(_from, _tokenId));
        require(_checkOnERC721Received(_from, _to, _tokenId), ERC721Errors.ERC721InvalidReceiver(_to));
        _transfer(_from, _to, _tokenId);      
        
    }

    function transferFrom(address _from, address _to, uint256 _tokenId) external payable override {
        require(_isApprovedOrOwner(msg.sender, _tokenId), ERC721Errors.ERC721InsufficientApproval(_from, _tokenId));        
        
        _transfer(_from, _to, _tokenId);        
    
    }

    function approve(address _approved, uint256 _tokenId) external payable override {
        
        require(_exists(_tokenId), ERC721Errors.ERC721NonexistentToken(_tokenId));        

        require(_isApprovedOrOwner(msg.sender, _tokenId), ERC721Errors.ERC721InvalidApprover(msg.sender));
        
        require(_approved != address(0) && _approved != msg.sender, ERC721Errors.ERC721InvalidOperator(_approved));

        getApproved[_tokenId] = _approved;

        emit IERC721.Approval(msg.sender, _approved, _tokenId);
        
    }

    function setApprovalForAll(address _operator,  bool _approved) external override {
        
        require(_operator != address(0) && _operator != msg.sender, ERC721Errors.ERC721InvalidOperator(_operator));
        
        isApprovedForAll[msg.sender][_operator] = true;
    }    

    function tokenURI(uint256 _tokenId) external view override returns (string memory) {
        
        require(_exists(_tokenId), ERC721Errors.ERC721NonexistentToken(_tokenId));        
        return string(abi.encodePacked(baseURI, _tokenId.toString(), ".json"));

    }
    
    function tokenByIndex(uint256 _index) external view override returns (uint256) {

    }

    function tokenOfOwnerByIndex(
        address _owner,
        uint256 _index
    ) external view override returns (uint256) {}    
     
     //служебные функции  
    function  _transfer(address _from, address _to, uint256 tokenId)  internal {
        require(_exists(tokenId), ERC721Errors.ERC721NonexistentToken(tokenId));        
        require (_from != _to 
                    && _to != address(0),
                    ERC721Errors.ERC721InvalidReceiver(_to) 
                );
        
        ownerOf[tokenId] = _to;        
        ++balanceOf[_to];
        --balanceOf[_from];
        emit IERC721.Transfer(_from, _to, tokenId);        
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
    
    function _checkOnERC721Received(address from, address to, uint tokenId) private returns (bool) {
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
                revert ERC721InvalidReceiver(to);                
            }
        } else {
            return true;
        }
    }    
}