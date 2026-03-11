const { Client } = require('pg');

async function enableRealtime() {
    const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:Ashwani%407903@db.lfwnrehqjiwpfoylhmby.supabase.co:5432/postgres';
    const client = new Client({ connectionString: dbUrl });

    try {
        await client.connect();

        // Ensure publication exists (it always does in Supabase, but safe to check)
        const check = await client.query(`SELECT objid FROM pg_publication WHERE pubname = 'supabase_realtime';`);

        if (check.rowCount > 0) {
            console.log('Adding battlegrounds and battleground_participants to supabase_realtime publication...');
            try {
                // Try to add tables to the publication. If they are already in it, Postgres throws an error, so we catch it.
                await client.query(`ALTER PUBLICATION supabase_realtime ADD TABLE battlegrounds;`);
                console.log('- Added battlegrounds');
            } catch (e) { console.log('- battlegrounds already in publication or error: ' + e.message); }

            try {
                await client.query(`ALTER PUBLICATION supabase_realtime ADD TABLE battleground_participants;`);
                console.log('- Added battleground_participants');
            } catch (e) { console.log('- battleground_participants already in publication or error: ' + e.message); }

            console.log('Realtime successfully enabled for Game tables!');
        } else {
            console.error('publication "supabase_realtime" does not exist in this database.');
        }

    } catch (e) {
        console.error('Failed:', e);
    } finally {
        await client.end();
    }
}

enableRealtime();
