import { ethers } from "ethers";
import { MyToken__factory } from "../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();

const CONTRACT_ADDRESS = "contract address here";
const ADDRESSES = ["voter addresses here", ""];

const TOKEN_MINT = ethers.utils.parseEther("1");

// create function that gives voting tokens to voters
async function giveVotingTokens() {
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
	const ballotContractFactory = new MyToken__factory(signer);
	const ballotContract = ballotContractFactory.attach(CONTRACT_ADDRESS);

	// give voting tokens
	const giveTx = await ballotContract.mint(ADDRESSES[0], TOKEN_MINT);
	await giveTx.wait();
	console.log("Gave voting tokens");

	// check token balance in wallet after minting
	const balanceAfterMint = await ballotContract.balanceOf(ADDRESSES[0]);
	console.log("Balance after minting: ", balanceAfterMint.toString());
}

giveVotingTokens()
	.catch((error) => {
		console.error(error);
		process.exitCode = 1;
	})
	.finally(() => process.exit());
