//import { ETHTokens } from "../typechain-types";
import { bigint } from "hardhat/internal/core/params/argumentTypes";
import { loadFixture, ethers, expect } from "./setup";

//"https://drive.google.com/drive/folders/1Ds1OrpnlwQeu8lu9UQoL0HzUEjPw6D-V/";

describe("ETHTokens", function() {
    async function deploy() {        
        const [user0, user1, user2] = await ethers.getSigners();
        
        const ERC20_Factory = await ethers.getContractFactory("ERC20");
        const ERC20_Token = await ERC20_Factory.deploy();
        await ERC20_Token.waitForDeployment();        

        return { user0, user1, user2, ERC20_Token }
    }

    it("should be deployed", async function() {
        const { ERC20_Token } = await loadFixture(deploy);        
        
        expect(ERC20_Token.target).to.be.properAddress;        
        expect(await ERC20_Token.name()).eq("Ametist");
        expect(await ERC20_Token.symbol()).eq("AME");

    });

    it("should have 0 eth by default", async function() {
        const { ERC20_Token } = await loadFixture(deploy);

        const balance = await ethers.provider.getBalance(ERC20_Token.target);        
        expect(balance).eq(0);
        
    }); 
    
    
    it("should possible transfer", async function() {
        
        const { user0, user1, ERC20_Token} = await loadFixture(deploy);
        
        const amount = 1000n;
        const balance_user0_before = await ERC20_Token.balanceOf(user0);
        
        const tx = await ERC20_Token.transfer(user1, amount);
        await tx.wait(1);         
        
        
        const balance_user1 = await ERC20_Token.balanceOf(user1);        
        expect(balance_user1).eq(amount);        
        
        const balance_user0_after = await ERC20_Token.balanceOf(user0);
        const balance_user0_after_eq = balance_user0_before - amount;
        expect(balance_user0_after).eq(balance_user0_after_eq);

        const totalSupply: bigint = await ERC20_Token.totalSupply();
        const totalSupply_eq = balance_user1 + balance_user0_after;
        expect(totalSupply).eq(totalSupply_eq);

        
    });

    it("should revert uncorret transfers", async function() {
        
        const { user0, user1, ERC20_Token} = await loadFixture(deploy);
        
        const amount = 1000n;
        const balance_user0_before = await ERC20_Token.balanceOf(user0);
        
        //корректная транзакция - чтобы перебросить на второй адрес
        const tx = await ERC20_Token.transfer(user1, amount);
        await tx.wait(1);         

        //дополнительно - выдача разрешений по переводу на второй адрес
        const tx_app = await ERC20_Token.approve(user1, amount);
        tx_app.wait(1);

        //некорректные транзы
        const ZERO_ADDRESS =  ethers.ZeroAddress;//"0x0000000000000000000000000000000000000000";
        await expect(ERC20_Token.connect(user1).transfer(user0, amount * 2n)).to.be.reverted;
        await expect(ERC20_Token.transfer(ZERO_ADDRESS, amount)).to.be.reverted;
        await expect(ERC20_Token.transfer(user0, amount)).to.be.reverted;
        
        
        await expect(ERC20_Token.connect(user1).transferFrom(user1, user0, amount * 2n)).to.be.reverted;
        await expect(ERC20_Token.connect(user1).transferFrom(ZERO_ADDRESS, user0, amount)).to.be.reverted;
        await expect(ERC20_Token.connect(user1).transferFrom(user1, ZERO_ADDRESS, amount)).to.be.reverted;
        await expect(ERC20_Token.transferFrom(user0, user0, amount)).to.be.reverted;
        await expect(ERC20_Token.connect(user1).transferFrom(user0, user1, amount * 2n)).to.be.reverted;

        await expect(ERC20_Token.approve(ZERO_ADDRESS, amount)).to.be.reverted;


    });


    it("should possible approve", async function() {
        
        const { user0, user1, ERC20_Token} = await loadFixture(deploy);

        const amount = 1000n;
        const tx_app = await ERC20_Token.approve(user1, amount);
        tx_app.wait(1);

        const allow_amount = await ERC20_Token.allowance(user0, user1);                
        
        expect(allow_amount).eq(amount);
        
    });

    it("should possible transfer from", async function() {
        
        const { user0, user1, ERC20_Token} = await loadFixture(deploy);

        const allow_amount = 10000n;
        const tx_app = await ERC20_Token.approve(user1, allow_amount);
        tx_app.wait(1);

        const amount = 5000n;                
        const balance_user0_before = await ERC20_Token.balanceOf(user0);
        
        const tx = await ERC20_Token.connect(user1).transferFrom(user0, user1, amount);        
        await tx.wait(1);         
        
        
        const balance_user1 = await ERC20_Token.balanceOf(user1);        
        expect(balance_user1).eq(amount);        
        
        const balance_user0_after = await ERC20_Token.balanceOf(user0);
        const balance_user0_after_eq = balance_user0_before - amount;
        expect(balance_user0_after).eq(balance_user0_after_eq);

        const totalSupply: bigint = await ERC20_Token.totalSupply();
        const totalSupply_eq = balance_user1 + balance_user0_after;
        expect(totalSupply).eq(totalSupply_eq);       
        
        
    });




    
    
});