const Splitter = artifacts.require('./Splitter.sol');

contract('Splitter', (accounts) => {
  const alice = accounts[0],
        bob = accounts[1],
        carol = accounts[2];
  let contract;

  beforeEach( () => {
    return Splitter.new(bob, carol, {from: alice})
      .then( (instance) => {
        contract = instance;
      });
  });

  it('should be owned by Alice', () => {
    return contract.owner({from:alice})
      .then( (owner) => {
        assert.strictEqual(owner, alice, "Contract is not owned by Alice");
      });
  });

  it('should initialize with recipients', () => {
    return contract.recipientStructs(0, {from:alice})
      .then( (recipient1) => {
        assert.strictEqual(recipient1[0], bob, "Contract did not store Recipient 1");
        contract.recipientStructs(1, {from:alice})
          .then ( (recipient2) => {
            assert.strictEqual(recipient2[0], carol, "Contract did not store Recipient 2");
          });
      });
  });

  it('should split even amounts to Bob and Carol and have a record of amount sent to each recipient', () => {
    const bobBalance = web3.eth.getBalance(bob),
          carolBalance = web3.eth.getBalance(carol);

    return contract.splitFunds({from:alice, value: 10})
      .then( (txn) => {
        return contract.recipientStructs(0, {from:alice})
          .then( (recipient1) => {
            assert.equal((bobBalance.plus(5)).toString(10), web3.eth.getBalance(bob).toString(10), "Recipient 1 did not receive the funds");
            assert.equal(recipient1[1].toString(10), 5, "Contract did not send half to Recipient 1");
            return contract.recipientStructs(1, {from:alice})
              .then( (recipient2) => {
                assert.equal((carolBalance.plus(5)).toString(10), web3.eth.getBalance(carol).toString(10), "Recipient 2 did not receive the funds");
                assert.equal(recipient2[1].toString(10), 5, "Contract did not send half to Recipient 2");
              });
          });
      });
  });

  it('should report total amount sent from Alice', () => {
    return contract.splitFunds({from:alice, value: 10})
      .then( (txn) => {
        return contract.totalSent({from:alice})
          .then( (total) => {
            assert.equal(total.toString(10), 10, "Contract total sent is not correct")
          });
      });
  });

  it('should split odd amounts to Bob and Carol and return the 1 Wei', () => {
    const bobBalance = web3.eth.getBalance(bob),
          carolBalance = web3.eth.getBalance(carol);

    return contract.splitFunds({from:alice, value: 11})
      .then( (txn) => {
        return contract.recipientStructs(0, {from:alice})
          .then( (recipient1) => {
            assert.equal((bobBalance.plus(5)).toString(10), web3.eth.getBalance(bob).toString(10), "Recipient 1 did not receive the funds");
            assert.equal(recipient1[1].toString(10), 5, "Contract did not send half to Recipient 1");
            return contract.recipientStructs(1, {from:alice})
              .then( (recipient2) => {
                assert.equal((carolBalance.plus(5)).toString(10), web3.eth.getBalance(carol).toString(10), "Recipient 2 did not receive the funds");
                assert.equal(recipient2[1].toString(10), 5, "Contract did not send half to Recipient 2");
              });
          });
      });
  });

  it('Alice should be able to kill it', () => {
    return contract.killMe({from:alice})
      .then( (txn) => {
        return contract.owner({from:alice})
          .then( (owner) => {
            assert.strictEqual(owner, '0x', "Alice could not kill the contract");
          });
      });
  });
});
