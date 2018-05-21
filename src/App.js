import React, { Component } from "react"
import ReactDOM from "react-dom"
import { abi } from "./../build/contracts/PumpAndDump.json"
import { contractAddress } from "./constants"
import Coin from "./Coin"
import Web3 from "web3"
const portis = require('portis')

const TEN_SECONDS = 10000

class App extends Component {

  constructor() {
    super()
    this.state = {
      numCoins: 0,
      coins: [],
      newCoinFee: 0,
      creatingCoin: false,
      newCoinId: "",
      newCoinName: ""
    }

    if (typeof web3 !== "undefined") {
      this.web3 = new Web3(web3.currentProvider)
    } else {
      console.log("Using Portis for web3")
      this.web3 = new Web3(new portis.PortisProvider())
    }
    const myContract = this.web3.eth.contract(abi)
    this.contractInstance = myContract.at(contractAddress)
    this.loading = 0
    this.updateState()
    setInterval(this.updateState.bind(this), TEN_SECONDS)
  }

  warnMessage(message) {
    alert(message)
  }

  updateState() {
    if (!this.web3 || this.loading > 0) {
      return
    }
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

  getIdFromCode(code) {
    const code0 = code.charCodeAt(0) - 65
    const code1 = code.charCodeAt(1) - 65
    const code2 = code.charCodeAt(2) - 65
    return (code0 * (676)) + (code1 * (26)) + (code2 * 1)
  }

  createNewCoin() {
    this.setState({ creatingCoin: false })
    const { newCoinId, newCoinName, newCoinFee } = this.state
    if (this.web3.eth.accounts[0]) {
      this.contractInstance.createCoin(
        this.getIdFromCode(newCoinId),
        newCoinName,
        {
          gas: 300000,
          from: this.web3.eth.accounts[0],
          value: newCoinFee
        },
        (err, result) => {
          if (result != null) {
            // SUCCESS
            // TODO: Need to show user that this event has happened
            // And conclude when transaction succeeds
          } else {
            // FAIL
          }
          console.log(result, err)
        }
      )
    } else {
      this.warnMessage("Address not found")
    }
  }

  buyCoin(coinId) {
    console.log("BUY")
    const price = this.state.coins[coinId].price
    if (this.web3.eth.accounts[0]) {
      this.contractInstance.buyCoin(
        coinId,
        {
          gas: 300000,
          from: this.web3.eth.accounts[0],
          value: price
        },
        (err, result) => {
          if (result != null) {
            // SUCCESS
            // TODO: Need to show user that this event has happened
            // And conclude when transaction succeeds
          } else {
            // FAIL
          }
          console.log(result, err)
        })
    } else {
      this.warnMessage("Address not found")
    }
  }

  sellCoin(coinId) {
    console.log("SELL:", coinId)
    if (this.web3.eth.accounts[0]) {
      this.contractInstance.sellCoin(
        coinId,
        {
          gas: 300000,
          from: web3.eth.accounts[0],
        },
        (err, result) => {
          if (result != null) {
            // SUCCESS
            this.updateState()
          } else {
            // FAIL
          }
          console.log(result, err)
        })
    } else {
      this.warnMessage("Address not found")
    }
  }

  render() {
    const { newCoinFee, coins, creatingCoin, newCoinId, newCoinName } = this.state
    const userAddress = this.web3.eth.accounts[0]
    return (
      <div>
        <h1>Pump and Dump</h1>
        (Price to create new coin: {this.web3.fromWei(newCoinFee, "ether").toString(10)} ETH)
        <h3>Coins:</h3>
        {coins.map((o, i) => {
          return <Coin
            userAddress={userAddress}
            buyCoin={this.buyCoin.bind(this)}
            sellCoin={this.sellCoin.bind(this)}
            id={o.id}
            name={o.name}
            coinId={o.coinId}
            price={this.web3.fromWei(o.price, "ether").toString(10)}
            marketValue={this.web3.fromWei(o.marketValue, "ether").toString(10)}
            investors={o.investors}
            key={i}
          />
        })}
        {creatingCoin &&
          <div>
            CoinId: <input
              type="text"
              value={newCoinId}
              onChange={e => {
                let newValue = e.target.value.toUpperCase()
                newValue = newValue.replace(/[^a-zA-Z]/g, '')
                if (newValue.length == 3) console.log(newValue, this.getIdFromCode(newValue))
                if (newValue.length < 4) {
                  this.setState({ newCoinId: newValue })
                }
              }} />
            Name: <input type="text" value={newCoinName} onChange={e => this.setState({
              newCoinName: e.target.value
            })} />
            <input type="button" value="Create" onClick={() => this.createNewCoin()} />
            <input type="button" value="Cancel" onClick={() => this.setState({ creatingCoin: false })} />
          </div>
          ||
          <input type="button" value="Create New Coin" onClick={() => this.setState({ creatingCoin: true })} />}
      </div>
    )
  }
}

ReactDOM.render(
  <App />,
  document.getElementById("root")
)