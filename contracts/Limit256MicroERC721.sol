// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/interfaces/IERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC721Metadata.sol";
import "@openzeppelin/contracts/interfaces/IERC721Receiver.sol";

import "./BaseMicroERC721.sol";

// This is an attempt to create a gas-efficient IERC721 for smaller collections.
// It aims to be a drop-in replacement for OpenZeppelin's ERC721.
// NOTE: this first exploration assumes 256 limit
// NOTE: it is _partially_ enumerable (with tokenOfOwnerByIndex)
abstract contract Limit256MicroERC721 is BaseMicroERC721 {
    mapping(uint256 => address) private owners; // token ID => owner mapping
    mapping(address => uint256) private holdings; // per-user bitmap of owned token IDs

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
        uint256 h = holdings[owner];
        uint16 count = 0;
        while (h != 0) {
            h &= (h - 1);
            count++;
        }
        return count;
    }

    function ownerOf(uint256 tokenId)
        public
        view
        virtual
        override
        returns (address)
    {
        address owner = owners[uint8(tokenId)];
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
        return tokenId < 256 && owners[uint8(tokenId)] != address(0);
    }

    function _doMint(address to, uint256 tokenId) internal virtual override {
        owners[uint8(tokenId)] = to;
        holdings[to] |= (1 << uint8(tokenId));
    }

    function _doBurn(address owner, uint256 tokenId) internal virtual override {
        owners[uint8(tokenId)] = address(0);
        holdings[owner] ^= (1 << uint8(tokenId));
    }

    function _doTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override {
        holdings[from] ^= (1 << uint8(tokenId));
        holdings[to] |= (1 << uint8(tokenId));
        owners[uint8(tokenId)] = to;
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
        (uint8 tokenId, uint8 foundCount) = findNth(
            holdings[owner],
            uint8(index) + 1,
            128,
            0,
            0
        );
        require(
            foundCount == index + 1,
            "ERC721Enumerable: owner index out of bounds"
        );
        return tokenId;
    }

    // Helpers

    // -1 == not found
    function findNth(
        uint256 source,
        uint8 n,
        uint8 visibleBits,
        uint8 offset,
        uint8 offsetCount
    )
        public
        view
        returns (
            uint8, // number "on" in visibleBits up to N. If == N then it was found.
            uint8 // the position of the Nth, if found.
        )
    {
        if (visibleBits <= 8) {
            uint8 count = offsetCount;
            uint8 b = uint8(source & 0xFF);
            for (uint8 i = 0; i < 8; i++) {
                if (b & (1 << i) != 0) {
                    count++;
                    if (count == n) {
                        return (count, i + offset);
                    }
                }
            }
            return (count, 0);
        }

        // Create a mask for half the visible bits.
        uint256 mask = ((1 << (visibleBits / 2)) - 1);

        // First check the left-hand side.
        uint256 masked = source & mask;
        // lNthIndex is the position of the Nth set bit on the left hand side, if found
        // lCount is the number of set bits (up to N) found on the left hand side
        (uint8 lCount, uint8 lNthIndex) = masked == 0
            ? (offsetCount, 0)
            : findNth(masked, n, visibleBits / 2, offset, offsetCount);
        // If we found it on the left-hand side, return the success.
        if (lCount >= n) {
            return (n, lNthIndex);
        }

        // Otherwise look for it on the right-hand side.
        masked = (source >> (visibleBits / 2)) & mask;
        (uint8 rCount, uint8 rNthIndex) = masked == 0
            ? (lCount, 0)
            : findNth(
                masked,
                n,
                visibleBits / 2,
                offset + visibleBits / 2,
                lCount
            );

        return (rCount, rNthIndex);
    }
}
