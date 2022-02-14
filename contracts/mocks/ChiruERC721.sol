// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "erc721a/contracts/ERC721A.sol";

contract ChiruERC721 is ERC721A {
    constructor(
        string memory name,
        string memory symbol,
        uint256 size
    ) ERC721A(name, symbol) {}

    function baseURI() public view returns (string memory) {
        return _baseURI();
    }

    function exists(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId);
    }

    function mint(address to, uint256 tokenId) public {
        require(
            tokenId == _currentIndex,
            "ChiruERC721 can only mint consecutive token IDs"
        );
        _mint(to, 1, "", false);
    }

    function multiMint(
        address to,
        uint256 fromTokenId,
        uint256 count
    ) public {
        require(
            fromTokenId == _currentIndex,
            "ChiruERC721 can only mint consecutive token IDs"
        );
        _mint(to, count, "", false);
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
