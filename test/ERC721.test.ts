import { loadFixture, ethers, expect } from "./setup";

//"https://drive.google.com/drive/folders/1Ds1OrpnlwQeu8lu9UQoL0HzUEjPw6D-V/";

describe("ERC721", function() {
    
    const tokenName = "Alphabet";
    const tokenSymbol = "ABC";
    const collectionURI = "https://drive.google.com/drive/folders/1Ds1OrpnlwQeu8lu9UQoL0HzUEjPw6D-V/";
    
    async function deploy() {        
        const [user0, user1, user2] = await ethers.getSigners();
        
        const ERC721_Factory = await ethers.getContractFactory("ERC721");       
        
        const ERC721_Token = await ERC721_Factory.deploy(tokenName, tokenSymbol, collectionURI);
        await ERC721_Token.waitForDeployment();        

        return { user0, user1, user2, ERC721_Token }
    }

    describe("deployment tеsts", function() {
        it("should be deployed", async function() {
            const {user0, ERC721_Token } = await loadFixture(deploy);        
            
            expect(ERC721_Token.target).to.be.properAddress;        
            expect(await ERC721_Token.name()).eq(tokenName);
            expect(await ERC721_Token.symbol()).eq(tokenSymbol);           
            expect(await ERC721_Token.symbol()).eq(collectionURI);           
    
        });
    
        it("should have 0 eth by default", async function() {
            const { ERC721_Token } = await loadFixture(deploy);
    
            const balance = await ethers.provider.getBalance(ERC721_Token.target);        
            expect(balance).eq(0);
            
        });     

    });

    /*describe("correct transfers", function(){
        
        it("should possible transfer", async function() {
        
            const { user0, user1, ERC721_Token} = await loadFixture(deploy);
            
            const tokenID = 1000n;
            const balance_user0_before = await ERC721_Token.balanceOf(user0);
            
            const tx = await ERC721_Token.transfer(user1, amount);
            await tx.wait(1);                     
            
            const balance_user1 = await ERC721_Token.balanceOf(user1);        
            expect(balance_user1).eq(amount);        
            
            const balance_user0_after = await ERC721_Token.balanceOf(user0);
            const balance_user0_after_eq = balance_user0_before - amount;
            expect(balance_user0_after).eq(balance_user0_after_eq);
    
            const totalSupply: bigint = await ERC721_Token.totalSupply();
            const totalSupply_eq = balance_user1 + balance_user0_after;
            expect(totalSupply).eq(totalSupply_eq);   
            
        });

        it("should possible transferFrom", async function() {
        
            const { user0, user1, ERC721_Token} = await loadFixture(deploy);
            
            const amount = 1000n;
            const balance_user0_before = await ERC721_Token.balanceOf(user0);
            
            const tx = await ERC721_Token.transferFrom(user0, user1, amount);
            await tx.wait(1);               
            
            const balance_user1 = await ERC721_Token.balanceOf(user1);        
            expect(balance_user1).eq(amount);        
            
            const balance_user0_after = await ERC721_Token.balanceOf(user0);
            const balance_user0_after_eq = balance_user0_before - amount;
            expect(balance_user0_after).eq(balance_user0_after_eq);
    
            const totalSupply: bigint = await ERC721_Token.totalSupply();
            const totalSupply_eq = balance_user1 + balance_user0_after;
            expect(totalSupply).eq(totalSupply_eq);        
        });

    });    
    
    describe("transfers errors", function() {
        it("should be reverted trassfer with insufficient balance", async function() {
        
            const { user0, user1, ERC721_Token} = await loadFixture(deploy);
            
            const amount = 1000n;
            const balance_user0_before = await ERC721_Token.balanceOf(user0);
            
            //корректная транзакция - чтобы перебросить на второй адрес
            const tx = await ERC721_Token.transfer(user1, amount);
            await tx.wait(1);         
            
            const user1_balance = await ERC721_Token.balanceOf(user1);
            
    
            //некорректные транзы
            await expect(ERC721_Token.connect(user1).transfer(user0, amount * 2n)).
                to.be.revertedWithCustomError(ERC721_Token,"ERC20InsufficientBalance").
                withArgs(user1, user1_balance, amount * 2n);           
            
        });

        it("should be reverted transferFrom with insufficient balance", async function() {
        
            const { user0, user1, ERC721_Token} = await loadFixture(deploy);
            
            const amount = 1000n;
            const balance_user0_before = await ERC721_Token.balanceOf(user0);
            
            //корректная транзакция - чтобы перебросить на второй адрес
            const tx = await ERC721_Token.transfer(user1, amount);
            await tx.wait(1);                        
            
            const user1_balance = await ERC721_Token.balanceOf(user1);            

            //некорректные транзы            
            await expect(ERC721_Token.connect(user1).transferFrom(user1, user0, amount * 2n)).
                to.be.revertedWithCustomError(ERC721_Token,"ERC20InsufficientBalance").
                withArgs(user1, user1_balance, amount * 2n);                  
            
        });

        it("should be reverted transfer to ZERO address", async function() {
        
            const { user0, user1, ERC721_Token} = await loadFixture(deploy);
            
            const amount = 1000n;    
            
            //корректная транзакция - чтобы перебросить на второй адрес
            const tx = await ERC721_Token.transfer(user1, amount);
            await tx.wait(1);                             
            
            const ZERO_ADDRESS =  ethers.ZeroAddress;//"0x0000000000000000000000000000000000000000";  
    
            //некорректные транзы
            
            await expect(ERC721_Token.transfer(ZERO_ADDRESS, amount)).
                to.be.revertedWithCustomError(ERC721_Token, "ERC20InvalidReceiver").
                withArgs(ZERO_ADDRESS);            
        });

        it("should be reverted transfer to self", async function() {
        
            const { user0, user1, ERC721_Token} = await loadFixture(deploy);
            
            const amount = 1000n;            

            await expect(ERC721_Token.transfer(user0, amount)).
                to.be.revertedWithCustomError(ERC721_Token, "ERC20InvalidReceiver").
                withArgs(user0.address);             
        });

        it("should be reverted transferFrom from ZERO address", async function() {
        
            const { user0, user1, ERC721_Token} = await loadFixture(deploy);
            
            const amount = 1000n;            
            
            const ZERO_ADDRESS =  ethers.ZeroAddress;//"0x0000000000000000000000000000000000000000";  
    
            //некорректные транзы
            
            await expect(ERC721_Token.connect(user1).transferFrom(ZERO_ADDRESS, user0, amount)).
                to.be.revertedWithCustomError(ERC721_Token, "ERC20InvalidSender").
                withArgs(ZERO_ADDRESS);
        });

        it("should be reverted transferFrom to ZERO address", async function() {
        
            const { user0, user1, ERC721_Token} = await loadFixture(deploy);
            
            const amount = 1000n;            
            
            //корректная транзакция - чтобы перебросить на второй адрес
            const tx = await ERC721_Token.transfer(user1, amount);
            await tx.wait(1);             
            
            const ZERO_ADDRESS =  ethers.ZeroAddress;//"0x0000000000000000000000000000000000000000";  
    
            //некорректные транзы            
            
            await expect(ERC721_Token.connect(user1).transferFrom(user1, ZERO_ADDRESS, amount)).
                to.be.revertedWithCustomError(ERC721_Token, "ERC20InvalidReceiver").
                withArgs(ZERO_ADDRESS);             
        });

        it("should be reverted transferFrom from ZERO address", async function() {
        
            const { user0, user1, ERC721_Token} = await loadFixture(deploy);
            
            const amount = 1000n;            
            
            //корректная транзакция - чтобы перебросить на второй адрес
            const tx = await ERC721_Token.transfer(user1, amount);
            await tx.wait(1);         
            
            const ZERO_ADDRESS =  ethers.ZeroAddress;//"0x0000000000000000000000000000000000000000";  
    
            //некорректные транзы
            
            await expect(ERC721_Token.connect(user1).transferFrom(ZERO_ADDRESS, user0, amount)).
                to.be.revertedWithCustomError(ERC721_Token, "ERC20InvalidSender").
                withArgs(ZERO_ADDRESS);                   
    
        });

        it("should be reverted transferFrom to self", async function() {
        
            const { user0, user1, ERC721_Token} = await loadFixture(deploy);
            
            const amount = 1000n;
            
            //корректная транзакция - чтобы перебросить на второй адрес
            const tx = await ERC721_Token.transfer(user1, amount);
            await tx.wait(1);             
            
            //некорректные транзы            
            
            await expect(ERC721_Token.transferFrom(user0, user0, amount)).
                to.be.revertedWithCustomError(ERC721_Token, "ERC20InvalidReceiver").
                withArgs(user0.address);                           
        });

        it("should be reverted transferFrom not allowed amount", async function() {
        
            const { user0, user1, ERC721_Token} = await loadFixture(deploy);
            
            const amount = 1000n;            
            
            //корректная транзакция - чтобы перебросить на второй адрес
            const tx = await ERC721_Token.transfer(user1, amount);
            await tx.wait(1);         
    
            //дополнительно - выдача разрешений по переводу на второй адрес
            const tx_app = await ERC721_Token.approve(user1, amount);
            tx_app.wait(1);                                   
    
            //некорректные транзы                  
            
            await expect(ERC721_Token.connect(user1).transferFrom(user0, user1, amount * 2n)).
                to.be.revertedWithCustomError(ERC721_Token,"ERC20InsufficientAllowance").
                withArgs(user1, amount, amount * 2n);
        });
    
    });    

    describe("approvements", function() {
        
        it("should possible approve", async function() {
        
            const { user0, user1, ERC721_Token} = await loadFixture(deploy);
    
            const amount = 1000n;
            const tx_app = await ERC721_Token.approve(user1, amount);
            tx_app.wait(1);
    
            const allow_amount = await ERC721_Token.allowance(user0, user1);                
            
            expect(allow_amount).eq(amount);
            
        });

        it("should be reverted set approve to ZERO address", async function() {
        
            const { user0, user1, ERC721_Token} = await loadFixture(deploy);
            
            const amount = 1000n;            
            
            //дополнительно - выдача разрешений по переводу на второй адрес
            const tx_app = await ERC721_Token.approve(user1, amount);
            tx_app.wait(1);
            const ZERO_ADDRESS =  ethers.ZeroAddress;//"0x0000000000000000000000000000000000000000";  
    
            //некорректные транзы                   
            await expect(ERC721_Token.approve(ZERO_ADDRESS, amount))
                .to.be.revertedWithCustomError(ERC721_Token, "ERC20InvalidSpender").withArgs(ZERO_ADDRESS);        
        });
    });   */
});

