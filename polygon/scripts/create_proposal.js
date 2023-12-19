const { fromBase64, fromHex, toUtf8 } = require("@cosmjs/encoding");
const { ethers } = require("hardhat");

async function create_proposal() {
  const privateVotingAddress = "0x1A2DD5588e6eA0723874B2BDE2C0C97EE0511Cf9"; // Replace with your deployed contract's address

  let PrivateVoting = await hre.ethers.getContractFactory("PrivateVoting");
  const privateVoting = await PrivateVoting.attach(privateVotingAddress);

  const tx = await privateVoting.createProposal(
    "Proposal # 5",
    "Do you like turtles? - Yes or No?",
    5
  );

  console.log(`Transaction hash: ${tx.hash}`);
  await tx.wait();

  console.log("Create Proposal function executed successfully!");
}
create_proposal();
