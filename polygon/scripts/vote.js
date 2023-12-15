const { fromBase64, fromHex, toUtf8 } = require("@cosmjs/encoding");
const { ethers } = require("hardhat");
const { encrypt } = require("./encrypt");

async function vote() {
  const privateVotingAddress = "0xd1feaa329E3b39f709A0f4a7212b097bb247d736"; // Replace with your deployed contract's address
  const destinationChain = "secret"; // Replace with your desired destination chain
  const destinationAddress = "secret19sa4556dmzltsaxs3zv32y220wwsuxm87r2llk"; // Replace with your desired destination address

  let msg = {
    proposalId: "4",
    answer: "no",
  };
  let my_encrypted_message = await encrypt(msg);
  let PrivateVoting = await hre.ethers.getContractFactory("PrivateVoting");
  const privateVoting = await PrivateVoting.attach(privateVotingAddress);

  const tx = await privateVoting.vote(
    4,
    my_encrypted_message.toString(),
    destinationChain,
    destinationAddress,
    {
      value: ethers.utils.parseEther("0.33"), // Adjust the amount as needed for gas
    }
  );

  console.log(`Transaction hash: ${tx.hash}`);
  await tx.wait();

  console.log("send function executed successfully!");
}
vote();
