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

const queryTalliedVotes = async () => {
  const query = await secretjs.query.compute.queryContract({
    contract_address: contractAddress,
    query: {
      get_results: {},
    },
    code_hash: contractCodeHash,
  });

  console.log(query);
};

export default queryTalliedVotes;
