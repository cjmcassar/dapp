import { PromiseOrValue } from "../typechain-types/common";
import { ethers } from "ethers";
import { MyToken__factory } from "../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
	const provider = ethers.getDefaultProvider("goerli");
	const wallet = ethers.Wallet.createRandom();
	const signer = wallet.connect(provider);

	const tokenContractFactory = new MyToken__factory(signer);
	const tokenContract = await tokenContractFactory.deploy();
	await tokenContract.deployed();

	console.log("Token contract deployed to: ", tokenContract.address);
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
