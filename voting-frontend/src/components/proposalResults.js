import React, { useState } from "react";
import decryptTally from "../functions/decrypt";
import queryTalliedVotes from "../functions/query_tallied_votes";

const ProposalResults = ({ proposals }) => {
  const [decryptedResults, setDecryptedResults] = useState([]);
  const [showResultIndex, setShowResultIndex] = useState(null);

  const decryptResults = async (proposalIndex) => {
    const encryptedVotes = proposals[proposalIndex].encryptedVotes;
    const decryptedResult = await decryptTally(encryptedVotes);

    // Ensure that decryptedResults[index] is initialized as an object
    if (!decryptedResults[proposalIndex]) {
      decryptedResults[proposalIndex] = {};
    }

    decryptedResults[proposalIndex].decryptedResult = decryptedResult;

    // Trigger the queryTalliedVotes function
    const queriedVotes = await queryTalliedVotes();

    // Ensure that decryptedResults[index] is initialized as an object
    if (!decryptedResults[proposalIndex]) {
      decryptedResults[proposalIndex] = {};
    }

    decryptedResults[proposalIndex].talliedVotes = queriedVotes;

    // Set the index to show the result for this proposal
    setShowResultIndex(proposalIndex);
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
              {showResultIndex === index && decryptedResults[index] && (
                <div>
                  <strong>Decrypted Result:</strong>{" "}
                  {JSON.stringify(decryptedResults[index].decryptedResult)}
                </div>
              )}
              {showResultIndex === index &&
                decryptedResults[index]?.talliedVotes && (
                  <div>
                    <strong>Tallied Votes:</strong>{" "}
                    {JSON.stringify(decryptedResults[index].talliedVotes)}
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
