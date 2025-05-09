import { PayableOverrides } from "../typechain-types/common";
import { loadFixture, ethers, expect } from "./setup";
import { network } from "hardhat";

describe("ERC721", function() {
    
    const tokenName = "Alphabet";
    const tokenSymbol = "ABC";
    const collectionURI = "https://raw.githubusercontent.com/mangert/NFTMetadataStorage/refs/heads/main/";
    
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
                tx = await ERC721_Token.mint({value: mintPrice});
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
                tx = await ERC721_Token.mint({value: mintPrice});
                await tx.wait(1);                                     
            }
            
            await expect(ERC721_Token.safeMint({value: mintPrice})).to.be
              .revertedWithCustomError(ERC721_Token, "ERC721MintNotAvailable");

        });         
    });

    describe("burning", function(){
        
        it("should possible burn NFT", async function() {
            const { user0, user1, ERC721_Token} = await loadFixture(deploy);            
            
            //сминтим несколько штук, чтобы было, что сжигать
            let tx: any;
            const count = 3n;
            for(let i = 0n; i != count; ++i) {
                tx = await ERC721_Token.mint({value: mintPrice});
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
                tx = await ERC721_Token.mint({value: mintPrice});
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
                tx = await ERC721_Token.mint({value: mintPrice});
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
                tx = await ERC721_Token.mint({value: mintPrice});
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
                tx = await ERC721_Token.mint({value: mintPrice});
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
                tx = await ERC721_Token.mint({value: mintPrice});
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
                tx = await ERC721_Token.mint({value: mintPrice});
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
                tx = await ERC721_Token.mint({value: mintPrice});
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
                tx = await ERC721_Token.mint({value: mintPrice});
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
                tx = await ERC721_Token.mint({value: mintPrice});
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
                tx = await ERC721_Token.mint({value: mintPrice});
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
                tx = await ERC721_Token.mint({value: mintPrice});
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
                tx = await ERC721_Token.mint({value: mintPrice});
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
                tx = await ERC721_Token.mint({value: mintPrice});
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
                tx = await ERC721_Token.mint({value: mintPrice});
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
                tx = await ERC721_Token.mint({value: mintPrice});
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
                tx = await ERC721_Token.mint({value: mintPrice});
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
                tx = await ERC721_Token.mint({value: mintPrice});
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
                tx = await ERC721_Token.mint({value: mintPrice});
                await tx.wait(1);                                     
            }                        
            
            await expect(ERC721_Token.setApprovalForAll(ethers.ZeroAddress, true)).to.be
              .revertedWithCustomError(ERC721_Token, "ERC721InvalidOperator").withArgs(ethers.ZeroAddress);
        });
        
    });

    describe("withdraw", function(){
        
        it("should possible withdraw by owner", async function() {
            const { user0, user1, ERC721_Token} = await loadFixture(deploy);            
            
            //сминтим несколько штук, чтобы были деньги на контракте
            let tx: any;
            const count = 3n;
            let contractFunds = 0n;
            for(let i = 0n; i != count; ++i) {
                tx = await ERC721_Token.connect(user1).mint({value: mintPrice});
                contractFunds += mintPrice;
                await tx.wait(1);                                     
            }
            const tx_withdraw = await ERC721_Token.withdrawAll();            
            
            expect(await tx_withdraw).changeEtherBalances([await ERC721_Token.getAddress(), user0], [contractFunds, -contractFunds]);
        });

        it("should reveted withdraw by non contract owner", async function() {
            const { user0, user1, ERC721_Token} = await loadFixture(deploy);            
            
            //сминтим несколько штук, чтобы были деньги на контракте
            let tx: any;
            const count = 3n;
            for(let i = 0n; i != count; ++i) {
                tx = await ERC721_Token.mint({value: mintPrice})
                await tx.wait(1);                                     
            }                        
            await expect(ERC721_Token.connect(user1).withdrawAll())
                .revertedWithCustomError(ERC721_Token, "ERC721NotAllowedWithdraw")
                .withArgs(user1);            
        });        
    });

    
    describe("enumerable fuctions", function(){
        
        it("should correct index before mint tokens", async function() {
            const { user0, user1, ERC721_Token} = await loadFixture(deploy);                      
            
            let totalSupply = await ERC721_Token.totalSupply();
            expect(totalSupply).eq(0);

            let index = 0n;
            await expect(ERC721_Token.tokenByIndex(index)).to.be
            .revertedWithCustomError(ERC721_Token, "ERC721OutOfBoundsIndex")
            .withArgs(ethers.ZeroAddress, index);

            await expect(ERC721_Token.tokenOfOwnerByIndex(user1, ++index)).to.be
            .revertedWithCustomError(ERC721_Token, "ERC721OutOfBoundsIndex")
            .withArgs(user1, index);

        });

        it("should correct index after mint", async function() {
            const { user0, user1, ERC721_Token} = await loadFixture(deploy);            
            
            //сминтим несколько штук, чтобы было, что считать
            let tx: any;
            const count = 3n;
            let contractFunds = 0n;
            for(let i = 0n; i != count; ++i) {
                tx = await ERC721_Token.mint({value: mintPrice});
                contractFunds += mintPrice;
                await tx.wait(1);                                     
            }
            
            //проверка после минта
            let totalSupply = await ERC721_Token.totalSupply();
            expect(totalSupply).eq(count);
            
            let index_0 = await ERC721_Token.tokenByIndex(0);
            expect(index_0).eq(0n);

            let index_2 = await ERC721_Token.tokenByIndex(2);
            expect(index_2).eq(2n);

            let user_index_1 = await ERC721_Token.tokenOfOwnerByIndex(user0, 1);
            expect(user_index_1).eq(1n);            

            //проверка после перевода
            
            const tx_transfer = await ERC721_Token.transferFrom(user0, user1, 1n);
            tx_transfer.wait(1);

            totalSupply = await ERC721_Token.totalSupply();
            expect(totalSupply).eq(count);

            index_0 = await ERC721_Token.tokenByIndex(0);
            expect(index_0).eq(0n);

            index_2 = await ERC721_Token.tokenByIndex(2);
            expect(index_2).eq(2n);

            let user_0_index_1 = await ERC721_Token.tokenOfOwnerByIndex(user0, 1);          
            expect(user_0_index_1).eq(2n);            
            
            let user_1_index_0 = await ERC721_Token.tokenOfOwnerByIndex(user1, 0);
            expect(user_1_index_0).eq(1n);            
        });

        it("should correct index after burn", async function() {
            const { user0, user1, ERC721_Token} = await loadFixture(deploy);            
            
            //сминтим несколько штук, чтобы было, что считать
            let tx: any;
            const count = 3n;
            let contractFunds = 0n;
            for(let i = 0n; i != count; ++i) {
                tx = await ERC721_Token.mint({value: mintPrice});
                contractFunds += mintPrice;
                await tx.wait(1);                                     
            }           
            
            const totalSupply_before = await ERC721_Token.totalSupply();
            const tx_burn = await ERC721_Token.burn(1);
            const totalSupply_after = await ERC721_Token.totalSupply();
            
            expect(totalSupply_after).eq(totalSupply_before - 1n);

            const indexTotal = await ERC721_Token.tokenByIndex(1);
            expect(indexTotal).eq(2n);
            
            const indexUser = await ERC721_Token.tokenOfOwnerByIndex(user0, 1);          
            expect(indexUser).eq(2n);            
        });
    });

    describe("metadata", function(){
        
        it("should returns correct URI", async function() {
            const { user0, user1, ERC721_Token} = await loadFixture(deploy);            
            
            //сминтим несколько штук, чтобы были NFT для запроса
            let tx: any;
            const count = 3n;
            let contractFunds = 0n;
            for(let i = 0n; i != count; ++i) {
                tx = await ERC721_Token.connect(user1).mint({value: mintPrice});
                contractFunds += mintPrice;
                await tx.wait(1);                                     
            }

            const url = await ERC721_Token.tokenURI(1);           

            const response = await fetch(url);
            if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const metadata = await response.json();

            expect(metadata.name).eq("Alpha");          
            
        });

        it("should reverted request not exists token URI", async function() {
            const { user0, user1, ERC721_Token} = await loadFixture(deploy);            
            
            //сминтим несколько штук, чтобы были NFT для запроса
            let tx: any;
            const count = 3n;
            let contractFunds = 0n;
            for(let i = 0n; i != count; ++i) {
                tx = await ERC721_Token.connect(user1).mint({value: mintPrice});
                contractFunds += mintPrice;
                await tx.wait(1);                                     
            }

            await expect (ERC721_Token.tokenURI(5)).to.be
            .revertedWithCustomError(ERC721_Token, "ERC721NonexistentToken")
            .withArgs(5);           
            
            
        });
    });
})
