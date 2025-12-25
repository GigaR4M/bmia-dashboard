-- SCRIPT DE DIAGNÓSTICO DE JOIN (USUÁRIOS X PONTOS)

-- 1. Contar total de usuários
SELECT 'Total Users' as metric, COUNT(*) as value FROM users
UNION ALL
-- 2. Contar usuários que NÃO são robôs
SELECT 'Non-Bot Users', COUNT(*) FROM users WHERE is_bot = FALSE
UNION ALL
-- 3. Contar quantos usuários únicos têm pontos (independente se existe na tabela users)
SELECT 'Unique UserIDs in Points', COUNT(DISTINCT user_id) FROM interaction_points
UNION ALL
-- 4. Contar quantos desses fazem match na tabela users (JOIN)
SELECT 'Matched Users in JOIN', COUNT(DISTINCT u.user_id) 
FROM interaction_points ip
JOIN users u ON ip.user_id = u.user_id;

-- 5. Mostrar amostra de dados para verificação visual
-- Mostra 5 pontos e tenta dar match com o usuário
SELECT 
    ip.user_id as point_user_id, 
    u.user_id as user_table_id, 
    u.username, 
    u.is_bot
FROM interaction_points ip
LEFT JOIN users u ON ip.user_id = u.user_id
LIMIT 10;
