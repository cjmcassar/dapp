import { MyToken__factory } from "./../typechain-types/factories/contracts/ERC20Votes.sol/MyToken__factory";
import { ethers } from "ethers";
import * as dotenv from "dotenv";
dotenv.config();

const CONTRACT_ADDRESS = "once deployed, copy the contract address here";
const ADDRESSES = ["0xf7602a8c78d167e15e56bf84f6e49e98f8000cea"];

// create function that mints tokens from smart contract
async function mintTokens() {
	const options = {
		alchemy: process.env.ALCHEMY_API_KEY,
		infura: process.env.INFURA_API_KEY,
	};

	const provider = ethers.getDefaultProvider("goerli", options);
	// connect to wallet
	const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "");
	const signer = wallet.connect(provider);
	// check if wallet has ether to mint tokens
	const balanceBN = await signer.getBalance();
	console.log("Balance: ", ethers.utils.formatEther(balanceBN));
	const balance = Number(ethers.utils.formatEther(balanceBN));
	if (balance < 0.1) {
		throw new Error("Insufficient funds to mint tokens");
	}

	// get the deployed contract
	const tokenContractFactory = new MyToken__factory(signer);
	const tokenContract = tokenContractFactory.attach(CONTRACT_ADDRESS);

	// mint tokens
	const mintTx = await tokenContract.mint(ADDRESSES[0], 1);
	await mintTx.wait();
	console.log("Minted token");

	// check token balance in wallet after minting
	const balanceAfterMint = await tokenContract.balanceOf(ADDRESSES[0]);
	console.log("Balance after minting: ", balanceAfterMint.toString());
}

mintTokens()
	.catch((error) => {
		console.error(error);
		process.exitCode = 1;
	})
	.finally(() => process.exit());
