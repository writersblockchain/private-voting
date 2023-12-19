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

  // Query the number of proposals
  const nextProposalId = await contract.nextProposalId();
  // console.log(`Total Proposals: ${nextProposalId.toNumber()}`);

  // Iterate over all proposals
  for (let i = 1; i < nextProposalId; i++) {
    const proposal = await contract.proposals(i);
    console.log(`Proposal:`, proposal);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
