import React, { useState } from "react";
import { ethers } from "ethers";

// Constants
const CELO_CHAIN_ID = "0xa4ec"; // Celo Mainnet Chain ID
const COMMONS_CONTRACT_ADDRESS = "0x7b97031b6297bc8e030B07Bd84Ce92FEa1B00c3e";
const UBESWAP_STAKING_ADDRESS = "0x..."; // Replace with actual staking contract address

// ABIs
const COMMONS_ABI = [
  {
    constant: false,
    inputs: [],
    name: "claim",
    outputs: [],
    type: "function",
  },
];

const UBESWAP_STAKING_ABI = [
  {
    constant: false,
    inputs: [{ name: "amount", type: "uint256" }],
    name: "stake",
    outputs: [],
    type: "function",
  },
];

const App = () => {
  const [signer, setSigner] = useState(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [amount, setAmount] = useState("");

  // Connect to Wallet
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signerInstance = provider.getSigner();

      const address = await signerInstance.getAddress();
      setSigner(signerInstance);
      setWalletAddress(address);

      // Switch to Celo Network
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: CELO_CHAIN_ID,
            chainName: "Celo Mainnet",
            rpcUrls: ["https://forno.celo.org"],
            nativeCurrency: {
              name: "Celo",
              symbol: "CELO",
              decimals: 18,
            },
            blockExplorerUrls: ["https://explorer.celo.org"],
          },
        ],
      });

      console.log("Connected wallet:", address);
    } catch (error) {
      console.error("Wallet connection failed:", error);
    }
  };

  // Claim Commons Tokens
  const claimCommonsTokens = async () => {
    if (!signer) {
      alert("Please connect your wallet first.");
      return;
    }

    try {
      const commonsContract = new ethers.Contract(
        COMMONS_CONTRACT_ADDRESS,
        COMMONS_ABI,
        signer
      );

      const tx = await commonsContract.claim();
      console.log("Claim transaction hash:", tx.hash);

      await tx.wait();
      console.log("Tokens claimed successfully!");
    } catch (error) {
      console.error("Error claiming tokens:", error);
    }
  };

  // Stake Tokens
  const stakeTokens = async () => {
    if (!signer) {
      alert("Please connect your wallet first.");
      return;
    }

    if (!amount || isNaN(amount)) {
      alert("Please enter a valid amount to stake.");
      return;
    }

    try {
      const stakingContract = new ethers.Contract(
        UBESWAP_STAKING_ADDRESS,
        UBESWAP_STAKING_ABI,
        signer
      );

      const tx = await stakingContract.stake(ethers.utils.parseEther(amount));
      console.log("Staking transaction hash:", tx.hash);

      await tx.wait();
      console.log("Tokens staked successfully!");
    } catch (error) {
      console.error("Error staking tokens:", error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Commons Protocol Claimer</h1>
      <p>
        Wallet Address: <strong>{walletAddress || "Not connected"}</strong>
      </p>
      <button onClick={connectWallet}>Connect Wallet</button>

      <hr />

      <h2>Claim Commons Tokens</h2>
      <button onClick={claimCommonsTokens}>Claim Tokens</button>

      <hr />

      <h2>Stake Tokens</h2>
      <input
        type="text"
        placeholder="Amount to Stake"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button onClick={stakeTokens}>Stake Tokens</button>
    </div>
  );
};

export default App;
    
