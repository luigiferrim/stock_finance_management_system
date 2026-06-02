-- Criar base multi-organizacao e escopo de dados por organizacao.
-- Execute este script no Neon SQL Editor (Console > SQL Editor).

CREATE TABLE IF NOT EXISTS organizations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS organization_members (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'Member',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (organization_id, user_id)
);

ALTER TABLE lots ADD COLUMN IF NOT EXISTS organization_id INTEGER REFERENCES organizations(id);
ALTER TABLE logs ADD COLUMN IF NOT EXISTS organization_id INTEGER REFERENCES organizations(id);

CREATE INDEX IF NOT EXISTS idx_organizations_name ON organizations(name);
CREATE INDEX IF NOT EXISTS idx_organization_members_user_active ON organization_members(user_id, active);
CREATE INDEX IF NOT EXISTS idx_organization_members_org_active ON organization_members(organization_id, active);
CREATE INDEX IF NOT EXISTS idx_lots_organization_id ON lots(organization_id);
CREATE INDEX IF NOT EXISTS idx_logs_organization_id ON logs(organization_id);

DO $$
DECLARE
  legacy_user_id INTEGER;
  legacy_organization_id INTEGER;
BEGIN
  SELECT id
  INTO legacy_user_id
  FROM users
  ORDER BY id ASC
  LIMIT 1;

  IF legacy_user_id IS NOT NULL THEN
    SELECT om.organization_id
    INTO legacy_organization_id
    FROM organization_members om
    WHERE om.user_id = legacy_user_id
      AND om.active = TRUE
    ORDER BY om.id ASC
    LIMIT 1;

    IF legacy_organization_id IS NULL THEN
      INSERT INTO organizations (name, created_at, updated_at)
      VALUES ('Organizacao Legada', NOW(), NOW())
      RETURNING id INTO legacy_organization_id;
    END IF;

    INSERT INTO organization_members (organization_id, user_id, role, active, created_at, updated_at)
    VALUES (legacy_organization_id, legacy_user_id, 'Owner', TRUE, NOW(), NOW())
    ON CONFLICT (organization_id, user_id) DO UPDATE
    SET role = 'Owner',
        active = TRUE,
        updated_at = NOW();

    UPDATE lots
    SET organization_id = legacy_organization_id
    WHERE organization_id IS NULL;

    UPDATE logs
    SET organization_id = COALESCE(
      (
        SELECT lots.organization_id
        FROM lots
        WHERE lots.id = logs.lot_id
        LIMIT 1
      ),
      legacy_organization_id
    )
    WHERE organization_id IS NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM lots WHERE organization_id IS NULL) THEN
    ALTER TABLE lots ALTER COLUMN organization_id SET NOT NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM logs WHERE organization_id IS NULL) THEN
    ALTER TABLE logs ALTER COLUMN organization_id SET NOT NULL;
  END IF;
END $$;
