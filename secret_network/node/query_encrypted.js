import { SecretNetworkClient, Wallet } from "secretjs";
import dotenv from "dotenv";
dotenv.config({ path: "../../polygon/.env" });
import util from "util";

const wallet = new Wallet(process.env.MNEMONIC);

const secretjs = new SecretNetworkClient({
  chainId: "pulsar-3",
  url: "https://lcd.pulsar-3.secretsaturn.net",
  wallet: wallet,
  walletAddress: wallet.address,
});

// secret contract info
let contractCodeHash =
  "de106949ccfef72de656b3ae0675d334f92102561a5e3419fa69177dc310b5a3";
let contractAddress = "secret1u58qtud4tdmcwh85j8vlxxkfknjcqyhq9292hw";
let get_stored = async () => {
  let query = await secretjs.query.compute.queryContract({
    contract_address: contractAddress,
    query: {
      get_stored: {},
    },
    code_hash: contractCodeHash,
  });

  console.log(util.inspect(query, { maxArrayLength: null }));
};

get_stored();
