const { expect } = require("chai");
const { ethers } = require("hardhat");
const { deploy, randomAddress, randomNLessThan } = require("./test-utils");

const SequentialOnlyType = {
  Chiru: true,
}; // default: false

["ExampleSized", "OZVanilla", "OZEnumerable", "Chiru"].forEach((type) => {
  [256, 1024, 4096 /* 10_000, /*100_000, 1_000_000*/].forEach((size) => {
    describe.only(`Benchmark:${type}:${size}`, function () {
      let DEPLOYER;
      let USER_A;
      let USER_B;
      let USER_C;
      let USER_D;
      let erc721;
      let someN = 20;

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
        for (let i = 0; i < someN; i++) {
          await erc721.mint(USER_A.address, i * 2 + 0);
          await erc721.mint(USER_B.address, i * 2 + 1);
        }
        for (let i = 0; i < someN; i++) {
          expect(await erc721.ownerOf(i * 2 + 0)).to.be.equal(USER_A.address);
          expect(await erc721.ownerOf(i * 2 + 1)).to.be.equal(USER_B.address);
        }
        expect(await erc721.balanceOf(USER_A.address)).to.be.equal(someN);
        expect(await erc721.balanceOf(USER_B.address)).to.be.equal(someN);
      });
      it("multiMinting", async function () {
        if (!erc721.multiMint2) {
          this.skip();
        }
        let total = 0;

        // correspond to .multiMint#(...) method names on mocks
        let ns = [2, 20];
        for (let i = 0; i < 10; i++) {
          for (let j = 0; j < ns.length; j++) {
            let n = ns[j];
            await erc721[`multiMint${n}`](USER_A.address, total);
            total += n;
          }
        }
        for (let i = 0; i < total; i++) {
          expect(await erc721.ownerOf(i)).to.be.equal(USER_A.address);
        }
        expect(await erc721.balanceOf(USER_A.address)).to.be.equal(total);
        expect(await erc721.balanceOf(USER_B.address)).to.be.equal(0);

        for (let i = total - 1; i >= 0; i--) {
          await erc721
            .connect(USER_A)
            .transferFrom(USER_A.address, USER_B.address, i);
        }
        for (let i = 0; i < total; i++) {
          expect(await erc721.ownerOf(i)).to.be.equal(USER_B.address);
        }
        expect(await erc721.balanceOf(USER_A.address)).to.be.equal(0);
        expect(await erc721.balanceOf(USER_B.address)).to.be.equal(total);
      });
      it("burning", async function () {
        await erc721.mint(USER_A.address, 0);
        await erc721.mint(USER_A.address, 1);
        expect(await erc721.ownerOf(0)).to.be.equal(USER_A.address);
        expect(await erc721.ownerOf(1)).to.be.equal(USER_A.address);
        expect(await erc721.balanceOf(USER_A.address)).to.be.equal(2);
        await erc721.burn(0);
        await expect(erc721.ownerOf(0)).to.be.reverted;
        expect(await erc721.balanceOf(USER_A.address)).to.be.equal(1);
      });
      it("transferring", async function () {
        for (let i = 0; i < someN; i++) {
          await erc721.mint(USER_A.address, 0 + i * 4);
          await erc721.mint(USER_A.address, 1 + i * 4);
          await erc721.mint(USER_B.address, 2 + i * 4);
          await erc721.mint(USER_B.address, 3 + i * 4);
        }
        for (let i = 0; i < someN; i++) {
          await erc721
            .connect(USER_A)
            .transferFrom(USER_A.address, USER_B.address, 0 + i * 4);
          await erc721
            .connect(USER_B)
            .transferFrom(USER_B.address, USER_A.address, 2 + i * 4);
        }
        for (let i = 0; i < someN; i++) {
          expect(await erc721.ownerOf(0 + i * 4)).to.be.equal(USER_B.address);
          expect(await erc721.ownerOf(1 + i * 4)).to.be.equal(USER_A.address);
          expect(await erc721.ownerOf(2 + i * 4)).to.be.equal(USER_A.address);
          expect(await erc721.ownerOf(3 + i * 4)).to.be.equal(USER_B.address);
        }
        expect(await erc721.balanceOf(USER_A.address)).to.be.equal(2 * someN);
        expect(await erc721.balanceOf(USER_B.address)).to.be.equal(2 * someN);
      });
      it("non-sequential minting, one minter", async function () {
        if (SequentialOnlyType[type]) {
          this.skip();
        }
        let tokens = randomNLessThan(someN, size);
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
        for (let i = 0; i < someN; i++) {
          await erc721.mint(USER_A.address, i);
        }
        for (let i = 0; i < someN; i++) {
          expect(await erc721.ownerOf(i)).to.be.equal(USER_A.address);
        }
        expect(await erc721.balanceOf(USER_A.address)).to.be.equal(someN);
      });
      it("sequential, lots of minters", async function () {
        let addresses = [];
        for (let i = 0; i < someN; i++) {
          addresses.push(randomAddress());
          await erc721.mint(addresses[i], i);
        }
        for (let i = 0; i < someN; i++) {
          expect(await erc721.ownerOf(i)).to.be.equal(addresses[i]);
          expect(await erc721.balanceOf(addresses[i])).to.be.equal(1);
        }
      });
      it("enumerating owner's tokens", async function () {
        if (!erc721.tokenOfOwnerByIndex) {
          this.skip();
        }
        await erc721.mint(USER_A.address, 0);
        await erc721.mint(USER_A.address, 1);
        await erc721.mint(USER_B.address, 2);
        await erc721.mint(USER_B.address, 3);

        expect(await erc721.balanceOf(USER_A.address)).to.equal(2);
        expect(await erc721.tokenOfOwnerByIndex(USER_A.address, 0)).to.equal(0);
        expect(await erc721.tokenOfOwnerByIndex(USER_A.address, 1)).to.equal(1);
        await expect(erc721.tokenOfOwnerByIndex(USER_A.address, 2)).to.be
          .reverted;

        expect(await erc721.balanceOf(USER_B.address)).to.equal(2);
        expect(await erc721.tokenOfOwnerByIndex(USER_B.address, 0)).to.equal(2);
        expect(await erc721.tokenOfOwnerByIndex(USER_B.address, 1)).to.equal(3);
        await expect(erc721.tokenOfOwnerByIndex(USER_B.address, 2)).to.be
          .reverted;
      });
      it("enumerating owner's tokens non-sequential spread out", async function () {
        if (!erc721.tokenOfOwnerByIndex) {
          this.skip();
        }
        if (SequentialOnlyType[type]) {
          this.skip();
        }
        let tokens = randomNLessThan(someN, size);
        for (let i = 0; i < tokens.length; i++) {
          await erc721.mint(USER_A.address, tokens[i]);
        }
        expect(await erc721.balanceOf(USER_A.address)).to.equal(someN);
        for (let i = 0; i < tokens.length; i++) {
          expect(await erc721.tokenOfOwnerByIndex(USER_A.address, i)).to.exist;
        }
        await expect(erc721.tokenOfOwnerByIndex(USER_A.address, someN)).to.be
          .reverted;
      });
    });
  });
});
