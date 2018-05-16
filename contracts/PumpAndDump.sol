pragma solidity ^0.4.23;

contract PumpAndDump {

  address owner;
  uint newCoinFee = 0.01 ether;
  uint newCoinFeeIncrease = 0.01 ether;
  uint defaultCoinPrice = 0.001 ether;
  uint coinPriceIncrease = 0.0001 ether;

  struct Coin {
    uint id;
    string name;
    string whitePaper;
    uint price;
    uint marketValue;
    address[] investors;
  }

  Coin[] coins;

  constructor() public {
    owner = msg.sender;
  }

  function createCoin(string name, string whitePaper) public payable {
    require(msg.value >= newCoinFee);
    Coin storage newCoin;
    newCoin.id = coins.length; 
    newCoin.name = name;
    newCoin.whitePaper = whitePaper;
    newCoin.price = defaultCoinPrice;
    newCoin.marketValue = msg.value;
    coins.push(newCoin);
    newCoinFee += newCoinFeeIncrease;
  }

  function getNumCoins() public constant returns (uint) {
    return coins.length;
  }

  function getCoinInfoFromIndex(uint coinIndex) public constant returns (uint, string, string, uint, uint, address[]) {
    return (
      coins[coinIndex].id,
      coins[coinIndex].name,
      coins[coinIndex].whitePaper,
      coins[coinIndex].price,
      coins[coinIndex].marketValue,
      coins[coinIndex].investors
    );
  }

  function getCoinIndexById(uint id) public constant returns (uint) {
    for (uint i = 0; i < coins.length; i++) {
        if (coins[i].id == id) {
          return i;
        }
    }
  }

  function getUserCoinMarketValue(uint coinId, uint userIndex) public constant returns (uint) {
      uint marketWeights = (userIndex * (userIndex + 1)) / 2;
      uint atomWeight = coins[coinId].marketValue / marketWeights;
      uint numInvestors = coins[coinId].investors.length;
      return (numInvestors - userIndex) * atomWeight;
  }

  function buyCoin(uint coinId) public payable {
    uint index = getCoinIndexById(coinId);
    require(msg.value >= coins[index].price);
    coins[index].investors.push(msg.sender);
    coins[index].marketValue += msg.value;
    coins[index].price += coinPriceIncrease;
  }

  function sellCoin(uint coinId) public {
    uint coinIndex = getCoinIndexById(coinId);
    address[] storage investors = coins[coinIndex].investors;
    for (uint i = 0; i < investors.length; i++) {
      if (coins[coinIndex].investors[i] == msg.sender) {
        uint value = getUserCoinMarketValue(coinId, i);
        coins[coinIndex].investors[i].transfer(value);
        coins[coinIndex].price -= coinPriceIncrease;
        coins[coinIndex].marketValue -= value;
        // Remove coin
        for (uint j = i; j < investors.length; j++) {
          coins[coinIndex].investors[j] = investors[j + 1];
          j++;
        }
        coins[coinIndex].investors.length--;
        break;
      }
    }
  }

  function retrieveFunds() public view {
    assert(msg.sender == owner);
    if (msg.sender == owner) {
      // address contractAddress = this;
      // owner.transfer(contractAddress.balance)
    }
  }
    
}