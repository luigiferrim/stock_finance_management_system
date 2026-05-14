-- Script para adicionar colunas faltantes na tabela lots
-- Execute este script no Neon SQL Editor se houver erro de "column does not exist"

-- Adicionar coluna supplier (se não existir)
ALTER TABLE lots ADD COLUMN IF NOT EXISTS supplier VARCHAR(255);

-- Adicionar coluna variety (se não existir)
ALTER TABLE lots ADD COLUMN IF NOT EXISTS variety VARCHAR(255);

-- Adicionar coluna process (se não existir)
ALTER TABLE lots ADD COLUMN IF NOT EXISTS process VARCHAR(255);

-- Adicionar coluna roast_date (se não existir)
ALTER TABLE lots ADD COLUMN IF NOT EXISTS roast_date TIMESTAMP;

-- Verificar estrutura final
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'lots' 
ORDER BY ordinal_position;
