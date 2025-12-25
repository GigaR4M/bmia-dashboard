-- SIMULAÇÃO DA LÓGICA DA FUNÇÃO
-- Este script roda exatamente a mesma lógica que está dentro da função, mas como uma query normal.
-- Assim podemos ver se o problema é o SQL ou a Função.

WITH top_users_list AS (
    -- 1. IDENTIFICAR TOP USERS (Simulando a variável v_top_users)
    SELECT ARRAY_AGG(top_u.user_id) as u_ids
    FROM (
        SELECT u.user_id
        FROM users u
        INNER JOIN interaction_points ip ON u.user_id = ip.user_id
        WHERE u.is_bot = FALSE
        -- Filtro de Guild removido propositalmente
        GROUP BY u.user_id
        ORDER BY SUM(ip.points) DESC
        LIMIT 10
    ) top_u
),
dates AS (
    -- 2. GERAR DATAS (Simulando 30 dias atrás)
    SELECT generate_series(
        (NOW() - INTERVAL '30 days')::DATE,
        CURRENT_DATE,
        '1 day'::INTERVAL
    )::DATE as date
),
user_cross_dates AS (
    -- 3. CRUZAR USUÁRIOS E DATAS
    SELECT 
        d.date,
        u.user_id,
        u.username
    FROM dates d
    CROSS JOIN (
        -- Expande o array de usuários encontrado no passo 1
        SELECT u_tbl.user_id, u_tbl.username
        FROM users u_tbl
        JOIN top_users_list t ON TRUE
        WHERE u_tbl.user_id = ANY(t.u_ids)
    ) u
),
cumulative_points AS (
    -- 4. CALCULAR PONTOS ACUMULADOS
    SELECT
        ucd.date,
        ucd.user_id,
        ucd.username,
        (
            SELECT COALESCE(SUM(ip.points), 0)
            FROM interaction_points ip
            WHERE ip.user_id = ucd.user_id
            -- Filtro de Guild ignorado
            AND ip.created_at::DATE <= ucd.date
        ) as total_points_at_date
    FROM user_cross_dates ucd
)
SELECT
    cp.date,
    cp.user_id,
    cp.username,
    RANK() OVER (PARTITION BY cp.date ORDER BY cp.total_points_at_date DESC)::BIGINT as rank,
    cp.total_points_at_date::BIGINT as total_points
FROM cumulative_points cp
ORDER BY cp.date ASC, rank ASC;
