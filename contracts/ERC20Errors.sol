// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

/**
 * @title ERC20Errors
 * @dev Интерфейс ошибок для токенов стандарта ERC20
  */

 interface ERC20Errors {

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
 }
    