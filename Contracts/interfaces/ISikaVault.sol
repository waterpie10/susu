// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ISikaVault
 * @author Sika Protocol
 * @notice Interface for the SikaVault contract. Defines the external API for a savings vault,
 * including functions for deposits, payouts, emergency procedures, and state-viewing.
 */
interface ISikaVault {
    // =============================================================
    // Events
    // =============================================================

    /**
     * @notice Emitted when a member successfully deposits their contribution for a cycle.
     * @param member The address of the member who made the deposit.
     * @param amount The amount deposited.
     * @param cycle The cycle number for which the deposit was made.
     */
    event Deposit(address indexed member, uint256 amount, uint256 cycle);

    /**
     * @notice Emitted when a scheduled payout is successfully executed.
     * @param recipient The address of the member who received the payout.
     * @param amount The total amount of the payout.
     * @param cycle The cycle number when the payout was executed.
     */
    event PayoutExecuted(address indexed recipient, uint256 amount, uint256 cycle);

    /**
     * @notice Emitted when a member requests an emergency payout.
     * @param requester The address of the member who initiated the emergency request.
     */
    event EmergencyRequested(address indexed requester);

    /**
     * @notice Emitted when a member votes for an ongoing emergency payout request.
     * @param voter The address of the member who cast the vote.
     * @param requester The address of the member who initiated the emergency request.
     */
    event EmergencyVote(address indexed voter, address indexed requester);

    /**
     * @notice Emitted when an emergency payout is successfully executed after unanimous consent.
     * @param requester The address of the member who received the emergency payout.
     * @param amount The total amount of the emergency payout.
     */
    event EmergencyPayoutExecuted(address indexed requester, uint256 amount);

    /**
     * @notice Emitted when the vault is terminated, either by emergency payout or completion.
     */
    event VaultTerminated();

    // =============================================================
    // Structs
    // =============================================================

    /**
     * @notice Represents an active request for an emergency payout.
     * @param requester The address of the member who initiated the request.
     * @param votes The number of votes the request has received.
     * @param active A flag indicating if an emergency request is currently active.
     */
    struct EmergencyRequest {
        address requester;
        uint256 votes;
        bool active;
    }

    // =============================================================
    // External Functions
    // =============================================================

    // --- State-Changing Functions ---

    /**
     * @notice Allows a member to deposit their contribution for the current cycle.
     * Reverts if the vault is terminated, if the sender is not a member,
     * if the member has already paid for the current cycle, or if the token transfer fails.
     */
    function deposit() external;

    /**
     * @notice Executes the scheduled payout to the rightful member for the current cycle.
     * Reverts if the vault is terminated, if the payout time has not been reached,
     * or if the total pot is not full (indicating a rollover).
     */
    function executePayout() external;

    /**
     * @notice Allows a member to initiate an emergency payout request.
     * Reverts if the vault is terminated, if the sender is not a member,
     * or if an emergency request is already active.
     */
    function requestEmergencyPayout() external;

    /**
     * @notice Allows a member to vote for an active emergency payout request.
     * Reverts if the vault is terminated, if the sender is not a member,
     * if there is no active emergency request, or if the member has already voted.
     */
    function voteForEmergencyPayout() external;

    /**
     * @notice Executes the emergency payout to the requester if unanimous consent is reached.
     * Reverts if the vault is terminated, if there is no active request,
     * or if the vote count has not reached the total number of members.
     */
    function executeEmergencyPayout() external;


    // --- View Functions ---

    /**
     * @notice Retrieves the immutable configuration details of the vault.
     * @return token_ The address of the ERC20 token used for contributions.
     * @return contributionAmount_ The required contribution amount per member per cycle.
     * @return payoutInterval_ The interval between payouts in seconds.
     * @return membersCount_ The total number of members in the vault.
     * @return isTerminated_ A flag indicating if the vault is terminated.
     */
    function getVaultConfiguration()
        external
        view
        returns (
            address token_,
            uint256 contributionAmount_,
            uint256 payoutInterval_,
            uint256 membersCount_,
            bool isTerminated_
        );

    /**
     * @notice Retrieves the current dynamic state of the vault.
     * @return currentCycle_ The current savings cycle number (0-indexed).
     * @return totalPot_ The total amount currently held in the vault.
     * @return nextPayoutTime_ The timestamp for the next scheduled payout.
     */
    function getVaultState()
        external
        view
        returns (
            uint256 currentCycle_,
            uint256 totalPot_,
            uint256 nextPayoutTime_
        );

    /**
     * @notice Checks if a specific member has paid for a given cycle.
     * @param member The address of the member to check.
     * @param cycle The cycle number to check against.
     * @return A boolean indicating if the member has paid.
     */
    function hasMemberPaidForCycle(address member, uint256 cycle) external view returns (bool);
} 