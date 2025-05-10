import hre, { ethers } from "hardhat";

async function main() {
    console.log("DEPLOYING...");
    const [deployer, owner] = await ethers.getSigners();

    const ERC20Token = await ethers.getContractFactory("ERC20");
    const token = await ERC20Token.deploy();    
    await token.waitForDeployment(); 
    console.log(token.target);    
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error); 
        process.exit(1);
    });
