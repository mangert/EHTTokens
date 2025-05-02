// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "./IERC6093.sol";

contract ERC20  is IERC6093 {

    string public override name;
    string public override symbol;
    uint8 public override decimals;
    uint256 public override totalSupply;

    address contractOwner;

    mapping (address owner => uint256 balance) public override balanceOf;

    mapping (address owner => mapping(address spender => uint256 amount)) public override allowance;

    modifier onlyOwnerOrApprover(address _from, uint256 _amount) {
        uint256 limit = allowance[_from][msg.sender];        
        
        require((msg.sender == _from || _amount > limit), ERC20InsufficientAllowance(_from, limit, _amount));
       
        _;        
    }    

    constructor() {

        name = "Ametist";
        symbol = "AME";

        uint8 _decimals = 16;
        decimals = _decimals;

        contractOwner = msg.sender;
        
        uint256 supply = 1_000_000_000 * (10 ** _decimals);
        balanceOf[contractOwner] = supply;
        totalSupply = supply;
        emit Transfer(address(0), msg.sender, supply);                       
    }

    function transfer(address _to, uint256 _amount) external returns (bool success) {return  true;} 
    function transferFrom(address _from, address _to, uint256 _amount) external returns (bool success) {return  true;}
    function approve(address _spender, uint256 _amount) external returns (bool success) {return  true;}     



    //служебные функции

    function _transfer(address _from, address _to, uint256 _amount) private onlyOwnerOrApprover(_from, _amount) returns(bool) {

        require(_from != address(0), ERC20InvalidSender(_from));
        require(_to != address(0), ERC20InvalidReceiver(_to));
        
        uint256 balance = balanceOf[_from];
        require(_amount < balance, ERC20InsufficientBalance(_from, balance, _amount));

        unchecked {
            balanceOf[_from] = balance - _amount;    
        }        
        balanceOf[_to] += _amount;

        emit Transfer(_from, _to, _amount);
        
        return true;

    }

}