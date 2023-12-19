import { SecretNetworkClient, Wallet } from "secretjs";
import dotenv from "dotenv";
dotenv.config({ path: "../../polygon/.env" });

let other_public_key = process.env.MY_PUB_KEY.split(",").map((num) =>
  parseInt(num, 10)
);
// console.log(other_public_key);

const wallet = new Wallet(process.env.MNEMONIC);

const secretjs = new SecretNetworkClient({
  chainId: "pulsar-3",
  url: "https://lcd.pulsar-3.secretsaturn.net",
  wallet: wallet,
  walletAddress: wallet.address,
});

// secret contract info
let contractCodeHash = process.env.CODE_HASH;
let contractAddress = process.env.SECRET_ADDRESS;

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
