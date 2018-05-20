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
    const coinCode = this.getCodeFromId(id)
    return (
      <div style={{ borderStyle: "solid", borderWidth: 2, padding: 10, margin: 10 }}>
        <div style={{ borderStyle: "solid", borderWidth: 1, padding: 2, margin: 2 }}>
          <div>
            {coinCode}
          </div>
          <div>
            <b>{name}</b>
          </div>
        </div>
        <div>
          Price: <b>{price}</b>{" "}ETH
        </div>
        <div>
          Market Value: {marketValue}{" "}ETH
        </div>

        {investors.includes(userAddress)
          ?
          <input type="button" value="SELL" onClick={() => this.sellCoin()} />
          :
          <input type="button" value="BUY" onClick={() => this.buyCoin()} />
        }
      </div>
    )
  }
}

export default Coin