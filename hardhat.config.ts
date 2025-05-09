import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";

module.exports = {
  solidity: "0.8.29",
  settings: {
    optimizer: {
      enabled: true,
      runs: 1000,
    },
  }
};
const config: HardhatUserConfig = {
  solidity: "0.8.29", 
  networks: {
    hardhat: {
      chainId: 1337,
      initialBaseFeePerGas: 0,
    },
    sepolia: {
      url: process.env.ALCHEMY_API_URL || "", // Берем URL из .env
      accounts: process.env.PRIVATE_KEY ? [`0x${process.env.PRIVATE_KEY}`] : [],
      chainId: 11155111, // Sepolia chainId
    },
  },
};

export default config;
