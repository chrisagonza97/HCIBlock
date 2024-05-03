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
  const [layoutOutput, setLayoutOutput] = useState(0);
  const [timeOutput, settimeOutput] = useState(1000);
  const [refreshBlocks, setRefreshBlocks] = useState(false);
  const [blockBoxSize, setBlockBoxSize] = useState(.6);

  const [latestBlocks, setLatestBlocks] = useState(null); // Initialize latestBlocks state
  
  const [oldLatestBlockTxns, setOldLatestBlockTxns] = useState(null);
  
  /* Delete Me if it's broken**************************************************/
  
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
      setOldLatestBlockTxns(blockTxns);

      console.log("Latest Block Transactions:", blockTxns);
    } catch (err) {
      console.error("Failed to fetch block information:", err);
    }
  }

  useEffect(() => {
    fetchLatestBlocks();
  }, [refreshBlocks]);

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









/* Delete End************************************************************/



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
  function leftRightClick(){
    setLayoutOutput(1); 
  }

  // Event handler function for set to one second box click
  function setOneSecond(){
    settimeOutput(1000); 
  }

  function setFiveSecond(){
    settimeOutput(5000); 
  }

  function setTenSecond() {
    settimeOutput(10000); 
    
  }

  function setTenMinutes() {
    settimeOutput(600000); 
    
  }

  function clickRefreshBlocks() {
    setRefreshBlocks((prevState) => !prevState); // Toggle the value of refreshBlocks
  }


  // Fetch the latest block and transactions when the component mounts
  useEffect(() => {
    fetchLatestBlockAndTxns();

    // Refresh transactions every 1 seconds (adjust as needed)
    const interval = setInterval(fetchLatestBlockAndTxns, timeOutput);

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [timeOutput]);

 
  function bottomTopClick() {
    setLayoutOutput(0);
  }

  function frontBackClick() {
    setLayoutOutput(2);
  }

  function groundClick() {
    clickRefreshBlocks();
  }

  function changeDamnBlockSize() {
    setBlockBoxSize(1);
  }


  return (
    <div className="App">
      <a-scene cursor="rayOrigin: mouse">
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


      
        {/* Other A-Frame assets and elements */}
        {/*options up-down and left right*/}

        
        {/*Time block*/}
        <a-box id="time-block" color=
        {timeOutput === 600000
                  ? "red"
                  : "green"
        } position="3 1.5 -4"
          width="2"
              height="0.5"
              depth="2">
            <a-text
              value={`Time: ${timeOutput} ms`}
              align="center"
              color="white"
              position={`0 0 1`}
            ></a-text>
        </a-box>

        {/*Ten Seconds*/}
        <a-box id="Ten-seconds" color=
        {timeOutput === 10000
                  ? "green"
                  : "blue"
        } position="2 .5 -4"
          onClick={setTenSecond}
          width="2"
              height="0.5"
              depth="2">
            <a-text
              value={`Ten Seconds`}
              align="center"
              color="white"
              position={`0 0 1`}
              onClick={setTenSecond}
            ></a-text>
        </a-box>

        {/*One second block*/}
        <a-box id="one-second" color=
        {timeOutput === 1000
                  ? "green"
                  : "blue"
        } position="2 1 -4"
          onClick={setOneSecond}
          width="2"
              height="0.5"
              depth="2">
            <a-text
              value={`One Second`}
              align="center"
              color="white"
              position={`0 0 1`}
              onClick={setOneSecond}
            ></a-text>
        </a-box>

        {/*five seconds block*/}
        <a-box id="five-second" color=
        {timeOutput === 5000
                  ? "green"
                  : "blue"
        } position="4 1 -4"
          onClick={setFiveSecond}
          width="2"
              height="0.5"
              depth="2">
            <a-text
              value={`Five Seconds`}
              align="center"
              color="white"
              position={`0 0 1`}
              onClick={setFiveSecond}
            ></a-text>
          </a-box>

          {/*ten Minute block*/}
          <a-box id="ten-minute" color=
          {timeOutput === 600000
                  ? "green"
                  : "blue"
          } position="4 .5 -4"
          onClick={setTenMinutes}
          width="2"
              height="0.5"
              depth="2">
            <a-text
              value={`Ten Minutes`}
              align="center"
              color="white"
              position={`0 0 1`}
              onClick={setFiveSecond}
            ></a-text>
        </a-box>

        {/*Bottom-Top Block*/}
        <a-text
          value={`View Bottom-Top`}
          align="center"
          color="white"
          position={`0 1 -3`}
          onClick={bottomTopClick}
        ></a-text>

        <a-box id="up-down" color=
          {layoutOutput === 0
              ? "gray"
              : "blue"
          } position="0 1 -4"
          onClick={bottomTopClick}
          width="2"
          height="0.5"
          depth="2">

        </a-box>


        {/*front-back Block*/}
        <a-box id="front-back" 
        color=
        {layoutOutput === 2
                  ? "gray"
                  : "blue"
        }
        width="2"
              height="0.5"
              depth="2"
        position="-2 .5 -4"
          onClick={frontBackClick}
        >

        <a-text
              value={`View Front-Back`}
              align="center"
              color="white"
              position={`0 0 1`}
              onClick={frontBackClick}
            ></a-text>
        </a-box>
        

        {/*Left-Right Block*/}
        <a-box id="left-right" 
        color=
        {layoutOutput === 1
                  ? "gray"
                  : "blue"
        }
        width="2"
              height="0.5"
              depth="2"
        position="0 .5 -4"
          onClick={leftRightClick}
        >
        <a-text
              value={`View Left-Right`}
              align="center"
              color="white"
              position={`0 0 1`}
              onClick={leftRightClick}
            ></a-text>
        </a-box>

        {/* Refresh Ground Block*/}
        <a-box id="refresh-ground" 
        color="yellow"
        width="2"
              height="0.5"
              depth="2"
        position="-2 1 -4"
          onClick={groundClick}
        >
        <a-text
              value={`Refresh on-Ground`}
              align="center"
              color="black"
              position={`0 0 1`}
              onClick={groundClick}
            ></a-text>
        </a-box>
        
        
        {/* Display transactions */}
        {latestBlockTxns.map((txn, index) => (
          <React.Fragment key={index}>
            {/* <a-text
              value={`Type: ${layoutOutput}`}
              align="left"
              color="black"
              position={`-2 3 -5`}
            ></a-text> */}
            {/* Pay block */}
          {txn.type === "pay" ? (
            <a-box
              depth={blockBoxSize}
              width={blockBoxSize}
              height={blockBoxSize}
              color="#00f"
              position={
                layoutOutput === 0
                  ? `-2 ${2 + index * 0.5} -4` //bottom top
                  : layoutOutput === 1
                    ? `${-2 + index * 0.5} 4 -4` //left right
                    : `-2 ${2.5 + index * 0.5} ${-4 - index * 0.5}`   // Front to back
              }
            >
              <a-text
              value={`Pay`}
              align="left"
              color="white"
              position={
                layoutOutput === 0
                  ? `-.20 0 .30`
                  : `-.20 0 .30`
              }
            ></a-text>
            </a-box>  
            
          ) : txn.type === "appl" ? (

            <a-box
            depth={blockBoxSize}
            width={blockBoxSize}
            height={blockBoxSize}
              color="#f00"
              position={
                layoutOutput === 0
                  ? `2 ${2 + index * 0.5} -4`   // Bottom to top
                  : layoutOutput === 1
                    ? `${-2 + index * 0.5} 3 -4`  // Left to right
                    : `2 ${2.5 + index * 0.5} ${-4 - index * 0.5}`   // Front to back
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
          
            ) : (
              <a-box
              depth={blockBoxSize}
              width={blockBoxSize}
              height={blockBoxSize}
                color="#f00"
                position={
                  layoutOutput === 0
                    ? `0 ${2 + index * 0.5} -4`
                    : `${-2 + index * 0.5} 3.5 -4`
                  
                }
                
              >
                <a-text
                value={` ${txn.type} `}
                align="center"
                color="white"
                position={
                  layoutOutput === 0
                    ? `-.15 0 .20`
                    : `-.15 0 .20`
                }
              ></a-text>
              </a-box>
          )}
        </React.Fragment>
        ))}
        {/* End ***********************/}

        {/* Delete me if Broken */}
        {latestBlocks &&
          latestBlocks.map((block, index) => (
            <React.Fragment key={index}>
            <a-entity key={index}>
              <a-box
                position={`${ - index * 2 - latestBlocks.length} .5 -3`}
                color="black"
                scale="1 1 1"
                width="2"
                height="2"
                depth="2"
                mixin="cubeMaterial edgeMaterial"
                wireframe="true"
              >
                <a-text
                  value={block.info}
                  align="center"
                  color="black"
                  scale="1 1 1"
                ></a-text>
                <a-text
                  value={block.info}
                  align="center"
                  color="black"
                  rotation="0 180 0"
                  scale="1 1 1"
                ></a-text>
              </a-box>

              {oldLatestBlockTxns &&
                oldLatestBlockTxns[index].map((txn, txnIndex) => (
                  <React.Fragment key={txnIndex}>
                  <a-box
                    key={txnIndex}
                    position={`${ - index * 2 - latestBlocks.length} .5 ${
                      -txnIndex * 2 - 6
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
                  </React.Fragment>
                ))}
            </a-entity>
            </React.Fragment>
          ))}



        {/* End DELETE me if Broken **********************/}

        
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
        <a-plane
          position="0 0 -3.5"
          rotation="-90 0 0"
          width="400"
          height="400"
          color="#7BC8A4"
        ></a-plane> 

        {/* Camera and controls */}
        <a-entity camera look-controls>
        </a-entity>
        <a-sky>scr="#sky"</a-sky>
      </a-scene>
    </div>
  );
}

export default App;
