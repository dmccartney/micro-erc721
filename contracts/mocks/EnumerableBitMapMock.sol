// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/structs/BitMaps.sol";
import "../EnumerableBitMaps.sol";

contract EnumerableBitMapMock {
    using BitMaps for BitMaps.BitMap;
    using EnumerableBitMaps for BitMaps.BitMap;

    BitMaps.BitMap private _bitmap;

    function get(uint256 index) public view returns (bool) {
        return _bitmap.get(index);
    }

    function setTo(uint256 index, bool value) public {
        _bitmap.setTo(index, value);
    }

    function set(uint256 index) public {
        _bitmap.set(index);
    }

    function setMulti(uint256 fromIndex, uint256 quantity) public {
        _bitmap.setMulti(fromIndex, quantity);
    }

    function unset(uint256 index) public {
        _bitmap.unset(index);
    }

    function countSet(uint256 indexLimit) public view returns (uint256) {
        return _bitmap.countSet(indexLimit);
    }

    function indexOfNth(uint256 n, uint256 indexLimit)
        public
        view
        returns (bool, uint256)
    {
        return _bitmap.indexOfNth(n, indexLimit);
    }
}
