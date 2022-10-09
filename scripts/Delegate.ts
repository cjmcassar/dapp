import { MyToken__factory } from "./../typechain-types/factories/contracts/ERC20Votes.sol/MyToken__factory";
import { ethers } from "ethers";
import * as dotenv from "dotenv";
dotenv.config();

const TOKEN_CONTRACT = "0x107052260BfC157cab653c6C01BADbDD1A4Bd424";

const ADDRESSES = [
	"0xf7602a8c78d167e15e56bf84f6e49e98f8000cea",
	"0xF54c4046226886eA8cd25E5D3f0ae8f085aA27CC",
	"0x9eac4B9D614325eA6577D10CaAB5080314a07253",
	"0xd3CcD60305981931d21c8E0D01b55EfB2CC47E8a",
	"0x0f12628C8aDFf1E28Ff3351915AfEF97Cfe92f85",
];

// create function that delegates voting power to another address
async function delegate() {
	const options = {
		alchemy: process.env.ALCHEMY_API_KEY,
		infura: process.env.INFURA_API_KEY,
	};

	const provider = ethers.getDefaultProvider("goerli", options);
	// connect to wallet
	const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "");
	const signer = wallet.connect(provider);
	// check if wallet has ether to delegate voting power
	const balanceBN = await signer.getBalance();
	console.log("Balance: ", ethers.utils.formatEther(balanceBN));
	const balance = Number(ethers.utils.formatEther(balanceBN));
	if (balance < 0.01) {
		throw new Error("Insufficient funds to delegate voting power");
	}

	// get the deployed contract
	const tokenContractFactory = new MyToken__factory(signer);
	const myTokenContract = tokenContractFactory.attach(TOKEN_CONTRACT);

	// delegate voting power
	const delegateTx = await myTokenContract
		.connect(signer)
		.delegate(ADDRESSES[4]);
	await delegateTx.wait();

	const votesAfterDelegate = await myTokenContract.getVotes(ADDRESSES[4]);
	console.log(
		"Account 5 initial votes after delegating:",
		ethers.utils.formatEther(votesAfterDelegate)
	);
}

delegate()
	.catch((error) => {
		console.error(error);
		process.exitCode = 1;
	})
	.finally(() => process.exit());
