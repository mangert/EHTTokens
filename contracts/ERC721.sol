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

    mapping(address owner => uint256 balance) public override balanceOf;
    mapping (uint256 tokenId => address owner) public override ownerOf;
    mapping (uint256 tokenId => address operator) public override getApproved;
    mapping (address owner => mapping (address operator => bool)) public override isApprovedForAll;    

    string private baseURI;
    uint256 public nextTokenId; //инкремент для минта
    
    //хранилища для Enumerable
    mapping(address owner => mapping(uint256 index => uint256)) private _ownedTokens;    
    mapping(uint256 tokenId => uint256) private _ownedTokensIndex;
    uint256[] private _allTokens;
    mapping(uint256 tokenId => uint256) private _allTokensIndex;

    //требования для минта
    uint256 public mintPrice;
    uint256 public maxSupply;  

    address owner; //владелец контракта

    modifier  onlyOwner() {
        require(msg.sender == owner, ERC721NotAllowedWithdraw(msg.sender));
        _;        
    }

    constructor(
        string memory _name, 
        string memory _symbol, 
        string memory _baseURI, 
        uint256 _mintPrice, 
        uint256 _maxSupply        
    ){
        name = _name;
        symbol = _symbol;
        baseURI = _baseURI;
        mintPrice = _mintPrice;
        maxSupply = _maxSupply;

        owner = msg.sender;
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

    function mint() external payable {
        _mint(msg.sender, msg.value);
    }

    function safeMint() external payable {
        address minter = msg.sender;
        require(_checkOnERC721Received(address(0), minter, nextTokenId), ERC721InvalidReceiver(minter));

        _mint(msg.sender, msg.value);

    }

    function burn(uint256 _tokenId) external {
        require(_exists(_tokenId), ERC721NonexistentToken(_tokenId));
        require(_isApprovedOrOwner(msg.sender, _tokenId), ERC721InvalidOwner(msg.sender));
        address from = ownerOf[_tokenId];
        
        _updateEnumeration (from, address(0), _tokenId);

        --balanceOf[from];
        delete ownerOf[_tokenId];        
        emit IERC721.Transfer(from, address(0), _tokenId);        
        
    }

    function approve(address _approved, uint256 _tokenId) external payable override {
        
        require(_exists(_tokenId), ERC721Errors.ERC721NonexistentToken(_tokenId));        

        require(_isApprovedOrOwner(msg.sender, _tokenId), ERC721Errors.ERC721InvalidApprover(msg.sender));
        
        require(_approved != msg.sender, ERC721Errors.ERC721InvalidOperator(_approved));

        getApproved[_tokenId] = _approved;

        emit IERC721.Approval(msg.sender, _approved, _tokenId);
        
    }

    function setApprovalForAll(address _operator,  bool _approved) external override {
        
        require(_operator != address(0) && _operator != msg.sender, ERC721Errors.ERC721InvalidOperator(_operator));
        
        isApprovedForAll[msg.sender][_operator] = _approved;
    }    

    function tokenURI(uint256 _tokenId) external view override returns (string memory) {
        
        require(_exists(_tokenId), ERC721Errors.ERC721NonexistentToken(_tokenId));        
        return string(abi.encodePacked(baseURI, _tokenId.toString(), ".json"));

    }

    function totalSupply() public view returns (uint256){
        return _allTokens.length;
    }
    
    function tokenByIndex(uint256 _index) external view override returns (uint256) {
        
        require(_index < totalSupply(), ERC721Errors.ERC721OutOfBoundsIndex(address(0), _index));
        return _allTokens[_index];
    }

    function tokenOfOwnerByIndex(address _owner, uint256 _index) external view override returns (uint256) {
        
        require(_index < balanceOf[_owner], ERC721Errors.ERC721OutOfBoundsIndex(_owner, _index));

        return _ownedTokens[_owner][_index];

    }

    //функции для владельца контракта
    function withdrawAll() external onlyOwner() {
        
        uint256 amount = address(this).balance;
        (bool success, ) = msg.sender.call{ value: amount }("");
    }  
   
     //служебные функции  
    function  _transfer(address _from, address _to, uint256 tokenId)  internal {
        require(_exists(tokenId), ERC721Errors.ERC721NonexistentToken(tokenId));        
        require (_from != _to 
                    && _to != address(0),
                    ERC721Errors.ERC721InvalidReceiver(_to) 
                );
        
        _updateEnumeration (_from, _to, tokenId);
        ownerOf[tokenId] = _to;        
        ++balanceOf[_to];
        --balanceOf[_from];
        emit IERC721.Transfer(_from, _to, tokenId);        
        
        getApproved[tokenId] = address(0);        
        emit Approval(_to, address(0), tokenId);
        
    }    

    function _mint(address _minter, uint256 _value) internal {            
        
        require (nextTokenId < maxSupply, ERC721MintNotAvailable());
        require (_value >= mintPrice, ERC721NotEnoughTransferredFunds(_minter, _value, mintPrice));

        _updateEnumeration (address(0), _minter, nextTokenId);
        ownerOf[nextTokenId] = _minter;        
        ++balanceOf[_minter];
        
        emit IERC721.Transfer(address(0), _minter, nextTokenId);                        
        nextTokenId++;
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

    //служебные функции для Enumerable

    function _addTokenToAllTokensEnumeration(uint256 _tokenId) internal {       

        _allTokensIndex[_tokenId] = _allTokens.length;
        _allTokens.push(_tokenId);
    }

    function _removeTokenFromAllTokensEnumeration(uint256 _tokenId) internal {
         
         uint256 lastTokenIndex = _allTokens.length - 1;
         uint256 tokenIndex = _allTokensIndex[_tokenId];
         uint256 lastTokenId = _allTokens[lastTokenIndex];

         _allTokens[tokenIndex] = lastTokenId;
         _allTokensIndex[lastTokenId] = tokenIndex;
        
        delete _allTokensIndex[_tokenId];
        _allTokens.pop();

    }

    function _addTokenToOwnerEnumeration(address _to, uint _tokenId) internal {
         uint256 nextIndex = balanceOf[_to];
        _ownedTokens[_to][nextIndex] = _tokenId;
        _ownedTokensIndex[_tokenId] = nextIndex;
    }

    function _removeTokenFromOwnerEnumeration(address _from, uint _tokenId) internal {
        
        uint256 lastTokenIndex = balanceOf[_from];
        uint256 tokenIndex = _ownedTokensIndex[_tokenId];

        mapping(uint256 index => uint256) storage _ownedTokensByOwner = _ownedTokens[_from];

        
        if (tokenIndex != lastTokenIndex) {
            uint256 lastTokenId = _ownedTokensByOwner[lastTokenIndex];

            _ownedTokensByOwner[tokenIndex] = lastTokenId;
            _ownedTokensIndex[lastTokenId] = tokenIndex;
        }

        delete _ownedTokensIndex[_tokenId];
        delete _ownedTokensByOwner[lastTokenIndex];
        
    }

    function _updateEnumeration (address _from, address _to, uint256 _tokenId) internal {
        
        if (_from == address(0)) {
            _addTokenToAllTokensEnumeration(_tokenId);
        } else if (_from != _to) {
            _removeTokenFromOwnerEnumeration(_from, _tokenId);
        }
        if (_to == address(0)) {
            _removeTokenFromAllTokensEnumeration(_tokenId);
        } else if (_from != _to) {
            _addTokenToOwnerEnumeration(_to, _tokenId);
        }
    }    

}