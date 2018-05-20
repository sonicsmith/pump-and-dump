import React, { Component } from "react"
// import { abi } from "./../build/contracts/PumpAndDump.json"
// import { contractAddress } from "./constants"


class Coin extends Component {

  constructor() {
    super()
    this.state = {
      //
    }
  }

  buyCoin() {
    this.props.buyCoin(this.props.id)
  }

  sellCoin() {
    this.props.sellCoin(this.props.id)
  }

  getCodeFromId(id) {
    const code0 = Math.floor((id / 676) + 65)
    id = id % 676
    const code1 = Math.floor((id / 26) + 65)
    id = id % 26
    const code2 = id + 65
    return String.fromCharCode(code0) + String.fromCharCode(code1) + String.fromCharCode(code2)
  }

  render() {
    const { id, name, price, marketValue, investors, userAddress } = this.props
    let sellAmount
    if (investors.includes(userAddress)) {
      const investorRank = investors.length - (investors.indexOf(userAddress))
      sellAmount = (marketValue / investors.length) * investorRank
    }
    const coinCode = this.getCodeFromId(id)
    return (
      <div style={{ borderStyle: "solid", borderWidth: 2, padding: 10, margin: 10 }}>
        <div style={{ borderStyle: "solid", borderWidth: 1, padding: 5, margin: 2 }}>
          <div>
            <b>{name}</b> ({coinCode}), Market Value: {marketValue}{" "}ETH
            <span style={{ float: "right" }}>
              {investors.includes(userAddress)
                ?
                <input type="button" value={`Sell for ${sellAmount}`} onClick={() => this.sellCoin()} />
                :
                <input type="button" value={`Buy for ${price}`} onClick={() => this.buyCoin()} />
              }
            </span>
          </div>
        </div>
      </div>
    )
  }
}

export default Coin