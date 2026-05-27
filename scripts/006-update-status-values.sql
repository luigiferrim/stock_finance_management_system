-- Atualizar valores padrão de status e adicionar check constraint
ALTER TABLE lots DROP CONSTRAINT IF EXISTS lots_status_check;

-- Atualizar status existentes para o novo padrão antes de aplicar a constraint
UPDATE lots
SET status = 'Em Estoque'
WHERE status = 'active'
   OR status IS NULL
   OR status NOT IN ('Encomendado', 'Chegou', 'Em Estoque', 'Embalado', 'Vendido');

ALTER TABLE lots ALTER COLUMN status SET DEFAULT 'Em Estoque';

-- Adicionar constraint para validar valores de status
ALTER TABLE lots ADD CONSTRAINT lots_status_check 
  CHECK (status IN ('Encomendado', 'Chegou', 'Em Estoque', 'Embalado', 'Vendido'));
