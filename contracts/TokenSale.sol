// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IMyERC20Token is IERC20 {
    function mint(address to, uint256 amount) external;
}

contract TokenSale {
    uint256 public ratio;
    IMyERC20Token public paymentToken;

    constructor(uint256 _ratio, address _paymentToken) {
        ratio = _ratio;
        paymentToken = IMyERC20Token(_paymentToken);
    }

    function buyTokens() public payable{
        uint256 paymentReceived = msg.value;
        uint256 amountToBeGiven = paymentReceived / ratio;
        paymentToken.mint(msg.sender, amountToBeGiven);
    }
}