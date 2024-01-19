const { fromBase64, fromHex, toUtf8 } = require("@cosmjs/encoding");
const { ethers } = require("hardhat");
const { encrypt } = require("./encrypt");
const { getProposalById } = require("./query_by_proposal_id.js");
require("dotenv").config();

const privateVotingAddress = process.env.CONTRACT_ADDRESS; // Replace with your deployed contract's address

async function vote() {
  let msg = {
    answer: "yes",
    proposal_id: 1,
    proposal_description: "Do you like turtles?",
    salt: Math.random(),
  };
  console.log(msg);
  let my_encrypted_message = await encrypt(msg);
  let PrivateVoting = await hre.ethers.getContractFactory("PrivateVoting");
  const privateVoting = await PrivateVoting.attach(privateVotingAddress);

  const tx = await privateVoting.vote(1, my_encrypted_message);

  console.log(`Transaction hash: ${tx.hash}`);
  await tx.wait();

  console.log("vote function executed successfully!");
}
vote();

// async function vote() {
//   let proposal = await getProposalById(2);

//   let msg = {
//     answer: "yes",
//     proposal_id: proposal.id,
//     proposal_description: proposal.description,
//     salt: Math.random(),
//   };
//   console.log(msg);
//   let my_encrypted_message = await encrypt(msg);
//   let PrivateVoting = await hre.ethers.getContractFactory("PrivateVoting");
//   const privateVoting = await PrivateVoting.attach(privateVotingAddress);

//   const tx = await privateVoting.vote(proposal.id, my_encrypted_message);

//   console.log(`Transaction hash: ${tx.hash}`);
//   await tx.wait();

//   console.log("vote function executed successfully!");
// }
// vote();
