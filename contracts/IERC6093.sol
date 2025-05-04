// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

/**
 * @title IERC6093
 * @dev Интерфейс ошибок для токенов
  */

 interface IERC6093 {

    /**
     * @dev выбрасывется при недостаточном балансе токенов
     * @param sender адрес отправителя
     * @param balance баланс отправителя
     * @param needed отправляемая сумма
     */
    error ERC20InsufficientBalance(address sender, uint256 balance, uint256 needed);

    /**
     * @dev выбрасывается при неверном адресе отправителя
     * @param sender адрес отправителя
     */
    error ERC20InvalidSender(address sender);
    
    /**
     * @dev выбрасывется при неверном адресе получателя
     * @param receiver адрес получателя
     */
    error ERC20InvalidReceiver(address receiver);

    /**
     * @dev выбрасывается, если сумма перевода превышает разрешенную
     * @param spender адрес отправителя
     * @param allowance разрешенный лимит
     * @param needed запрашиваемая сумма
     */
    error ERC20InsufficientAllowance(address spender, uint256 allowance, uint256 needed);

    /**
     * @dev выбрасывается при попытке выдать разрешения c неверного адреса
     * @dev адрес, выдающий разрешения
     */
    error ERC20InvalidApprover(address approver);


    /**
     * @dev выбрасывается при попытке выдать разрешения на неверный адрес
     * @dev адрес, на который выдается разрешение
     */
    error ERC20InvalidSpender(address spender); 

    //ошибки для токенов стандарта ERC721

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
     * @dev выбрасывается, если отправитель токена не является его владельцем
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

   error ERC721InvalidReceiver(address receiver);

/*Indicates a failure with the token receiver. Used in transfers.

Usage guidelines:

    RECOMMENDED for disallowed transfers to the zero address.
    RECOMMENDED for disallowed transfers to non-ERC721TokenReceiver contracts or those that reject a transfer. (eg. returning an invalid response in onERC721Received).
    MUST NOT be used for approval operations.

    */
   /**
    * @dev выбрасывается при ошибках разрешений при переводах
    * 
    */
   error ERC721InsufficientApproval(address operator, uint256 tokenId);
/*

Indicates a failure with the operator’s approval. Used in transfers.

Usage guidelines:

    isApprovedForAll(owner, operator) MUST be false for the tokenId’s owner and operator.
    getApproved(tokenId) MUST not be operator.

ERC721InvalidApprover(address approver)

Indicates a failure with the owner of a token to be approved. Used in approvals.

Usage guidelines:

    RECOMMENDED for disallowed approvals from the zero address.
    MUST NOT be used for transfer operations.

ERC721InvalidOperator(address operator)

Indicates a failure with the operator to be approved. Used in approvals.

Usage guidelines:

    RECOMMENDED for disallowed approvals to the zero address.
    The operator MUST NOT be the owner of the approved token.
    MUST NOT be used for transfer operations.
        Use ERC721InsufficientApproval instead.

*/
 }
    