import { ethers } from "ethers";
import { MyToken__factory } from "../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
	const options = {
		alchemy: process.env.ALCHEMY_API_KEY,
		infura: process.env.INFURA_API_KEY,
	};

	const provider = ethers.getDefaultProvider("goerli", options);
	const wallet = new ethers.Wallet(
		process.env.PRIVATE_KEY ??
			"683def552ac24f83434628e742eb722aa99ac67484fb543904f6c8229251f9a2"
	);
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
