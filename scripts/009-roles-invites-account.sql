-- 009-roles-invites-account.sql
-- RBAC role expansion, organization invites, and account email-change columns.
-- Execute no Neon SQL Editor (Console > SQL Editor) apos o script 008.

-- 1) Migrar papel legado 'Member' para 'Viewer' (privilegio minimo).
UPDATE organization_members
SET role = 'Viewer', updated_at = NOW()
WHERE role = 'Member';

-- 2) Tabela de convites.
CREATE TABLE IF NOT EXISTS organization_invites (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  invited_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  expires_at TIMESTAMP NOT NULL,
  accepted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_org_invites_org_status
  ON organization_invites(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_org_invites_token_hash
  ON organization_invites(token_hash);

-- Apenas um convite "pending" por (organizacao, email).
CREATE UNIQUE INDEX IF NOT EXISTS uq_org_invites_pending
  ON organization_invites(organization_id, lower(email))
  WHERE status = 'pending';

-- 3) Colunas de conta / verificacao de e-mail.
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS pending_email VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_change_token_hash VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_change_expires_at TIMESTAMP;
