CREATE TABLE regions (
  id CHAR(3) PRIMARY KEY,
  name_en VARCHAR UNIQUE NOT NULL,
  name_bg VARCHAR UNIQUE NOT NULL,
  region_center_id CHAR(5) NOT NULL
);

CREATE TABLE municipalities (
  id CHAR(5) PRIMARY KEY,
  name_en VARCHAR NOT NULL,
  name_bg VARCHAR NOT NULL,
  region_id CHAR(3) NOT NULL,
  municipality_center_id CHAR(5) NOT NULL
);

CREATE TABLE townhalls (
  id CHAR(8) PRIMARY KEY,
  name_en VARCHAR NOT NULL,
  name_bg VARCHAR NOT NULL,
  municipality_id CHAR(5) NOT NULL,
  townhall_center_id CHAR(5) NOT NULL
);

CREATE TABLE towns (
  id CHAR(5) PRIMARY KEY,
  type VARCHAR(4) NOT NULL CHECK (type IN ('с.', 'гр.', 'ман.')),
  name_en VARCHAR NOT NULL,
  name_bg VARCHAR NOT NULL,
  townhall_id CHAR(8),
  municipality_id CHAR(5) NOT NULL
);


ALTER TABLE regions
  ADD CONSTRAINT fk_regions_center
  FOREIGN KEY (region_center_id)
  REFERENCES towns(id)
  DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE municipalities
  ADD CONSTRAINT fk_municipalities_region
  FOREIGN KEY (region_id)
  REFERENCES regions(id)
  ON DELETE CASCADE
  DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE municipalities
  ADD CONSTRAINT fk_municipalities_center
  FOREIGN KEY (municipality_center_id)
  REFERENCES towns(id)
  DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE townhalls
  ADD CONSTRAINT fk_townhalls_municipality
  FOREIGN KEY (municipality_id)
  REFERENCES municipalities(id)
  ON DELETE CASCADE
  DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE townhalls
  ADD CONSTRAINT fk_townhalls_center
  FOREIGN KEY (townhall_center_id)
  REFERENCES towns(id)
  DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE towns
  ADD CONSTRAINT fk_towns_townhall
  FOREIGN KEY (townhall_id)
  REFERENCES townhalls(id)
  ON DELETE SET NULL
  DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE towns
  ADD CONSTRAINT fk_towns_municipality
  FOREIGN KEY (municipality_id)
  REFERENCES municipalities(id)
  ON DELETE CASCADE
  DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX idx_municipalities_region_id ON municipalities(region_id);
CREATE INDEX idx_townhalls_municipality_id ON townhalls(municipality_id);
CREATE INDEX idx_towns_townhall_id ON towns(townhall_id);
CREATE INDEX idx_towns_municipality_id ON towns(municipality_id);
