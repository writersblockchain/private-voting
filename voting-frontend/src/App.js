import { useState, useEffect } from "react";
import ConnectWallet from "./components/connectWallet";
import CreateProposal from "./components/createProposal";
import ProposalsList from "./components/proposalsList";
import ProposalResults from "./components/proposalResults";
import ABI from "./ABI/PrivateVoting.json";
import { Web3Provider } from "@ethersproject/providers";
import { Contract } from "ethers";

import "./App.css";

const contractABI = ABI.abi;
const contractAddress = "0x14332ACE418E5E067e90E7fB21d329dF44F1C6b2";

// Define the contract variable
const contract = new Contract(contractAddress, contractABI);

function App() {
  const [openProposals, setOpenProposals] = useState([]);
  const [closedProposals, setClosedProposals] = useState([]); // Define state for closed proposals

  useEffect(() => {
    async function fetchOpenProposals() {
      try {
        if (window.ethereum) {
          const provider = new Web3Provider(window.ethereum);
          await provider.send("eth_requestAccounts", []);
          const signer = provider.getSigner();
          const contract = new Contract(contractAddress, contractABI, signer);

          // Call your getAllOpenProposals function from the contract
          const openProposals = await contract.getAllOpenProposals();
          const closedProposals =
            await contract.getAllClosedProposalsWithVotes(); // Fetch closed proposals

          console.log("Open Proposals:", openProposals); // Debugging: Log the retrieved open proposals
          console.log("Closed Proposals:", closedProposals); // Debugging: Log the retrieved closed proposals

          // Update the state with the open and closed proposals
          setOpenProposals(openProposals);
          setClosedProposals(closedProposals);
        } else {
          alert("Please install MetaMask!");
        }
      } catch (error) {
        console.error("Error fetching open proposals:", error); // Debugging: Log any errors
        alert("Failed to fetch open proposals");
      }
    }

    fetchOpenProposals(); // Trigger the fetch operation when the component mounts
  }, []); // Empty dependency array means this effect runs once on mount
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
            {/* Pass existingProposals as a prop to ProposalsList */}
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
