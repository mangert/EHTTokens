// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

/**
 * @title IERC721
 * @notice Интерфейс для токена по стандарту ERC-721
 */  

interface IERC721 {
    /** 
    * @notice Генерируется при создании, переводе и уничтожении NFT
    * @param _from  - адрес отправителя
    * @param _to  - адрес получателя
    * @param _tokenId  - идентификатор токена
    */    
    event Transfer(address indexed _from, address indexed _to, uint256 indexed _tokenId);

    /**
     * @notice Генерируется, в случае изменения разрешений на NFT
    *  @param _owner  - адрес владельца
    *  @param _approved  - на который выдается разрешение
    *  @param _tokenId  - идентификатор токена
    */
    event Approval(address indexed _owner, address indexed _approved, uint256 indexed _tokenId);

    /**
     * @notice Генерируется при выдаче или отмене разрешений на все NFT
     * @param _owner - адрес владельца
     * @param _operator - адрес оператора
     * @param _approved - разрешить / отменить разрешение
     */    
    event ApprovalForAll(address indexed _owner, address indexed _operator, bool _approved);
    
    /**
     * @notice Возращает количество NFT владельца
     * @param _owner - адрес владельца
     */
    function balanceOf(address _owner) external view returns (uint256);

    /// @notice Find the owner of an NFT
    /// @notice NFTs assigned to zero address are considered invalid, and queries
    ///  about them do throw.
    /// @param _tokenId The identifier for an NFT
    /// @return The address of the owner of the NFT

    /**
     * @notice функция возвращает адрес владельца NFT
     * @param _tokenId - идентификатор токена
     * @return адрес владельца NFT
     */
    function ownerOf(uint256 _tokenId) external view returns (address);

    /**
     * @notice "Безопасная" передача владения NFT между двумя адресами
     * @param _from - адрес текущего владельца
     * @param _to - адрес нового владельцаThe new owner
     * @param _tokenId - идентификатор передаваемого токена
     * @param data - дополнительные данные, которые можно передать вместе с токеном
     */ 
    function safeTransferFrom(address _from, address _to, uint256 _tokenId, bytes calldata data) external payable;

    /**
     * @notice "Безопасная" передача владения NFT между двумя адресами
     * @param _from - адрес текущего владельца
     * @param _to - адрес нового владельцаThe new owner
     * @param _tokenId - идентификатор передаваемого токена     * 
     */ 
    function safeTransferFrom(address _from, address _to, uint256 _tokenId) external payable;

    /**
     * @notice Предача владения NFT между двумя адресами
     * @param _from - адрес текущего владельца
     * @param _to - адрес нового владельцаThe new owner
     * @param _tokenId - идентификатор передаваемого токена     * 
     */ 
    function transferFrom(address _from, address _to, uint256 _tokenId) external payable;

    /**
     * @notice функция устанавливает разрешения на токен
     * @param _approved - адрес, получаеющий разрашение
     * @param _tokenId - идентификатор токена
     */    
    function approve(address _approved, uint256 _tokenId) external payable;

    /// @notice Enable or disable approval for a third party ("operator") to manage
    ///  all of `msg.sender`'s assets
    /// @notice Emits the ApprovalForAll event. The contract MUST allow
    ///  multiple operators per owner.
    /// @param _operator Address to add to the set of authorized operators
    /// @param _approved True if the operator is approved, false to revoke approval
    /**
     * @notice устанавливает или отменяет разрешения на все токены владельца
     * @param _operator - адрес, получающий разрешения
     * @param _approved - параметр определяет, отменяем или устанавливаем разрешения
     */
    function setApprovalForAll(address _operator, bool _approved) external;

    /// @notice Get the approved address for a single NFT
    /// @notice Throws if `_tokenId` is not a valid NFT.
    /// @param _tokenId The NFT to find the approved address for
    /// @return The approved address for this NFT, or the zero address if there is none
    /**
     * @notice функция возвращает адрес, которому дано разрешение на действия с токенами
     * @param _tokenId - идентификатор токена
     * @return - адрес, которому выдано разрешение на токен
     */
    function getApproved(uint256 _tokenId) external view returns (address);
    
    /**
     * @notice функция возращает информацию, разрешено ли определенному адресу распоряжаться всеми токенами другого адреса
     * @param _owner - адрес владельца
     * @param _operator - адрес, который проверяется на наличие разрешения
     * @return результат, разрешено ли оператору распоряжться токенами
     */

    function isApprovedForAll(address _owner, address _operator) external view returns (bool);

    /**
     * @notice Минт новой NFT
     */
    function mint() external payable;

    /**
     * @notice "Безпасный" минт новой NFT
     */
    function safeMint() external payable;

    /**
     * @notice Сжигаение конкретного NFT
     * @param tokenI - идентификатор сжигаемой NFT
     */
    function burn(uint tokenI) external;
    
}