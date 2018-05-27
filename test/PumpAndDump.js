const PumpAndDump = artifacts.require("PumpAndDump")

const timeout = ms => new Promise(res => setTimeout(res, ms))

contract("PumpAndDump", (accounts) => {

  it("should start with zero devfees", async () => {
    const instance = await PumpAndDump.deployed()
    const fees = await instance.getDevFees.call()
    assert.equal(fees.valueOf(), 0, "DevFees not initially zero")
  })


  it("should create a coin properly", async () => {
    const instance = await PumpAndDump.deployed()
    let coinFee = await instance.getNewCoinFee.call()

    await instance.createCoin(0, "Bitcoin", {
      from: accounts[0],
      value: coinFee.toNumber()
    })

    const devfees = await instance.getDevFees.call()
    const coinInfo = await instance.getCoinInfoFromId.call(0)
    assert.equal(devfees.toNumber(), (coinFee * 0.9), "devfees not changed")
    assert.equal(coinInfo[2].toNumber(), (coinFee * 0.1), "marketvalue not changed")
  })

  it("should let a user buy coin properly", async () => {
    const instance = await PumpAndDump.deployed()
    let coinFee = await instance.getCoinInfoFromId.call(0)
    coinFee = coinFee[1].toNumber()
    const devfeesBefore = await instance.getDevFees.call()

    await instance.buyCoin(0, {
      from: accounts[1],
      value: coinFee
    })

    const devfeesAfter = await instance.getDevFees.call()
    const coinInfo = await instance.getCoinInfoFromId.call(0)

    assert.equal(devfeesAfter.toNumber(), (devfeesBefore.toNumber() + (coinFee * 0.01)), "devfees not changed")
    assert.equal(coinInfo[3].length, 2, "investors not changed")
  })

  it("should calculate correct profit", async () => {
    const instance = await PumpAndDump.deployed()
    let profit = await instance.getUserCoinMarketValue(0, 0)
    profit = profit.toNumber()
    let marketValue = await instance.getCoinInfoFromId.call(0)
    marketValue = marketValue[2].toNumber()
    let expectedProfit = (marketValue / 3) * 2
    profit = Number.parseFloat(profit).toPrecision(4)
    expectedProfit = Number.parseFloat(expectedProfit).toPrecision(4)
    assert.equal(profit, expectedProfit)
  })


})