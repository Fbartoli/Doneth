import { Deployer } from "@matterlabs/hardhat-zksync";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Wallet } from "zksync-ethers";
import dotenv from "dotenv";

dotenv.config();

export default async function (hre: HardhatRuntimeEnvironment) {
  const pk = process.env.WALLET_PRIVATE_KEY as string;
  if (!pk) {
    throw new Error("WALLET_PRIVATE_KEY is not set");
  }
  // Initialize the wallet.
  const wallet = new Wallet(pk);

  // Create deployer object and load the artifact of the contract we want to deploy.
  const deployer = new Deployer(hre, wallet);

  // Load contract
  const artifact = await deployer.loadArtifact("CrowdfundingFactory");

  // `initialNumber` is an argument for contract constructor.
  const greeterContract = await deployer.deploy(artifact, []);
  const contract = await greeterContract.waitForDeployment();
  await contract.createCampaign(
    "0x44857FCEE5328bCe58BdB97AFd1cC154Bd4d17f9",
    1000000000000000n,
    1000n,
    1000n,
    "test"
  );

  console.log(
    `${
      artifact.contractName
    } was deployed to ${await greeterContract.getAddress()}`
  );
}