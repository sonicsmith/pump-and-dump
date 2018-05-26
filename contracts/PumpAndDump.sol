pragma solidity ^0.4.23;

// import "github.com/OpenZeppelin/zeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract PumpAndDump {

  using SafeMath for uint256;

  address owner;
  uint newCoinFee = 0.005 ether;
  uint newCoinFeeIncrease = 0.001 ether;
  uint defaultCoinPrice = 0.001 ether;
  uint coinPriceIncrease = 0.0001 ether;
  uint devFees = 0;
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

  function kill() external {
    require(msg.sender == owner);
    selfdestruct(owner);
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
    uint amount = extractDevFee(msg.value, 90);
    coins[id].exists = true;
    coins[id].name = name;
    coins[id].price = defaultCoinPrice;
    coins[id].marketValue = amount;
    coins[id].investors.push(msg.sender);
    coinIds.push(id);
    newCoinFee = newCoinFee.add(newCoinFeeIncrease);
  }

  function getCoinIds() public view returns (uint16[]) {
    return coinIds;
  }

  function getCoinInfoFromId(uint16 coinId) public view returns (string, uint, uint, address[]) {
    return (
      coins[coinId].name,
      coins[coinId].price,
      coins[coinId].marketValue,
      coins[coinId].investors
    );
  }

  function getUserCoinMarketValue(uint16 coinId, uint userIndex) public view returns (uint) {
      uint numInvestors = coins[coinId].investors.length;
      // If this is the most recent investor
      if (numInvestors == userIndex.add(1)) {
        return coins[coinId].price;
      } else {
        uint numShares = (numInvestors.mul(numInvestors.add(1))).div(2);
        uint atomWeight = coins[coinId].marketValue.div(numShares);
        return (numInvestors - userIndex).mul(atomWeight);
      }
  }

  function isSenderInvestor(address sender, address[] investors) public pure returns (bool) {
    for (uint i = 0; i < investors.length; i++) {
      if (investors[i] == sender) {
        return true;
      }
    }
    return false;
  }

  function buyCoin(uint16 coinId) public payable {
    require(msg.value >= coins[coinId].price);
    require(coins[coinId].exists);
    require(!isSenderInvestor(msg.sender, coins[coinId].investors));
    coins[coinId].investors.push(msg.sender);
    uint amount = extractDevFee(msg.value, 1);
    coins[coinId].marketValue = coins[coinId].marketValue.add(amount);
    coins[coinId].price = coins[coinId].price.add(coinPriceIncrease);
  }

  function payAndRemoveInvestor(uint16 coinId, uint investorIndex) private {
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
    payAndRemoveInvestor(coinId, investorIndex);
  }

  function extractDevFee(uint amount, uint percent) private returns (uint) {
    uint fee = amount.mul(percent).div(100);
    devFees = devFees.add(fee);
    return amount.sub(fee);
  }

  function getDevFees() public view returns (uint) {
    return devFees;
  }

  function collectDevFees() public {
    require(msg.sender == owner);
    owner.transfer(devFees);
    devFees = 0;
  }

  function() public payable {}

}