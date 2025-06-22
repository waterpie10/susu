const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy MockERC20 token
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const mockERC20 = await MockERC20.deploy("Mock Token", "MTK");
  await mockERC20.waitForDeployment();
  const tokenAddress = await mockERC20.getAddress();
  console.log("MockERC20 deployed to:", tokenAddress);

  // Deploy SikaVaultFactory
  const SikaVaultFactory = await ethers.getContractFactory("SikaVaultFactory");
  const factory = await SikaVaultFactory.deploy(deployer.address);
  await factory.waitForDeployment();

  const factoryAddress = await factory.getAddress();
  console.log("SikaVaultFactory deployed to:", factoryAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
