-- Atualizar valores padrão de status e adicionar check constraint
ALTER TABLE lots DROP CONSTRAINT IF EXISTS lots_status_check;

-- Adicionar constraint para validar valores de status
ALTER TABLE lots ADD CONSTRAINT lots_status_check 
  CHECK (status IN ('Encomendado', 'Chegou', 'Em Estoque', 'Embalado', 'Vendido'));

-- Atualizar status existentes para o novo padrão
UPDATE lots SET status = 'Em Estoque' WHERE status = 'active' OR status IS NULL;
