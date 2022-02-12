// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../SizedERC721.sol";

contract ExampleSizedERC721 is SizedERC721 {
    constructor(
        string memory name,
        string memory symbol,
        uint256 size
    ) SizedERC721(name, symbol, size) {}

    function baseURI() public view returns (string memory) {
        return _baseURI();
    }

    function exists(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId);
    }

    function mint(address to, uint256 tokenId) public {
        _mint(to, tokenId);
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
