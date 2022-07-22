//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.9;

contract Founder {

    address owner;

    // will decrease with time after every single milestone
    uint256 public rate = 1000000000000000000;

    // the limit of founder that can be
    uint16 public limit = 1000;

    // the total number of founder
    uint16 public total = 0;

    // founder addresses
    mapping(address => bool) founders;

    event FounderAdded(address founder);
    event Withdraw(address founder, uint256 amount);
    event Milestone(address founder, uint256 amount);

    modifier onlyOwner {
        require(msg.sender == owner, "Only owner can call this function.");
        _;
    }

    constructor(address _owner) {
        owner = _owner;
    }

    function balance() external view returns (uint256) {
        return address(this).balance;
    }

    function addToFounder(address _addr) external payable {
        require(founders[_addr] == false, 'Already a founder');
        require(msg.value == 1000000000000000000, 'Not enough ETH');
        require(total < limit, 'Limit reached');
        founders[_addr] = true;
        total += 1;
        emit FounderAdded(_addr);
    }

    function removeFromFounder() external payable {
        require(founders[msg.sender] == true, 'Not a founder');
        require(address(this).balance > 0, 'Not enough ETH inside the contract');
        founders[msg.sender] = false;
        total -= 1;
        (bool os, ) = payable(msg.sender).call{value: rate}("");
        require(os, "");
        emit Withdraw(msg.sender, rate);
    }

    function milestone(uint256 _newRate) external payable onlyOwner() {
        uint256 oldRate = rate;
        uint256 takeOut = oldRate - _newRate;
        uint256 amountToTake = total * takeOut;
        rate = _newRate;
        require(address(this).balance > amountToTake, 'Not enough ETH inside the contract');
        (bool os, ) = payable(owner).call{value: amountToTake}("");
        require(os, "");
        emit Milestone(msg.sender, amountToTake);
    }

    function isFounder(address _addr) external view returns (bool) {
        return founders[_addr];
    }

    function setRate(uint256 _rate) external {
        rate = _rate;
    }

    function setLimit(uint16 _limit) external {
        limit = _limit;
    }
}