const { fromBase64, fromHex, toUtf8 } = require("@cosmjs/encoding");
const { ethers } = require("hardhat");

async function vote() {
  const sendReceiveEncryptAddress =
    "0xB0Ce0cb80a6a1E38EA00E3476327C783FbaA6B46"; // Replace with your deployed contract's address
  const destinationChain = "secret"; // Replace with your desired destination chain
  const destinationAddress = "secret1z3dt84jeczmx2eqr2yxp7n9ym3utzqrt2dt3xr"; // Replace with your desired destination address

  let msg = { vote: "yes" };
  let my_encrypted_message = await encrypt(msg);
  const SendReceiveEncrypt = await ethers.getContractFactory(
    "SendReceiveEncrypt"
  );
  const sendReceiveEncrypt = await SendReceiveEncrypt.attach(
    sendReceiveEncryptAddress
  );

  const tx = await sendReceiveEncrypt.send(
    destinationChain,
    destinationAddress,
    my_encrypted_message,
    {
      value: ethers.utils.parseEther("0.35"), // Adjust the amount as needed for gas
    }
  );

  console.log(`Transaction hash: ${tx.hash}`);
  await tx.wait();

  console.log("send function executed successfully!");
}
vote();
