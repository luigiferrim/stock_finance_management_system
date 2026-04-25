-- Script para resetar manualmente as senhas dos usuários antigos
-- Execute este script APENAS se os usuários não conseguirem fazer login

-- Este script define uma senha temporária: "TrocaSenha123!"
-- Os usuários devem trocar após o primeiro login

-- IMPORTANTE: Substitua o hash abaixo pelo resultado de hashPassword("TrocaSenha123!")
-- Você pode gerar o hash executando este código Node.js:
-- 
-- const password = "TrocaSenha123!";
-- const salt = crypto.randomBytes(16);
-- const hash = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
-- console.log(`${salt.toString('hex')}:${hash.toString('hex')}`);

-- OU simplesmente crie um novo usuário de teste e use o mesmo hash

-- Para resetar todos os usuários antigos (formato SHA-256 sem ':'):
UPDATE users 
SET password = 'COLE_O_HASH_PBKDF2_AQUI'
WHERE password NOT LIKE '%:%';

-- Exemplo de uso:
-- UPDATE users 
-- SET password = 'a1b2c3d4e5f6...salt...:f9e8d7c6b5a4...hash...'
-- WHERE password NOT LIKE '%:%';

-- Verificar quais usuários têm formato antigo:
SELECT id, name, email, 
       CASE 
         WHEN password LIKE '%:%' THEN 'PBKDF2 (Seguro)'
         ELSE 'SHA-256 (Antigo - Precisa Migração)'
       END as formato_senha
FROM users;
