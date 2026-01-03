
// require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log(`URL Found: ${!!supabaseUrl}`);
console.log(`Key Found: ${!!supabaseServiceKey}`);

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing credentials in dashboard .env");
    process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function testRpc() {
    const guildId = '1327836427915886643';
    console.log(`Testing RPC for guild: ${guildId}`);

    // Test get_daily_message_stats
    const { data: dailyData, error: dailyError } = await supabaseAdmin.rpc('get_daily_message_stats', {
        p_guild_id: guildId,
        p_days: 30,
        p_timezone: 'America/Sao_Paulo',
        p_start_date: null
    });

    if (dailyError) {
        console.error('get_daily_message_stats Error:', dailyError);
    } else {
        console.log(`get_daily_message_stats rows: ${dailyData ? dailyData.length : 0}`);
        if (dailyData && dailyData.length > 0) console.log(dailyData[0]);
    }
}

testRpc();
