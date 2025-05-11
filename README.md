# 📦 Учебный проект: ERC-20 и ERC-721 токены на Solidity

Этот репозиторий содержит реализацию и тестирование смарт-контрактов по стандартам [ERC-20](https://eips.ethereum.org/EIPS/eip-20) и [ERC-721](https://eips.ethereum.org/EIPS/eip-721) с использованием Hardhat и TypeScript.

## 📁 Структура проекта


## ⚙️ Используемый стек

- [Solidity](https://soliditylang.org/) `^0.8.29`
- [Hardhat](https://hardhat.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Chai](https://www.chaijs.com/) + [Waffle](https://github.com/EthWorks/Waffle) для тестирования
- [Ethers.js](https://docs.ethers.org/)
- Alchemy + Etherscan API для деплоя и верификации в сети Sepolia

## 📜 Контракты

### ERC-20

- Реализация `ERC20.sol`
- Отдельный файл ошибок `ERC20Errors.sol`
- Интерфейс `IERC20.sol`

Комментарий: конструктор без параметров, 

### ERC-721

- Контракт `ERC721.sol` с поддержкой:
  - `ERC721Enumerable`
  - `ERC721Metadata`
  - Проверки `IERC721Receiver`
- Интерфейсы и кастомные ошибки

Комментарий: контструктор контракта принимает в качестве аргументов:
  - имя и символ токена
  - url хранилища данных
  - максимальную эмиссию токена
  - цену минта

## 🚀 Деплой и верификация

Скрипты для работы с сетью Sepolia:

```bash
npx hardhat run scripts/ERC20_deploy.ts --network sepolia
npx hardhat run scripts/ERC721_deploy.ts --network sepolia
npx hardhat run scripts/ERC20_verify.ts --network sepolia
npx hardhat run scripts/ERC721_verify.ts --network sepolia

🔍 Особенности

    Контракты используют кастомные ошибки (например, ERC721MintNotAvailable)

    Хранение метаданных NFT организовано через внешние JSON-файлы

    Деплой скрипты автоматически подставляют адреса контрактов в config.ts

📂 Пример метаданных NFT

В качестве примера создан контракт "Греческий алфавит" с 25 токенами (весь алфавит + 24 буквы)
Файлы размещены на GitHub и используются как tokenURI:
https://raw.githubusercontent.com/mangert/NFTMetadataStorage/main/0.json

Там же размещены изображения для NFT

