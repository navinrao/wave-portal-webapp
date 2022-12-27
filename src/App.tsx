import React, { useState, useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";
import { ethers } from "ethers";
import abi from "./utils/WavePortal.json";
import { styled } from "@mui/material/styles";
import {
  Tooltip,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

const { ethereum } = window;

type Wave = {
  message: string;
  waver: string;
  timestamp: number;
};

type FormattedWave = {
  message: string;
  waver: string;
  timestamp: Date;
};

function App() {
  const [currentAccount, setCurrentAccount] = useState(String);
  const [waveObjects, setWaveObjects] = useState(Array<FormattedWave>);
  const [waveMessageText, setWaveMessageText] = useState(String);

  const contractAddress: string = "0x8edF9695877cE5bE0B264D9d3636d4BdA8358201"; // old address: 0xb046Ce21Ae9E7689b3aA676fD3cF07CF75Bb149f
  const contractABI = abi.abi;

  const getMetaMaskAccount = async (method: any) => {
    try {
      if (ethereum) {
        method = { method: "eth_requestAccounts" };
        console.log("Ethereum object:", ethereum);
        const accounts = await ethereum.request(method);

        if (accounts.length > 0) {
          const account = accounts[0];

          console.log("Found an authorized account: ", account);
          setCurrentAccount(account);
          return account;
        } else {
          console.log("ERROR: No authorized account found.");
          return null;
        }
      }
      console.log(
        "Metamask extension is not installed on your browser. Please install it before accessing the Wave Portal."
      );
      return null;
    } catch (error) {
      console.log("ERROR: ", error);
      return null;
    }
  };

  const wave = async () => {
    try {
      console.log(waveMessageText);
      if (ethereum && currentAccount) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count", count.toNumber());

        /*
         * Execute the actual wave from your smart contract
         */

        const waveTxn = await wavePortalContract.wave("Sick portal!");
        console.log("Mining...", waveTxn.hash);
        await waveTxn.wait();
        console.log("Mined...", waveTxn.hash);
        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
        const waves: Array<Wave> = await wavePortalContract.getWaves(); // append to this and retrieve all waves once in useEffect
        let formattedWaves: Array<FormattedWave> = [];
        waves.forEach((wave) => {
          formattedWaves.push({
            waver: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
          });
          setWaveObjects(formattedWaves);
        });
      } else {
        alert(
          "Please connect your wallet first. If you don't have Metamask, then download it."
        );
        console.log("Ethereum object does not exist");
      }
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    getMetaMaskAccount({ method: "eth_accounts" }).then((account: string) => {
      if (account != null) {
        setCurrentAccount(account);
      }
    });
  }, []);

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
          Welcome to the Wave Portal, a place to wave to others.
        </div>

        <div className="bio">
          Connect your virtual wallet, click the "Wave at Me" button to interact
          with a smart contract that will keep track of how many people have
          waved!
        </div>
        <div className="buttonContainer">
          {!currentAccount && (
            <Tooltip title="Connect Metamask Wallet">
              <div id="connectWalletButton" className="waveButtons">
                <button className="waveButtons" onClick={getMetaMaskAccount}>
                  Connect Wallet
                </button>
              </div>
            </Tooltip>
          )}
          {/* <img src={logo} className="App-logo" alt="logo" /> */}

          <div className="columnContainer">
            {/* TODO: Fix formatting here so that the button width is the same as the width of the Text div above it */}
            <TextField
              id="outlined-basic"
              className="textField"
              label="Send me a Message!"
              variant="filled"
              value={waveMessageText}
              onChange={e => setWaveMessageText(e.target.value)}
            />
            <Tooltip title="Adds a message on the Ethereum blockchain">
              <button className="waveButtons" onClick={wave}>
                Wave at Me!
              </button>
            </Tooltip>
          </div>
        </div>
        <div id="tableDiv">
          {waveObjects.length >= 0 && (
            <TableContainer
              component={Paper}
              sx={{
                backgroundColor: "black",
                color: "white",
              }}
            >
              <Table className="tableColors" aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell
                      className="tableColors"
                      sx={{
                        backgroundColor: "black",
                        color: "white",
                      }}
                    >
                      Message
                    </TableCell>
                    <TableCell
                      align="left"
                      sx={{
                        backgroundColor: "black",
                        color: "white",
                      }}
                    >
                      Address
                    </TableCell>
                    <TableCell
                      align="left"
                      sx={{
                        backgroundColor: "black",
                        color: "white",
                      }}
                    >
                      Timestamp
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {waveObjects.map((wave) => (
                    <TableRow
                      key={wave.message}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell
                        component="th"
                        scope="row"
                        sx={{
                          backgroundColor: "black",
                          color: "white",
                        }}
                      >
                        {wave.message}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          backgroundColor: "black",
                          color: "white",
                        }}
                      >
                        {wave.waver}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          backgroundColor: "black",
                          color: "white",
                        }}
                      >
                        {wave.timestamp.toDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
