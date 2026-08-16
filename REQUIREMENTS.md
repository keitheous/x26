# Coding Challenge 1

## Spaceship X26: Passenger Resource Management System

## Mission Overview

Spaceship X26 is on a mission from Earth to Mars, carrying passengers who plan to settle on Mars. During the journey, passengers rely on various onboard resources such as sleeping pods, food supply stations, oxygen refill units, medical bays, hygiene pods, and fitness centers.

Three Crew Leads are responsible for managing passengers and the resources available inside the spaceship.

Passengers are assigned different membership levels, and access to resources depends on their level. The system must enforce access control rules while keeping track of resource usage.

**Your task:** Build a Passenger Resource Management System that allows Crew Leads to manage passengers/resources while allowing passengers to access permitted resources and track usage.

**Critical Infrastructure**

- Sleeping Pods
- Food Supply Stations
- Oxygen Refill Units
- Medical Bays
- Hygiene Pods & Fitness Centers

## Core Objective: Passenger Levels

Rule: Higher levels inherit lower-level access

| Level | Access | Resources |
| --- | --- | --- |
| Silver | Base tier access | Food Stations, Sleeping Pods, Basic Hygiene |
| Gold | Enhanced access | Private Cabins, Adv. Medical Bay, + All Silver |
| Platinum | Full ship access | Luxury O2 Pods, VIP Rec Deck, All Gold & Silver |

## Administrative Control: The Crew Lead Role

System integrity is maintained by exactly three Crew Leads. These administrators hold exclusive permissions to manage the ship's complex ecosystem.

Only Crew Leads are authorized to perform administrative tasks, ensuring a secure and controlled environment for all passengers.

**Exclusive Permissions**

- Create and manage passenger profiles
- Upgrade or downgrade membership levels
- Provision and decommission ship resources
- Monitor real-time activity and usage reports

## Passenger Experience: Seamless Interaction

Passengers interact with the PRMS through a streamlined interface designed for clarity and ease of use during the mission.

**Resource Discovery**
Instantly view all facilities available to your specific membership tier.

**Active Usage**
Seamlessly initiate the use of accessible resources with real-time validation.

## Level 1: Basic Passenger & Resource Management

**Crew Lead Enforcement**

Strict system validation to ensure exactly three administrators.

Categorizing all ship resources by their minimum required membership level.

**Resource Definition**

Enabling passengers to view a filtered list of accessible resources.

Enforces safe limits to prevent unauthorized administrative expansion.

**Passenger Discovery**

Establishing the base inventory for the mission.

Ensuring transparency in available life-support services.

## Level 2: Dynamic Access & Validation

The second phase introduces operational logic and state management, ensuring that resource usage is both secure and trackable.

This layer provides the Crew Leads with the tools to manage passenger tiers dynamically.

**Permission Validation**
Real-time checks performed before any resource is utilized to ensure strict adherence to membership rules.

**Tier Management**
Administrative tools for Crew Leads to upgrade or downgrade passenger levels based on mission requirements.

**Audit Logging**
Automatic recording of every resource interaction, creating a reliable audit trail for safety and reporting.

## Level 3: Advanced Reporting & Insights

The final phase focuses on data-driven oversight, providing both passengers and Crew Leads with deep insights into resource consumption.

This ensures mission-critical resources are monitored and optimized for the long journey to Mars.

**Personal History**
Detailed logs for passengers to track their own resource consumption and well-being trends.

**Aggregated Reports**
Summary views for Crew Leads, grouped by passenger level, to monitor ship-wide resource distribution.

**Usage Analytics**
Identifying high-demand resources like "Luxury Oxygen Pods" to prevent shortages.

## SUMMARY: ENSURING MISSION SUCCESS

By implementing the Spaceship X26 PRMS, we ensure that every settler has the resources they need to thrive. The system provides the Crew Leads with the tools to manage the ship's complex ecosystem while offering passengers a transparent and reliable way to access life-support services.
