// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

/**
 * @title IERC20
 * @notice Интерфейс для токена по стандарту ERC-20
 */

 interface IERC20 {

    /**
     * @notice генерируется при передаче токенов между адресами
     * @param _from адрес отправителя
     * @param _to адрес получателя
     * @param _amount передавамая сумма
     */
    event Transfer(address indexed _from, address indexed _to, uint256 _amount);

    /**
     * @notice генерируется при выдаче разрешения на передачу токенов
     * @param _owner адрес владельца токена
     * @param _spender адрес, которому разрешено передавать токены
     * @param _amount сумма, на которую выданы разрешения
     */
    event Approval(address indexed _owner, address indexed _spender, uint256 _amount);

    /**
     * @notice возвращает имя токена
     */
    function name() external view returns (string memory);
    /**
     * @notice возвращает тикер токена
     */
    function symbol() external view returns (string memory);
    /**
     * @notice возвращает разрядность
     */
    function decimals() external view returns (uint8);
    
    /**
     * @notice возвращает общую эмиссию токена
     */
    function totalSupply() external view returns (uint256);
    
    /**
     * @notice возвращает количество токенов на заданном адресе
     * @param _owner запрашиваемый адрес
     */
    function balanceOf(address _owner) external view returns (uint256 balance);
    
    /**
     * @notice функция переводит токены с адреса отправителя на заданный адрес
     * @param _to адрес получателя
     * @param _amount сумма перевода
     */
    function transfer(address _to, uint256 _amount) external returns (bool success);
    
    /**
     * @notice функция переводит токены между адресами
     * @param _from адрес отправителя
     * @param _to адрес получателя
     * @param _amount сумма перевода
     */
    function transferFrom(address _from, address _to, uint256 _amount) external returns (bool success);
    function approve(address _spender, uint256 _amount) external returns (bool success);
    
    /**
     * @notice возвращает лимиты расхода токенов оператором с адреса владельца
     * @param _owner адрес владельца
     * @param _spender адрес оператора 
     */
    function allowance(address _owner, address _spender) external view returns (uint256 remaining);
 }