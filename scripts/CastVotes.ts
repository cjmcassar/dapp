import { TokenizedBallot__factory } from "./../typechain-types/factories/contracts/TokenizedBallot.sol/TokenizedBallot__factory";
import { MyToken__factory } from "./../typechain-types/factories/contracts/ERC20Votes.sol/MyToken__factory";
import { ethers } from "ethers";
import * as dotenv from "dotenv";

dotenv.config();

const TOKEN_BALLOT_CONTRACT_ADDRESS =
	"0x203AE32F1cbC9b6130615B384d2d6AF9005ae62a";
const TOKEN_CONTRACT_ADDRESS = "0x1e0B640B04779a0dE4799f586CFa96c2423d628E";
const ADDRESSES = [
	"0xf7602a8c78d167e15e56bf84f6e49e98f8000cea",
	"0xF54c4046226886eA8cd25E5D3f0ae8f085aA27CC",
	"0x9eac4B9D614325eA6577D10CaAB5080314a07253",
	"0xd3CcD60305981931d21c8E0D01b55EfB2CC47E8a",
	"0x0f12628C8aDFf1E28Ff3351915AfEF97Cfe92f85",
];

const PROPOSALS = [
	"0x50726f706f73616c000000000000000000000000000000000000000000000000",
	"0x50726f706f73616c000000000000000000000000000000000000000000000000",
	"0x50726f706f73616c000000000000000000000000000000000000000000000000",
];

const TOKEN_AMOUNT = ethers.utils.parseEther("1");

// function that mints tokens from smart contract
async function vote() {
	const options = {
		alchemy: process.env.ALCHEMY_API_KEY,
		infura: process.env.INFURA_API_KEY,
	};

	const provider = ethers.getDefaultProvider("goerli", options);
	// connect to wallet
	const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "");
	const signer = wallet.connect(provider);
	// check if wallet has ether
	const balanceBN = await signer.getBalance();
	console.log("Balance: ", ethers.utils.formatEther(balanceBN));
	const balance = Number(ethers.utils.formatEther(balanceBN));
	if (balance < 0.01) {
		throw new Error("Insufficient funds to mint tokens");
	}

	//Get the deployed contract
	const ballotFactory = new TokenizedBallot__factory(signer);
	const ballotContract = await ballotFactory.attach(
		TOKEN_BALLOT_CONTRACT_ADDRESS
	);

	//cast vote
	console.log("casting vote");

	const castVoteTx = await ballotContract.vote(1, 2);
	const castVoteTxReceipt = await castVoteTx.wait();
	console.log({ castVoteTxReceipt });
}

vote()
	.catch((error) => {
		console.error(error);
		process.exitCode = 1;
	})
	.finally(() => process.exit());
