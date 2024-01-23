import React, { useState } from "react";
import { Web3Provider } from "@ethersproject/providers";

const ConnectWallet = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState("");

  // const infuraProvider = new JsonRpcProvider(
  //   `https://sepolia.infura.io/v3/${process.env.REACT_APP_INFURA_KEY}`
  // );

  const connectWalletHandler = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        if (accounts.length === 0) {
          console.log("No account found");
          return;
        }

        // Use Web3Provider to wrap window.ethereum
        const provider = new Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();

        setIsConnected(true);
        setUserAddress(address);

        console.log("Connected", address);
      } catch (error) {
        console.error("Error connecting to MetaMask", error);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  // // Example usage of Infura provider (e.g., reading contract state)
  // useEffect(() => {
  //   if (isConnected) {
  //     // Example function call using Infura provider
  //     async function getBlockNumber() {
  //       const blockNumber = await infuraProvider.getBlockNumber();
  //       console.log("Current block number:", blockNumber);
  //     }

  //     getBlockNumber();
  //   }
  // }, [isConnected, infuraProvider]);

  return (
    <div className="connect-wallet">
      <button onClick={connectWalletHandler}>
        {isConnected
          ? `Connected: ${userAddress.substring(0, 6)}...`
          : "Connect Wallet"}
      </button>
    </div>
  );
};

export default ConnectWallet;
