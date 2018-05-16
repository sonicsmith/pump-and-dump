import React, { Component } from "react"
import { abi } from "./../build/contracts/PumpAndDump.json"
import { contractAddress } from "./constants"
import Coin from "./Coin"

const TEN_SECONDS = 10000

class App extends Component {

  constructor() {
    super()
    this.state = {
      numCoins: 0,
      coins: [],
      newCoinFee: 0.01,
      creatingCoin: false,
      newCoinName: "",
      newWhitePaper: ""
    }
    this.web3 = new Web3(web3.currentProvider)
    const myContract = web3.eth.contract(abi)
    this.contractInstance = myContract.at(contractAddress)
    this.loading = 0;
    this.updateState()
    setInterval(this.updateState.bind(this), TEN_SECONDS)
  }

  updateState() {
    if (this.loading > 0) {
      return
    }
    console.log("Checking if need to update state")
    this.loading++
    this.contractInstance.getNumCoins((err, result) => {
      this.loading--
      if (result) {
        const numCoins = result && result.c && result.c[0] || 0
        const newCoinList = []
        for (let i = 0; i < numCoins; i++) {
          this.loading++
          this.contractInstance.getCoinInfoFromIndex(i, (err, result) => {
            this.loading--
            if (result) {
              console.log(result)
              newCoinList.push({
                id: i,
                name: result[1],
                whitePaper: result[2],
                price: result[3].c[0],
                marketValue: result[4].c[0],
              })
              this.setState({ coins: newCoinList })
            }
          })
        }
      }
    })
  }

  createNewCoin() {
    this.setState({ creatingCoin: false })
    const { newCoinName, newWhitePaper, newCoinFee } = this.state
    if (this.web3.eth.accounts[0]) {
      this.contractInstance.createCoin(
        newCoinName,
        newWhitePaper,
        {
          gas: 300000,
          from: this.web3.eth.accounts[0],
          value: this.web3.toWei(newCoinFee, "ether")
        },
        (err, result) => {
          if (result != null) {
            // SUCCESS
            this.updateState()
          } else {
            // FAIL
          }
          console.log(result, err)
        }
      )
    } else {
      alert("Address not found")
    }
  }

  render() {
    const { coins, creatingCoin, newCoinName, newWhitePaper } = this.state
    return (
      <div>
        <h1>Pump and Dump</h1>
        <h3>Coins:</h3>
        {coins.map((o, i) => {
          return <Coin buyCoin={} sellCoin={} coinInfo={o} key={i} />
        })}
        {creatingCoin &&
          <div>
            Name: <input type="text" value={newCoinName} onChange={e => this.setState({ newCoinName: e.target.value })} />
            White Paper: <input type="textarea" value={newWhitePaper} onChange={e => this.setState({ newWhitePaper: e.target.value })} />
            <input type="button" value="Create" onClick={() => this.createNewCoin()} />
            <input type="button" value="Cancel" onClick={() => this.setState({ creatingCoin: false })} />
          </div>
          ||
          <input type="button" value="Create New Coin" onClick={() => this.setState({ creatingCoin: true })} />}
      </div>
    )
  }
}

export default App