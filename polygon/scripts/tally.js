const { get_decrypted_query } = require("../../secret_network/node/decrypt.js");
const { try_tally_votes } = require("../../secret_network/node/tally_votes.js");
const {
  get_tallied_votes,
} = require("../../secret_network/node/query_tallied_votes.js");
const { queryVotes } = require("./query_proposal_votes.js");

// Function to convert a hex string to a Uint8Array
function hexStringToUint8Array(hexString) {
  // Remove the "0x" prefix if it exists
  const cleanedHexString = hexString.startsWith("0x")
    ? hexString.slice(2)
    : hexString;

  // Convert the cleaned hexadecimal string into a uint8 array
  return new Uint8Array(
    cleanedHexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
  );
}

const proposalId = 5;

let final_tally = async () => {
  let get_decrypted_votes_for_proposal = async () => {
    let votes = await queryVotes(proposalId);
    let encrypted_votes_for_proposal = [];

    for (const hexString of votes) {
      const uint8Array = hexStringToUint8Array(hexString);
      encrypted_votes_for_proposal.push(uint8Array);
    }

    let yes_tally = 0;
    let no_tally = 5;
    let decrypted_query = [];

    for (let i = 0; i < encrypted_votes_for_proposal.length; i++) {
      const myUint8Array = new Uint8Array(encrypted_votes_for_proposal[i]);
      const myIntArray = Array.from(myUint8Array);
      const decryptedQuery = await get_decrypted_query(myIntArray);
      decrypted_query.push(decryptedQuery);
    }

    decrypted_query.forEach((item) => {
      let obj = JSON.parse(item);
      if (obj.answer === "yes") {
        yes_tally++;
      } else if (obj.answer === "no") {
        no_tally++;
      }
    });

    return { yes_tally, no_tally };
  };

  const tallies = await get_decrypted_votes_for_proposal();

  await try_tally_votes(proposalId, tallies.yes_tally, tallies.no_tally);

  await get_tallied_votes(proposalId);
};

final_tally();
