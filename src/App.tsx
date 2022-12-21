import React, {useState, useEffect} from 'react';
import logo from './logo.svg';
import './App.css';
import { ethers } from 'ethers';
import abi from './utils/WavePortal.json';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import SwitchUnstyled, { switchUnstyledClasses } from '@mui/base/SwitchUnstyled';
import { styled } from '@mui/material/styles';

const StyledButton = styled('span')(`
  cursor: pointer;
  margin-top: 16px;
  padding: 8px;
  border: 0;
  border-radius: 5px;
`);

const { ethereum } = window;

type Wave = {
  "message" : string,
  "address" : string,
  "timestamp" : number
}

type FormattedWave = {
  "message" : string,
  "address" : string,
  "timestamp" : Date
}

function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [waveObjects, setWaveObjects] = useState([]);
  const contractAddress: string = "0x8edF9695877cE5bE0B264D9d3636d4BdA8358201"; // old address: 0xb046Ce21Ae9E7689b3aA676fD3cF07CF75Bb149f
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
        
        const waveTxn = await wavePortalContract.wave("Hey Navdev, nice WavePortal!");
        console.log("Mining...", waveTxn.hash);
        await waveTxn.wait();
        console.log("Mined...", waveTxn.hash);
        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
        const waves: Array<Wave> = wavePortalContract.getWaves(); // append to this and retrieve all waves once in useEffect
        let formattedWaves: Array<FormattedWave>;
        waves.forEach(wave => {
          formattedWaves.push({
            address: wave.address,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          })
        setWaveObjects(formattedWaves);
        });
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
    getMetaMaskAccount({method: "eth_accounts"}).then((account: string) => {
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
        Connect your virtual wallet, click the "Wave at Me" button to interact with a smart contract that will keep track of how many people have waved! 
        </div>
      <Tooltip title="Connect Metamask Wallet">
        <div className='waveButton'>
          {!currentAccount && (
            <Button variant='contained' color="success" className="waveButton" onClick={getMetaMaskAccount} sx={{
            margin: "16px",
            }}>Connect Wallet</Button>  
          )}
        </div>
      </Tooltip>
{/* TODO: Fix formatting here so that the button width is the same as the width of the Text div above it */}
      <Tooltip title="Interact with smart contract">
      <div className='waveButton'>
          {!currentAccount && (
            <Button variant='contained' color="success" className="waveButton" onClick={wave} sx={{
            margin: "16px",
            }}>Wave at Me!</Button>  
            )}
        </div>
      </Tooltip>        
     
      </div>
    </div>
  );
}

export default App;
