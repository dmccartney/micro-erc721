const { expect } = require("chai");
const { ethers } = require("hardhat");

async function deploy(kName, ...args) {
  let K = await ethers.getContractFactory(kName);
  return K.deploy(...args);
}

// This suite is where I'm testing inner methods as I work on the micro implementation.
describe("Example", () => {
  it("findOn", async () => {
    let example = await deploy("ExampleMicroERC721", "Example", "Example");
    let found = await example.findOn(0b10101010, 128, 0);
    // it should find that the positions 1, 3, 5, and 7 are "on"
    expect(found).to.be.eql([1, 3, 5, 7]);
  });
  it("findNth", async () => {
    let example = await deploy("ExampleMicroERC721", "Example", "Example");
    let found = await example.findNth(0b10101010, 3, 128, 0, 0);
    // it should find that the 3rd "on" bit in ^ is at position 5
    expect(found).to.be.eql([5, 3]);
  });
});
