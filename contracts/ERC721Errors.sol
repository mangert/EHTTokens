// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

/**
 * @title ERC721Errors
 * @notice Интерфейс ошибок для токенов cтандарта ERC721
  */

 interface ERC721Errors { 

    /**
    * @notice выбрасывается, если адрес не владеет токенами
    * @param owner - адрес, по которому делается запрос 
    */
    error ERC721InvalidOwner(address owner);

    /**
     * @notice выбрасывается, если токен не существует
     * @param tokenId - идентификатор токена
     */
    error ERC721NonexistentToken(uint256 tokenId);

    /**
     * @notice выбрасывается, если инициатор транзакции не является владельцем токена
     * @param sender - адрес, отправляющий токен
     * @param tokenId - идентификатор токена    
     * @param owner - адрес владельца токена
     */
    error ERC721IncorrectOwner(address sender, uint256 tokenId, address owner);

    /**
     * @notice выбрасывается при попытках перевода с нулевого адреса
     * @param sender - адрес отправителя
     */
    error ERC721InvalidSender(address sender);
   
   /**
    * @notice Выбрасывается, если получатель не может принимать NFT
    * @param receiver - адрес получателя
    */
   error ERC721InvalidReceiver(address receiver);

   /**
    * @notice выбрасывается при ошибках разрешений при переводах
    * @param operator - адрес, инициирующий перевод
    * @param tokenId - идентификатор токена
    */
   error ERC721InsufficientApproval(address operator, uint256 tokenId);

   /**
    * @notice выбрасывается при попытке выдать разрешение с некорректного (например, нулевого) адреса)
    * @param approver - адрес, пытающийся выдать разрешение
    */
   error ERC721InvalidApprover(address approver);

   /**
    * @notice выбрасывается при попытке выдать разрешение на некорректный адрес (нулевой или "на себя")
    * @param operator - адрес, на который выдается разрешение
    */
   error ERC721InvalidOperator(address operator); 

   /**
    * @notice ошибка из интерфейса Enumerable - выбрасывается при выходе за пределы дипапазона 
    * @param _owner - адрес владельца токенов
    * @param _index - запрашиваемый индекс токена
    */
   error ERC721OutOfBoundsIndex(address _owner, uint256 _index);

   //кастомные ошибки

   /**
    * @notice выбрасывается, если перечисленных средств не хватает на оплату минта
    * @param _minter - адрес, который хотел сминтить NFT
    * @param _value - отправленные минтером средства
    * @param _needed  - требуемая сумма (цена минта)
    */
   error ERC721NotEnoughTransferredFunds(address _minter, uint256 _value, uint256 _needed);

   /**
    * @notice выбрасывается, если минт невозможен (превышен максимальный размер эмиссии)
    */
   error ERC721MintNotAvailable();

   /**
    * @notice выбрасывается при попытке инициирования транзакции (вывода средств) не владельцем контракта
    * @param _msgSender - адрес, инициирующий вывод
    */
   error ERC721NotAllowedWithdraw(address _msgSender);  

 }    