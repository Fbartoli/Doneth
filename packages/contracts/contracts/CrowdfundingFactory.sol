// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {CrowdfundingCampaign} from "./CrowdfundingCampaign.sol";

/**
 * @title CrowdfundingFactory
 * @author Your Name/Org
 * @notice Factory contract to deploy new CrowdfundingCampaign instances directly (no proxies).
 */
contract CrowdfundingFactory {
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
     * @notice Deploys a new crowdfunding campaign contract directly.
     * @param _beneficiary The address that will receive funds if the campaign is successful.
     * @param _goal The funding goal in wei (for ETH) or smallest unit (for ERC20).
     * @param _duration The duration of the campaign fundraising period in seconds.
     * @param _withdrawalPeriod The duration in seconds after success during which the beneficiary must withdraw.
     * @param _name The name of the campaign.
     * @return campaignAddress The address of the newly created campaign.
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

        // Deploy the campaign directly with constructor arguments
        CrowdfundingCampaign campaign = new CrowdfundingCampaign(
            _beneficiary,
            _goal,
            _deadline,
            _withdrawalPeriod,
            _name
        );

        campaignAddress = address(campaign);
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