-- Script para corrigir o problema da coluna 'unit' que não existe mais
-- Execute este script no Neon SQL Editor

-- Remover a coluna 'unit' se existir (ela não é mais usada)
ALTER TABLE lots DROP COLUMN IF EXISTS unit;

-- Garantir que todas as outras colunas estejam corretas
-- Se a tabela já existir, adicionar as colunas que podem estar faltando

DO $$ 
BEGIN
  -- Adicionar coluna supplier se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='lots' AND column_name='supplier') THEN
    ALTER TABLE lots ADD COLUMN supplier VARCHAR(255);
  END IF;

  -- Adicionar coluna variety se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='lots' AND column_name='variety') THEN
    ALTER TABLE lots ADD COLUMN variety VARCHAR(255);
  END IF;

  -- Adicionar coluna process se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='lots' AND column_name='process') THEN
    ALTER TABLE lots ADD COLUMN process VARCHAR(255);
  END IF;

  -- Adicionar coluna roast_date se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='lots' AND column_name='roast_date') THEN
    ALTER TABLE lots ADD COLUMN roast_date TIMESTAMP;
  END IF;
END $$;
