import React, { useState, useEffect } from "react";
import ConnectWallet from "./components/connectWallet";
import CreateProposal from "./components/createProposal";
import ProposalsList from "./components/proposalsList";
import ProposalResults from "./components/proposalResults";
import ABI from "./ABI/PrivateVoting.json";
import { ethers } from "ethers";
import "./App.css";
import "@ethersproject/shims";

const contractABI = ABI.abi;
const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

function App() {
  const [openProposals, setOpenProposals] = useState([]);
  const [closedProposals, setClosedProposals] = useState([]);

  useEffect(() => {
    fetchProposals();
    const interval = setInterval(fetchProposals, 10000); // Poll every 10 seconds

    return () => {
      clearInterval(interval);
    };
  }, []);

  const fetchProposals = async () => {
    try {
      // Initialize Ethers provider
      // Use the mainnet
      const network = "sepolia";

      // Specify your own API keys
      // Each is optional, and if you omit it the default
      // API key for that service will be used.
      const provider = ethers.getDefaultProvider(network, {
        infura: process.env.REACT_APP_INFURA_KEY,
      });

      // Create a new Ethers contract instance
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        provider
      );

      // Call the getAllProposals method
      const open = await contract.getAllProposals(true);
      setOpenProposals(open);

      const closed = await contract.getAllProposals(false);
      setClosedProposals(closed);
    } catch (error) {
      console.error("Error fetching proposals:", error);
    }
  };

  return (
    <div className="App">
      <ConnectWallet />
      <div className="header">
        <h1>Private Voting on Secret Network</h1>
      </div>
      <div className="columns">
        <CreateProposal
          contractABI={contractABI}
          contractAddress={contractAddress}
        />
        <div className="column">
          <div className="proposal-list">
            <ProposalsList
              proposals={openProposals}
              contractABI={contractABI}
              contractAddress={contractAddress}
            />
          </div>
        </div>
        <div className="column">
          <ProposalResults proposals={closedProposals} />
        </div>
      </div>
    </div>
  );
}

export default App;
