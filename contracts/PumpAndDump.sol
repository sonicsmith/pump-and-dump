pragma solidity ^0.4.23;

// import "github.com/OpenZeppelin/zeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract PumpAndDump {

  using SafeMath for uint256;

  address owner;
  uint newCoinFee = 0.01 ether;
  uint newCoinFeeIncrease = 0.01 ether;
  uint defaultCoinPrice = 0.001 ether;
  uint coinPriceIncrease = 0.0001 ether;
  uint16[] coinIds;

  struct Coin {
    bool exists;
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
    coins[id].exists = true;
    coins[id].name = name;
    coins[id].price = defaultCoinPrice;
    coins[id].marketValue = msg.value; 
    coins[id].investors.push(msg.sender);
    coinIds.push(id);
    newCoinFee = newCoinFee.add(newCoinFeeIncrease);
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
      uint numInvestors = coins[coinId].investors.length;
      if (numInvestors == userIndex.add(1)) {
        return coins[coinId].price;
      } else {
        uint numShares = (numInvestors.mul(numInvestors.add(1))).div(2);
        uint atomWeight = coins[coinId].marketValue.div(numShares);
        return (numInvestors - userIndex).mul(atomWeight);
      }
  }

  function isSenderInvestor(address sender, address[] investors) public constant returns (bool) {
    require(coins[coinId].exists);
    for (uint i = 0; i < investors.length; i++) {
      if (investors[i] == sender) {
        return true;
      }
    }
    return false
  }

  function buyCoin(uint16 coinId) public payable {
    require(msg.value >= coins[coinId].price);
    require(condition);
    require(!isSenderInvestor());
    coins[coinId].investors.push(msg.sender);
    coins[coinId].marketValue = coins[coinId].marketValue.add(msg.value);
    coins[coinId].price = coins[coinId].price.add(coinPriceIncrease);
  }

  function removeInvestor(uint16 coinId, uint investorIndex) public {
    uint value = getUserCoinMarketValue(coinId, investorIndex);
    coins[coinId].investors[investorIndex].transfer(value);
    coins[coinId].price = coins[coinId].price.sub(coinPriceIncrease);
    coins[coinId].marketValue = coins[coinId].marketValue.sub(value);
    if (coins[coinId].investors.length == 1) {
      delete coins[coinId].investors[0];
    } else {
      uint secondLastIndex = coins[coinId].investors.length.sub(1);
      for (uint j = investorIndex; j < secondLastIndex; j++) {
        coins[coinId].investors[j] = coins[coinId].investors[j.add(1)];
      }
    }
    coins[coinId].investors.length = coins[coinId].investors.length.sub(1);
  }

  function sellCoin(uint16 coinId) public {
    bool senderIsInvestor = false;
    uint investorIndex = 0;
    require(coins[coinId].exists);
    for (uint i = 0; i < coins[coinId].investors.length; i++) {
      if (coins[coinId].investors[i] == msg.sender) {
        senderIsInvestor = true;
        investorIndex = i;
        break;
      }
    }
    require(senderIsInvestor);
    removeInvestor(coinId, investorIndex);
  }

  function retrieveFunds(uint amount) public {
    assert(msg.sender == owner);
    if (msg.sender == owner) {
    //   address contractAddress = this;
      owner.transfer(amount);
    }
  }
    
}