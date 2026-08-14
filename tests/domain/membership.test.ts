import { MembershipLevel, canAccess } from '../../src/domain/membership';

const LEVELS = [MembershipLevel.SILVER, MembershipLevel.GOLD, MembershipLevel.PLATINUM];

const EXPECTED: Record<MembershipLevel, Record<MembershipLevel, boolean>> = {
  [MembershipLevel.SILVER]: {
    [MembershipLevel.SILVER]: true,
    [MembershipLevel.GOLD]: false,
    [MembershipLevel.PLATINUM]: false,
  },
  [MembershipLevel.GOLD]: {
    [MembershipLevel.SILVER]: true,
    [MembershipLevel.GOLD]: true,
    [MembershipLevel.PLATINUM]: false,
  },
  [MembershipLevel.PLATINUM]: {
    [MembershipLevel.SILVER]: true,
    [MembershipLevel.GOLD]: true,
    [MembershipLevel.PLATINUM]: true,
  },
};

describe('canAccess', () => {
  it.each(
    LEVELS.flatMap((passengerLevel) =>
      LEVELS.map((resourceMinLevel) => ({
        passengerLevel,
        resourceMinLevel,
        expected: EXPECTED[passengerLevel][resourceMinLevel],
      })),
    ),
  )(
    'passenger=$passengerLevel resourceMin=$resourceMinLevel -> $expected',
    ({ passengerLevel, resourceMinLevel, expected }) => {
      expect(canAccess(passengerLevel, resourceMinLevel)).toBe(expected);
    },
  );
});
