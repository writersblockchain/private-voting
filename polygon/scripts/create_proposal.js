const { fromBase64, fromHex, toUtf8 } = require("@cosmjs/encoding");
const { ethers } = require("hardhat");
require("dotenv").config();

async function create_proposal() {
  const privateVotingAddress = process.env.CONTRACT_ADDRESS; // Replace with your deployed contract's address

  let PrivateVoting = await hre.ethers.getContractFactory("PrivateVoting");
  const privateVoting = await PrivateVoting.attach(privateVotingAddress);

  const tx = await privateVoting.createProposal(
    "Proposal # 2",
    "Do you like turtles? - Yes or No?",
    2
  );

  console.log(`Transaction hash: ${tx.hash}`);
  await tx.wait();

  console.log("Create Proposal function executed successfully!");
}
create_proposal();
