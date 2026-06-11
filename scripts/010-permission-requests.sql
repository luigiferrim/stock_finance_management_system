-- 010-permission-requests.sql
-- Tabela de solicitações de elevação de papel (issue #16).
-- Execute no Neon SQL Editor após o script 009.

CREATE TABLE IF NOT EXISTS permission_requests (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  requester_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  requested_role VARCHAR(50) NOT NULL,
  reason TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  reviewed_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_permission_requests_org_status
  ON permission_requests(organization_id, status);

CREATE INDEX IF NOT EXISTS idx_permission_requests_requester
  ON permission_requests(requester_user_id);

-- Apenas uma solicitação "pending" por (organização, usuário).
CREATE UNIQUE INDEX IF NOT EXISTS uq_permission_requests_pending
  ON permission_requests(organization_id, requester_user_id)
  WHERE status = 'pending';
