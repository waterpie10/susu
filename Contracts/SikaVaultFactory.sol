// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./SikaVault.sol";
import "./interfaces/ISikaVault.sol";

/**
 * @title SikaVaultFactory
 * @author Sika Protocol
 * @notice This contract is responsible for deploying and managing SikaVault instances.
 * It allows anyone to create a new savings vault, but only the owner can perform
 * administrative tasks on the factory itself.
 */
contract SikaVaultFactory is Ownable {
    // =============================================================
    // State Variables
    // =============================================================

    /**
     * @notice An array containing the addresses of all SikaVaults deployed by this factory.
     */
    address[] public deployedVaults;

    // =============================================================
    // Events
    // =============================================================

    /**
     * @notice Emitted when a new SikaVault is successfully created and deployed.
     * @param vaultAddress The address of the newly created vault contract.
     * @param creator The address of the user who initiated the vault creation.
     * @param members The list of member addresses for the new vault.
     * @param token The ERC20 token address for contributions.
     * @param contributionAmount The required contribution amount per cycle.
     */
    event VaultCreated(
        address indexed vaultAddress,
        address indexed creator,
        address[] members,
        address token,
        uint256 contributionAmount
    );

    // =============================================================
    // Constructor
    // =============================================================

    /**
     * @notice Initializes the factory contract and sets the owner.
     * @param initialOwner The address that will become the owner of this factory.
     */
    constructor(address initialOwner) Ownable(initialOwner) {}

    // =============================================================
    // External Functions
    // =============================================================

    /**
     * @notice Deploys a new SikaVault contract with the specified parameters.
     * @dev This function is the primary entry point for creating a new savings group.
     * It instantiates a new SikaVault and stores its address.
     * @param _members An array of addresses for the members of the vault.
     * @param _payoutOrder A pre-shuffled array of indices corresponding to the `_members` array,
     * determining the order of payouts.
     * @param _contributionAmount The fixed amount each member must contribute per cycle.
     * @param _payoutIntervalDays The duration of each savings cycle in days.
     * @param _token The address of the ERC20 token to be used for contributions and payouts.
     * @return newVaultAddress The address of the newly deployed SikaVault contract.
     */
    function createVault(
        address[] calldata _members,
        uint256[] calldata _payoutOrder,
        uint256 _contributionAmount,
        uint256 _payoutIntervalDays,
        address _token
    ) external returns (address) {
        // Input validation
        require(_members.length > 1, "SikaVault: Must have at least two members.");
        require(_members.length == _payoutOrder.length, "SikaVault: Members and payout order must have the same length.");
        require(_contributionAmount > 0, "SikaVault: Contribution amount must be greater than zero.");
        require(_payoutIntervalDays > 0, "SikaVault: Payout interval must be greater than zero.");
        require(_token != address(0), "SikaVault: Token address cannot be zero.");

        SikaVault newVault = new SikaVault(
            _members,
            _payoutOrder,
            _contributionAmount,
            _payoutIntervalDays,
            _token
        );

        address newVaultAddress = address(newVault);
        deployedVaults.push(newVaultAddress);

        emit VaultCreated(
            newVaultAddress,
            msg.sender,
            _members,
            _token,
            _contributionAmount
        );

        return newVaultAddress;
    }

    // =============================================================
    // View Functions
    // =============================================================

    /**
     * @notice Retrieves the total number of vaults deployed by this factory.
     * @return The count of deployed vaults.
     */
    function getDeployedVaultsCount() external view returns (uint256) {
        return deployedVaults.length;
    }
} 