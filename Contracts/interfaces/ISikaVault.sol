// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ISikaVault
 * @author Sika Protocol
 * @notice Interface for the SikaVault contract, defining all external functions
 * and events that can be called or emitted by the vault.
 */
interface ISikaVault {
    // =============================================================
    // Events
    // =============================================================

    /**
     * @notice Emitted when a member successfully deposits their contribution.
     * @param member The address of the member who made the deposit.
     * @param amount The amount deposited.
     * @param cycle The cycle number for which the deposit was made.
     */
    event Deposit(address indexed member, uint256 amount, uint256 cycle);

    /**
     * @notice Emitted when a payout is successfully executed.
     * @param recipient The address of the member who received the payout.
     * @param amount The total amount of the payout.
     * @param cycle The cycle number for which the payout was executed.
     */
    event PayoutExecuted(address indexed recipient, uint256 amount, uint256 cycle);

    /**
     * @notice Emitted when a member requests an emergency payout.
     * @param requester The address of the member who requested the emergency payout.
     */
    event EmergencyRequested(address indexed requester);

    /**
     * @notice Emitted when a member votes for an emergency payout.
     * @param voter The address of the member who voted.
     * @param requester The address of the member who requested the emergency payout.
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
    // View Functions
    // =============================================================

    /**
     * @notice Returns the name of the vault.
     * @return The vault name.
     */
    function vaultName() external view returns (string memory);

    /**
     * @notice Returns the ERC20 token address used for contributions and payouts.
     * @return The token address.
     */
    function token() external view returns (address);

    /**
     * @notice Returns the fixed contribution amount required per cycle.
     * @return The contribution amount in wei.
     */
    function contributionAmount() external view returns (uint256);

    /**
     * @notice Returns the payout interval in seconds.
     * @return The payout interval.
     */
    function payoutInterval() external view returns (uint256);

    /**
     * @notice Returns the total number of members in the vault.
     * @return The member count.
     */
    function membersCount() external view returns (uint256);

    /**
     * @notice Returns the current cycle number.
     * @return The current cycle.
     */
    function currentCycle() external view returns (uint256);

    /**
     * @notice Returns the total amount in the pot.
     * @return The total pot amount.
     */
    function totalPot() external view returns (uint256);

    /**
     * @notice Returns the timestamp for the next payout.
     * @return The next payout timestamp.
     */
    function nextPayoutTime() external view returns (uint256);

    /**
     * @notice Returns whether the vault is terminated.
     * @return True if the vault is terminated, false otherwise.
     */
    function isTerminated() external view returns (bool);

    /**
     * @notice Returns whether a specific member has paid for the current cycle.
     * @param member The member address to check.
     * @return True if the member has paid, false otherwise.
     */
    function hasPaidForCycle(uint256 cycle, address member) external view returns (bool);

    /**
     * @notice Returns whether an address is a member of the vault.
     * @param member The address to check.
     * @return True if the address is a member, false otherwise.
     */
    function isMember(address member) external view returns (bool);

    /**
     * @notice Returns the member address at a specific index.
     * @param index The index of the member.
     * @return The member address.
     */
    function members(uint256 index) external view returns (address);

    /**
     * @notice Returns the payout order index at a specific position.
     * @param index The index in the payout order.
     * @return The member index for payout.
     */
    function payoutOrder(uint256 index) external view returns (uint256);

    /**
     * @notice Returns the current emergency request details.
     * @return requester The address of the emergency requester.
     * @return votes The number of votes received.
     * @return active Whether an emergency request is active.
     */
    function emergencyRequest() external view returns (address requester, uint256 votes, bool active);

    /**
     * @notice Returns the complete vault configuration in a single call.
     * @return token_ The ERC20 token address.
     * @return contributionAmount_ The contribution amount per cycle.
     * @return payoutInterval_ The payout interval in seconds.
     * @return membersCount_ The total number of members.
     * @return isTerminated_ Whether the vault is terminated.
     */
    function getVaultConfiguration() external view returns (
        address token_,
        uint256 contributionAmount_,
        uint256 payoutInterval_,
        uint256 membersCount_,
        bool isTerminated_
    );

    /**
     * @notice Returns the current vault state in a single call.
     * @return currentCycle_ The current cycle number.
     * @return totalPot_ The total amount in the pot.
     * @return nextPayoutTime_ The timestamp for the next payout.
     */
    function getVaultState() external view returns (
        uint256 currentCycle_,
        uint256 totalPot_,
        uint256 nextPayoutTime_
    );

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
     * @notice Allows a member to request an emergency payout.
     * Reverts if the vault is terminated, if the sender is not a member,
     * or if an emergency request is already active.
     */
    function requestEmergencyPayout() external;

    /**
     * @notice Allows a member to vote for an active emergency payout request.
     * Reverts if the vault is terminated, if the sender is not a member,
     * if no emergency request is active, or if the member has already voted.
     */
    function voteForEmergencyPayout() external;

    /**
     * @notice Executes an emergency payout if unanimous consent has been reached.
     * Reverts if the vault is terminated, if no emergency request is active,
     * or if unanimous consent has not been reached.
     */
    function executeEmergencyPayout() external;
} 