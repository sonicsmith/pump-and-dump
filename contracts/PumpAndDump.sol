pragma solidity ^0.4.23;

contract PumpAndDump {

  address owner;
  uint newCoinFee = 0.01 ether;
  uint newCoinFeeIncrease = 0.01 ether;
  uint defaultCoinPrice = 0.001 ether;
  uint coinPriceIncrease = 0.0001 ether;
  uint16[] coinIds; 

  struct Coin {
    string name;
    uint price;
    uint marketValue;
    address[] investors;
  }

  mapping (uint16 => Coin) coins;

  constructor() public {
    owner = msg.sender;
  }

  function getNewCoinFee() public constant returns (uint) {
    return newCoinFee;
  }

  function isCoinIdUnique(uint16 newId) public constant returns (bool) {
    for (uint i = 0; i < coinIds.length; i++) {
      if (coinIds[i] == newId) {
        return false;
      }
    }
    return true;
  }


  function createCoin(uint16 id, string name) public payable {
    require(msg.value >= newCoinFee);
    require(id < 17576); // 26*26*26
    require(bytes(name).length > 0);
    require(isCoinIdUnique(id));
    coins[id].name = name;
    coins[id].price = defaultCoinPrice;
    coins[id].marketValue = msg.value; 
    coins[id].investors.push(msg.sender);
    coinIds.push(id);
    newCoinFee += newCoinFeeIncrease;
  }

  function getCoinIds() public constant returns (uint16[]) {
    return coinIds;
  }

  function getCoinInfoFromId(uint16 coinId) public constant returns (string, uint, uint, address[]) {
    return (
      coins[coinId].name,
      coins[coinId].price,
      coins[coinId].marketValue,
      coins[coinId].investors
    );
  }

  function getUserCoinMarketValue(uint16 coinId, uint userIndex) public constant returns (uint) {
      uint marketWeights = (userIndex * (userIndex + 1)) / 2;
      uint atomWeight = coins[coinId].marketValue / marketWeights;
      uint numInvestors = coins[coinId].investors.length;
      return (numInvestors - userIndex) * atomWeight;
  }

  function buyCoin(uint16 coinId) public payable {
    require(msg.value >= coins[coinId].price);
    coins[coinId].investors.push(msg.sender);
    coins[coinId].marketValue += msg.value;
    coins[coinId].price += coinPriceIncrease;
  }

  function removeInvestor(uint16 coinId, uint investorIndex) public {
    uint value = getUserCoinMarketValue(coinId, investorIndex);
    coins[coinId].investors[investorIndex].transfer(value);
    coins[coinId].price -= coinPriceIncrease;
    coins[coinId].marketValue -= value;
    if (coins[coinId].investors.length == 1) {
      delete coins[coinId].investors[0];
    } else {
      for (uint j = investorIndex; j < coins[coinId].investors.length - 1; j++) {
        coins[coinId].investors[j] = coins[coinId].investors[j + 1];
      }
    }
    coins[coinId].investors.length--;
  }

  function sellCoin(uint16 coinId) public {
    bool senderIsInvestor = false;
    uint investorIndex = 0;
    for (uint i = 0; i < coins[coinId].investors.length; i++) {
      if (coins[coinId].investors[i] == msg.sender) {
        senderIsInvestor = true;
        investorIndex = i;
        break;
      }
    }
    if (senderIsInvestor) {
      removeInvestor(coinId, investorIndex);
    }
  }

  function retrieveFunds(uint amount) public {
    assert(msg.sender == owner);
    if (msg.sender == owner) {
    //   address contractAddress = this;
      owner.transfer(amount);
    }
  }
    
}