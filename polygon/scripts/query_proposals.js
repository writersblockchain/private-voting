const fs = require("fs");
const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "0x1A2DD5588e6eA0723874B2BDE2C0C97EE0511Cf9";
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
