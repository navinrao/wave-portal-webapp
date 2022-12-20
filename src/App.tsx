import React, {useState, useEffect} from 'react';
import logo from './logo.svg';
import './App.css';
import { ethers } from 'ethers';
import { ExternalProvider } from "@ethersproject/providers";
import abi from './utils/WavePortal.json';

const { ethereum } = window;

function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const contractAddress = "0xb046Ce21Ae9E7689b3aA676fD3cF07CF75Bb149f"
  const contractABI = abi.abi;

  const getMetaMaskAccount = async (method: any) => {
    try {
      if (ethereum) {
        method = {"method": "eth_requestAccounts"}
        console.log("Ethereum object:", ethereum);
        const accounts = await ethereum.request(method);
  
        if (accounts.length > 0) {
          const account = accounts[0];
          
          console.log("Found an authorized account: ", account);
          setCurrentAccount(account);
          return account
        }
        else {
          console.log("ERROR: No authorized account found.");
          return null;
        }
      }
      console.log('Metamask extension is not installed on your browser. Please install it before accessing the Wave Portal.');
      return null; 
    }
    catch (error) {
      console.log("ERROR: ", error);
      return null;
    }
  };

  const wave = async() => {
    try {
      if (ethereum && currentAccount) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count", count.toNumber());

        /*
        * Execute the actual wave from your smart contract
        */
        
        const waveTxn = await wavePortalContract.wave();
        console.log("Mining...", waveTxn.hash);
        await waveTxn.wait();
        console.log("Mined...", waveTxn.hash);    
        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());        
      }
      else {
        alert("Please connect your wallet first. If you don't have Metamask, then download it.");
        console.log("Ethereum object does not exist");
      }
    }
    catch (error) {
      console.error(error);
    }
  }
  useEffect(() => {
    getMetaMaskAccount({method: "eth_accounts"}).then((account) => {
      if (account != null) {
        setCurrentAccount(account);
      }
    });

  }, []);
    
  return (
    <div className="mainContainer">
      <img src={logo} className="App-logo" alt="logo" />
      <div className="dataContainer">
        <div className="header">
        Welcome to the Wave Portal, a place to wave to others.
        </div>

        <div className="bio">
        This webapp was built by Farza 
        </div>

        {!currentAccount && (
          <button className="waveButton" onClick={getMetaMaskAccount}>
            Connect Wallet
          </button>
        )}   

        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>
     
      </div>
    </div>
  );
}

export default App;
