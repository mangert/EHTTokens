import fs from "fs";
import path from "path";
import hre, { ethers } from "hardhat";
import {getERC721ArgsArray } from "./config"

async function main() {
    console.log("DEPLOYING...");
    const [deployer, owner] = await ethers.getSigners();

    const ERC721Token = await ethers.getContractFactory("ERC721");    

    const token = await ERC721Token.deploy(...getERC721ArgsArray() as [string, string, string, bigint, bigint]);
         
    await token.waitForDeployment(); 
    const address = await token.getAddress();
    console.log("Deployed ERC721 at:", address);
    
    
    const configPath = path.resolve(__dirname, "./config.ts");
    let configContent = fs.readFileSync(configPath, "utf8");

    const newContent = configContent.replace(
    /const ERC721_contractAddress = ".*?";/,
    `const ERC721_contractAddress = "${address}";`
  );

    fs.writeFileSync(configPath, newContent);
    console.log("📝 Updated config.ts with deployed address.");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error); 
        process.exit(1);
    });
