const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("SikaChain Core Logic", function () {
    let SikaVaultFactory, factory, SikaVault, vault;
    let owner, member1, member2, member3;
    let mockERC20, token;
    
    const contributionAmount = ethers.parseEther("100");
    const payoutIntervalDays = 30;

    beforeEach(async function () {
        [owner, member1, member2, member3] = await ethers.getSigners();
        
        // 1. Deploy a mock ERC20 token for contributions
        const MockERC20 = await ethers.getContractFactory("MockERC20");
        mockERC20 = await MockERC20.deploy("Mock Token", "MTK");
        token = await mockERC20.getAddress();

        // Distribute tokens to members
        await mockERC20.transfer(member1.address, ethers.parseEther("1000"));
        await mockERC20.transfer(member2.address, ethers.parseEther("1000"));
        await mockERC20.transfer(member3.address, ethers.parseEther("1000"));

        // 2. Deploy the SikaVaultFactory
        SikaVaultFactory = await ethers.getContractFactory("SikaVaultFactory");
        factory = await SikaVaultFactory.deploy(owner.address);

        // 3. Create a new SikaVault via the factory
        const members = [member1.address, member2.address, member3.address];
        const payoutOrder = [0, 1, 2]; // Simple sequential order for testing
        
        const tx = await factory.createVault(members, payoutOrder, contributionAmount, payoutIntervalDays, token);
        const receipt = await tx.wait();
        
        // Extract vault address from the VaultCreated event
        const vaultAddress = receipt.logs.find(log => factory.interface.parseLog(log)?.name === 'VaultCreated').args[0];

        SikaVault = await ethers.getContractFactory("SikaVault");
        vault = SikaVault.attach(vaultAddress);
    });

    it("Factory Test: Should deploy a new SikaVault successfully", async function () {
        expect(await vault.getAddress()).to.not.be.null;
        expect(await vault.token()).to.equal(token);
        expect(await vault.contributionAmount()).to.equal(contributionAmount);
        expect(await vault.membersCount()).to.equal(3);
    });

    it("Deposit Test: A member should be able to deposit the correct amount", async function () {
        // Member 1 approves the vault to spend tokens
        await mockERC20.connect(member1).approve(await vault.getAddress(), contributionAmount);
        
        // Member 1 deposits
        await expect(vault.connect(member1).deposit())
            .to.emit(vault, "Deposit")
            .withArgs(member1.address, contributionAmount, 0);

        // Verify vault state
        expect(await vault.totalPot()).to.equal(contributionAmount);
        expect(await vault.hasMemberPaidForCycle(member1.address, 0)).to.be.true;
    });

    it("Payout Test: Should execute payout correctly after all members deposit", async function () {
        // All members approve and deposit
        await mockERC20.connect(member1).approve(await vault.getAddress(), contributionAmount);
        await vault.connect(member1).deposit();
        
        await mockERC20.connect(member2).approve(await vault.getAddress(), contributionAmount);
        await vault.connect(member2).deposit();

        await mockERC20.connect(member3).approve(await vault.getAddress(), contributionAmount);
        await vault.connect(member3).deposit();

        // Check the pot is full
        const expectedPot = contributionAmount * 3n;
        expect(await vault.totalPot()).to.equal(expectedPot);

        // Fast-forward time to after the next payout
        const payoutIntervalSeconds = payoutIntervalDays * 24 * 60 * 60;
        await time.increase(payoutIntervalSeconds);
        
        // Execute payout
        const recipient = member1; // First in payout order
        const initialBalance = await mockERC20.balanceOf(recipient.address);
        
        await expect(vault.executePayout())
            .to.emit(vault, "PayoutExecuted")
            .withArgs(recipient.address, expectedPot, 0);
            
        // Check recipient balance
        const finalBalance = await mockERC20.balanceOf(recipient.address);
        expect(finalBalance).to.equal(initialBalance + expectedPot);

        // Check vault state after payout
        expect(await vault.totalPot()).to.equal(0);
        expect(await vault.currentCycle()).to.equal(1);
    });
});

// A simple Mock ERC20 contract for testing purposes
const { compile } = require("hardhat");

const MOCK_ERC20_SOURCE = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _mint(msg.sender, 1000000 * 10**18); // Mint a large supply to the deployer
    }
}
`;

// Helper to dynamically compile and get factory for the mock contract
async function getContractFactory(name, source) {
    const artifact = await compile(source);
    return ethers.getContractFactory(artifact.abi, artifact.bytecode);
} 