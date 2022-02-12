// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/structs/BitMaps.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/interfaces/IERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC721Metadata.sol";
import "@openzeppelin/contracts/interfaces/IERC721Receiver.sol";

import "./BaseERC721.sol";
import "./EnumerableBitMaps.sol";

// This is an attempt to create a gas-efficient IERC721 for sized collections.
// It aims to be a drop-in replacement for OpenZeppelin's ERC721.
// NOTE: it is _partially_ enumerable (with tokenOfOwnerByIndex)
abstract contract SizedERC721 is BaseERC721 {
    using BitMaps for BitMaps.BitMap;
    using EnumerableBitMaps for BitMaps.BitMap;

    uint256 private immutable _size; // the maximum number of token IDs (fixed at construction)
    mapping(uint256 => address) private _owners; // token ID => owner mapping
    mapping(address => BitMaps.BitMap) private _holdings; // per-user bitmap of owned token IDs

    constructor(
        string memory name,
        string memory symbol,
        uint256 size_
    ) BaseERC721(name, symbol) {
        _size = size_;
    }

    function balanceOf(address owner)
        public
        view
        virtual
        override
        returns (uint256)
    {
        require(
            owner != address(0),
            "ERC721: balance query for the zero address"
        );
        return _holdings[owner].countSet(_size);
    }

    function ownerOf(uint256 tokenId)
        public
        view
        virtual
        override
        returns (address)
    {
        address owner = _owners[tokenId];
        require(
            owner != address(0),
            "ERC721: owner query for nonexistent token"
        );
        return owner;
    }

    function _exists(uint256 tokenId)
        internal
        view
        virtual
        override
        returns (bool)
    {
        return _owners[tokenId] != address(0);
    }

    function _doMint(address to, uint256 tokenId) internal virtual override {
        _owners[tokenId] = to;
        _holdings[to].set(tokenId);
    }

    function _doBurn(address owner, uint256 tokenId) internal virtual override {
        _owners[tokenId] = address(0);
        _holdings[owner].unset(tokenId);
    }

    function _doTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override {
        _holdings[from].unset(tokenId);
        _holdings[to].set(tokenId);
        _owners[tokenId] = to;
    }

    /**
     * per-Owner partial implementation of IERC721Enumerable.
     * @dev See {IERC721Enumerable-tokenOfOwnerByIndex}.
     */
    function tokenOfOwnerByIndex(address owner, uint256 index)
        public
        view
        returns (uint256)
    {
        (bool wasFound, uint256 position) = _holdings[owner].indexOfNth(
            index + 1,
            _size
        );
        require(wasFound, "ERC721Enumerable: owner index out of bounds");
        return position;
    }
}
