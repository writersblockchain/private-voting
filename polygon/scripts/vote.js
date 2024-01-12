const { fromBase64, fromHex, toUtf8 } = require("@cosmjs/encoding");
const { ethers } = require("hardhat");
const { encrypt } = require("./encrypt");
require("dotenv").config();

async function vote() {
  const privateVotingAddress = process.env.CONTRACT_ADDRESS; // Replace with your deployed contract's address

  let msg = {
    answer: "no",
    salt: Math.random(),
  };
  let my_encrypted_message = await encrypt(msg);
  let PrivateVoting = await hre.ethers.getContractFactory("PrivateVoting");
  const privateVoting = await PrivateVoting.attach(privateVotingAddress);

  const tx = await privateVoting.vote(5, my_encrypted_message);

  console.log(`Transaction hash: ${tx.hash}`);
  await tx.wait();

  console.log("vote function executed successfully!");
}
vote();
