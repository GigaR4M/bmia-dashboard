-- TESTE FINAL: CHAMADA DIRETA DA FUNÇÃO E DATAS

-- 1. Verificar datas dos pontos do usuário Top 1 (Para entender por que apareceu 0 na simulação)
-- Isso nos dirá se os pontos são todos recentes (pós 25/Nov/2025).
SELECT 
    'Check Dates for User' as description, 
    u.username, 
    MIN(ip.created_at) as first_point, 
    MAX(ip.created_at) as last_point, 
    COUNT(*) as total_points,
    SUM(ip.points) as sum_points
FROM users u
JOIN interaction_points ip ON u.user_id = ip.user_id
WHERE u.username = 'kaick175' -- Substitua se necessário, mas esse existia no print anterior
GROUP BY u.username, u.user_id
UNION ALL
-- 2. CHAMAR A FUNÇÃO DIRETAMENTE
-- Se isto retornar linhas, a função está consertada e o erro é na API (código).
-- Se não retornar linhas, o erro é na função (mesmo a simulação tendo funcionado).
-- Passando um ID de guild qualquer (pois o filtro está desligado)
-- Passando 30 dias e limite 10.
SELECT 
    'Function Result' as description,
    f.username,
    f.date::timestamp, -- cast para compatibilidade no UNION
    NULL::timestamp, 
    f.rank, 
    f.total_points
FROM get_ranking_history(1327836427915886643::bigint, 30, 10) f
LIMIT 20;
