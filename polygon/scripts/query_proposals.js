const fs = require("fs");
const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const contractName = "PrivateVoting"; // Replace with your contract's name

  const ContractJson = require("../artifacts/contracts/PrivateVoting.sol/PrivateVoting.json");
  const abi = ContractJson.abi;

  // Setup provider and contract
  const provider = ethers.provider;
  const contract = new ethers.Contract(contractAddress, abi, provider);

  // Get the next proposal ID
  const nextProposalId = await contract.nextProposalId();

  // Iterate over all proposals and log their details
  for (let i = 1; i < nextProposalId; i++) {
    try {
      const proposal = await contract.getProposal(i);
      console.log(`Proposal ${i}:`, proposal);
    } catch (error) {
      console.error(`Error fetching proposal ${i}:`, error);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// BigNumber { value: "1" }: This is the ID of the proposal. In Ethereum, numeric values, including integers, are often returned as BigNumber objects to safely handle large numbers that exceed JavaScript's safe integer limit. The ID 1 indicates that this is the first proposal.

// 'Do you like turtles?': This is the description of the proposal. It's a string value, as defined in your contract.

// BigNumber { value: "1" }: This represents the quorum for the proposal. In your contract, the quorum is an unsigned integer, which ethers.js handles as a BigNumber. A quorum of 1 means that one vote is enough for the decision to be made.

// BigNumber { value: "0" }: This is the current vote count for the proposal. Since no votes have been cast yet, it's 0.
