-- Adicionar novos campos à tabela lots para café
ALTER TABLE lots ADD COLUMN IF NOT EXISTS variety VARCHAR(255);
ALTER TABLE lots ADD COLUMN IF NOT EXISTS process VARCHAR(255);
ALTER TABLE lots ADD COLUMN IF NOT EXISTS roast_date TIMESTAMP;

-- Renomear expiry_date para roast_date (se necessário migração de dados)
-- Como não temos dados em produção, apenas vamos usar roast_date como novo campo
