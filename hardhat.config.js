require("@nomicfoundation/hardhat-toolbox");

const { vars } = require("hardhat/config");

const ALCHEMY_API_KEY = vars.get("ALCHEMY_API_KEY", "BrHFhrhG3VibpWvw7HmaG5-GyZZSlDMs");
const AMOY_PRIVATE_KEY = vars.get("AMOY_PRIVATE_KEY", "a7413359a390e7e2489720ed82cbfea2f6a751d4f7d28eb22269bf38ade49f30");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  paths: {
    sources: "./Contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  networks: {
    amoy: {
      url: `https://polygon-amoy.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [AMOY_PRIVATE_KEY],
    },
  },
}; 