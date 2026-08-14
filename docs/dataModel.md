# Data Model

_PK: Primary Key_
_UK: Unique Key_
_FK: Foreign Key_

ERD:

- A CrewLead creates a Passenger
- A CrewLead provisions a Resource
- A CrewLead authorises a Membership Change
- A Usage Log is created for auditing purpose when a Passenger uses a Resource
- A Membership Change is created when a CrewLead updates a Passenger's membership

### CREW_LEAD
| Field| Type | Note |
| :--- | :--- | :--- |
| id     | int   | PK |
| slot     | int   | 1 to 3    |
| name     | string   | |
| apiKeyHash     | string | UK    |
| createdAt     | dateTime   | |

### PASSENGER
| Field| Type | Note |
| :--- | :--- | :--- |
| int     | id   | PK    |
| name     | string   | |
| membershipLevel     | enum   | "SILVER / GOLD / PLATINUM" |
| status     | enum | "ACTIVE / INACTIVE" |
| status     | enum | "ACTIVE / INACTIVE" |
| apiKeyHash     | string | UK |
| createdByCrewLeadId     | enum | FK |
| createdAt     | dateTime   | |

### RESOURCE
| Field| Type | Note |
| :--- | :--- | :--- |
| id     | int   | PK    |
| name     | string   | UK |
| category     | enum   |  |
| minimumLevel     | enum | "SILVER / GOLD / PLATINUM" |
| capacity     | int | |
| status     | enum | "ACTIVE / DECOMMISIONED" |
| provisionedByCrewLeadId     | int | FK |
| createdAt     | dateTime   | |

### USAGE_LOG
| Field| Type | Note |
| :--- | :--- | :--- |
| id     | bigint   | PK |
| passengerId     | int   | FK |
| resourceId     | int   | FK |
| passengerLevelAtUse     | enum   | Snapshot |
| resourceMinLevelAtUse     | enum   | Snapshot |
| outcome     | enum   | "GRANTED / DENIED" |
| denialReason     | string   | Nullable |
| occurredAt     | dateTime   | |

### MEMBERSHIP_CHANGE
| Field| Type | Note |
| :--- | :--- | :--- |
| id     | bigint   | PK |
| passengerId     | int   | FK |
| fromLevel     | enum   | |
| toLevel     | enum   | |
| changedByCrewLeadId     | int   | FK |
| changedAt     | dateTime   | |


KEITH TODOS:
- crew_leads
- usage_log
- Soft Deletes
- Indexes

- ERDs / Domain Model describe