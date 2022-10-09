import { ethers } from "ethers";
import { MyToken__factory, TokenizedBallot__factory } from "../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();

const PROPOSALS = [
	"0x50726f706f73616c000000000000000000000000000000000000000000000000",
	"0x50726f706f73616c000000000000000000000000000000000000000000000000",
	"0x50726f706f73616c000000000000000000000000000000000000000000000000",
];
const TOKEN_CONTRACT = "0x107052260BfC157cab653c6C01BADbDD1A4Bd424";
const VOTING_POWER = 1;

async function main() {
	const options = {
		alchemy: process.env.ALCHEMY_API_KEY,
		infura: process.env.INFURA_API_KEY,
	};

	const provider = ethers.getDefaultProvider("goerli", options);
	const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "");
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
