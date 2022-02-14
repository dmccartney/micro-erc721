
# Micro ERC721

This contains my WIP experiments creating a smaller footprint ERC721.

## TODO package/publish for use, doc install

## [`SizedERC721`](contracts/SizedERC721.sol) - size-optimized ERC721
This is a drop-in replacement for the OpenZeppelin ERC721 that uses
storage optimizations for a specified maximum `size`. This lets it
keep gas costs low for `mint`/`transfer`/`burn` while also
adding extra functionality (e.g. `IERC721Enumerable-tokenOfOwnerByIndex`).

Whereas `ERC721` supports any `uint256` ID and up to `2^256 tokens`,
this `SizedERC721` requires a specified maximum token ID (e.g. 10,000)
and token IDs can then only be minted within that range (e.g. 0 - 10,000).
This is a typical assumption many projects enforce anyways.

## [Benchmarks](test/Benchmark.test.js)

- `ExampleSized` runs are instances of [`SizedERC721`](contracts/SizedERC721.sol).
- `OZVanilla` runs are instances of OpenZeppelin's [`ERC721`](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/ERC721.sol).
- `OZEnumerable` runs are instances of OpenZeppelin's [`ERC721Enumerable`](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/extensions/ERC721Enumerable.sol).
- `ChiruERC721` runs are instances of Chiru Lab's [`ERC721a`](https://github.com/chiru-labs/ERC721A).

Right now the `SizedERC721` has the same gas prices as OpenZeppelin's vanilla `ERC721` for `mint`/`burn`/`transfer`.
But it does this while also implementing `IERC721Enumerable-tokenOfOwnerByIndex`. By contrast, the OpenZeppelin edition
of `ERC721Enumerable` (which includes `tokenOfOwnerByIndex`) dramatically increases the `mint`/`burn`/`transfers` costs by 2x-3x.
So this means your `SizedERC721` can list a person's tokens on-chain w/o a big spike in the cost of a mint.

### Multi-minting
Chiru Lab's [`ERC721a`](https://github.com/chiru-labs/ERC721A) does some clever stuff to make
multi-minting (minting more than one at a time) cheaper up-front. It offloads some of those minting costs on later transfers
and requires tokens mint use sequential IDs starting from 0.

I've added `multiMinting` to the benchmark to track this. Comparing multi-minting costs is a little tricky.
Where `Chiru` is a hair costlier for `n = 1` it quickly becomes the cheapest for minting multiple. And
if you look at `transferFrom`, you can see where it offloads that onto later transfers.

![benchmark of micro ERC721](https://user-images.githubusercontent.com/599974/153911534-66bf86a2-5fd9-4c77-a1a6-9af609e9010c.png)

## `TODO` doc data structure cleverness / next explorations
- TODO explain [EnumerableBitMaps](contracts/EnumerableBitMaps.sol)
- TODO explore incorporating Chiru's null-run technique for `SizedERC721`'s `_owners` (and/or consider contributing to `ERC721a` to speed up enumeration)
- TODO explore static indexed 8192 (8x32 index (fits into 1 uint256) for a 8x256 bitmap of holdings)

## development setup
- `$ npm install`
- `$ npm test`
- `$ npm run pretty`
- `$ REPORT_GAS=true npm test`
