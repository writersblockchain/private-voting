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

let get_tallied_votes = async (proposal_id) => {
  let query = await secretjs.query.compute.queryContract({
    contract_address: contractAddress,
    query: {
      get_vote_results: {
        proposal_id: proposal_id,
      },
    },
    code_hash: contractCodeHash,
  });

  console.log(query);
};

module.exports = {
  get_tallied_votes,
};
