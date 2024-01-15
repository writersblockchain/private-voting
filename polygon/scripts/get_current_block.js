const { ethers } = require("ethers");

// Function to get the current block height
async function getCurrentBlockHeight() {
  // Connect to the Polygon testnet (Mumbai)
  const provider = new ethers.providers.JsonRpcProvider(
    "https://rpc-mumbai.maticvigil.com"
  );

  try {
    const blockNumber = await provider.getBlockNumber();
    console.log("Current Block Number:", blockNumber);
    return blockNumber;
  } catch (error) {
    console.error("Error fetching block height:", error);
    throw error;
  }
}

// Usage
getCurrentBlockHeight()
  .then((blockHeight) => {
    console.log("The current block height is:", blockHeight);
  })
  .catch((error) => {
    console.error("Error:", error);
  });
