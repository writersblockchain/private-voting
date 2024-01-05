npx hardhat compile

npx hardhat run scripts/deploy.js --network polygon

PrivateVoting deployed to: 0x9aD72b95F04BA2cfF3A19bbc03fdf29B921771f6

npx hardhat --network polygon run ./scripts/create_proposal.js
npx hardhat --network polygon run ./scripts/query_proposals.js
npx hardhat --network polygon run ./scripts/vote.js
npx hardhat --network polygon run ./scripts/query_votes.js
