import React, { useState } from "react";
import { Web3Provider, InfuraProvider } from "@ethersproject/providers";
import { ethers, Wallet } from "ethers";

const ConnectWallet = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState("");

  const API_KEY = process.env.REACT_APP_INFURA_KEY;
  const PRIVATE_KEY = process.env.REACT_APP_PRIVATE_KEY;
  const infuraProvider = new InfuraProvider("sepolia", API_KEY);
  // const provider_Metamask = new Web3Provider(window.ethereum);

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

        const signer = new ethers.Wallet(PRIVATE_KEY, infuraProvider);
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
