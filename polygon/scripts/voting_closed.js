const fs = require("fs");
const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS; // Replace with your contract's address
  const contractName = "PrivateVoting"; // Replace with your contract's name

  const ContractJson = require("../artifacts/contracts/PrivateVoting.sol/PrivateVoting.json");
  const abi = ContractJson.abi;

  // Setup provider and contract
  const provider = ethers.provider;
  const contract = new ethers.Contract(contractAddress, abi, provider);

  // Listen for VotingClosed event
  contract.on("VotingClosed", (proposalId, event) => {
    console.log(`Voting Closed for Proposal ID: ${proposalId}`);
    console.log("Event Details:", event);
  });

  // Keep the process alive
  process.stdin.resume();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
