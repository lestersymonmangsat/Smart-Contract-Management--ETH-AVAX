// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Assessment {
    mapping(address => uint) private balances;

    event Deposit(address indexed account, uint amount);
    event Withdrawal(address indexed account, uint amount);
    event Purchase(address indexed account, string item, uint amount);

    function deposit() public payable {
        require(msg.value > 0, "Deposit amount must be greater than zero");
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint _amount) public {
        require(_amount <= balances[msg.sender], "Insufficient balance");
        balances[msg.sender] -= _amount;
        payable(msg.sender).transfer(_amount);
        emit Withdrawal(msg.sender, _amount);
    }

    function getBalance() public view returns (uint) {
        return balances[msg.sender];
    }

    function buyCloth(string memory _item, uint _price) public {
        require(_price <= balances[msg.sender], "Insufficient balance to buy this item");
        balances[msg.sender] -= _price;
        emit Purchase(msg.sender, _item, _price);
    }
}
