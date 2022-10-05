import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { MyERC20Token, MyERC721Token, TokenSale } from "../typechain-types";

const TOKEN_RATIO = 5;
const NFT_PRICE = 1;

describe("NFT Shop", async () => {
	let tokenSaleContract: TokenSale;
	let erc20TokenContract: MyERC20Token;
	let erc721TokenContract: MyERC721Token;
	let deployer: SignerWithAddress;
	let acc1: SignerWithAddress;
	let acc2: SignerWithAddress;

	beforeEach(async () => {
		[deployer, acc1, acc2] = await ethers.getSigners();

		const erc20TokenContractFactory = await ethers.getContractFactory(
			"MyERC20Token"
		);
		const erc721TokenContractFactory = await ethers.getContractFactory(
			"MyERC721Token"
		);
		const tokenSaleContractFactory = await ethers.getContractFactory(
			"TokenSale"
		);
		erc20TokenContract = await erc20TokenContractFactory.deploy();
		await erc20TokenContract.deployed();

		erc721TokenContract = await erc721TokenContractFactory.deploy();
		await erc721TokenContract.deployed();

		tokenSaleContract = await tokenSaleContractFactory.deploy(
			TOKEN_RATIO,
			NFT_PRICE,
			erc20TokenContract.address,
			erc721TokenContract.address
		);
		await tokenSaleContract.deployed();

		const MINTER_ROLE = await erc20TokenContract.MINTER_ROLE();
		const grantRoleTx = await erc20TokenContract.grantRole(
			MINTER_ROLE,
			tokenSaleContract.address
		);
		await grantRoleTx.wait();
		// TODO: give minter role for tokenSaleContract at erc721TokenContract
	});

	describe("When the Shop contract is deployed", async () => {
		it("defines the ratio as provided in parameters", async () => {
			const ratio = await tokenSaleContract.ratio();
			expect(ratio).to.eq(TOKEN_RATIO);
		});

		it("uses a valid ERC20 as payment token", async () => {
			const paymentTokenAddress = await tokenSaleContract.paymentToken();
			expect(paymentTokenAddress).to.eq(erc20TokenContract.address);
			const erc20ContractFactory = await ethers.getContractFactory(
				"MyERC20Token"
			);
			const paymentTokenContract =
				erc20ContractFactory.attach(paymentTokenAddress);
			const totalSupply = await paymentTokenContract.totalSupply();
			expect(totalSupply).to.eq(0);
			const myBalance = await paymentTokenContract.balanceOf(deployer.address);
			expect(myBalance).to.eq(0);
		});
	});

	describe("When a user purchase an ERC20 from the Token contract", async () => {
		const paymentAmount = ethers.utils.parseEther("1");
		const purchaseAmount = paymentAmount.div(TOKEN_RATIO);
		let balanceBeforeBuyTokens: BigNumber;
		let gasFeesBuyTokens: BigNumber;

		beforeEach(async () => {
			balanceBeforeBuyTokens = await acc1.getBalance();
			const burnTokensTx = await tokenSaleContract
				.connect(acc1)
				.buyTokens({ value: paymentAmount });
			const burnTokensTxReceipt = await burnTokensTx.wait();
			const gasUsedBuyTokens = burnTokensTxReceipt.gasUsed;
			const gasPriceBuyTokens = burnTokensTxReceipt.effectiveGasPrice;
			gasFeesBuyTokens = gasUsedBuyTokens.mul(gasPriceBuyTokens);
		});

		it("charges the correct amount of ETH", async () => {
			const balanceAfterBuyTokens = await acc1.getBalance();
			const diff = balanceBeforeBuyTokens.sub(balanceAfterBuyTokens);
			const expectedDiff = paymentAmount.add(gasFeesBuyTokens);
			const error = diff.sub(expectedDiff);
			expect(error).to.eq(0);
		});

		it("gives the correct amount of tokens", async () => {
			const acc1Balance = await erc20TokenContract.balanceOf(acc1.address);
			expect(acc1Balance).to.eq(purchaseAmount);
		});

		it("increases the contract balance", async () => {
			const balanceContract = await ethers.provider.getBalance(
				tokenSaleContract.address
			);
			expect(balanceContract).to.eq(paymentAmount);
		});

		describe("When a user burns an ERC20 at the Token contract", async () => {
			let gasFeesBurnTokens: BigNumber;
			let gasFeesApprove: BigNumber;

			beforeEach(async () => {
				const approveTx = await erc20TokenContract
					.connect(acc1)
					.approve(tokenSaleContract.address, purchaseAmount);
				const approveTxReceipt = await approveTx.wait();
				const gasUsedApprove = approveTxReceipt.gasUsed;
				const gasPriceApprove = approveTxReceipt.effectiveGasPrice;
				gasFeesApprove = gasUsedApprove.mul(gasPriceApprove);
				const burnTokensTx = await tokenSaleContract
					.connect(acc1)
					.burnTokens(purchaseAmount);
				const burnTokensTxReceipt = await burnTokensTx.wait();
				const gasUsedBurnTokens = burnTokensTxReceipt.gasUsed;
				const gasPriceBurnTokens = burnTokensTxReceipt.effectiveGasPrice;
				gasFeesBurnTokens = gasUsedBurnTokens.mul(gasPriceBurnTokens);
			});

			it("gives the correct amount of ETH", async () => {
				const balanceAfterBurnTokens = await acc1.getBalance();
				const diff = balanceBeforeBuyTokens.sub(balanceAfterBurnTokens);
				const expectedDiff = gasFeesBuyTokens
					.add(gasFeesApprove)
					.add(gasFeesBurnTokens);
				const error = diff.sub(expectedDiff);
				expect(error).to.eq(0);
			});

			it("burns the correct amount of tokens", async () => {
				const acc1Balance = await erc20TokenContract.balanceOf(acc1.address);
				expect(acc1Balance).to.eq(0);
				const totalSupply = await erc20TokenContract.totalSupply();
				expect(totalSupply).to.eq(0);
			});
		});

		describe("When a user purchase a NFT from the Shop contract", async () => {
			it("charges the correct amount of ETH", async () => {
				throw new Error("Not implemented");
			});

			it("updates the owner account correctly", async () => {
				throw new Error("Not implemented");
			});

			it("update the pool account correctly", async () => {
				throw new Error("Not implemented");
			});

			it("favors the pool with the rounding", async () => {
				throw new Error("Not implemented");
			});

			describe("When a user burns their NFT at the Shop contract", async () => {
				it("gives the correct amount of ERC20 tokens", async () => {
					throw new Error("Not implemented");
				});
				it("updates the pool correctly", async () => {
					throw new Error("Not implemented");
				});
			});

			describe("When the owner withdraw from the Shop contract", async () => {
				it("recovers the right amount of ERC20 tokens", async () => {
					throw new Error("Not implemented");
				});

				it("updates the owner account correctly", async () => {
					throw new Error("Not implemented");
				});
			});
		});
	});
});
