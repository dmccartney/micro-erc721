const { expect } = require("chai");
const { ethers } = require("hardhat");

async function deploy(kName, ...args) {
  let K = await ethers.getContractFactory(kName);
  return K.deploy(...args);
}

function randomAddress() {
  let hex = [...Array(40)]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join("");
  // calling .getAddress() normalizes case to a checksum address
  return ethers.utils.getAddress(hex);
}

let implementations = ["ExampleMicro", "OZVanilla", "OZEnumerable"];
implementations.forEach((type) => {
  describe(`Benchmark:${type}`, () => {
    let DEPLOYER;
    let USER_A;
    let USER_B;
    let USER_C;
    let USER_D;
    let erc721;

    beforeEach(async function () {
      let signers = await ethers.getSigners();
      DEPLOYER = signers[0];
      USER_A = signers[1];
      USER_B = signers[2];
      USER_C = signers[3];
      USER_D = signers[4];
      erc721 = await deploy(`${type}ERC721`, type, type);
    });
    it("minting", async () => {
      await erc721.mint(USER_A.address, 1);
      await erc721.mint(USER_A.address, 2);
      await erc721.mint(USER_B.address, 3);
      await erc721.mint(USER_B.address, 4);
      expect(await erc721.ownerOf(1)).to.be.equal(USER_A.address);
      expect(await erc721.ownerOf(2)).to.be.equal(USER_A.address);
      expect(await erc721.ownerOf(3)).to.be.equal(USER_B.address);
      expect(await erc721.ownerOf(4)).to.be.equal(USER_B.address);
      expect(await erc721.balanceOf(USER_A.address)).to.be.equal(2);
      expect(await erc721.balanceOf(USER_B.address)).to.be.equal(2);
    });
    it("burning", async () => {
      let erc721 = await deploy(`${type}ERC721`, type, type);
      await erc721.mint(USER_A.address, 1);
      await erc721.mint(USER_A.address, 2);
      expect(await erc721.ownerOf(1)).to.be.equal(USER_A.address);
      expect(await erc721.ownerOf(2)).to.be.equal(USER_A.address);
      expect(await erc721.balanceOf(USER_A.address)).to.be.equal(2);
      await erc721.burn(1);
      await expect(erc721.ownerOf(1)).to.be.reverted;
      expect(await erc721.balanceOf(USER_A.address)).to.be.equal(1);
    });
    it("transferring", async () => {
      await erc721.mint(USER_A.address, 1);
      await erc721.mint(USER_A.address, 2);
      await erc721.mint(USER_B.address, 3);
      await erc721.mint(USER_B.address, 4);
      await erc721
        .connect(USER_A)
        .transferFrom(USER_A.address, USER_B.address, 1);
      await erc721
        .connect(USER_B)
        .transferFrom(USER_B.address, USER_A.address, 3);
      expect(await erc721.ownerOf(1)).to.be.equal(USER_B.address);
      expect(await erc721.ownerOf(2)).to.be.equal(USER_A.address);
      expect(await erc721.ownerOf(3)).to.be.equal(USER_A.address);
      expect(await erc721.ownerOf(4)).to.be.equal(USER_B.address);
      expect(await erc721.balanceOf(USER_A.address)).to.be.equal(2);
      expect(await erc721.balanceOf(USER_B.address)).to.be.equal(2);
    });
    it("non-sequential minting, one minter", async () => {
      for (let i = 0; i < 256; i++) {
        // swap the nibbles to make counting non-sequential
        // [0, 1, 2, 3, ...] -> [0, 16, 32, 48, ...]
        let nibbleSwappedI = ((i & 0b11110000) >> 4) + ((i & 0b00001111) << 4);
        await erc721.mint(USER_A.address, nibbleSwappedI);
      }
      for (let i = 0; i < 256; i++) {
        expect(await erc721.ownerOf(i)).to.be.equal(USER_A.address);
      }
      expect(await erc721.balanceOf(USER_A.address)).to.be.equal(256);
    });
    it("sequential minting, one minter", async () => {
      for (let i = 0; i < 256; i++) {
        await erc721.mint(USER_A.address, i);
      }
      for (let i = 0; i < 256; i++) {
        expect(await erc721.ownerOf(i)).to.be.equal(USER_A.address);
      }
      expect(await erc721.balanceOf(USER_A.address)).to.be.equal(256);
    });
    it("lots of minters", async () => {
      let addresses = [];
      for (let i = 0; i < 256; i++) {
        addresses.push(randomAddress());
        await erc721.mint(addresses[i], i);
      }
      for (let i = 0; i < 256; i++) {
        expect(await erc721.ownerOf(i)).to.be.equal(addresses[i]);
        expect(await erc721.balanceOf(addresses[i])).to.be.equal(1);
      }
    });
  });
});
