const { expect } = require("chai");
const { ethers } = require("hardhat");
const { deploy, randomAddress, randomNLessThan } = require("./test-utils");

["ExampleSized", "OZVanilla", "OZEnumerable"].forEach((type) => {
  [256, 1024, 4096, 10240].forEach((size) => {
    describe.only(`Benchmark:${type}:${size}`, function () {
      let DEPLOYER;
      let USER_A;
      let USER_B;
      let USER_C;
      let USER_D;
      let erc721;
      let some = Math.floor(size / 50);

      beforeEach(async function () {
        let signers = await ethers.getSigners();
        DEPLOYER = signers[0];
        USER_A = signers[1];
        USER_B = signers[2];
        USER_C = signers[3];
        USER_D = signers[4];
        erc721 = await deploy(`${type}ERC721`, type, type, size);
      });
      it("minting", async function () {
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
      it("burning", async function () {
        await erc721.mint(USER_A.address, 1);
        await erc721.mint(USER_A.address, 2);
        expect(await erc721.ownerOf(1)).to.be.equal(USER_A.address);
        expect(await erc721.ownerOf(2)).to.be.equal(USER_A.address);
        expect(await erc721.balanceOf(USER_A.address)).to.be.equal(2);
        await erc721.burn(1);
        await expect(erc721.ownerOf(1)).to.be.reverted;
        expect(await erc721.balanceOf(USER_A.address)).to.be.equal(1);
      });
      it("transferring", async function () {
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
      it("non-sequential minting, one minter", async function () {
        let tokens = randomNLessThan(some, size);
        for (let i = 0; i < tokens.length; i++) {
          await erc721.mint(USER_A.address, tokens[i]);
        }
        for (let i = 0; i < tokens.length; i++) {
          expect(await erc721.ownerOf(tokens[i])).to.be.equal(USER_A.address);
        }
        expect(await erc721.balanceOf(USER_A.address)).to.be.equal(
          tokens.length
        );
      });
      it("sequential minting, one minter", async function () {
        for (let i = 0; i < some; i++) {
          await erc721.mint(USER_A.address, i);
        }
        for (let i = 0; i < some; i++) {
          expect(await erc721.ownerOf(i)).to.be.equal(USER_A.address);
        }
        expect(await erc721.balanceOf(USER_A.address)).to.be.equal(some);
      });
      it("sequential, lots of minters", async function () {
        let addresses = [];
        for (let i = 0; i < some; i++) {
          addresses.push(randomAddress());
          await erc721.mint(addresses[i], i);
        }
        for (let i = 0; i < some; i++) {
          expect(await erc721.ownerOf(i)).to.be.equal(addresses[i]);
          expect(await erc721.balanceOf(addresses[i])).to.be.equal(1);
        }
      });
      it("enumerating owner's tokens", async function () {
        if (!erc721.tokenOfOwnerByIndex) {
          this.skip();
        }
        await erc721.mint(USER_A.address, 1);
        await erc721.mint(USER_A.address, 2);
        await erc721.mint(USER_B.address, 3);
        await erc721.mint(USER_B.address, 4);

        expect(await erc721.balanceOf(USER_A.address)).to.equal(2);
        expect(await erc721.tokenOfOwnerByIndex(USER_A.address, 0)).to.equal(1);
        expect(await erc721.tokenOfOwnerByIndex(USER_A.address, 1)).to.equal(2);
        await expect(erc721.tokenOfOwnerByIndex(USER_A.address, 2)).to.be
          .reverted;

        expect(await erc721.balanceOf(USER_B.address)).to.equal(2);
        expect(await erc721.tokenOfOwnerByIndex(USER_B.address, 0)).to.equal(3);
        expect(await erc721.tokenOfOwnerByIndex(USER_B.address, 1)).to.equal(4);
        await expect(erc721.tokenOfOwnerByIndex(USER_B.address, 2)).to.be
          .reverted;
      });
      it("enumerating owner's tokens non-sequential spread out", async function () {
        if (!erc721.tokenOfOwnerByIndex) {
          this.skip();
        }
        let tokens = randomNLessThan(some, size);
        for (let i = 0; i < tokens.length; i++) {
          await erc721.mint(USER_A.address, tokens[i]);
        }
        expect(await erc721.balanceOf(USER_A.address)).to.equal(some);
        for (let i = 0; i < tokens.length; i++) {
          expect(await erc721.tokenOfOwnerByIndex(USER_A.address, i)).to.exist;
        }
        await expect(erc721.tokenOfOwnerByIndex(USER_A.address, some)).to.be
          .reverted;
      });
    });
  });
});
