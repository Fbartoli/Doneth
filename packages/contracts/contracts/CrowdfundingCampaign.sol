// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CrowdfundingCampaign
 * @author Your Name/Org
 * @notice Manages a single crowdfunding campaign, accepting ETH or a specified ERC20 token.
 * Allows contributors to claim refunds if the goal isn't met by the deadline,
 * and the beneficiary to withdraw funds if the campaign is successful.
 */
contract CrowdfundingCampaign is ReentrancyGuard {
    using SafeERC20 for IERC20;

    enum State {
        Fundraising,
        Successful,
        Failed
    }

    address public beneficiary;
    uint256 public goal; // Amount in wei (for ETH) or smallest unit (for ERC20)
    uint256 public deadline; // Unix timestamp
    uint256 public withdrawalPeriod; // Period after success for beneficiary withdrawal
    string public name;

    uint256 public totalRaised;
    mapping(address => uint256) public contributions;
    State public currentState;
    uint256 public withdrawalDeadline; // Timestamp when beneficiary withdrawal expires (if successful)

    event Contribution(address indexed contributor, uint256 amount);
    event Withdrawal(address indexed beneficiary, uint256 amount);
    event Refund(address indexed contributor, uint256 amount);
    event CampaignFailed();
    event CampaignSuccessful(uint256 withdrawalDeadline);
    event ContributionReclaimed(address indexed contributor, uint256 amount);
    event CampaignStarted(address indexed beneficiary, uint256 goal, uint256 deadline, uint256 withdrawalPeriod, string name);

    error DeadlinePassed();
    error AlreadyEnded();
    error NotFundraising();
    error NotFailed();
    error NotSuccessful();
    error GoalNotReached();
    error GoalAlreadyReached();
    error ZeroContribution();
    error NotBeneficiary();
    error NothingToRefund();
    error NothingToWithdraw();
    error IncorrectToken();
    error IncorrectEthValue();
    error WithdrawalDeadlinePassed();
    error WithdrawalDeadlineNotPassed();
    error NothingToReclaim();

    modifier onlyState(State _state) {
        if (currentState != _state) {
            if (_state == State.Fundraising) revert NotFundraising();
            if (_state == State.Successful) revert NotSuccessful();
            if (_state == State.Failed) revert NotFailed();
        }
        _;
    }

    /**
     * @notice Initializes the campaign state. Called once by the factory when creating a campaign.
     * @param _beneficiary The address that will receive funds if the campaign is successful.
     * @param _goal The funding goal in wei (for ETH) or smallest unit (for ERC20).
     * @param _deadline The Unix timestamp after which contributions are no longer accepted.
     * @param _withdrawalPeriod The duration in seconds after success during which the beneficiary must withdraw.
     * @param _name The name of the campaign.
     */
    constructor(
        address _beneficiary,
        uint256 _goal,
        uint256 _deadline,
        uint256 _withdrawalPeriod,
        string memory _name
    ) {
        require(_beneficiary != address(0), "Beneficiary cannot be zero address");
        require(_goal > 0, "Goal must be greater than zero");
        require(_deadline > block.timestamp, "Deadline must be in the future");
        require(_withdrawalPeriod > 0, "Withdrawal period must be positive");
        require(bytes(_name).length > 0, "Name required");

        beneficiary = _beneficiary;
        goal = _goal;
        deadline = _deadline;
        withdrawalPeriod = _withdrawalPeriod;
        name = _name;
        currentState = State.Fundraising;
        emit CampaignStarted(_beneficiary, _goal, _deadline, _withdrawalPeriod, _name);
    }

    /**
     * @notice Contributes ETH to the campaign.
     */
    function contribute(address onBehalfOf) external payable nonReentrant {
        if (block.timestamp > deadline) revert DeadlinePassed();
        if (msg.value == 0) revert ZeroContribution();

        address contributor = onBehalfOf == address(0)
            ? msg.sender
            : onBehalfOf;

        uint256 amount = msg.value;
        contributions[contributor] += amount;
        totalRaised += amount;

        emit Contribution(contributor, amount);
    }

    /**
     * @notice Finalizes the campaign state after the deadline has passed.
     * Transitions state to Successful if goal met, or Failed otherwise.
     * Can be called by anyone after the deadline.
     */
    function finalizeCampaignAfterDeadline() public {
        if (currentState != State.Fundraising) revert AlreadyEnded();
        if (block.timestamp <= deadline) revert DeadlinePassed();

        if (totalRaised >= goal) {
            currentState = State.Successful;
            withdrawalDeadline = block.timestamp + withdrawalPeriod;
            emit CampaignSuccessful(withdrawalDeadline);
        } else {
            currentState = State.Failed;
            emit CampaignFailed();
        }
    }

    /**
     * @notice Allows contributors to claim a refund if the campaign failed.
     */
    function claimRefund(address onBehalfOf) external nonReentrant {
        if (currentState != State.Failed) revert NotFailed();

        address contributor = onBehalfOf == address(0)
            ? msg.sender
            : onBehalfOf;

        uint256 amountToRefund = contributions[contributor];
        if (amountToRefund == 0) revert NothingToRefund();

        contributions[contributor] = 0;

        (bool success, ) = payable(contributor).call{value: amountToRefund}("");
        require(success, "ETH transfer failed");

        emit Refund(contributor, amountToRefund);
    }

    /**
     * @notice Allows the beneficiary to withdraw the collected funds if the campaign was successful.
     */
    function withdraw() external nonReentrant onlyState(State.Successful) {
        if (msg.sender != beneficiary) revert NotBeneficiary();
        if (block.timestamp > withdrawalDeadline)
            revert WithdrawalDeadlinePassed();

        uint256 amountToWithdraw = address(this).balance;

        if (amountToWithdraw == 0) revert NothingToWithdraw();

        (bool success, ) = payable(beneficiary).call{value: amountToWithdraw}(
            ""
        );
        require(success, "ETH transfer failed");

        emit Withdrawal(beneficiary, amountToWithdraw);
    }

    /**
     * @notice Allows contributors to reclaim their contribution if the campaign was successful
     * but the beneficiary failed to withdraw within the allocated time.
     */
    function reclaimContribution() external nonReentrant {
        if (currentState != State.Successful) revert NotSuccessful();
        if (block.timestamp <= withdrawalDeadline)
            revert WithdrawalDeadlineNotPassed();

        uint256 amountToReclaim = contributions[msg.sender];
        if (amountToReclaim == 0) revert NothingToReclaim();

        contributions[msg.sender] = 0;

        (bool success, ) = payable(msg.sender).call{value: amountToReclaim}("");
        require(success, "ETH reclaim failed");

        emit ContributionReclaimed(msg.sender, amountToReclaim);
    }

    // --- View Functions ---

    function getState() external view returns (State) {
        return currentState;
    }

    function getContribution(
        address _contributor
    ) external view returns (uint256) {
        return contributions[_contributor];
    }
}
