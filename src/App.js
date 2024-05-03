import React, { useEffect, useState } from "react";
import "./App.css";
import algosdk from "algosdk";
//import AFRAME from "aframe"; // Import AFRAME

// Define the Algorand node connection parameters
const algodToken = ""; // free service does not require tokens
const algodServer = "https://testnet-api.algonode.cloud";
const algodPort = 443;

const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);



function App() {
  const [latestBlock, setLatestBlock] = useState(null);
  const [latestBlockTxns, setLatestBlockTxns] = useState([]);
  const [layoutOutput, setLayoutOutput] = useState([0]);
  

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

  // Event handler function for left-right box click
  const handleLeftRightClick = () => {
    setLayoutOutput(1); // Update layoutOutput to 1 when left-right box is clicked
  }

  // Fetch the latest block and transactions when the component mounts
  useEffect(() => {
    fetchLatestBlockAndTxns();

    // Refresh transactions every 1 seconds (adjust as needed)
    const interval = setInterval(fetchLatestBlockAndTxns, 1000);

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

 
  function handleClick() {
    setLayoutOutput(0);
  }

  return (
    <div className="App">
      <a-scene cursor="rayOrigin: mouse">
      <a-sky src="https://cdn.aframe.io/a-painter/images/sky.jpg"></a-sky>
        {/* Other A-Frame assets and elements */}
        {/*options up-down and left right*/}

        <a-text
              value={`View Bottom-Top`}
              align="center"
              color="white"
              position={`0 1 -3.5`}
            ></a-text>

        <a-box id="up-down" color=
        {layoutOutput === 0
                  ? "gray"
                  : "blue"
        } position="0 1 -4"
          onClick={handleClick}
          width="2"
              height="0.5">
        </a-box>

        <a-box id="left-right" 
        color=
        {layoutOutput === 1
                  ? "gray"
                  : "blue"
        }
        width="2"
              height="0.5"
        position="0 .5 -4"
          onClick={handleLeftRightClick}
        >
        </a-box>
        <a-text
              value={`View Left-Right`}
              align="center"
              color="white"
              position={`0 .5 -3.5`}
            ></a-text>

        {/* Display transactions */}
        {latestBlockTxns.map((txn, index) => (
          <React.Fragment key={index}>
            <a-text
              value={`Type: ${layoutOutput}`}
              align="left"
              color="black"
              position={`-2 3 -5`}
            ></a-text>
          {txn.type === "pay" ? (
            <a-box
              depth="0.4"
              width="0.4"
              height="0.4"
              color="#00f"
              position={
                layoutOutput === 0
                  ? `-2 ${2 + index * 0.5} -4`
                  : `${-2 + index * 0.5} 4 -4`
              }
            >
              <a-text
              value={`Pay`}
              align="left"
              color="white"
              position={
                layoutOutput === 0
                  ? `-.20 0 .20`
                  : `-.20 0 .20`
              }
            ></a-text>
            </a-box>  
          ) : txn.type === "appl" ? (
            <a-box
            depth="0.4"
            width="0.4"
            height="0.4"
              color="#f00"
              position={
                layoutOutput === 0
                  ? `2 ${2 + index * 0.5} -4`
                  : `${-2 + index * 0.5} 3 -4`
              }
              
            >
              <a-text
              value={`Appl`}
              align="left"
              color="white"
              position={
                layoutOutput === 0
                  ? `-.15 0 .20`
                  : `-.15 0 .20`
              }
            ></a-text>
            </a-box>
          ) : txn.type === "axfer" ? (
            <a-cone
              radius="0.25"
              color="green"
              position={
                layoutOutput === 0
                  ? `0 ${2 + index * 0.5} -10`
                  : `${2 + index * 0.5} 0 -10`
              }
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
        
          <img id="groundTexture" alt="ground" src="https://cdn.aframe.io/a-painter/images/floor.jpg"/>
          <img id="skyTexture" alt="sky" src="https://cdn.aframe.io/a-painter/images/sky.jpg"/>
        
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
          position="0 1.5 -4.5"
          
          width="3"
          height=".5"
          depth="3"
          mixin="cubeMaterial edgeMaterial"
          
        >
          {/* Display text on the front face of the cube */}
          <a-text value={latestBlock} align="center" color="white" position={`0 0 1.5`}></a-text>
          {/* Display text on the back face of the cube */}
          <a-text
            value={latestBlock}
            align="center"
            color="white"
            rotation="0 180 0"
          ></a-text>
        </a-box>

        {/* A plane as floor */}
        {/* <a-plane
          position="0 0 -3.5"
          rotation="-90 0 0"
          width="4"
          height="4"
          color="#7BC8A4"
        ></a-plane> */}

        {/* Camera and controls */}
        <a-entity camera look-controls>
        </a-entity>
      </a-scene>
    </div>
  );
}

export default App;
