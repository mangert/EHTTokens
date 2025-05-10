import { ERC721_contractAddress, ERC721_constructorArgs } from "./config"
import { run } from "hardhat";

async function main() {
  const contractAddress = ERC721_contractAddress; 
  const constructorArgs: any[] = []; // если без аргументов

  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: ERC721_constructorArgs,
    });
    console.log("Verification successful!");
  } catch (error: any) {
    if (error.message.toLowerCase().includes("already verified")) {
      console.log("Already verified");
    } else {
      console.error("Verification failed:", error);
    }
  }
}

main();
