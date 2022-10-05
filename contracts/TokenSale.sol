// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IMyERC20Token is IERC20 {
    function mint(address to, uint256 amount) external;

    function burnFrom(address from, uint256 amount) external;
}

interface IMyERC721Token is IERC721 {
    function safeMint(address to, uint256 tokenId) external;

    function burn(uint256 tokenId) external;
}

contract TokenSale is Ownable {
    uint256 public ratio;
    uint256 public price;
    IMyERC20Token public paymentToken;
    IMyERC721Token public nftContract;
    uint256 public ownerPool;

    constructor(
        uint256 _ratio,
        uint256 _price,
        address _paymentToken,
        address _nftContract
    ) {
        ratio = _ratio;
        price = _price;
        paymentToken = IMyERC20Token(_paymentToken);
        nftContract = IMyERC721Token(_nftContract);
    }

    function buyTokens() public payable {
        uint256 paymentReceived = msg.value;
        uint256 amountToBeGiven = paymentReceived / ratio;
        paymentToken.mint(msg.sender, amountToBeGiven);
    }

    function burnTokens(uint256 amount) public {
        paymentToken.burnFrom(msg.sender, amount);
        uint256 amountToBeReturned = amount * ratio;
        payable(msg.sender).transfer(amountToBeReturned);
    }

    function buyNft(uint256 tokenId) public {
        paymentToken.transferFrom(msg.sender, address(this), price);
        nftContract.safeMint(msg.sender, tokenId);
        ownerPool += price / 2;
    }

    function burnNft(uint256 tokenId) public {
        nftContract.burn(tokenId);
        paymentToken.transfer(msg.sender, price / 2);
    }

    function withdraw(uint256 amount) public onlyOwner {
        require(amount <= ownerPool);
        ownerPool -= amount;
        paymentToken.transfer(msg.sender, amount);
    }
}