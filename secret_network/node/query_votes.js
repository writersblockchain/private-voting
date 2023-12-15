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
  "aaa576de9b93e770835d37d7cc0812a42e219350e6112540191834e314d294ed";
let contractAddress = "secret19sa4556dmzltsaxs3zv32y220wwsuxm87r2llk";

let get_stored_votes = async () => {
  let query = await secretjs.query.compute.queryContract({
    contract_address: contractAddress,
    query: {
      get_stored_votes: {
        ciphertexts: [
          [
            158, 193, 81, 210, 73, 49, 23, 202, 255, 74, 21, 8, 224, 248, 64,
            168, 195, 69, 164, 201, 238, 170, 247, 11, 150, 53, 131, 33, 223,
            198, 96, 73, 0, 177, 187, 189, 86, 10, 109, 221, 157, 171, 103, 136,
            21, 78, 168, 10, 125,
          ],
          [
            39, 45, 121, 9, 49, 101, 119, 42, 94, 120, 1, 15, 211, 74, 234, 68,
            247, 139, 106, 176, 223, 240, 141, 154, 120, 248, 132, 166, 87, 17,
            80, 2, 192, 153, 200, 164, 155, 141, 94, 236, 130, 146, 194, 106,
            87, 141, 114, 2,
          ],
        ],
        public_key: other_public_key,
      },
    },
    code_hash: contractCodeHash,
  });

  console.log(query);
};

get_stored_votes();
