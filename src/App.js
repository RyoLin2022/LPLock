import './App.css';
import { useState } from 'react';
import { ethers } from 'ethers';

export let savedAcc;
let currentAccount = null;
let LPContract = null;
function App() {
  let contractAddress = "0x5Fb4846Dd91AD9D2dBbB124CfF10fddb4cbde204";
  switchEthereumChain();

  async function switchEthereumChain() {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x7D0' }],
      });
    } catch (e) {
      if (e.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x7D0',
                chainName: 'DogeChain',
                nativeCurrency: {
                  name: 'WDoge',
                  symbol: 'WDoge', // 2-6 characters long
                  decimals: 18
                },
                blockExplorerUrls: ['https://explorer.dogechain.dog/'],
                rpcUrls: ['https://rpc03-sg.dogechain.dog'],
              },
            ],
          });
        } catch (addError) {
          alert("Please change the chain to DogeChain");
          console.error(addError);
        }
      }
    }
  }

  const [walletAddress, setWalletAddress] = useState("");

  async function requestAccount() {
    console.log('Requesting account...');
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setWalletAddress(accounts[0]);
      currentAccount = accounts[0];
      savedAcc = accounts[0];
    } catch (error) {
      console.log('error connecting');
    }

    //Check if Metamask Exist
    if (window.ethereum) {
      console.log('detected');
    } else {
      console.log('not detected');
      alert("Please Install Metamask");
    }
  }

  async function getBalance() {
    let accBalance = await window.ethereum.request({
      method: "eth_getBalance",
      params:
        [currentAccount, 'latest']
    });
    var rounded;
    var balanceDEC = Number(accBalance).toString(10);
    var balanceBtn = document.getElementById("balance-btn");
    if (balanceDEC < Math.pow(10, 21)) {
      var inWeiBal = balanceDEC.length;
      console.log(balanceDEC);
      var str = Math.pow(10, (inWeiBal - 18 - 5));
      rounded = Math.round(str * parseInt(balanceDEC.substring(0, 5)) * 10000) / 10000;
    } else {
      if (balanceDEC.includes("."));
      let balLength1 = balanceDEC.length;
      let realbalLength = balanceDEC.substring(balLength1 - 2, balLength1);
      rounded = balanceDEC.substring(0, 1) + balanceDEC.substring(2, realbalLength - 18 + 2);
    }
    balanceBtn.innerText = rounded + " WDoge";
  }

  async function connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      var btnConnect = document.getElementById("connect-btn");
      document.getElementById("balance-btn").hidden = false;

      let lengthAcc = currentAccount.length;
      btnConnect.innerText = currentAccount.substring(0, 4) + "..." + currentAccount.substring(lengthAcc - 4, lengthAcc);
      getBalance();
      alert("Wallet connected successfully!");
    } else {
      alert("Please install an injected Web3 wallet");
    }
  }

  function LockLPToken() {
    LPContract = document.getElementById("LPAddr").value;
    console.log(LPContract);
  }


  async function ACCAllowance() {
    let inputdata = "0xdd62ed3e"
      + "000000000000000000000000" + currentAccount.substring(2, currentAccount.length)
      + "000000000000000000000000" + contractAddress.substring(2, contractAddress.length);
    let accAllowance = await window.ethereum.request({
      method: "eth_call",
      params: [{
        to: LPContract,
        data: inputdata,
        //allowance:0xdd62ed3e
        //BalanceOF + staking contract address
      },
        "latest"
      ]
    });
    var accAllowNum = Number(accAllowance).toString(10);

    if (accAllowNum > 0) {
      document.getElementById("Approve-btn").innerText = "Approved";
      document.getElementById("Approve-btn").value = "haveApproved";
    }
  }


  async function ApproveLPToken() {
    LPContract = document.getElementById("LPAddr").value;
    ACCAllowance();
    LPBalance();
    let haveApproved = document.getElementById("Approve-btn").value;
    console.log(haveApproved);
    if (haveApproved != "haveApproved") {
      let inputGasPrice = await window.ethereum.request({
        method: "eth_gasPrice"
      });
      let inputData = "0x095ea7b3000000000000000000000000" +
        contractAddress.substring(2, contractAddress.length) +
        "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
      // "0000000000000000000000000000000000000000204fce5e3e25026110000000";

      let params = [
        {
          from: currentAccount,
          to: LPContract,
          gas: Number(100000).toString(16), // 30400
          gasPrice: inputGasPrice, // 10000000000
          value: '0', // 2441406250
          data: inputData,

        },
      ];

      var ApproveBTN = document.getElementById("Approve-btn");

      let result = window.ethereum
        .request({
          method: "eth_sendTransaction",
          params,
        }).then(
          ApproveBTN.innerText = "Approving...",
        ).catch((err) => {
          ApproveBTN.innerText = "Approve"
          console.log(err);
        })

      setTimeout(function () {
        console.log("The first log delay 20 second");
        ACCAllowance();
      }, 20000);

      setTimeout(function () {
        console.log("The second log delay 40 second");
        ACCAllowance();
      }, 40000);
    }
  }

  async function LPBalance() {
    let inputData = "0x70a08231000000000000000000000000" + currentAccount.substring(2, currentAccount.length);
    let accBalance = await window.ethereum.request({
      method: "eth_call",
      params: [{
        to: LPContract,
        data: inputData,
      },
        "latest"
      ]
    });
    var balanceDEC = Number(accBalance).toString(10);
    var actual = balanceDEC / Math.pow(10, 18);

    var CAbalance = document.getElementById("ACCTokenBalance");

    document.getElementById("maxStake").value = actual;
    CAbalance.innerText = actual;
  }



  function maxStakeButton() {
    let staking = document.getElementById("stakeAmountID");
    let maxstaking = document.getElementById("maxStake").value;
    staking.value = maxstaking;
  }

  return (
    <div className="App" id="bg">
      <button id="balance-btn" hidden>
        balance
      </button>
      <button id="connect-btn" onClick={connectWallet}>
        Connect Wallet
      </button>
      <div className="App-header">
        <table className="LockLPTable">
          <thead>
            Lock LP With Ryo<br /><hr />
          </thead>
          <tbody>
            LP Address :
            <input id="LPAddr"></input><br />
            <button onClick={ApproveLPToken} id="Approve-btn">Check</button><br /><hr />
            <div className="SameRow">
              <div className="left">Your Balance : </div>
              <div className="right" id="ACCTokenBalance">0</div>
            </div>
            LockAmount :
            <input id="LockAmount"></input><br />
            <div id="maxStake" onClick={maxStakeButton}>max</div>
            <button onClick={LockLPToken} id="Lock-btn">Lock</button>
          </tbody>
        </table>
      </div>
      {/* <h1>Designer <a href="https://t.me/RyoLin" className="Ryo">RyoLin</a></h1>
      <h1>Background Source : https://www.livescience.com/what-is-the-universe</h1> */}
    </div>
  );

}
export default App;

