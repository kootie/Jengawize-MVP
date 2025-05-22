const hre = require("hardhat");

async function main() {
  // Get the contract factory
  const JengawizeStore = await hre.ethers.getContractFactory("JengawizeStore");

  // Deploy the contract
  const store = await JengawizeStore.deploy();

  // Wait for deployment to finish
  await store.waitForDeployment();

  const address = await store.getAddress();
  console.log(`JengawizeStore deployed to: ${address}`);

  // Wait for a few block confirmations
  console.log("Waiting for block confirmations...");
  await store.deployTransaction.wait(5);

  // Verify the contract on BaseScan
  console.log("Verifying contract on BaseScan...");
  try {
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: [],
    });
    console.log("Contract verified successfully");
  } catch (error) {
    console.error("Error verifying contract:", error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 