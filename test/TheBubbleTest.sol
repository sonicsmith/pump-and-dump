import "truffle/Assert.sol";
import "../contracts/PumpAndDump.sol";

contract TheBubbleTest {

  function testInitialBalanceUsingDeployedContract() {
    PumpAndDump pumpAndDump = PumpAndDump();

    uint expected = 0;

    Assert.equal(pumpAndDump.getBalance(tx.origin), expected, "Owner should have 0 balance initially");
  }

  // function testInitialBalanceWithNewMetaCoin() {
  //   MetaCoin meta = new MetaCoin();

  //   uint expected = 10000;

  //   Assert.equal(meta.getBalance(tx.origin), expected, "Owner should have 10000 MetaCoin initially");
  // }
}