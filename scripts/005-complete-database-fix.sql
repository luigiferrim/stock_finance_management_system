-- Script completo para corrigir todas as colunas faltantes no banco de dados
-- Execute este script no Neon SQL Editor (Console > SQL Editor)

-- 1. Verificar e adicionar coluna lot_id na tabela logs (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'logs' AND column_name = 'lot_id'
  ) THEN
    ALTER TABLE logs ADD COLUMN lot_id INTEGER REFERENCES lots(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_logs_lot_id ON logs(lot_id);
    RAISE NOTICE 'Coluna lot_id adicionada à tabela logs';
  ELSE
    RAISE NOTICE 'Coluna lot_id já existe na tabela logs';
  END IF;
END $$;

-- 2. Remover coluna unit da tabela lots (se existir)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lots' AND column_name = 'unit'
  ) THEN
    ALTER TABLE lots DROP COLUMN unit;
    RAISE NOTICE 'Coluna unit removida da tabela lots';
  ELSE
    RAISE NOTICE 'Coluna unit não existe na tabela lots';
  END IF;
END $$;

-- 3. Adicionar coluna supplier (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lots' AND column_name = 'supplier'
  ) THEN
    ALTER TABLE lots ADD COLUMN supplier VARCHAR(255);
    RAISE NOTICE 'Coluna supplier adicionada à tabela lots';
  ELSE
    RAISE NOTICE 'Coluna supplier já existe na tabela lots';
  END IF;
END $$;

-- 4. Adicionar coluna variety (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lots' AND column_name = 'variety'
  ) THEN
    ALTER TABLE lots ADD COLUMN variety VARCHAR(255);
    RAISE NOTICE 'Coluna variety adicionada à tabela lots';
  ELSE
    RAISE NOTICE 'Coluna variety já existe na tabela lots';
  END IF;
END $$;

-- 5. Adicionar coluna process (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lots' AND column_name = 'process'
  ) THEN
    ALTER TABLE lots ADD COLUMN process VARCHAR(255);
    RAISE NOTICE 'Coluna process adicionada à tabela lots';
  ELSE
    RAISE NOTICE 'Coluna process já existe na tabela lots';
  END IF;
END $$;

-- 6. Adicionar coluna roast_date (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lots' AND column_name = 'roast_date'
  ) THEN
    ALTER TABLE lots ADD COLUMN roast_date TIMESTAMP;
    CREATE INDEX IF NOT EXISTS idx_lots_roast_date ON lots(roast_date);
    RAISE NOTICE 'Coluna roast_date adicionada à tabela lots';
  ELSE
    RAISE NOTICE 'Coluna roast_date já existe na tabela lots';
  END IF;
END $$;

-- 7. Criar índices úteis (se não existirem)
CREATE INDEX IF NOT EXISTS idx_lots_status ON lots(status);
CREATE INDEX IF NOT EXISTS idx_lots_category ON lots(category);
CREATE INDEX IF NOT EXISTS idx_logs_user_id ON logs(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at);

-- Verificar estrutura final das tabelas
SELECT 'Estrutura da tabela lots:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'lots' 
ORDER BY ordinal_position;

SELECT 'Estrutura da tabela logs:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'logs' 
ORDER BY ordinal_position;
