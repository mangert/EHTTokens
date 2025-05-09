import { loadFixture, ethers, expect } from "./setup";
import { network } from "hardhat";

describe("ERC721", function() {
    
    const tokenName = "Alphabet";
    const tokenSymbol = "ABC";
    const collectionURI = "https://drive.google.com/drive/folders/1Ds1OrpnlwQeu8lu9UQoL0HzUEjPw6D-V/";
    
    const mintPrice = 1_000_000_000n;
    const maxSupply = 3; //заведомо маленькое число, чтобы было легко превысить
    
    async function deploy() {        
        const [user0, user1, user2] = await ethers.getSigners();
        
        const ERC721_Factory = await ethers.getContractFactory("ERC721");       
        
        const ERC721_Token = await ERC721_Factory.deploy(tokenName, tokenSymbol, collectionURI, mintPrice, maxSupply);
        await ERC721_Token.waitForDeployment();        

        return { user0, user1, user2, ERC721_Token }
    }

    describe("deployment tеsts", function() {
        it("should be deployed", async function() {
            const {user0, ERC721_Token } = await loadFixture(deploy);        
            
            expect(ERC721_Token.target).to.be.properAddress;        
            expect(await ERC721_Token.name()).eq(tokenName);
            expect(await ERC721_Token.symbol()).eq(tokenSymbol);           
    
        });
    
        it("should have 0 eth by default", async function() {
            const { ERC721_Token } = await loadFixture(deploy);
    
            const balance = await ethers.provider.getBalance(ERC721_Token.target);        
            expect(balance).eq(0);
            
        });     

    });
    
    describe("minting functions", function(){
        
        it("should possible mint NFT", async function() {
        
            const { user0, user1, ERC721_Token} = await loadFixture(deploy);            
            
            
            const tx = await ERC721_Token.mint({value: mintPrice})
            await tx.wait(1);                     
            
            const balance_user0 = await ERC721_Token.balanceOf(user0);        
            expect(balance_user0).eq(1);   
            
            const ownerOf = await ERC721_Token.ownerOf(0);
            expect(ownerOf).eq(user0.address);

            expect(tx).changeEtherBalances([ERC721_Token, user0], [mintPrice, -mintPrice]);
        });       

        it("should possible safeMint NFT", async function() {
        
            const { user0, user1, ERC721_Token} = await loadFixture(deploy);            
            
            
            const tx = await ERC721_Token.safeMint({value: mintPrice})
            await tx.wait(1);                     
            
            const balance_user0 = await ERC721_Token.balanceOf(user0);        
            expect(balance_user0).eq(1);   
            
            const ownerOf = await ERC721_Token.ownerOf(0);
            expect(ownerOf).eq(user0.address);

            expect(tx).changeEtherBalances([ERC721_Token, user0], [mintPrice, -mintPrice]);
        });   
        
        it("should revert mint NFT with not enough funds", async function() {
        
            const { user0, user1, ERC721_Token} = await loadFixture(deploy);            
            
            await expect(ERC721_Token.mint({value: (mintPrice - 1n)})).to.be
                .revertedWithCustomError(ERC721_Token, "ERC721NotEnoughTransferredFunds")
                .withArgs(user0.address, mintPrice - 1n, mintPrice);            
        });       

        it("should revert safeMint NFT with not enough funds", async function() {
        
            const { user0, user1, ERC721_Token} = await loadFixture(deploy);            
            
            await expect(ERC721_Token.safeMint({value: (mintPrice - 1n)})).to.be
                .revertedWithCustomError(ERC721_Token, "ERC721NotEnoughTransferredFunds")
                .withArgs(user0.address, mintPrice - 1n, mintPrice);            
        });
        
        it("should revert mint NFT with exceeding the max supply", async function() {
        
            const { user0, user1, ERC721_Token} = await loadFixture(deploy);            
            const max = await ERC721_Token.maxSupply();
            let tx: any;
            for(let i = 0n; i != max; ++i) {
                tx = await ERC721_Token.mint({value: mintPrice})
                await tx.wait(1);                                     
            }
            
            await expect(ERC721_Token.mint({value: mintPrice})).to.be
              .revertedWithCustomError(ERC721_Token, "ERC721MintNotAvailable");

        }); 

        it("should revert safeMint NFT with exceeding the max supply", async function() {
        
            const { user0, user1, ERC721_Token} = await loadFixture(deploy);            
            const max = await ERC721_Token.maxSupply();
            let tx: any;
            for(let i = 0n; i != max; ++i) {
                tx = await ERC721_Token.mint({value: mintPrice})
                await tx.wait(1);                                     
            }
            
            await expect(ERC721_Token.safeMint({value: mintPrice})).to.be
              .revertedWithCustomError(ERC721_Token, "ERC721MintNotAvailable");

        }); 

        /*it("should revert safeMint NFT to non-NFTReciever address", async function() {
        
            const { user0, user1, ERC721_Token} = await loadFixture(deploy);            
            const code = "0x6000600d60003960006000f3"; // минимальный контракт с payable fallback

            // 1. Деплой
            const tx = await user0.sendTransaction({
            data: code,
            gasLimit: 100000,
            });

            const receipt = await tx.wait();
            const dummyAddr = receipt?.contractAddress;
            expect(dummyAddr).to.be.properAddress;

            // 2. Отправка ETH
            await user0.sendTransaction({
            to: dummyAddr,
            value: mintPrice + (ethers.parseUnits("0.01", "ether")), // с запасом на газ
            });

            // 3. Проверка safeMint (от имени dummyAddr)
            await expect(
            ethers.provider.call({
                to: ERC721_Token.getAddress(),
                from: dummyAddr,
                value: mintPrice,
                data: ERC721_Token.interface.encodeFunctionData("safeMint")
            })
            ).to.be.revertedWithCustomError(ERC721_Token, "ERC721InvalidReceiver");

        }); */
    });

    describe("burning", function(){
        
        it("should possible burn NFT", async function() {
            const { user0, user1, ERC721_Token} = await loadFixture(deploy);            
            
            //сминтим несколько штук, чтобы было, что сжигать
            let tx: any;
            const count = 3n;
            for(let i = 0n; i != count; ++i) {
                tx = await ERC721_Token.mint({value: mintPrice})
                await tx.wait(1);                                     
            }

            const balance_before = await ERC721_Token.balanceOf(user0);
            const tx_burn = await ERC721_Token.burn(1n);
            tx.wait(1);
            const balance_after = await ERC721_Token.balanceOf(user0);

            expect(balance_after).eq(balance_before - 1n);
            expect(await ERC721_Token.ownerOf(1n)).eq(ethers.ZeroAddress);        
            expect(await ERC721_Token.totalSupply()).eq(count - 1n);
        });

        it("should reveted burn not exists token", async function() {
            const { user0, user1, ERC721_Token} = await loadFixture(deploy);            
            
            //сминтим несколько штук, чтобы было, что сжигать
            let tx: any;
            const count = 3n;
            for(let i = 0n; i != count; ++i) {
                tx = await ERC721_Token.mint({value: mintPrice})
                await tx.wait(1);                                     
            }            
            await expect(ERC721_Token.burn(3n)).to.be
              .revertedWithCustomError(ERC721_Token, "ERC721NonexistentToken").withArgs(3n);           
            
        });

        it("should reveted burn not owned token", async function() {
            const { user0, user1, ERC721_Token} = await loadFixture(deploy);            
            
            //сминтим несколько штук, чтобы было, что сжигать
            let tx: any;
            const count = 3n;
            for(let i = 0n; i != count; ++i) {
                tx = await ERC721_Token.mint({value: mintPrice})
                await tx.wait(1);                                     
            }            
            await expect(ERC721_Token.connect(user1).burn(1n)).to.be
              .revertedWithCustomError(ERC721_Token, "ERC721InvalidOwner").withArgs(user1.address);        
            
        });
        
    });

    describe("transfers tests", function(){
        
        it("should possible transfer NFT", async function() {
            const { user0, user1, ERC721_Token} = await loadFixture(deploy);            
            
            //сминтим несколько штук, чтобы было, что переводить
            let tx: any;
            const count = 3n;
            for(let i = 0n; i != count; ++i) {
                tx = await ERC721_Token.mint({value: mintPrice})
                await tx.wait(1);                                     
            }

            const balance_user0_before = await ERC721_Token.balanceOf(user0);
            const balance_user1_before = await ERC721_Token.balanceOf(user1);

            const tx_transfer = await ERC721_Token.transferFrom(user0, user1, 2n);
            tx_transfer.wait(1);
            
            const balance_user0_after = await ERC721_Token.balanceOf(user0);
            const balance_user1_after = await ERC721_Token.balanceOf(user1);


            expect(balance_user0_after).eq(balance_user0_before - 1n);
            expect(balance_user1_after).eq(balance_user1_before + 1n);
            expect(await ERC721_Token.ownerOf(2n)).eq(user1.address);
            expect(await ERC721_Token.totalSupply()).eq(count);            
        });

        it("should possible safeTransfer NFT", async function() {
            const { user0, user1, user2, ERC721_Token} = await loadFixture(deploy);            
            
            //сминтим несколько штук, чтобы было, что переводить
            let tx: any;
            const count = 3n;
            for(let i = 0n; i != count; ++i) {
                tx = await ERC721_Token.mint({value: mintPrice})
                await tx.wait(1);                                     
            }

            const balance_user0_before = await ERC721_Token.balanceOf(user0);
            const balance_user1_before = await ERC721_Token.balanceOf(user1);

            const tx_transfer = await ERC721_Token["safeTransferFrom(address,address,uint256)"](user0, user1, 2n);
            tx_transfer.wait(1);
            
            const balance_user0_after = await ERC721_Token.balanceOf(user0);
            const balance_user1_after = await ERC721_Token.balanceOf(user1);

            expect(balance_user0_after).eq(balance_user0_before - 1n);
            expect(balance_user1_after).eq(balance_user1_before + 1n);
            expect(await ERC721_Token.ownerOf(2n)).eq(user1.address);
            expect(await ERC721_Token.totalSupply()).eq(count);           
            
        });

        it("should reveted transfer not exists token", async function() {
            const { user0, user1, ERC721_Token} = await loadFixture(deploy);            
            
            //сминтим несколько штук, чтобы было, что сжигать
            let tx: any;
            const count = 3n;
            for(let i = 0n; i != count; ++i) {
                tx = await ERC721_Token.mint({value: mintPrice})
                await tx.wait(1);                                     
            }                        
            
            await expect(ERC721_Token.transferFrom(user0, user1, 3n)).to.be
              .revertedWithCustomError(ERC721_Token, "ERC721NonexistentToken").withArgs(3n);                       
        });

        it("should reveted transfer not owned token", async function() {
            const { user0, user1, user2, ERC721_Token} = await loadFixture(deploy);            
            
            //сминтим несколько штук, чтобы было, что переводить
            let tx: any;
            const count = 3n;
            for(let i = 0n; i != count; ++i) {
                tx = await ERC721_Token.mint({value: mintPrice})
                await tx.wait(1);                                     
            }                        
            
            await expect(ERC721_Token.connect(user1).transferFrom(user0, user2, 2n)).to.be
              .revertedWithCustomError(ERC721_Token, "ERC721InsufficientApproval").withArgs(user0, 2n);
        });

         it("should reveted safeTransfer not owned token", async function() {
            const { user0, user1, user2, ERC721_Token} = await loadFixture(deploy);            
            
            //сминтим несколько штук, чтобы было, что переводить
            let tx: any;
            const count = 3n;
            for(let i = 0n; i != count; ++i) {
                tx = await ERC721_Token.mint({value: mintPrice})
                await tx.wait(1);                                     
            }                        
            
            await expect(ERC721_Token.connect(user1)["safeTransferFrom(address,address,uint256)"](user0, user2, 2n)).to.be
              .revertedWithCustomError(ERC721_Token, "ERC721InsufficientApproval").withArgs(user0, 2n);
        });

        it("should reveted transfer to self", async function() {
            const { user0, user1, user2, ERC721_Token} = await loadFixture(deploy);            
            
            //сминтим несколько штук, чтобы было, что переводить
            let tx: any;
            const count = 3n;
            for(let i = 0n; i != count; ++i) {
                tx = await ERC721_Token.mint({value: mintPrice})
                await tx.wait(1);                                     
            }                        
            
            await expect(ERC721_Token.transferFrom(user0, user0, 2n)).to.be
              .revertedWithCustomError(ERC721_Token, "ERC721InvalidReceiver").withArgs(user0);
        });

        it("should reveted safeTransfer to self", async function() {
            const { user0, user1, user2, ERC721_Token} = await loadFixture(deploy);            
            
            //сминтим несколько штук, чтобы было, что переводить
            let tx: any;
            const count = 3n;
            for(let i = 0n; i != count; ++i) {
                tx = await ERC721_Token.mint({value: mintPrice})
                await tx.wait(1);                                     
            }                        
            
            await expect(ERC721_Token["safeTransferFrom(address,address,uint256)"](user0, user0, 2n)).to.be
              .revertedWithCustomError(ERC721_Token, "ERC721InvalidReceiver").withArgs(user0);
        });

        it("should reveted transfer to ZeroAddress", async function() {
            const { user0, user1, user2, ERC721_Token} = await loadFixture(deploy);            
            
            //сминтим несколько штук, чтобы было, что переводить
            let tx: any;
            const count = 3n;
            for(let i = 0n; i != count; ++i) {
                tx = await ERC721_Token.mint({value: mintPrice})
                await tx.wait(1);                                     
            }                        
            
            await expect(ERC721_Token.transferFrom(user0, ethers.ZeroAddress, 2n)).to.be
              .revertedWithCustomError(ERC721_Token, "ERC721InvalidReceiver").withArgs(ethers.ZeroAddress);
        });

        it("should reveted safeTransfer to ZeroAddress", async function() {
            const { user0, user1, user2, ERC721_Token} = await loadFixture(deploy);            
            
            //сминтим несколько штук, чтобы было, что переводить
            let tx: any;
            const count = 3n;
            for(let i = 0n; i != count; ++i) {
                tx = await ERC721_Token.mint({value: mintPrice})
                await tx.wait(1);                                     
            }                        
            
            await expect(ERC721_Token["safeTransferFrom(address,address,uint256)"](user0, ethers.ZeroAddress, 2n)).to.be
              .revertedWithCustomError(ERC721_Token, "ERC721InvalidReceiver").withArgs(ethers.ZeroAddress);
        });
    });

    describe("Approves", function(){
        
        it("should possible approve NFT", async function() {
            const { user0, user1, user2, ERC721_Token} = await loadFixture(deploy);            
            
            //сминтим несколько штук, чтобы было, на чем экспериментировать
            let tx: any;
            const count = 3n;
            for(let i = 0n; i != count; ++i) {
                tx = await ERC721_Token.mint({value: mintPrice})
                await tx.wait(1);                                     
            }

            const tx_appove = await ERC721_Token.approve(user1.address, 2n);
            tx_appove.wait(1);

            const user = await ERC721_Token.getApproved(2n);

            const tx_test_transfer = await ERC721_Token.connect(user1).transferFrom(user0, user2, 2n);
            tx_test_transfer.wait(1);
            const balance_user2 = await ERC721_Token.balanceOf(user2);
            
            expect(user).eq(user1);
            expect(balance_user2).eq(1n);            
        });

        it("should reveted approve to not exists token", async function() {
            const { user0, user1, ERC721_Token} = await loadFixture(deploy);            
            
            //сминтим несколько штук, чтобы было, на чем экспериментировать
            let tx: any;
            const count = 3n;
            for(let i = 0n; i != count; ++i) {
                tx = await ERC721_Token.mint({value: mintPrice})
                await tx.wait(1);                                     
            }            
            await expect(ERC721_Token.approve(user1, 3n)).to.be
              .revertedWithCustomError(ERC721_Token, "ERC721NonexistentToken").withArgs(3n);           
            
        });

        it("should reveted approvе not owned token", async function() {
            const { user0, user1, user2, ERC721_Token} = await loadFixture(deploy);            
            
            //сминтим несколько штук, чтобы было, на чем экспериментировать
            let tx: any;
            const count = 3n;
            for(let i = 0n; i != count; ++i) {
                tx = await ERC721_Token.mint({value: mintPrice})
                await tx.wait(1);                                     
            }            
            await expect(ERC721_Token.connect(user1).approve(user2, 1n)).to.be
              .revertedWithCustomError(ERC721_Token, "ERC721InvalidApprover").withArgs(user1.address);        
            
        });

        it("should reveted approve to self", async function() {
            const { user0, user1, user2, ERC721_Token} = await loadFixture(deploy);            
            
            //сминтим несколько штук, чтобы было, что переводить
            let tx: any;
            const count = 3n;
            for(let i = 0n; i != count; ++i) {
                tx = await ERC721_Token.mint({value: mintPrice})
                await tx.wait(1);                                     
            }                        
            
            await expect(ERC721_Token.approve(user0, 2n)).to.be
              .revertedWithCustomError(ERC721_Token, "ERC721InvalidOperator").withArgs(user0);
        });

        it("should possible approve for All", async function() {
            const { user0, user1, user2, ERC721_Token} = await loadFixture(deploy);            
            
            //сминтим несколько штук, чтобы было, на чем экспериментировать
            let tx: any;
            const count = 3n;
            for(let i = 0n; i != count; ++i) {
                tx = await ERC721_Token.mint({value: mintPrice})
                await tx.wait(1);                                     
            }

            const tx_appoveAll = await ERC721_Token.setApprovalForAll(user1, true);
            tx_appoveAll.wait(1);

            const isApprove = await ERC721_Token.isApprovedForAll(user0, user1);

            expect(isApprove).true;

            const tx_test_transfer = await ERC721_Token.connect(user1).transferFrom(user0, user2, 2n);
            tx_test_transfer.wait(1);
            const balance_user2 = await ERC721_Token.balanceOf(user2);            
            
            expect(balance_user2).eq(1n);            
        });

        it("should reveted approveForAll to self", async function() {
            const { user0, user1, user2, ERC721_Token} = await loadFixture(deploy);            
            
            //сминтим несколько штук, чтобы было, что переводить
            let tx: any;
            const count = 3n;
            for(let i = 0n; i != count; ++i) {
                tx = await ERC721_Token.mint({value: mintPrice})
                await tx.wait(1);                                     
            }                        
            
            await expect(ERC721_Token.setApprovalForAll(user0, true)).to.be
              .revertedWithCustomError(ERC721_Token, "ERC721InvalidOperator").withArgs(user0);
        });

        it("should reveted approveForAll to ZeroAddress", async function() {
            const { user0, user1, user2, ERC721_Token} = await loadFixture(deploy);            
            
            //сминтим несколько штук, чтобы было, что переводить
            let tx: any;
            const count = 3n;
            for(let i = 0n; i != count; ++i) {
                tx = await ERC721_Token.mint({value: mintPrice})
                await tx.wait(1);                                     
            }                        
            
            await expect(ERC721_Token.setApprovalForAll(ethers.ZeroAddress, true)).to.be
              .revertedWithCustomError(ERC721_Token, "ERC721InvalidOperator").withArgs(ethers.ZeroAddress);
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

