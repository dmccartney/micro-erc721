// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract OZVanillaERC721 is ERC721 {
    constructor(
        string memory name,
        string memory symbol,
        uint256 size
    ) ERC721(name, symbol) {}

    function baseURI() public view returns (string memory) {
        return _baseURI();
    }

    function exists(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId);
    }

    function mint(address to, uint256 tokenId) public {
        _mint(to, tokenId);
    }

    function multiMint(
        address to,
        uint256 fromTokenId,
        uint256 quantity
    ) public {
        for (uint256 i = 0; i < quantity; i++) {
            _mint(to, fromTokenId + i);
        }
    }

    function multiMint2(address to, uint256 fromTokenId) public {
        multiMint(to, fromTokenId, 2);
    }

    function multiMint20(address to, uint256 fromTokenId) public {
        multiMint(to, fromTokenId, 20);
    }

    function safeMint(address to, uint256 tokenId) public {
        _safeMint(to, tokenId);
    }

    function safeMint(
        address to,
        uint256 tokenId,
        bytes memory _data
    ) public {
        _safeMint(to, tokenId, _data);
    }

    function burn(uint256 tokenId) public {
        _burn(tokenId);
    }
}
