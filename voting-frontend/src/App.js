import React, { useState } from "react";
import "./App.css";

function App() {
  const [proposalName, setProposalName] = useState("");
  const [proposals, setProposals] = useState([]); // To store submitted proposals
  const [votes, setVotes] = useState({}); // To store votes for each proposal

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add the proposal name to the list of proposals
    setProposals([...proposals, proposalName]);
    // Initialize the votes for this proposal
    setVotes({ ...votes, [proposalName]: { yes: 0, no: 0 } });
    // Clear the input field after submission
    setProposalName("");
  };

  const handleVote = (proposal, vote) => {
    // Increment the vote count for the selected proposal and vote type (yes or no)
    setVotes({
      ...votes,
      [proposal]: {
        ...votes[proposal],
        [vote]: votes[proposal][vote] + 1,
      },
    });
  };

  return (
    <div className="App">
      <div className="header">
        <h1>Private Voting on Secret Network</h1>
      </div>
      <div className="columns">
        <div className="column">
          <h2>Create New Proposal</h2>
          <form onSubmit={handleSubmit}>
            <label>
              Create a new Yes or No Proposal:
              <br></br>
              <input
                type="text"
                value={proposalName}
                onChange={(e) => setProposalName(e.target.value)}
              />
            </label>
            <button type="submit">Submit Proposal</button>
          </form>
        </div>
        <div className="column">
          <h2>Existing Proposals</h2>
          <ul style={{ listStyleType: "none", padding: 0 }}>
            {proposals.map((proposal, index) => (
              <li key={index}>
                {proposal} -{" "}
                <button onClick={() => handleVote(proposal, "yes")}>Yes</button>{" "}
                <button onClick={() => handleVote(proposal, "no")}>No</button>
              </li>
            ))}
          </ul>
        </div>
        <div className="column">
          <h2>Proposal Results</h2>
        </div>
      </div>
    </div>
  );
}

export default App;
