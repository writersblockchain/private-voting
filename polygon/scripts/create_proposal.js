const { fromBase64, fromHex, toUtf8 } = require("@cosmjs/encoding");
const { ethers } = require("hardhat");

async function create_proposal() {
  const privateVotingAddress = "0xd1feaa329E3b39f709A0f4a7212b097bb247d736"; // Replace with your deployed contract's address

  let PrivateVoting = await hre.ethers.getContractFactory("PrivateVoting");
  const privateVoting = await PrivateVoting.attach(privateVotingAddress);

  const tx = await privateVoting.createProposal(
    "My First Question",
    "What is the secret to life?"
  );

  console.log(`Transaction hash: ${tx.hash}`);
  await tx.wait();

  console.log("Create Proposal function executed successfully!");
}
create_proposal();
