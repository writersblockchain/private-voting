// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract PrivateVoting {

    event ProposalCreated(uint indexed proposalId, string description);
    event Voted(uint indexed proposalId, address indexed voter, bytes encryptedVote);
    event VotingClosed(uint indexed proposalId);

   struct Proposal {
    uint id; 
    string description;
    mapping(address => bool) hasVoted;
    bytes[] encryptedVotes;
    uint quorum;
    uint voteCount;
}

    mapping(uint => Proposal) public proposals;
    uint public nextProposalId;

    constructor() {
        nextProposalId = 1;
    }

    function createProposal(string memory description, uint quorum) external returns (uint proposalId) {
        proposalId = nextProposalId++;
        Proposal storage proposal = proposals[proposalId];
        proposal.id = proposalId;
        proposal.description = description;
        proposal.quorum = quorum;
        emit ProposalCreated(proposalId, description);
    }

    function getProposal(uint proposalId) external view returns (uint, string memory, uint, uint) {
    Proposal storage proposal = proposals[proposalId];
    return (proposal.id, proposal.description, proposal.quorum, proposal.voteCount);
}

    function vote(uint proposalId, bytes calldata encryptedVote) external {
    Proposal storage proposal = proposals[proposalId];
    require(!proposal.hasVoted[msg.sender], "Already voted");
    require(proposal.voteCount < proposal.quorum, "Voting closed");

    proposal.encryptedVotes.push(encryptedVote);
    proposal.hasVoted[msg.sender] = true;
    proposal.voteCount++;

    emit Voted(proposalId, msg.sender, encryptedVote);

    if (proposal.voteCount >= proposal.quorum) {
        emit VotingClosed(proposalId);
    }
}

function getVotes(uint proposalId) external view returns (bytes[] memory) {
    return proposals[proposalId].encryptedVotes;
}

}
