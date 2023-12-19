const { fromBase64, fromHex, toUtf8 } = require("@cosmjs/encoding");
const { ethers } = require("hardhat");
const { encrypt } = require("./encrypt");

async function vote() {
  const privateVotingAddress = "0x1A2DD5588e6eA0723874B2BDE2C0C97EE0511Cf9"; // Replace with your deployed contract's address
  const destinationChain = "secret"; // Replace with your desired destination chain
  const destinationAddress = "secret1u58qtud4tdmcwh85j8vlxxkfknjcqyhq9292hw"; // Replace with your desired destination address

  let msg = {
    proposalId: "5",
    answer: "yes",
  };
  let my_encrypted_message = await encrypt(msg);
  let PrivateVoting = await hre.ethers.getContractFactory("PrivateVoting");
  const privateVoting = await PrivateVoting.attach(privateVotingAddress);

  const tx = await privateVoting.vote(
    5,
    my_encrypted_message.toString(),
    destinationChain,
    destinationAddress,
    {
      value: ethers.utils.parseEther("0.40"), // Adjust the amount as needed for gas
    }
  );

  console.log(`Transaction hash: ${tx.hash}`);
  await tx.wait();

  console.log("send function executed successfully!");
}
vote();
