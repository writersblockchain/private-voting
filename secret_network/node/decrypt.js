const { SecretNetworkClient, Wallet } = require("secretjs");
const dotenv = require("dotenv");
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

let get_decrypted_query = async (encrypted_message) => {
  let query = await secretjs.query.compute.queryContract({
    contract_address: contractAddress,
    query: {
      decrypt_query: {
        public_key: other_public_key,
        encrypted_message: encrypted_message,
      },
    },
    code_hash: contractCodeHash,
  });

  return query;
};

module.exports = {
  get_decrypted_query,
};
