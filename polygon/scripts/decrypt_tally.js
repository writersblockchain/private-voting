const { decrypt_tally } = require("../../secret_network/node/decrypt_tally.js");
const { queryVotes } = require("./query_proposal_votes.js");

let try_decrypt_tally = async () => {
  // 1. js function queries current block height
  // is current block height > deadline block height? if yes, then decrypt tally

  let encrypted_votes = await queryVotes(7);
  decrypt_tally(encrypted_votes);
};

try_decrypt_tally();
