const { fromBase64, fromHex, toUtf8 } = require("@cosmjs/encoding");
const { ethers } = require("hardhat");
const { encrypt } = require("./encrypt");

async function vote() {
  const privateVotingAddress = "0xd1feaa329E3b39f709A0f4a7212b097bb247d736"; // Replace with your deployed contract's address
  const destinationChain = "secret"; // Replace with your desired destination chain
  const destinationAddress = "secret1aqe9e093wmmxk0jr5dus0h8kyey7yk0qpj4p6h"; // Replace with your desired destination address

  let msg = { answer: "gratitude" };
  let my_encrypted_message = await encrypt(msg);
  let PrivateVoting = await hre.ethers.getContractFactory("PrivateVoting");
  const privateVoting = await PrivateVoting.attach(privateVotingAddress);

  const tx = await privateVoting.vote(
    destinationChain,
    destinationAddress,
    my_encrypted_message.toString(),

    {
      value: ethers.utils.parseEther("0.35"), // Adjust the amount as needed for gas
    }
  );

  console.log(`Transaction hash: ${tx.hash}`);
  await tx.wait();

  console.log("send function executed successfully!");
}
vote();
