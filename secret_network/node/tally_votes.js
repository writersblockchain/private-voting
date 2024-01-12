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

let try_tally_votes = async (proposal_id, yes_votes, no_votes) => {
  const tx = await secretjs.tx.compute.executeContract(
    {
      sender: wallet.address,
      contract_address: contractAddress,
      msg: {
        tally: {
          proposal_id: proposal_id,
          yes_votes: yes_votes,
          no_votes: no_votes,
        },
      },
      code_hash: contractCodeHash,
    },
    { gasLimit: 2_000_000 }
  );

  console.log(tx);
};

module.exports = {
  try_tally_votes,
};
