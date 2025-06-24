// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/ISikaVault.sol";

/**
 * @title SikaVault
 * @author Sika Protocol
 * @notice This contract manages a single group savings vault. It handles member contributions,
 * scheduled payouts, and an emergency withdrawal system based on unanimous member consent.
 * It is designed to be deployed by the SikaVaultFactory.
 */
contract SikaVault is ISikaVault, ReentrancyGuard {
    // =============================================================
    // State Variables
    // =============================================================

    // --- Vault Configuration (Immutable) ---
    address public immutable token;
    uint256 public immutable contributionAmount;
    uint256 public immutable payoutInterval;
    uint256 public immutable membersCount;
    string public vaultName;
    address[] public members;
    uint256[] public payoutOrder;
    mapping(address => bool) public isMember;

    // --- Vault State ---
    uint256 public currentCycle;
    uint256 public totalPot;
    uint256 public nextPayoutTime;
    mapping(uint256 => mapping(address => bool)) public hasPaidForCycle;
    bool public isTerminated;

    // --- Emergency System ---
    EmergencyRequest public emergencyRequest;
    mapping(address => bool) private hasVotedForEmergency;

    // =============================================================
    // Modifiers
    // =============================================================

    /**
     * @notice Restricts function access to members of this specific vault.
     * @dev Reverts the transaction if the `msg.sender` is not a registered member.
     */
    modifier onlyMember() {
        require(isMember[msg.sender], "SikaVault: Caller is not a member");
        _;
    }

    /**
     * @notice Checks if the vault is active and not terminated.
     * @dev Reverts the transaction if the `isTerminated` flag is true.
     */
    modifier whenNotTerminated() {
        require(!isTerminated, "SikaVault: Vault is terminated");
        _;
    }

    // =============================================================
    // Constructor
    // =============================================================

    /**
     * @notice Initializes the SikaVault with its configuration.
     * @dev This is called only once by the SikaVaultFactory upon deployment.
     * @param _members An array of addresses for the members of the vault.
     * @param _payoutOrder A pre-shuffled array of indices for the payout order.
     * @param _contributionAmount The fixed amount each member must contribute per cycle.
     * @param _payoutIntervalDays The duration of each savings cycle in days.
     * @param _token The address of the ERC20 token for contributions and payouts.
     * @param _vaultName The name of the vault.
     */
    constructor(
        address[] memory _members,
        uint256[] memory _payoutOrder,
        uint256 _contributionAmount,
        uint256 _payoutIntervalDays,
        address _token,
        string memory _vaultName
    ) {
        token = _token;
        contributionAmount = _contributionAmount;
        payoutInterval = _payoutIntervalDays * 1 days;
        vaultName = _vaultName;
        members = _members;
        payoutOrder = _payoutOrder;
        membersCount = _members.length;

        for (uint256 i = 0; i < _members.length; i++) {
            require(_members[i] != address(0), "SikaVault: Member address cannot be zero");
            require(!isMember[_members[i]], "SikaVault: Duplicate members are not allowed");
            isMember[_members[i]] = true;
        }

        nextPayoutTime = block.timestamp + payoutInterval;
    }

    // =============================================================
    // External Functions - State-Changing
    // =============================================================

    /**
     * @inheritdoc ISikaVault
     */
    function deposit() external override onlyMember whenNotTerminated nonReentrant {
        require(
            !hasPaidForCycle[currentCycle][msg.sender],
            "SikaVault: Already paid for this cycle"
        );

        hasPaidForCycle[currentCycle][msg.sender] = true;
        totalPot += contributionAmount;

        // Pull the funds from the user's wallet to the vault
        uint256 allowance = IERC20(token).allowance(msg.sender, address(this));
        require(allowance >= contributionAmount, "SikaVault: Check token allowance");
        IERC20(token).transferFrom(msg.sender, address(this), contributionAmount);

        emit Deposit(msg.sender, contributionAmount, currentCycle);
    }

    /**
     * @inheritdoc ISikaVault
     */
    function executePayout() external override whenNotTerminated nonReentrant {
        require(block.timestamp >= nextPayoutTime, "SikaVault: Payout time not yet reached");
        
        uint256 expectedPot = contributionAmount * membersCount;
        require(totalPot >= expectedPot, "SikaVault: Payout rolling over, pot not full");

        // Determine recipient and transfer the pot
        address recipient = members[payoutOrder[currentCycle]];
        uint256 payoutAmount = totalPot;
        totalPot = 0;
        IERC20(token).transfer(recipient, payoutAmount);
        
        emit PayoutExecuted(recipient, payoutAmount, currentCycle);

        // Advance to the next cycle
        currentCycle++;
        nextPayoutTime += payoutInterval;

        // If all cycles are completed, terminate the vault
        if (currentCycle >= membersCount) {
            _terminateVault();
        }
    }

    /**
     * @inheritdoc ISikaVault
     */
    function requestEmergencyPayout() external override onlyMember whenNotTerminated {
        require(!emergencyRequest.active, "SikaVault: Emergency request already active");

        emergencyRequest.active = true;
        emergencyRequest.requester = msg.sender;
        emergencyRequest.votes = 1;
        hasVotedForEmergency[msg.sender] = true;

        emit EmergencyRequested(msg.sender);
    }

    /**
     * @inheritdoc ISikaVault
     */
    function voteForEmergencyPayout() external override onlyMember whenNotTerminated {
        require(emergencyRequest.active, "SikaVault: No active emergency request");
        require(
            !hasVotedForEmergency[msg.sender],
            "SikaVault: Member has already voted"
        );

        hasVotedForEmergency[msg.sender] = true;
        emergencyRequest.votes++;

        emit EmergencyVote(msg.sender, emergencyRequest.requester);
    }

    /**
     * @inheritdoc ISikaVault
     */
    function executeEmergencyPayout() external override whenNotTerminated nonReentrant {
        require(emergencyRequest.active, "SikaVault: No active emergency request");
        require(
            emergencyRequest.votes == membersCount,
            "SikaVault: Unanimous consent not reached"
        );

        address requester = emergencyRequest.requester;
        uint256 payoutAmount = totalPot;
        totalPot = 0;

        // Transfer the entire pot to the requester
        IERC20(token).transfer(requester, payoutAmount);

        emit EmergencyPayoutExecuted(requester, payoutAmount);

        // Terminate the vault permanently
        _terminateVault();
    }

    // =============================================================
    // External Functions - Views
    // =============================================================

    /**
     * @inheritdoc ISikaVault
     */
    function getVaultConfiguration()
        external
        view
        override
        returns (
            address token_,
            uint256 contributionAmount_,
            uint256 payoutInterval_,
            uint256 membersCount_,
            bool isTerminated_
        )
    {
        return (token, contributionAmount, payoutInterval, membersCount, isTerminated);
    }

    /**
     * @inheritdoc ISikaVault
     */
    function getVaultState()
        external
        view
        override
        returns (
            uint256 currentCycle_,
            uint256 totalPot_,
            uint256 nextPayoutTime_
        )
    {
        return (currentCycle, totalPot, nextPayoutTime);
    }

    /**
     * @inheritdoc ISikaVault
     */
    function hasMemberPaidForCycle(address member, uint256 cycle) external view override returns (bool) {
        return hasPaidForCycle[cycle][member];
    }
    
    // =============================================================
    // Internal Functions
    // =============================================================

    /**
     * @notice Marks the vault as terminated and resets the emergency state.
     * @dev This is an internal function called upon completion or emergency execution.
     */
    function _terminateVault() internal {
        isTerminated = true;
        
        // Clear the emergency request state
        delete emergencyRequest;
        
        emit VaultTerminated();
    }
} 