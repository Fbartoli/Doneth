import { Deployer } from "@matterlabs/hardhat-zksync";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Wallet } from "zksync-ethers";

export default async function (hre: HardhatRuntimeEnvironment) {
  // Initialize the wallet.
  const wallet = new Wallet(process.env.WALLET_PRIVATE_KEY as string);

  // Create deployer object and load the artifact of the contract we want to deploy.
  const deployer = new Deployer(hre, wallet);

  // Load contract
  const artifact = await deployer.loadArtifact("CrowdfundingFactory");

  // `initialNumber` is an argument for contract constructor.
  const initialNumber = 42;
  const greeterContract = await deployer.deploy(artifact, [initialNumber]);

  // Show the contract info.
  console.log(
    `${
      artifact.contractName
    } was deployed to ${await greeterContract.getAddress()}`
  );
}