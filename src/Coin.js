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
    this.props.buyCoin(this.props.coinInfo.id)
  }

  sellCoin() {
    this.props.sellCoin(this.props.coinInfo.id)
  }

  render() {
    const { name, whitePaper, price, marketValue } = this.props.coinInfo
    return (
      <div style={{ borderStyle: "solid", borderWidth: 2, padding: 10, margin: 10 }}>
        <div style={{ borderStyle: "solid", borderWidth: 1, padding: 2, margin: 2 }}>
          <div>
            <b>{name}</b>
          </div>
          <div>
            {whitePaper}
          </div>
        </div>
        <div>
          <b>{price}</b>
        </div>
        <div>
          {marketValue}
        </div>
        <input type="button" value="BUY" onClick={() => this.buyCoin()} />
        <input type="button" value="SELL" onClick={() => this.sellCoin()} />
      </div>
    )
  }
}

export default Coin