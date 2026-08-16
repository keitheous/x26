export enum MembershipLevel {
  SILVER = 1,
  GOLD = 2,
  PLATINUM = 3,
}

export enum Role {
  CREW_LEAD = 'CREW_LEAD',
  PASSENGER = 'PASSENGER',
}

export function canAccess(
  passengerLevel: MembershipLevel,
  resourceMinLevel: MembershipLevel,
): boolean {
  return passengerLevel >= resourceMinLevel;
}
