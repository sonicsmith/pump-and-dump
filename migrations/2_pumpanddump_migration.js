var PumpAndDump = artifacts.require("./PumpAndDump.sol");

module.exports = function (deployer) {
  deployer.deploy(PumpAndDump);
};
