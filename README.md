
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

## Benchmarks

- `ExampleSized` runs are instances of [`SizedERC721`](contracts/SizedERC721.sol).
- `OZVanilla` runs are instances of OpenZeppelin's `ERC721`.
- `OZEnumerable` runs are instances of OpenZeppelin's `ERC721Enumerable`.

Right now the `SizedERC721` has the same gas prices as OpenZeppelin's vanilla `ERC721` for `mint`/`burn`/`transfer`.
But it does this while also implementing `IERC721Enumerable-tokenOfOwnerByIndex`. By contrast, the OpenZeppelin edition
of `ERC721Enumerable` (which includes `tokenOfOwnerByIndex`) dramatically increases the `mint`/`burn`/`transfers` costs by 2x-3x.
So this means your `SizedERC721` can list a person's tokens on-chain w/o a big spike in the cost of a mint.

![benchmark of micro ERC721](https://user-images.githubusercontent.com/599974/153712963-2cc482b8-db4b-4e32-b772-fbac016d9155.png)

## `TODO` doc data structure cleverness / next explorations
- TODO explain [EnumerableBitMaps](contracts/EnumerableBitMaps.sol)

## development setup
- `$ npm install`
- `$ npm test`
- `$ npm run pretty`
- `$ REPORT_GAS=true npm test`
