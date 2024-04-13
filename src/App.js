import React, { useEffect, useState } from "react";
import "./App.css";
import algosdk from "algosdk";

// Define the Algorand node connection parameters
const algodToken = ""; // free service does not require tokens
const algodServer = "https://testnet-api.algonode.cloud";
const algodPort = 443;

const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

function App() {
  const [latestBlock, setLatestBlock] = useState(null);
  const [latestBlockTxns, setLatestBlockTxns] = useState(null);
  // Fetch the latest block when the component mounts
  useEffect(() => {
    async function fetchLatestBlock() {
      try {
        const status = await algodClient.status().do();
        console.log("status:")
        console.log(status);
        const lastRound = status["last-round"];
        setLatestBlock(`Last Round: ${lastRound}`);
        console.log(lastRound);
        // Fetch block information
        const blockInfo = await algodClient.block(lastRound).do();
        console.log("blockInfo");
        console.log(blockInfo);

        // Extract transactions from the block
        // if there was no transactions in the latest block, then 'transactions' is undefined
        const transactions = blockInfo.block.txns;
        console.log("raw Transactions in the latest block:", transactions);
        if (typeof transactions === "undefined") {
          console.log("no transactions in this block");
          setLatestBlock([]);
        } else {
          console.log("txns")
          let txnArr = [];
          for (let i = 0; i < transactions.length; i++) {
            if ((transactions[i].txn.type === "pay")) {
              txnArr.push({
                type: transactions[i].txn.type,
                sender: algosdk.encodeAddress(transactions[i].txn.snd),
                receiver: algosdk.encodeAddress(transactions[i].txn.rcv),
              });
            }else{
              txnArr.push({
                type: transactions[i].txn.type,
                sender: algosdk.encodeAddress(transactions[i].txn.snd),
                //receiver: algosdk.encodeAddress(transactions[i].txn.rcv),
              });
            }
          }
          setLatestBlockTxns(txnArr);
        }

        // Display transactions
        console.log("Transactions in the latest block:", latestBlockTxns);
      } catch (err) {
        setLatestBlock("Failed to get node status: " + err);
      }
    }
    fetchLatestBlock();
  }, []);

  // Function to get the text
  function getHello() {
    return "Hello";
  }

  return (
    <div className="App">
      <a-scene background="color: white">
        <a-assets>
          {/* Define a material asset for the white cube */}
          <a-mixin
            id="cubeMaterial"
            material="color: #ffffff; opacity: 1.0; transparent: true; metalness: 0; roughness: 0.5; shader: standard"
          ></a-mixin>
          {/* Define a material asset for the blue edges */}
          <a-mixin
            id="edgeMaterial"
            material="color: #00f; opacity: 1; metalness: 0; roughness: 0.5; shader: standard"
          ></a-mixin>
        </a-assets>
        {/* Use the defined material assets for the white cube */}
        <a-box
          position="0 2 -3"
          scale="1 1 1"
          width="1"
          height="1"
          depth="1"
          mixin="cubeMaterial edgeMaterial"
          wireframe="true"
        >
          {/* Display text on the front face of the cube */}
          <a-text value={latestBlock} align="center" color="black"></a-text>
          {/* Display text on the back face of the cube */}
          <a-text
            value={latestBlock}
            align="center"
            color="black"
            rotation="0 180 0"
          ></a-text>
        </a-box>

        {/* A plane as floor */}
        <a-plane
          position="0 0 -3.5"
          rotation="-90 0 0"
          width="4"
          height="4"
          color="#7BC8A4"
        ></a-plane>

        {/* Camera and controls */}
        <a-entity camera look-controls></a-entity>
      </a-scene>
    </div>
  );
}

export default App;
