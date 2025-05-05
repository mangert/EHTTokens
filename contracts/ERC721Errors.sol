// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

/**
 * @title ERC721Errors
 * @dev Интерфейс ошибок для токенов cтандарта ERC721
  */

 interface ERC721Errors { 

    /**
    * @dev выбрасывается, если адрес не владеет токенами
    * @param owner - адрес, по которому делается запрос 
    */
    error ERC721InvalidOwner(address owner);

    /**
     * @dev выбрасывается, если токен не существует
     * @param tokenId - идентификатор токена
     */
    error ERC721NonexistentToken(uint256 tokenId);

    /**
     * @dev выбрасывается, если инициатор транзакции не является владельцем токена
     * @param sender - адрес, отправляющий токен
     * @param tokenId - идентификатор токена    
     * @param owner - адрес владельца токена
     */
    error ERC721IncorrectOwner(address sender, uint256 tokenId, address owner);

    error ERC721InvalidSender(address sender);

/*Indicates a failure with the token sender. Used in transfers.

Usage guidelines:

    RECOMMENDED for disallowed transfers from the zero address.
    MUST NOT be used for approval operations.
    MUST NOT be used for ownership or approval requirements.
        Use ERC721IncorrectOwner or ERC721InsufficientApproval instead.*/

   /**
    * @dev Выбрасывается, если получатель не может принимать NFT
    * @param receiver - адрес получателя
    */
   error ERC721InvalidReceiver(address receiver);

   /**
    * @dev выбрасывается при ошибках разрешений при переводах
    * @param operator - адрес, инициирующий перевод
    * @param tokenId - идентификатор токена
    */
   error ERC721InsufficientApproval(address operator, uint256 tokenId);
/*

Indicates a failure with the operator’s approval. Used in transfers.

Usage guidelines:

    isApprovedForAll(owner, operator) MUST be false for the tokenId’s owner and operator.
    getApproved(tokenId) MUST not be operator.
*/
    error ERC721InvalidApprover(address approver);/*

Indicates a failure with the owner of a token to be approved. Used in approvals.

Usage guidelines:

    RECOMMENDED for disallowed approvals from the zero address.
    MUST NOT be used for transfer operations.
*/
    error ERC721InvalidOperator(address operator); /*

Indicates a failure with the operator to be approved. Used in approvals.

Usage guidelines:

    RECOMMENDED for disallowed approvals to the zero address.
    The operator MUST NOT be the owner of the approved token.
    MUST NOT be used for transfer operations.
        Use ERC721InsufficientApproval instead.

*/
    error ERC721OutOfBoundsIndex(address _owner, uint256 _index);
 }
    