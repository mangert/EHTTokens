import hre, { ethers } from "hardhat";
import { ERC721_constructorArgs } from "./config"

async function main() {
    console.log("DEPLOYING...");
    const [deployer, owner] = await ethers.getSigners();

    const ERC721Token = await ethers.getContractFactory("ERC721");

    const args = ERC721_constructorArgs;

    const token = await ERC721Token.deploy
        (
            args.token_name, 
            args.token_sym,
            args.link,
            args.max_supply,
            args.mint_price
         );    
         
    await token.waitForDeployment(); 
    console.log(token.target);    
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error); 
        process.exit(1);
    });
