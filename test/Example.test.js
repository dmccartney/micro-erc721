const { expect } = require("chai");
const { ethers } = require("hardhat");

async function deploy(kName, ...args) {
  let K = await ethers.getContractFactory(kName);
  return K.deploy(...args);
}

// This suite is where I'm testing inner methods as I work on the micro implementation.
describe("Example", () => {
  it("findNth", async () => {
    let example = await deploy("Example256MicroERC721", "Example", "Example");
    // it should find that the 3rd "on" bit in ^ is at position 5
    expect(await example.findNth(0b10101010, 3, 128, 0, 0)).to.be.eql([3, 5]);

    let expected = [
      [
        0b11111111_11111111_11111111_00000000_00000000_00000000,
        6 * 8, // look at all 6 bytes
        [
          // the 1st "on" bit in ^ is at position 24 (count from the right)
          [1, 1, 24],
          [10, 10, 33],
          [20, 20, 43],
          // the 30th "on" bit does not exist since there were only 24 "on".
          [30, 24, 0],
        ],
      ],
      [
        0b10101010_10101010_10101010_10101010_10101010_10101010,
        6 * 8, // look at all 6 bytes
        [
          [1, 1, 1],
          [10, 10, 19],
          [20, 20, 39],
        ],
      ],
      [
        0b10101010_10101010_10101010_10000000_10000000_10000000,
        3 * 8, // look at only the first 3 bytes (from the right -- they're all zero)
        [
          [0, 0, 0],
          [1, 1, 7],
          [2, 2, 15],
          [3, 3, 23],
          [4, 3, 0],
        ],
      ],
    ];
    for (let i = 0; i < expected.length; i++) {
      let [source, visibleBits, nPositions] = expected[i];
      for (let j = 0; j < nPositions.length; j++) {
        let [n, count, position] = nPositions[j];
        expect(await example.findNth(source, n, visibleBits, 0, 0)).to.be.eql([
          count,
          position,
        ]);
      }
    }
  });
});
