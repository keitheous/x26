import { MembershipLevel } from '../domain/membership';
import { ResourceCategory } from '../domain/resource-category';

export interface CrewLead {
  id: number;
  name: string;
  apiKeyHash: string;
  slot: number;
  createdAt: Date;
}

export type PassengerStatus = 'ACTIVE' | 'INACTIVE';

export interface Passenger {
  id: number;
  name: string;
  membershipLevel: MembershipLevel;
  status: PassengerStatus;
  apiKeyHash: string;
  createdByCrewLeadId: number;
  createdAt: Date;
}

export type ResourceStatus = 'ACTIVE' | 'DECOMMISSIONED';

export interface Resource {
  id: number;
  name: string;
  category: ResourceCategory;
  minimumLevel: MembershipLevel;
  capacity: number;
  status: ResourceStatus;
  provisionedByCrewLeadId: number;
  createdAt: Date;
}

export type UsageOutcome = 'GRANTED' | 'DENIED';

export interface UsageLog {
  id: number;
  passengerId: number;
  resourceId: number;
  passengerLevelAtUse: MembershipLevel;
  resourceMinLevelAtUse: MembershipLevel;
  outcome: UsageOutcome;
  denialReason: string | null;
  occurredAt: Date;
}

export interface MembershipChange {
  id: number;
  passengerId: number;
  fromLevel: MembershipLevel;
  toLevel: MembershipLevel;
  changedByCrewLeadId: number;
  changedAt: Date;
}