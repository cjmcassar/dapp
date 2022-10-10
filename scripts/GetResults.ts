import { TokenizedBallot__factory } from "./../typechain-types/factories/contracts/TokenizedBallot.sol/TokenizedBallot__factory";
import { ethers } from "ethers";
import * as dotenv from "dotenv";
dotenv.config();

const CONTRACT_ADDRESS = "0x2D89cBcd202eB80944b59540E86883F02C929e39";

async function main() {
	const options = {
		alchemy: process.env.ALCHEMY_API_KEY,
		infura: process.env.INFURA_API_KEY,
	};

	const provider = ethers.getDefaultProvider("goerli", options);
	//connect to Metamask wallet using seed phrase
	const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "");
	const signer = wallet.connect(provider);
	//make sure wallet contains ether
	const balanceBN = await signer.getBalance();
	const balance = Number(ethers.utils.formatEther(balanceBN));
	if (balance < 0.01) {
		throw new Error("Not enough ether");
	}
	//Get the deployed contract
	const tokenisedBallotFactory = new TokenizedBallot__factory(signer);
	const tokenisedBallotContract = await tokenisedBallotFactory.attach(
		CONTRACT_ADDRESS
	);

	//Query winning proposal
	console.log("Query winning proposal");
	const winningProposal = await tokenisedBallotContract.winnerName();
	const name = ethers.utils.parseBytes32String(winningProposal);
	console.log("name:", name);
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
