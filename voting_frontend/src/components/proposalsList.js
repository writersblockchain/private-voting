// Inside ProposalsList.js
import React, { useState } from "react";
import { Web3Provider } from "@ethersproject/providers";
import { Contract } from "ethers";
import encrypt from "../functions/encrypt.js";

const ProposalsList = ({ proposals, contractABI, contractAddress }) => {
  const [voteChoice, setVoteChoice] = useState(""); // State to store the selected vote choice

  const handleVote = async (proposalId, choice) => {
    try {
      if (!window.ethereum) {
        alert("Please install MetaMask!");
        return;
      }

      // Request access to the signer (MetaMask account)
      await window.ethereum.request({ method: "eth_requestAccounts" });

      const provider = new Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();

      const contract = new Contract(contractAddress, contractABI, signer);

      //   // Check if the user has already voted for this proposal
      //   const hasVoted = await contract.hasVoted(
      //     proposalId,
      //     window.ethereum.selectedAddress
      //   );

      //   if (hasVoted) {
      //     alert("You have already voted for this proposal.");
      //     return;
      //   }

      // Encrypt the message with the specified format
      let msg = {
        answer: choice,
        salt: Math.random(),
      };
      let my_encrypted_message = await encrypt(msg);
      console.log(choice, my_encrypted_message);
      // Call the vote function with the encrypted message
      const tx = await contract.vote(proposalId, my_encrypted_message);
      await tx.wait();
      alert("Vote submitted successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to vote.");
    }
  };

  return (
    <div>
      <h2>Open Proposals</h2>
      <ul style={{ listStyleType: "none", padding: 0 }}>
        {proposals ? (
          proposals.map((proposal, index) => (
            <li key={index}>
              <strong>Description:</strong>{" "}
              {JSON.stringify(proposal.description)}
              <br />
              <button onClick={() => handleVote(proposal.id, "yes")}>
                Vote Yes
              </button>
              <button onClick={() => handleVote(proposal.id, "no")}>
                Vote No
              </button>
            </li>
          ))
        ) : (
          <p>No open proposals found.</p>
        )}
      </ul>
    </div>
  );
};

export default ProposalsList;
