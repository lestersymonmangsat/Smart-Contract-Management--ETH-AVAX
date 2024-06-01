import {useState, useEffect} from "react";
import {ethers} from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [selectedItem, setSelectedItem] = useState("Nike");

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const itemPrices = {
    "Nike": 200,
    "Adidas": 180,
    "Oxygen": 150,
    "Jordan": 250
  };

  const getWallet = async() => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({method: "eth_accounts"});
      handleAccount(account);
    }
  }

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  }

  const connectAccount = async() => {
    if (!ethWallet) {
      alert('MetaMask wallet is required to connect');
      return;
    }

    const accounts = await ethWallet.request({ method: 'eth_requestAccounts' });
    handleAccount(accounts);
    
    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);
 
    setATM(atmContract);
  }

  const getBalance = async() => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  }

  const deposit = async() => {
    if (atm) {
      let tx = await atm.deposit(1000);
      await tx.wait()
      getBalance();
    }
  }

  const withdraw = async() => {
    if (atm) {
      let tx = await atm.withdraw(500);
      await tx.wait()
      getBalance();
    }
  }

  const getAll = async () => {
    if (atm && balance !== undefined) {
      // Withdraw entire balance
      let tx = await atm.withdraw(balance);
      await tx.wait();
      getBalance();
    }
  };

  const buyCloth = async() => {
    if (atm) {
      const price = itemPrices[selectedItem];
      if (balance >= price) {
        let tx = await atm.withdraw(price);
        await tx.wait();
        getBalance();
        alert(`You have successfully bought ${selectedItem}`);
      } else {
        alert("Insufficient balance to buy this item.");
      }
    }
  }

  const canBuy = () => {
    const price = itemPrices[selectedItem];
    return balance >= price ? "You can buy this item" : "You cannot buy this item";
  }

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return <button onClick={connectAccount}>Let's proceed to Symon's Clothing</button>
    }

    if (balance == undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <button onClick={deposit}>Deposit 1000 ETH</button>
        <button onClick={withdraw}>Withdraw 500 ETH</button>
        <button onClick={getAll}>Colect all the Balances</button>
        <div>
          <select value={selectedItem} onChange={(e) => setSelectedItem(e.target.value)}>
            {Object.keys(itemPrices).map(item => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
          <p>Price: {itemPrices[selectedItem]} ETH</p>
          <p>{balance !== undefined && canBuy()}</p>
          <button onClick={buyCloth}>Buy Cloth</button>
        </div>
      </div>
    )
  }

  useEffect(() => {getWallet();}, []);

  return (
    <main className="container">
      <header><h1>Welcome to Symon's Clothing</h1></header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
        }
      `}
      </style>
    </main>
  )
}
