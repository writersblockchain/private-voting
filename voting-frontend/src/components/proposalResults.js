import React, { useState } from "react";
import decryptTally from "../functions/decrypt";
import queryTalliedVotes from "../functions/query_tallied_votes";

const ProposalResults = ({ proposals }) => {
  const [decryptedResults, setDecryptedResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const decryptResults = async (proposalIndex) => {
    const encryptedVotes = proposals[proposalIndex].encryptedVotes;
    const decryptedResult = await decryptTally(encryptedVotes);
    const query = await queryTalliedVotes();
    const newDecryptedResults = [...decryptedResults];
    newDecryptedResults[proposalIndex] = decryptedResult;
    setDecryptedResults(newDecryptedResults);
    setShowResults(true);
  };

  return (
    <div>
      <h2>Closed Proposals</h2>
      <ul style={{ listStyleType: "none", padding: 0 }}>
        {proposals.length === 0 ? (
          <p>No closed proposals found.</p>
        ) : (
          proposals.map((proposal, index) => (
            <li key={index}>
              <strong>Description:</strong>{" "}
              {JSON.stringify(proposal.description)}
              <br />
              <button onClick={() => decryptResults(index)}>Decrypt</button>
              {showResults && decryptedResults[index] && (
                <div>
                  <strong>Decrypted Result:</strong>{" "}
                  {JSON.stringify(decryptedResults[index].decryptedResult)}
                </div>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default ProposalResults;
