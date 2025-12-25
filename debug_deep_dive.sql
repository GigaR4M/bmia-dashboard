-- DEBUG DEEP DIVE
-- Execute is script para vermos exatamente ONDE a lógica quebra.

-- 1. Verificar Intervalo de Datas
SELECT 
    MIN(created_at) as data_minima, 
    MAX(created_at) as data_maxima, 
    NOW() as data_atual,
    (NOW() - INTERVAL '30 days') as trinta_dias_atras
FROM interaction_points;

-- 2. Verificar se a query de Top Users retorna algo (Igual à da função)
SELECT u.user_id, u.username, SUM(ip.points) as total_points
FROM users u
INNER JOIN interaction_points ip ON u.user_id = ip.user_id
WHERE u.is_bot = FALSE
GROUP BY u.user_id, u.username
ORDER BY SUM(ip.points) DESC
LIMIT 10;

-- 3. Bloco PL/pgSQL Simulado para testar a variável array (Olhe na aba MESSAGES/MENSAGENS após rodar)
DO $$
DECLARE
    v_top_users BIGINT[];
BEGIN
    SELECT ARRAY_AGG(top_u.user_id) INTO v_top_users
    FROM (
        SELECT u.user_id
        FROM users u
        INNER JOIN interaction_points ip ON u.user_id = ip.user_id
        WHERE u.is_bot = FALSE
        GROUP BY u.user_id
        ORDER BY SUM(ip.points) DESC
        LIMIT 10
    ) top_u;

    -- Se aparecer NULL aqui, a query de cima falhou
    RAISE NOTICE 'DEBUG: v_top_users = %', v_top_users;
END $$;
