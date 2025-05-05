// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {CrowdfundingCampaign} from "./CrowdfundingCampaign.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";

/**
 * @title CrowdfundingFactory
 * @author Your Name/Org
 * @notice Factory contract to deploy new CrowdfundingCampaign instances as minimal proxies (clones).
 */
contract CrowdfundingFactory {
    address public immutable implementation; // Address of the master CrowdfundingCampaign logic contract
    address[] public deployedCampaigns;

    event CampaignCreated(
        address indexed campaignAddress,
        address indexed beneficiary,
        uint256 goal,
        uint256 deadline,
        uint256 withdrawalPeriod,
        string name
    );

    /**
     * @notice Deploys the implementation contract and stores its address.
     */
    constructor() {
        // Deploy the master implementation contract
        implementation = address(new CrowdfundingCampaign());
        // Note: The CrowdfundingCampaign constructor calls _disableInitializers()
    }

    /**
     * @notice Deploys a new crowdfunding campaign contract as a clone (minimal proxy).
     * @param _beneficiary The address that will receive funds if the campaign is successful.
     * @param _goal The funding goal in wei (for ETH) or smallest unit (for ERC20).
     * @param _duration The duration of the campaign fundraising period in seconds.
     * @param _withdrawalPeriod The duration in seconds after success during which the beneficiary must withdraw.
     * @param _name The name of the campaign.
     * @return campaignAddress The address of the newly created campaign clone.
     */
    function createCampaign(
        address _beneficiary,
        uint256 _goal,
        uint256 _duration,
        uint256 _withdrawalPeriod,
        string memory _name
    ) external returns (address campaignAddress) {
        require(_duration > 0, "Duration must be greater than zero");
        uint256 _deadline = block.timestamp + _duration;

        // Deploy the clone using the stored implementation address
        address clone = Clones.clone(implementation);

        // Initialize the newly deployed clone
        CrowdfundingCampaign(payable(clone)).initialize(
            _beneficiary,
            _goal,
            _deadline,
            _withdrawalPeriod,
            _name
        );

        campaignAddress = clone;
        deployedCampaigns.push(campaignAddress);

        emit CampaignCreated(
            campaignAddress,
            _beneficiary,
            _goal,
            _deadline,
            _withdrawalPeriod,
            _name
        );
    }

    /**
     * @notice Returns the list of all deployed campaign addresses.
     * @return An array containing the addresses of all campaigns created by this factory.
     */
    function getDeployedCampaigns() external view returns (address[] memory) {
        return deployedCampaigns;
    }
} 