import { MembershipLevel } from '../domain/membership';
import { ResourceCategory } from '../domain/resource-category';

export interface CrewLead {
  id: number;
  name: string;
  slot: number;
  createdAt: Date;
}

export interface NewCrewLead {
  name: string;
  apiKeyHash: string;
}

export interface CrewLeadRepository {
  findByApiKeyHash(apiKeyHash: string): Promise<CrewLead | null>;
  createWithNextSlot(input: NewCrewLead): Promise<CrewLead>;
}

export type PassengerStatus = 'ACTIVE' | 'INACTIVE';

export interface Passenger {
  id: number;
  name: string;
  membershipLevel: MembershipLevel;
  status: PassengerStatus;
  createdByCrewLeadId: number;
  createdAt: Date;
}

export interface NewPassenger {
  name: string;
  membershipLevel: MembershipLevel;
  apiKeyHash: string;
  createdByCrewLeadId: number;
}

export interface PassengerRepository {
  create(input: NewPassenger): Promise<Passenger>;
  findById(id: number): Promise<Passenger | null>;
  findByApiKeyHash(apiKeyHash: string): Promise<Passenger | null>;
  list(): Promise<Passenger[]>;
  deactivate(id: number): Promise<void>;
  updateMembershipLevel(id: number, level: MembershipLevel): Promise<void>;
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

export interface NewResource {
  name: string;
  category: ResourceCategory;
  minimumLevel: MembershipLevel;
  capacity: number;
  provisionedByCrewLeadId: number;
}

export interface ResourceRepository {
  create(input: NewResource): Promise<Resource>;
  findById(id: number): Promise<Resource | null>;
  listActive(): Promise<Resource[]>;
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

export interface NewUsageLog {
  passengerId: number;
  resourceId: number;
  passengerLevelAtUse: MembershipLevel;
  resourceMinLevelAtUse: MembershipLevel;
  outcome: UsageOutcome;
  denialReason: string | null;
}

export interface UsageLogRepository {
  create(input: NewUsageLog): Promise<UsageLog>;
  findByPassenger(passengerId: number, limit: number): Promise<UsageLog[]>;
}

export interface MembershipChange {
  id: number;
  passengerId: number;
  fromLevel: MembershipLevel;
  toLevel: MembershipLevel;
  changedByCrewLeadId: number;
  changedAt: Date;
}

export interface NewMembershipChange {
  passengerId: number;
  fromLevel: MembershipLevel;
  toLevel: MembershipLevel;
  changedByCrewLeadId: number;
}

export interface MembershipChangeRepository {
  create(input: NewMembershipChange): Promise<MembershipChange>;
}
