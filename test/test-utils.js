const { ethers } = require("hardhat");

async function deploy(kName, ...args) {
  let K = await ethers.getContractFactory(kName);
  return K.deploy(...args);
}

async function estimateGas(k, method, ...args) {
  let gas = (await k.estimateGas[method](...args)).toString();
  console.log(`${method}(${args.join(",")}) gas ${gas}`);
  return gas;
}

function randomAddress() {
  let hex = [...Array(40)]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join("");
  // calling .getAddress() normalizes case to a checksum address
  return ethers.utils.getAddress(hex);
}

function randomNLessThan(n, limit) {
  let used = {};
  const uniqRandom = () => {
    let v;
    do {
      v = Math.floor(Math.random() * limit);
    } while (used[v]);
    used[v] = true;
    return v;
  };
  return [...Array(n)].map(() => uniqRandom());
}

exports = module.exports = {
  deploy,
  estimateGas,
  randomNLessThan,
  randomAddress,
};
