-- SCRIPTS DE DEBUG PARA INVESTIGAR "SEM DADOS" NO GRÁFICO DE POSIÇÕES

-- 1. Verificar se existem pontos na tabela interaction_points
-- Se retornar 0, a tabela está vazia.
SELECT COUNT(*) as total_points FROM interaction_points;

-- 2. Verificar o intervalo de datas dos pontos
-- Importante para saber se p_days=30 ou p_days=365 cobre os dados existentes.
SELECT 
    MIN(created_at) as first_point, 
    MAX(created_at) as last_point 
FROM interaction_points;

-- 3. Verificar os Top 10 usuários (Query interna da função)
-- Se esta query não retornar nada, o problema está na seleção inicial dos usuários.
SELECT u.user_id, u.username, SUM(ip.points) as total_points
FROM users u
INNER JOIN interaction_points ip ON u.user_id = ip.user_id
WHERE u.is_bot = FALSE
GROUP BY u.user_id, u.username
ORDER BY SUM(ip.points) DESC
LIMIT 10;

-- 4. Simular a query principal com um dos user_id retornados acima
-- Substitua 'SEU_USER_ID_AQUI' por um ID retornado na query 3, se houver.
-- Isso verifica se a lógica de datas e join está correta para um usuário específico.
-- SELECT 
--     ip.user_id,
--     u.username,
--     (ip.created_at::DATE) as point_date,
--     SUM(ip.points) as daily_points
-- FROM interaction_points ip
-- JOIN users u ON ip.user_id = u.user_id
-- WHERE ip.user_id = 'SEU_USER_ID_AQUI'
-- GROUP BY 1, 2, 3
-- ORDER BY point_date DESC;

-- 5. Verificar distribuição de Guild IDs (para entender o problema do filtro anterior)
-- Se retornar NULL ou vazio para guild_id, explica porque o filtro estava falhando.
SELECT guild_id, COUNT(*) as count
FROM interaction_points
GROUP BY guild_id;
