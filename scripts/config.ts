//настройки для верификации ЕRC-20    
    const ERC20_contractAddress = "0x2b27530BD462d612491d3E9A8538bBD7D8009D00"; //подставить после деплоя

 //настройки для ЕRC-721
    const ERC721_argsObject  = 
    {
        token_name:  "GreekAlphabet", 
        token_sym: "ELL",
        link: "https://raw.githubusercontent.com/mangert/NFTMetadataStorage/refs/heads/main/",
        max_supply: 25n, //maxSupply
        mint_price: 100000000000000000n       

    }
    const getERC721ArgsArray = (): [string, string, string, bigint, bigint] => [
        ERC721_argsObject.token_name,
        ERC721_argsObject.token_sym,
        ERC721_argsObject.link,
        ERC721_argsObject.max_supply,
        ERC721_argsObject.mint_price
];
        
    const ERC721_contractAddress = "0xA6B8dac4980b4C8Bc46ff8a28e256699a337fD26"; //подставить после деплоя


export {ERC20_contractAddress, getERC721ArgsArray, ERC721_contractAddress};