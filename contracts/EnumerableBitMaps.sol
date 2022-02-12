// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/structs/BitMaps.sol";

// This adds helper methods for enumerating BitMaps.
// TODO: consider "CountingBitMaps" extension that includes total counters
// TODO: consider packing bucket-counts into a single 256bit count-list
//       e.g. 32x8bit counts (=256bits) mapping to 32 bucket counts so indexLimit = 32x256 = 8192
//            so we could quickly find the Nth and sum the total.
library EnumerableBitMaps {
    // This returns the number of bits set in the `bitmap` given a maximum `indexLimit`.
    // The `indexLimit` is the maximum possible value of any index into the bitmap.
    // NOTE: this performs better with fewer buckets and sparser maps.
    // TODO: consider gas checks
    function countSet(BitMaps.BitMap storage bitmap, uint256 indexLimit)
        internal
        view
        returns (uint256)
    {
        uint256 count = 0;
        uint256 bucketIndex = 0;
        uint256 bucketLimit = ((indexLimit - 1) >> 8) + 1;
        //   Loops once for each bucket (bucket count = indexLimit / 256)
        // + Loops once for each set bit
        // e.g. when indexLimit = 10240 with 200 bits set throughout
        //      then the outer loop executes 40 times.
        //      and the inner loop executes 240 times.
        while (bucketIndex < bucketLimit) {
            uint256 bucketData = bitmap._data[bucketIndex];
            while (bucketData != 0) {
                bucketData &= (bucketData - 1);
                count++;
            }
            bucketIndex++;
        }
        return count;
    }

    function indexOfNth(
        BitMaps.BitMap storage bitmap,
        uint256 n,
        uint256 indexLimit
    )
        internal
        view
        returns (
            bool found, // weather an Nth "on" bit was found
            uint256 position // the position of the Nth "on" bit
        )
    {
        // We first find the right bucket by (relatively) quickly
        // counting the number in each bucket until we hit N.
        (
            bool bucketFound,
            uint256 bucketIndex,
            uint256 count
        ) = indexOfNthBucket(bitmap, n, indexLimit);

        if (!bucketFound) {
            return (false, 0);
        }

        // Now find the position within that bucket.
        // This walks through the 256 bits in the bucket until it finds the Nth item.
        // TODO: for small (n - count), consider a more performant divide-count technique.
        //       e.g. split the bits in half, count the # in each side (using fast method), repeat

        uint256 bucketData = bitmap._data[bucketIndex];
        // NOTE: count is already initialized to the count at the start of the bucket.
        for (uint256 i = 0; i < 256; i++) {
            if (bucketData & 1 != 0) {
                count++;
                if (count == n) {
                    return (true, i + bucketIndex * 256);
                }
            }
            bucketData >>= 1;
        }

        // NOTE: this is unreachable code (because we already found it at the bucket-level).
        return (false, 0);
    }

    // This finds the bucket containing the Nth bit that is "on".
    // NOTE: this has performance characteristics similar to #count()
    // TODO: consider gas checks
    function indexOfNthBucket(
        BitMaps.BitMap storage bitmap,
        uint256 n,
        uint256 indexLimit
    )
        internal
        view
        returns (
            // Weather we hit the Nth set bit.
            bool found,
            // If found, the bucketIndex it was found inside.
            uint256 bucketIndex,
            // If found, the # of set bits prior to bucketIndex.
            // This is useful when we begin looking inside bucketIndex for the Nth item.
            uint256 bucketStartCount
        )
    {
        found = false;
        bucketIndex = 0;
        bucketStartCount = 0;
        uint256 count = 0;
        uint256 bucketLimit = ((indexLimit - 1) >> 8) + 1;
        while (bucketIndex < bucketLimit) {
            uint256 bucketData = bitmap._data[bucketIndex];
            bucketStartCount = count;
            while (bucketData != 0) {
                bucketData &= (bucketData - 1);
                count++;
                if (count == n) {
                    found = true;
                    return (found, bucketIndex, bucketStartCount);
                }
            }
            bucketIndex++;
        }
        return (found, bucketIndex, bucketStartCount);
    }
}
