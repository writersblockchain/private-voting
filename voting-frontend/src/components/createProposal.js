import React, { useState } from "react";
import { Web3Provider } from "@ethersproject/providers";
import { Contract } from "ethers";

const CreateProposal = ({ contractABI, contractAddress }) => {
  const [proposalName, setProposalName] = useState("");
  const [quorum, setQuorum] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createProposal = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    try {
      setIsSubmitting(true);

      // Request access to the user's Ethereum account
      await window.ethereum.request({ method: "eth_requestAccounts" });

      // Use the window.ethereum provider
      const provider = new Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const contract = new Contract(contractAddress, contractABI, signer);
      const tx = await contract.createProposal(
        proposalName,
        parseInt(quorum, 10)
      );

      console.log(tx);

      alert(`Proposal created successfully!`);
    } catch (error) {
      console.error("Failed to create proposal", error);
      alert("Failed to create proposal");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createProposal();
  };

  return (
    <div className="column">
      <h2>Create New Proposal</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Proposal Name:
          <input
            type="text"
            value={proposalName}
            onChange={(e) => setProposalName(e.target.value)}
          />
        </label>
        <label>
          Quorum:
          <input
            type="number"
            value={quorum}
            onChange={(e) => setQuorum(e.target.value)}
            min="0"
          />
        </label>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Proposal"}
        </button>
      </form>
    </div>
  );
};

export default CreateProposal;
