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
  const [latestBlockTxns, setLatestBlockTxns] = useState([]);

  // Function to fetch latest block and transactions
  const fetchLatestBlockAndTxns = async () => {
    try {
      const status = await algodClient.status().do();
      const lastRound = status["last-round"];
      setLatestBlock(`Last Round: ${lastRound}`);

      const blockInfo = await algodClient.block(lastRound).do();
      const transactions = blockInfo.block.txns;

      if (typeof transactions !== "undefined") {
        let txnArr = [];
        for (let i = 0; i < transactions.length; i++) {
          if (transactions[i].txn.type === "pay") {
            txnArr.push({
              type: transactions[i].txn.type,
              sender: algosdk.encodeAddress(transactions[i].txn.snd),
              receiver: algosdk.encodeAddress(transactions[i].txn.rcv),
            });
          } else {
            txnArr.push({
              type: transactions[i].txn.type,
              sender: algosdk.encodeAddress(transactions[i].txn.snd),
            });
          }
        }
        setLatestBlockTxns(txnArr);
      } else {
        setLatestBlockTxns([]);
      }
    } catch (err) {
      console.error("Failed to get node status:", err);
    }
  };

  // Fetch the latest block and transactions when the component mounts
  useEffect(() => {
    fetchLatestBlockAndTxns();

    // Refresh transactions every 1 seconds (adjust as needed)
    const interval = setInterval(fetchLatestBlockAndTxns, 1000);

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  return (
    <div className="App">
      <a-scene cursor="rayOrigin: mouse" background="color: white">
        {/* Other A-Frame assets and elements */}
        {/* Display transactions */}
        {latestBlockTxns.map((txn, index) => (
          <React.Fragment key={index}>
          {txn.type === "pay" ? (
            <a-box
              width="0.5"
              height="0.5"
              color="#00f"
              position={`-2 ${2 - index * 0.5} -3`}
              //event-set__enter="_event: mouseenter; material.color: #FF0000"
              //event-set__leave="_event: mouseleave; material.color: #AA0000"
            ></a-box>
          ) : txn.type === "appl" ? (
            <a-sphere
              radius="0.25"
              color="#f00"
              position={`2 ${2 - index * 0.5} -3`}
            ></a-sphere>
          ) : txn.type === "axfer" ? (
            <a-cone
              radius="0.25"
              color="green"
              position={`0 ${2 - index * 0.5} -10`}
            ></a-cone>
          ) : txn.type === "stpf" ? (
            <a-torus
              radius="0.25"
              color="purple"
              position={`5 ${2 - index * 0.5} -10`}
            ></a-torus>
            ) : (
            <a-text
              value={`Type: ${txn.type}\nSender: ${txn.sender}\nReceiver: ${txn.receiver || 'N/A'}`}
              align="left"
              color="black"
              position={`-2 ${2 - index * 0.5} -3`}
            ></a-text>
          )}
        </React.Fragment>
        ))}
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
        <a-entity camera look-controls>
        </a-entity>
      </a-scene>
    </div>
  );
}

export default App;
