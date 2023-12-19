// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import {AxelarExecutable} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/executable/AxelarExecutable.sol";
import {IAxelarGateway} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGateway.sol";
import {IAxelarGasService} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGasService.sol";
import {StringToAddress, AddressToString} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/utils/AddressString.sol";

contract PrivateVoting is AxelarExecutable {
    using StringToAddress for string;
    using AddressToString for address;

event ProposalCreated(uint indexed proposalId, string name, string description);
event Voted(uint indexed proposalId, address indexed voter, string encryptedVote);
event VotingClosed(uint indexed proposalId);


    IAxelarGasService public immutable gasService;
    string public chainName; // name of the chain this contract is deployed to

      constructor(
        address gateway_,
        address gasReceiver_,
        string memory chainName_
    ) AxelarExecutable(gateway_) {
        gasService = IAxelarGasService(gasReceiver_);
        chainName = chainName_;
        nextProposalId = 1;
    }

  struct Proposal {
    uint id;
    string name;
    string description;
    mapping(address => bool) hasVoted;
    uint quorum;
    uint voteCount;
}

    mapping(uint => Proposal) public proposals;
    uint public nextProposalId;

    function uintToString(uint256 value) public pure returns (string memory) {
        return string(abi.encodePacked(value));
    }

   function createProposal(string memory name, string memory description, uint quorum) external returns (uint proposalId) {
    proposalId = nextProposalId++;
    Proposal storage proposal = proposals[proposalId];
    proposal.id = proposalId;
    proposal.name = name;
    proposal.description = description;
    proposal.quorum = quorum;
    emit ProposalCreated(proposalId, name, description);
}


     function vote(uint proposalId, string calldata encryptedVote, string calldata destinationChain, string calldata destinationAddress) external payable {
    Proposal storage proposal = proposals[proposalId];
    require(!proposal.hasVoted[msg.sender], "Already voted");
    require(proposal.voteCount < proposal.quorum, "Voting closed");
emit Voted(proposalId, msg.sender, encryptedVote);
    proposal.hasVoted[msg.sender] = true;
    proposal.voteCount++;

    if (proposal.voteCount >= proposal.quorum) {
       emit VotingClosed(proposalId);
    }

    send(destinationChain, destinationAddress, encryptedVote);
}


  function send(
        string calldata destinationChain,
        string calldata destinationAddress,
        string calldata encryptedVote
    ) public payable {
        // 1. Generate GMP payload
        bytes memory executeMsgPayload = abi.encode(encryptedVote);
        bytes memory payload = _encodePayloadToCosmWasm(executeMsgPayload);

        // 2. Pay for gas
        gasService.payNativeGasForContractCall{value: msg.value}(
            address(this),
            destinationChain,
            destinationAddress,
            payload,
            msg.sender
        );

        // 3. Make GMP call
        gateway.callContract(destinationChain, destinationAddress, payload);
    }

    function _encodePayloadToCosmWasm(bytes memory executeMsgPayload) internal view returns (bytes memory) {
        // Schema
        //   bytes4  version number (0x00000001)
        //   bytes   ABI-encoded payload, indicating function name and arguments:           
        //     string                   CosmWasm contract method name
        //     dynamic array of string  CosmWasm contract argument name array
        //     dynamic array of string  argument abi type array
        //     bytes                    abi encoded argument values

        // contract call arguments for ExecuteMsg::receive_message_evm{ source_chain, source_address, payload }
        bytes memory argValues = abi.encode(
            chainName,
            address(this).toString(),
            executeMsgPayload
        );

        string[] memory argumentNameArray = new string[](3);
        argumentNameArray[0] = "source_chain";
        argumentNameArray[1] = "source_address";
        argumentNameArray[2] = "payload";

        string[] memory abiTypeArray = new string[](3);
        abiTypeArray[0] = "string";
        abiTypeArray[1] = "string";
        abiTypeArray[2] = "bytes";

        bytes memory gmpPayload;
        gmpPayload = abi.encode(
            "receive_message_evm",
            argumentNameArray,
            abiTypeArray,
            argValues
        );

        return abi.encodePacked(
            bytes4(0x00000001),
            gmpPayload
        );
    }
}
