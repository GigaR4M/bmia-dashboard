-- VERIFICAÇÃO DE PERMISSÕES E RLS

-- 1. Verificar se RLS está ativo nas tabelas críticas
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('users', 'interaction_points');

-- 2. Listar Policies existentes
SELECT schemaname, tablename, policyname, cmd, roles, qual, with_check 
FROM pg_policies 
WHERE tablename IN ('users', 'interaction_points');

-- 3. TENTATIVA DE EXECUÇÃO COMO 'authenticated' (Simulando a API)
-- Isso vai nos provar se o RLS está bloqueando.
SET ROLE authenticated;

-- Tenta contar pontos (se der 0, o RLS está bloqueando)
SELECT 'Count as authenticated' as test, COUNT(*) FROM interaction_points;

-- Tenta rodar a função
SELECT * FROM get_ranking_history(1327836427915886643::bigint, 30, 5);

-- Volta para admin
RESET ROLE;
