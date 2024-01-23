import React, { useState, useEffect } from "react";
import ConnectWallet from "./components/connectWallet";
import CreateProposal from "./components/createProposal";
import ProposalsList from "./components/proposalsList";
import ProposalResults from "./components/proposalResults";
import ABI from "./ABI/PrivateVoting.json";
import { ethers } from "ethers";
import { Web3Provider, InfuraProvider } from "@ethersproject/providers";
import "./App.css";

const contractABI = ABI.abi;
const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
const API_KEY = process.env.REACT_APP_INFURA_KEY;

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
    // await window.ethereum.request({ method: "eth_requestAccounts" });

    const provider = new InfuraProvider("sepolia", API_KEY);
    // await provider.send("eth_requestAccounts", []);
    try {
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        provider
      );

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
