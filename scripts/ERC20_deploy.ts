import fs from "fs";
import path from "path";
import hre, { ethers } from "hardhat";

async function main() {
    console.log("DEPLOYING...");
    const [deployer, owner] = await ethers.getSigners();

    const ERC20Token = await ethers.getContractFactory("ERC20");
    const token = await ERC20Token.deploy();    
    await token.waitForDeployment(); 
    
    const address = await token.getAddress();
    console.log("Deployed ERC20 at:", address);
        
        
    const configPath = path.resolve(__dirname, "./config.ts");
    let configContent = fs.readFileSync(configPath, "utf8");
    
    const newContent = configContent.replace(
    /const ERC20_contractAddress = ".*?";/,
    `const ERC20_contractAddress = "${address}";`
      );
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error); 
        process.exit(1);
    });
