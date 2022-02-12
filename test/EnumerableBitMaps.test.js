const { expect } = require("chai");
const { ethers } = require("hardhat");
const { deploy, estimateGas, randomNLessThan } = require("./test-utils");
const { BigNumber } = ethers;

describe("EnumerableBitMaps", () => {
  it("countSet with 0 in 100", async function () {
    let ebm = await deploy("EnumerableBitMapMock");
    expect(await ebm.countSet(100)).to.be.equal(0);
    expect(await ebm.indexOfNth(0, 100)).to.be.eql([
      false,
      ethers.constants.Zero,
    ]);
    await estimateGas(ebm, "countSet", 100);
    // ~= 24062
    await estimateGas(ebm, "indexOfNth", 0, 100);
    // ~= 24401
  });
  it("countSet with 100 in 100", async function () {
    let ebm = await deploy("EnumerableBitMapMock");
    for (let i = 0; i < 100; i++) {
      await ebm.set(i);
    }
    expect(await ebm.countSet(100)).to.be.equal(100);
    expect(await ebm.indexOfNth(100, 100)).to.be.eql([
      true,
      BigNumber.from(99),
    ]);
    await estimateGas(ebm, "countSet", 100);
    // ~= 41862
    await estimateGas(ebm, "indexOfNth", 100, 100);
    // ~= 70913
  });
  it("countSet with 100 in 10_000", async function () {
    let ebm = await deploy("EnumerableBitMapMock");
    let tokens = randomNLessThan(100, 10_000);
    for (let i = 0; i < tokens.length; i++) {
      await ebm.set(tokens[i]);
    }
    expect(await ebm.countSet(10_000)).to.be.equal(100);
    expect((await ebm.indexOfNth(100, 10_000))[0]).to.be.eql(true);
    await estimateGas(ebm, "countSet", 10_000);
    // ~= 131925
    await estimateGas(ebm, "indexOfNth", 100, 10_000);
    // ~= 141675
  });
  // NOTE: disabled since it's slow
  it.skip("countSet with 10_000 in 10_000", async function () {
    this.timeout(90_000); // give it a long while
    let ebm = await deploy("EnumerableBitMapMock");
    for (let i = 0; i < 10_000; i++) {
      await ebm.set(i);
      if (!(i % 1000)) console.log("progress", i);
    }
    expect(await ebm.countSet(10_000)).to.be.equal(10_000);
    expect(await ebm.indexOfNth(10_000, 10_000)).to.be.eql([
      true,
      BigNumber.from(9_999),
    ]);
    await estimateGas(ebm, "countSet", 10_000);
    // ~= 1894125
    await estimateGas(ebm, "indexOfNth", 10_000, 10_000);
    // ~= 2159294
  });
});
