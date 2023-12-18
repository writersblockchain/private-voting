import { SecretNetworkClient, Wallet } from "secretjs";
import dotenv from "dotenv";
dotenv.config({ path: "../../polygon/.env" });

let other_public_key = process.env.MY_PUB_KEY.split(",").map((num) =>
  parseInt(num, 10)
);

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

let get_stored_votes = async () => {
  let query = await secretjs.query.compute.queryContract({
    contract_address: contractAddress,
    query: {
      get_stored_votes: {
        public_key: other_public_key,
      },
    },
    code_hash: contractCodeHash,
  });

  console.log(query);
};

get_stored_votes();
