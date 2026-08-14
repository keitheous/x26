CREATE TABLE crew_leads (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(255) NOT NULL,
  api_key_hash CHAR(64)     NOT NULL,
  slot         TINYINT      NOT NULL,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_crew_leads_api_key_hash (api_key_hash),
  UNIQUE KEY uq_crew_leads_slot (slot),
  CONSTRAINT chk_crew_leads_slot CHECK (slot BETWEEN 1 AND 3)
) ENGINE = InnoDB;

CREATE TABLE passengers (
  id                      INT AUTO_INCREMENT PRIMARY KEY,
  name                    VARCHAR(255) NOT NULL,
  membership_level        ENUM ('SILVER', 'GOLD', 'PLATINUM') NOT NULL,
  status                  ENUM ('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  api_key_hash            CHAR(64) NOT NULL,
  created_by_crew_lead_id INT NOT NULL,
  created_at              DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_passengers_api_key_hash (api_key_hash),
  CONSTRAINT fk_passengers_created_by
    FOREIGN KEY (created_by_crew_lead_id) REFERENCES crew_leads (id)
) ENGINE = InnoDB;

CREATE TABLE resources (
  id                          INT AUTO_INCREMENT PRIMARY KEY,
  name                        VARCHAR(255) NOT NULL,
  category                    ENUM (
                                'SLEEPING_POD', 'FOOD_STATION', 'OXYGEN_UNIT', 'MEDICAL_BAY',
                                'HYGIENE_POD', 'FITNESS_CENTER', 'PRIVATE_CABIN', 'REC_DECK'
                              ) NOT NULL,
  minimum_level               ENUM ('SILVER', 'GOLD', 'PLATINUM') NOT NULL,
  capacity                    INT NOT NULL,
  status                      ENUM ('ACTIVE', 'DECOMMISSIONED') NOT NULL DEFAULT 'ACTIVE',
  provisioned_by_crew_lead_id INT NOT NULL,
  created_at                  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_resources_name (name),
  CONSTRAINT fk_resources_provisioned_by
    FOREIGN KEY (provisioned_by_crew_lead_id) REFERENCES crew_leads (id),
  CONSTRAINT chk_resources_capacity CHECK (capacity >= 0)
) ENGINE = InnoDB;

CREATE TABLE usage_log (
  id                        BIGINT AUTO_INCREMENT PRIMARY KEY,
  passenger_id              INT NOT NULL,
  resource_id               INT NOT NULL,
  passenger_level_at_use    ENUM ('SILVER', 'GOLD', 'PLATINUM') NOT NULL,
  resource_min_level_at_use ENUM ('SILVER', 'GOLD', 'PLATINUM') NOT NULL,
  outcome                   ENUM ('GRANTED', 'DENIED') NOT NULL,
  denial_reason             VARCHAR(255) NULL,
  occurred_at               DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_usage_log_passenger FOREIGN KEY (passenger_id) REFERENCES passengers (id),
  CONSTRAINT fk_usage_log_resource FOREIGN KEY (resource_id) REFERENCES resources (id),
  KEY idx_usage_log_passenger_occurred (passenger_id, occurred_at),
  KEY idx_usage_log_resource_occurred (resource_id, occurred_at),
  KEY idx_usage_log_level_occurred (passenger_level_at_use, occurred_at)
) ENGINE = InnoDB;

CREATE TABLE membership_changes (
  id                      BIGINT AUTO_INCREMENT PRIMARY KEY,
  passenger_id            INT NOT NULL,
  from_level              ENUM ('SILVER', 'GOLD', 'PLATINUM') NOT NULL,
  to_level                ENUM ('SILVER', 'GOLD', 'PLATINUM') NOT NULL,
  changed_by_crew_lead_id INT NOT NULL,
  changed_at              DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_membership_changes_passenger
    FOREIGN KEY (passenger_id) REFERENCES passengers (id),
  CONSTRAINT fk_membership_changes_changed_by
    FOREIGN KEY (changed_by_crew_lead_id) REFERENCES crew_leads (id)
) ENGINE = InnoDB;
