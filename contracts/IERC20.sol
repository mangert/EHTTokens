// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

/**
 * @title IERC20
 * @dev Интерфейс для токена по стандарту ERC-20
 */

 interface IERC20 {

    /**
     * @dev генерируется при передаче токенов между адресами
     * @param _from адрес отправителя
     * @param _to адрес получателя
     * @param _amount передавамая сумма
     */
    event Transfer(address indexed _from, address indexed _to, uint256 _amount);

    /**
     * @dev генерируется при выдаче разрешения на передачу токенов
     * @param _owner адрес владельца токена
     * @param _spender адрес, которому разрешено передавать токены
     * @param _amount сумма, на которую выданы разрешения
     */
    event Approval(address indexed _owner, address indexed _spender, uint256 _amount);

    /**
     * @dev возвращает имя токена
     */
    function name() external view returns (string memory);
    /**
     * @dev возвращает тикер токена
     */
    function symbol() external view returns (string memory);
    /**
     * @dev возвращает разрядность
     */
    function decimals() external view returns (uint8);
    
    /**
     * @dev возвращает общую эмиссию токена
     */
    function totalSupply() external view returns (uint256);
    
    /**
     * @dev возвращает количество токенов на заданном адресе
     * @param _owner запрашиваемый адрес
     */
    function balanceOf(address _owner) external view returns (uint256 balance);
    
    /**
     * @dev функция переводит токены с адреса отправителя на заданный адрес
     * @param _to адрес получателя
     * @param _amount сумма перевода
     */
    function transfer(address _to, uint256 _amount) external returns (bool success);
    
    /**
     * @dev функция переводит токены между адресами
     * @param _from адрес отправителя
     * @param _to адрес получателя
     * @param _amount сумма перевода
     */
    function transferFrom(address _from, address _to, uint256 _amount) external returns (bool success);
    function approve(address _spender, uint256 _amount) external returns (bool success);
    
    /**
     * @dev возвращает лимиты расхода токенов оператором с адреса владельца
     * @param _owner адрес владельца
     * @param _spender адрес оператора 
     */
    function allowance(address _owner, address _spender) external view returns (uint256 remaining);
 }