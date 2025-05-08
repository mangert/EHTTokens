// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

/**
 * @title  Enumerable ERC-721
 * @notice Расширение интерфейса, предоставляющее индексы для NFT
 */
interface IERC721Enumerable {   
    
    /**
     * @notice возсращает текущую эмиссию NFT
     */
    function totalSupply() external view returns (uint256);
    
    /**
     * @notice функция возвращает идентификатор NFT по индексу
     * @param _index - индекс для поиска
     */
    function tokenByIndex(uint256 _index) external view returns (uint256);
    
    /**
     * @notice функция возвращает идентификатор NFT по индексу среди NFT конкретного адреса
     * @param _owner - владелец, среди чьих токенов ищем
     * @param _index - индекс NFT
     */
    function tokenOfOwnerByIndex(address _owner, uint256 _index) external view returns (uint256);
}
