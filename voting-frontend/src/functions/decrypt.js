import { SecretNetworkClient, Wallet } from "secretjs";

const wallet = new Wallet(
  "shed clerk spray velvet flower tide cherry idea public solar prize tackle"
);

const secretjs = new SecretNetworkClient({
  chainId: "pulsar-3",
  url: "https://lcd.pulsar-3.secretsaturn.net",
  wallet: wallet,
  walletAddress: wallet.address,
});

// secret contract info
const contractCodeHash =
  "6bd4faa5ad77bee86c34c89df8250be258d7af552587fbd0b2c75b58019d7933";
const contractAddress = "secret16gx7t23c9nlgxgctey0mmr0ct5luw3jg8x7dwd";
const otherPublicKey =
  "2,205,150,187,68,68,194,2,77,164,192,40,76,92,51,189,246,253,191,133,56,199,169,60,140,167,96,187,7,226,178,146,212"
    .split(",")
    .map((num) => parseInt(num, 10));

const decryptTally = async (encryptedVotes) => {
  const tx = await secretjs.tx.compute.executeContract(
    {
      sender: wallet.address,
      contract_address: contractAddress,
      msg: {
        decrypt_tally: {
          public_key: otherPublicKey,
          encrypted_message: encryptedVotes,
        },
      },
      code_hash: contractCodeHash,
    },
    { gasLimit: 2_000_000 }
  );

  console.log(tx);
};

export default decryptTally;
