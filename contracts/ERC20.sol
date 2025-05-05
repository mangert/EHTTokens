// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "./IERC20.sol";
import "./ERC20Errors.sol";

contract ERC20  is IERC20, ERC20Errors {

    string public override name;
    string public override symbol;
    uint8 public override decimals;
    uint256 public override totalSupply;   

    mapping (address owner => uint256 balance) public override balanceOf;

    mapping (address owner => mapping(address spender => uint256 amount)) public override allowance;        

    constructor() {

        name = "Ametist";
        symbol = "AME";

        uint8 _decimals = 16;
        decimals = _decimals;        
        
        uint256 supply = 1_000_000_000 * (10 ** _decimals);
        balanceOf[msg.sender] = supply;
        totalSupply = supply;
        emit Transfer(address(0), msg.sender, supply);                       
    }

    function transfer(address _to, uint256 _amount) external override returns (bool) {       
                
        return  _transfer(msg.sender, _to, _amount);
        
    } 
    
    function transferFrom(address _from, address _to, uint256 _amount) external override returns (bool) {
        
        uint256 limit = allowance[_from][msg.sender];        
        require((msg.sender == _from || _amount <= limit), ERC20InsufficientAllowance(_from, limit, _amount));
        
        return _transfer(_from, _to, _amount);        
    }
    
    function approve(address _spender, uint256 _amount) external returns (bool) {
        
        require(_spender != address(0), ERC20InvalidSpender(_spender));
        
        allowance[msg.sender][_spender] = _amount;
        emit Approval(msg.sender, _spender, _amount);        

        return  true;  
    
    }     

    //служебные функции

    function _transfer(address _from, address _to, uint256 _amount) internal returns(bool) {

        require(_from != address(0), ERC20InvalidSender(_from));
        require(_to != address(0), ERC20InvalidReceiver(_to));
        require(_to != _from, ERC20InvalidReceiver(_to));              
        
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