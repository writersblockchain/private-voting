import { SecretNetworkClient, Wallet } from "secretjs";
import dotenv from "dotenv";
dotenv.config({ path: "../../polygon/.env" });

const wallet = new Wallet(process.env.MNEMONIC);

const secretjs = new SecretNetworkClient({
  chainId: "pulsar-3",
  url: "https://lcd.pulsar-3.secretsaturn.net",
  wallet: wallet,
  walletAddress: wallet.address,
});

// secret contract info
let contractCodeHash =
  "c30ef475618ce4a4f08814cf3f12939f19b5ae41e0c8483369ee89dd58a7dc34";
let contractAddress = "secret16lmkn6y4r5c28m37teptqa3xl3mtvmyktdru4y";
let encrypted_data;

let try_create_keys = async () => {
  const tx = await secretjs.tx.compute.executeContract(
    {
      sender: wallet.address,
      contract_address: contractAddress,
      msg: {
        create_keys: {},
      },
      code_hash: contractCodeHash,
    },
    { gasLimit: 2_000_000 }
  );

  console.log(tx);
};

try_create_keys();
