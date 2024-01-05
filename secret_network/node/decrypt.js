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
let contractCodeHash = process.env.CODE_HASH;
let contractAddress = process.env.SECRET_ADDRESS;
let encrypted_data;
let other_public_key = process.env.MY_PUB_KEY.split(",").map((num) =>
  parseInt(num, 10)
);

let get_decrypted_query = async () => {
  let query = await secretjs.query.compute.queryContract({
    contract_address: contractAddress,
    query: {
      decrypt_query: {
        public_key: other_public_key,
        encrypted_message: [
          170, 178, 174, 57, 214, 52, 175, 237, 211, 140, 68, 7, 3, 157, 202,
          209, 150, 177, 232, 250, 86, 186, 178, 60, 78, 252, 133, 201, 78, 234,
          208, 105,
        ],
      },
    },
    code_hash: contractCodeHash,
  });

  console.log(query);
};

get_decrypted_query();
