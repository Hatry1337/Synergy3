/*
          +--------------------------------------------------------------------+
          | Unified ID Binary Structure                                        |
          +--------------------------------------------------------------------+
          | 64                                           20    15            0 |
          | 11111111111111111111111111111111111111111111 11111 111111111111111 |
          +--------------------------------------------------------------------+

          +------------------------------------------------------------------------------------------+
          | Unified ID components description                                                        |
          +---------+--------------------------------------------------------------------------------+
          | [64-20] | Milliseconds from RainbowBOT Epoch (April 28 of 2019 TZ=GMT+0 - 1556409600000) |
          +---------+--------------------------------------------------------------------------------+
          | [20-15] | Associated data type:                                                          |
          |         |   0 - Reserved                                                                 |
          |         |   1 - Any data                                                                 |
          |         |   2 - User                                                                     |
          |         |   3 - Discord Guild                                                            |
          |         |   4 - Discord Channel                                                          |
          |         |   5 - Other channel                                                            |
          |         |   ...                                                                          |
          +---------+--------------------------------------------------------------------------------+
          | [15-00] | Increment number                                                               |
          +---------+--------------------------------------------------------------------------------+
 */

export const RainbowBOTEpoch = 1556409600000;

export enum UnifiedIdDataType {
    RESERVED        = 0,
    AnyData         = 1,
    User            = 2,
    DiscordGuild    = 3,
    DiscordChannel  = 4,
    OtherChannel    = 5,
}

export type UnifiedIdString = string;

export class UnifiedId {
    private static increment = 0;
    public static generate(dataType: UnifiedIdDataType = UnifiedIdDataType.AnyData, milliseconds?: number, increment?: number) {
        if(milliseconds === undefined) {
            milliseconds = new Date().getTime() - RainbowBOTEpoch;
        }
        if(increment === undefined) {
            UnifiedId.increment++;
            if(UnifiedId.increment >= 32768) {
                UnifiedId.increment = 0;
            }
            increment = UnifiedId.increment;
        }

        return  BigInt(increment) +
                (BigInt(dataType) << 15n) +
                (BigInt(milliseconds) << 20n)
    }

    public static parse(id: bigint) {
        let milliseconds = id >> 20n;
        let dataType = (id - (milliseconds << 20n)) >> 15n;
        let increment = (id - (milliseconds << 20n) - (dataType << 15n));

        return {
            milliseconds: Number(milliseconds),
            dataType: Number(dataType) as UnifiedIdDataType,
            increment: Number(increment)
        }
    }
}