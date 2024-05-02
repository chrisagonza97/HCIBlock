import React, { useEffect, useState } from "react";
import "./App.css";
import algosdk from "algosdk";

const algodToken = "";
const algodServer = "https://testnet-api.algonode.cloud";
const algodPort = 443;

const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

function App() {
  const [latestBlocks, setLatestBlocks] = useState(null);
  const [latestBlockTxns, setLatestBlockTxns] = useState(null);

  // Function to fetch the latest blocks
  async function fetchLatestBlocks() {
    try {
      const status = await algodClient.status().do();
      const currentRound = status["last-round"];

      const blockPromises = [];
      for (let i = currentRound; i > currentRound - 5; i--) {
        blockPromises.push(algodClient.block(i).do());
      }
      const blockResponses = await Promise.all(blockPromises);

      const blocks = blockResponses.map((blockResponse) => {
        const round = blockResponse["block"]["rnd"];
        const transactions = blockResponse["block"]["txns"];
        const formattedTransactions = transactions.map((txn) => {
          const sender = algosdk.encodeAddress(txn.txn.snd);
          const receiver = txn.txn.rcv ? algosdk.encodeAddress(txn.txn.rcv) : "None";
          const type = txn.txn.type === "pay" ? "pay" : "appl";
          return `Sender: ${sender}, Receiver: ${receiver}, Type: ${type}`;
        });

        const payCount = formattedTransactions.filter((txn) => txn.includes("Type: pay")).length;
        const applCount = formattedTransactions.filter((txn) => txn.includes("Type: appl")).length;

        return {
          round,
          transactions: formattedTransactions,
          payCount,
          applCount,
        };
      });

      const latestBlockInfo = blocks.map((block) => ({
        info: `#${block.round}\npay=${block.payCount}, appl=${block.applCount}\n${block.payCount + block.applCount} Transactions`,
      }));
      setLatestBlocks(latestBlockInfo);

      const blockTxns = blocks.map((block) => block.transactions);
      setLatestBlockTxns(blockTxns);

      console.log("Latest Block Transactions:", blockTxns);
    } catch (err) {
      console.error("Failed to fetch block information:", err);
    }
  }

  useEffect(() => {
    fetchLatestBlocks();
  }, []);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "r") {
        fetchLatestBlocks();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="App">
      <a-scene background="color: white">
        <a-assets>
          <a-mixin
            id="cubeMaterial"
            material="color: #ffffff; opacity: 1.0; transparent: true; metalness: 0; roughness: 0.5; shader: standard"
          ></a-mixin>
          <a-mixin
            id="edgeMaterial"
            material="color: #00f; opacity: 1; metalness: 0; roughness: 0.5; shader: standard"
          ></a-mixin>
        </a-assets>

        {latestBlocks &&
          latestBlocks.map((block, index) => (
            <a-entity key={index}>
              <a-box
                position={`${index * 2 - latestBlocks.length} 1 -3`}
                scale="1 1 1"
                width="1"
                height="1"
                depth="1"
                mixin="cubeMaterial edgeMaterial"
                wireframe="true"
              >
                <a-text
                  value={block.info}
                  align="center"
                  color="black"
                  scale="0.5 0.5 0.5"
                ></a-text>
                <a-text
                  value={block.info}
                  align="center"
                  color="black"
                  rotation="0 180 0"
                  scale="0.5 0.5 0.5"
                ></a-text>
              </a-box>

              {latestBlockTxns &&
                latestBlockTxns[index].map((txn, txnIndex) => (
                  <a-box
                    key={txnIndex}
                    position={`${index * 2 - latestBlocks.length} 1 ${
                      -txnIndex * 2 - 5
                    }`}
                    scale="1 1 1"
                    mixin="cubeMaterial edgeMaterial"
                    wireframe="true"
                  >
                    <a-text
                      value={txn}
                      align="center"
                      color="black"
                      position="0 0 0"
                      scale="0.3 0.3 0.3"
                    ></a-text>
                    <a-text
                      value={txn}
                      align="center"
                      color="black"
                      position="0 0 0"
                      rotation="0 180 0"
                      scale="0.3 0.3 0.3"
                    ></a-text>
                  </a-box>
                ))}
            </a-entity>
          ))}

        <a-plane
          position="0 0 -3.5"
          rotation="-90 0 0"
          width="25"
          height="25"
          color="#7BC8A4"
        ></a-plane>

        <a-entity camera></a-entity>
      </a-scene>

      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "10px",
          height: "10px",
          background: "black",
          transform: "translate(-50%, -50%)",
          zIndex: "9999",
        }}
      ></div>
    </div>
  );
}

export default App;
