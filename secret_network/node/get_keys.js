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
  "1701eb81ac7f948f4fb503197f32c87780e6eb68b2b58438829d37ea5ee03fe1";
let contractAddress = "secret1aqe9e093wmmxk0jr5dus0h8kyey7yk0qpj4p6h";

let get_keys = async () => {
  let query = await secretjs.query.compute.queryContract({
    contract_address: contractAddress,
    query: {
      get_keys: {},
    },
    code_hash: contractCodeHash,
  });

  console.log(query);
};

get_keys();
