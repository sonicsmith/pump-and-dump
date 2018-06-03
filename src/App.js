import React, { Component } from "react"
import ReactDOM from "react-dom"
import { abi } from "./../build/contracts/PumpAndDump.json"
import { contractAddress } from "./constants"
import Coin from "./Coin"
import Web3 from "web3"
import { PortisProvider } from "portis"

const ONE_MINUTE = 60000

class App extends Component {

  constructor() {
    super()
    this.state = {
      numCoins: 0,
      coins: [],
      newCoinFee: 0,
      creatingCoin: false,
      newCoinId: "",
      newCoinName: "",
      userAddress: null
    }

    if (typeof web3 !== "undefined") {
      this.web3 = new Web3(web3.currentProvider)
      this.setInfoMessage("Connected to blockchain with Web3 provider", "green")
    } else {
      console.log("Using Portis for web3")
      this.web3 = new Web3(new PortisProvider({
        apiKey: "11c09071df2fda994f1bb97445a26f2b"
      }))
      this.setInfoMessage("Connected to blockchain with Portis", "green")
    }
    if (this.web3) {
      const myContract = this.web3.eth.contract(abi)
      this.contractInstance = myContract.at(contractAddress)
      this.loading = 0
      this.updateState()
      setInterval(this.updateState.bind(this), ONE_MINUTE)
    } else {
      setInfoMessage("Cannot connect to blockchain", "red")
    }
  }

  setInfoMessage(message, color) {
    ReactDOM.render(
      <div>{message}</div>,
      document.getElementById("dappInfo")
    )
  }

  updateState() {
    if (!this.web3 || this.loading > 0) {
      return
    }
    this.loading++
    this.web3.eth.getAccounts((err, accounts) => {
      this.loading--
      if (accounts.length) {
        this.setState({ userAddress: accounts[0] })
      }
    })
    console.log("Checking if need to update state")
    this.loading++
    this.contractInstance.getNewCoinFee((err, newCoinFee) => {
      this.loading--
      if (newCoinFee) {
        this.setState({ newCoinFee })
      }
    })
    // Coin info
    this.loading++
    this.contractInstance.getCoinIds((err, coinIds) => {
      this.loading--
      if (coinIds) {
        coinIds.sort()
        const newCoinList = []
        coinIds.map((coinId, index) => {
          this.loading++
          this.contractInstance.getCoinInfoFromId(coinId, (err, coinInfo) => {
            this.loading--
            if (coinInfo) {
              newCoinList[index] = {
                id: coinId,
                name: coinInfo[0],
                price: coinInfo[1],
                marketValue: coinInfo[2],
                investors: coinInfo[3]
              }
              console.log("Coin loaded:", newCoinList.length, "/", coinIds.length)
              if (newCoinList.length == coinIds.length) {
                console.log("All coins loaded")
                this.setState({ coins: newCoinList })
              }
            }
          })
        })
      }
    })
  }

  getCoinFromId(id) {
    return this.state.coins.find((coin) => coin.id === id)
  }

  getIdFromCode(code) {
    const code0 = code.charCodeAt(0) - 65
    const code1 = code.charCodeAt(1) - 65
    const code2 = code.charCodeAt(2) - 65
    return (code0 * (676)) + (code1 * (26)) + (code2 * 1)
  }

  createNewCoin() {
    this.setInfoMessage("Attempting to create new coin...")
    const { newCoinId, newCoinName, newCoinFee } = this.state
    this.web3.eth.getAccounts((err, accounts) => {
      if (accounts.length) {
        this.contractInstance.createCoin(
          this.getIdFromCode(newCoinId),
          newCoinName,
          {
            gas: 300000,
            from: accounts[0],
            value: newCoinFee
          },
          (err, result) => {
            this.setState({ creatingCoin: false })
            if (result != null) {
              this.setInfoMessage("Transaction processing..")
            } else {
              this.setInfoMessage("Transaction failed, you have not been charged", "red")
            }
            console.log(result, err)
          }
        )
      } else {
        this.setInfoMessage("Error: Cannot connect to blockchain, are you logged in?", "red")
      }
    })
  }

  buyCoin(coinId) {
    this.setInfoMessage("Attempting to buy coin...")
    const price = this.getCoinFromId(coinId).price
    this.web3.eth.getAccounts((err, accounts) => {
      if (accounts.length) {
        this.contractInstance.buyCoin(
          coinId,
          {
            gas: 300000,
            from: accounts[0],
            value: price
          },
          (err, result) => {
            if (result != null) {
              this.setInfoMessage("Transaction processing..")
            } else {
              this.setInfoMessage("Transaction failed, you have not been charged", "red")
            }
            console.log(result, err)
          })
      } else {
        this.setInfoMessage("Error: Cannot connect to blockchain, are you logged in?", "red")
      }
    })
  }

  sellCoin(coinId) {
    if (confirm("Selling a coin will require a small transaction fee")) {
      this.setInfoMessage("Attempting to sell coin...")
      this.web3.eth.getAccounts((err, accounts) => {
        if (accounts.length) {
          this.contractInstance.sellCoin(
            coinId,
            {
              gas: 300000,
              from: accounts[0],
            },
            (err, result) => {
              if (result != null) {
                this.setInfoMessage("Transaction processing..")
              } else {
                this.setInfoMessage("Transaction failed, you have not been charged", "red")
              }
              console.log(result, err)
            })
        }
      })
    }
  }


  render() {
    const {
      newCoinFee,
      coins,
      creatingCoin,
      newCoinId,
      newCoinName,
      infoMessage,
      messageColor,
      userAddress
    } = this.state
    let coinIdExists = false
    const coinId = this.getIdFromCode(newCoinId)
    coins.map((o, i) => {
      if (o.id.toNumber() === coinId) {
        coinIdExists = true
      }
    })
    return (
      <div style={{ paddingTop: 50, paddingBottom: 50, paddingLeft: 10, paddingRight: 10 }}>
        {coins.map((o, i) => {
          return <Coin
            userAddress={userAddress}
            buyCoin={this.buyCoin.bind(this)}
            sellCoin={this.sellCoin.bind(this)}
            id={o.id}
            name={o.name}
            coinId={o.coinId}
            price={this.web3.fromWei(o.price, "ether").toNumber()}
            marketValue={this.web3.fromWei(o.marketValue, "ether").toNumber()}
            investors={o.investors}
            key={i}
          />
        })}
        {infoMessage ?
          <div style={{ textAlign: "center", color: messageColor }}><h3>{infoMessage}</h3></div>
          : null}
        <div style={{ textAlign: "center", padding: 5 }}>
          It can take up to a minute for transactions to process, please be patient.
          <br />
          If you are experiencing long waits or issues, try putting a higher gas fee on.
          <br />
          (Price to create new coin: {this.web3.fromWei(newCoinFee, "ether").toString(10)} ETH)
        </div>
        <div style={{ textAlign: "center", padding: 20 }}>
          {creatingCoin &&
            <div>
              {coinIdExists ? <div style={{ color: "red" }}>[abreviation not unique]</div> : ""}
              Abbreviation: <input
                placeholder="e.g BTC"
                style={{ margin: 5 }}
                type="text"
                value={newCoinId}
                onChange={e => {
                  let newValue = e.target.value.toUpperCase()
                  newValue = newValue.replace(/[^a-zA-Z]/g, '')
                  if (newValue.length < 4) {
                    this.setState({ newCoinId: newValue })
                  }
                }} />
              <br />
              Name: <input
                placeholder="e.g Bitcoin"
                style={{ margin: 5 }}
                type="text"
                value={newCoinName}
                onChange={e => this.setState({
                  newCoinName: e.target.value
                })} />
              <br />
              <input
                style={{ margin: 5 }}
                type="button"
                value="Create"
                disabled={this.state.newCoinId.length !== 3 || coinIdExists}
                onClick={() => this.createNewCoin()} />
              <input
                style={{ margin: 5 }}
                type="button"
                value="Cancel"
                onClick={() => this.setState({ creatingCoin: false })} />
            </div>
            ||
            <input style={{ borderRadius: 5, padding: 10 }} type="button" value="CREATE NEW COIN" onClick={() => this.setState({ creatingCoin: true })} />}
        </div>
      </div>
    )
  }
}

ReactDOM.render(
  <App />,
  document.getElementById("root")
)
