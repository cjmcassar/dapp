import { PromiseOrValue } from "../typechain-types/common";
import { ethers } from "ethers";
import { MyToken__factory, TokenizedBallot__factory } from "../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();

const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];
const TOKEN_CONTRACT = "token contract address";
const VOTING_POWER = 1;

async function main() {
	const provider = ethers.getDefaultProvider("goerli");
	const wallet = ethers.Wallet.createRandom();
	const signer = wallet.connect(provider);

	const tokenBallotContractFactory = new TokenizedBallot__factory(signer);
	const tokenBallotContract = await tokenBallotContractFactory.deploy(
		PROPOSALS,
		TOKEN_CONTRACT,
		VOTING_POWER
	);
	await tokenBallotContract.deployed();

	console.log("TokenSale contract deployed to: ", tokenBallotContract.address);

	const erc20TokenContractFactory = new MyToken__factory(signer);
	const erc20TokenContract = erc20TokenContractFactory.attach(TOKEN_CONTRACT);
	const MINTER_ROLE = await erc20TokenContract.MINTER_ROLE();
	const grantRoleTx = await erc20TokenContract.grantRole(
		MINTER_ROLE,
		tokenBallotContract.address
	);
	await grantRoleTx.wait();
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
