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

  // Define a custom struct to represent Proposal information for queries
    struct ProposalInfo {
        uint id;
        string description;
        uint quorum;
        uint voteCount;
    }

    function getAllOpenProposals() external view returns (ProposalInfo[] memory) {
        uint[] memory openProposalIds = new uint[](nextProposalId);

        uint openProposalCount = 0;
        for (uint i = 1; i < nextProposalId; i++) {
            Proposal storage proposal = proposals[i];
            if (proposal.voteCount < proposal.quorum) {
                openProposalIds[openProposalCount] = i;
                openProposalCount++;
            }
        }

        ProposalInfo[] memory openProposals = new ProposalInfo[](openProposalCount);

        for (uint i = 0; i < openProposalCount; i++) {
            uint proposalId = openProposalIds[i];
            Proposal storage proposal = proposals[proposalId];
            openProposals[i] = ProposalInfo({
                id: proposal.id,
                description: proposal.description,
                quorum: proposal.quorum,
                voteCount: proposal.voteCount
            });
        }

        return openProposals;
    }

    // New struct to represent Proposal information including encrypted votes
    struct ProposalInfoWithVotes {
        uint id;
        string description;
        uint quorum;
        uint voteCount;
        bytes[] encryptedVotes;
    }

    // New function to query all closed proposals along with their info and encrypted votes
    function getAllClosedProposalsWithVotes() external view returns (ProposalInfoWithVotes[] memory) {
        uint[] memory closedProposalIds = new uint[](nextProposalId);

        uint closedProposalCount = 0;
        for (uint i = 1; i < nextProposalId; i++) {
            Proposal storage proposal = proposals[i];
            if (proposal.voteCount >= proposal.quorum) {
                closedProposalIds[closedProposalCount] = i;
                closedProposalCount++;
            }
        }

        ProposalInfoWithVotes[] memory closedProposals = new ProposalInfoWithVotes[](closedProposalCount);

        for (uint i = 0; i < closedProposalCount; i++) {
            uint proposalId = closedProposalIds[i];
            Proposal storage proposal = proposals[proposalId];
            closedProposals[i] = ProposalInfoWithVotes({
                id: proposal.id,
                description: proposal.description,
                quorum: proposal.quorum,
                voteCount: proposal.voteCount,
                encryptedVotes: proposal.encryptedVotes
            });
        }

        return closedProposals;
    }

}

