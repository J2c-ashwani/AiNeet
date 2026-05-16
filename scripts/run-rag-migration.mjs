#!/usr/bin/env node
/**
 * scripts/run-rag-migration.mjs
 * Runs the NCERT RAG Enterprise Schema via Supabase REST API (rpc/sql)
 * Uses service role key — bypasses direct TCP which is blocked locally.
 */
import 'dotenv/config';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const headers = {
    'apikey':        SERVICE_KEY,
    'Authorization': 'Bearer ' + SERVICE_KEY,
    'Content-Type':  'application/json',
    'Prefer':        'return=minimal',
};

async function sql(query, description) {
    process.stdout.write(`  ${description}... `);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/execute_sql`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ sql_query: query }),
    });
    
    if (res.ok) {
        console.log('✓');
        return true;
    }

    // Supabase doesn't expose raw SQL exec via REST by default.
    // We'll use the Management API instead.
    const err = await res.text();
    console.log('⚠ (see below)');
    console.log('   Response:', err.substring(0, 200));
    return false;
}

// Use Supabase Management API to run raw SQL
async function runSQL(sqlText, description) {
    process.stdout.write(`  ${description}... `);
    
    const projectRef = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '');
    const mgmtUrl = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;
    
    const res = await fetch(mgmtUrl, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + SERVICE_KEY,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: sqlText }),
    });

    if (res.ok) {
        console.log('✓');
        return true;
    }
    
    // Fallback: try the pg endpoint
    const text = await res.text();
    console.log(`✗ (${res.status})`);
    return false;
}

// Alternative: use Supabase's pg proxy via REST
async function checkTable(tableName) {
    const res = await fetch(
        `${SUPABASE_URL}/rest/v1/${tableName}?select=count&limit=1`,
        { headers }
    );
    return res.ok;
}

async function checkExtension(extname) {
    const res = await fetch(
        `${SUPABASE_URL}/rest/v1/rpc/check_extension?ext_name=${extname}`,
        { method: 'POST', headers, body: '{}' }
    );
    return res.ok;
}

async function main() {
    console.log('\n🚀 NCERT RAG Enterprise Migration Runner');
    console.log(`   Supabase: ${SUPABASE_URL}`);
    
    // Step 1: Check existing tables
    console.log('\n📋 Pre-flight checks...');
    
    const questionsOK = await checkTable('questions');
    console.log(`  questions table:         ${questionsOK ? '✓' : '✗'}`);
    
    const embeddingsExists = await checkTable('ncert_embeddings');
    console.log(`  ncert_embeddings table:  ${embeddingsExists ? 'EXISTS (skip create)' : 'NOT FOUND (will create)'}`);
    
    const ragExpExists = await checkTable('rag_explanations');
    console.log(`  rag_explanations table:  ${ragExpExists ? 'EXISTS (skip create)' : 'NOT FOUND (will create)'}`);
    
    const reviewQueueExists = await checkTable('rag_teacher_review_queue');
    console.log(`  rag_teacher_review_queue: ${reviewQueueExists ? 'EXISTS (skip create)' : 'NOT FOUND (will create)'}`);
    
    if (!questionsOK) {
        console.error('\n❌ Cannot connect to database. Check SERVICE_ROLE_KEY.');
        process.exit(1);
    }
    
    console.log('\n📋 Migration Status:');
    
    if (embeddingsExists && ragExpExists && reviewQueueExists) {
        console.log('  ✅ All RAG tables already exist. Schema is up to date.');
        console.log('\n  To re-run from scratch, drop tables first via Supabase SQL editor.\n');
    } else {
        console.log('\n⚠️  MANUAL STEP REQUIRED');
        console.log('══════════════════════════════════════════════════════════════');
        console.log('The migration SQL must be run in Supabase SQL Editor because:');
        console.log('• Direct TCP (port 5432) is blocked on this network');
        console.log('• Supabase REST API does not allow raw DDL statements');
        console.log('\n📋 ACTION: Go to → https://supabase.com/dashboard/project/lfwnrehqjiwpfoylhmby/sql');
        console.log('   Paste the contents of:');
        console.log('   scripts/migrations/001_ncert_rag_enterprise.sql');
        console.log('   and click RUN.\n');
        console.log('══════════════════════════════════════════════════════════════');
    }
    
    // Verify embedding pipeline readiness
    console.log('\n🔍 Embedding Pipeline Readiness:');
    const geminiKey = !!process.env.GEMINI_API_KEY;
    console.log(`  GEMINI_API_KEY:          ${geminiKey ? '✓ Set' : '✗ Missing'}`);
    console.log(`  SUPABASE_SERVICE_ROLE_KEY: ${!!SERVICE_KEY ? '✓ Set' : '✗ Missing'}`);
    console.log(`  DATABASE_URL:            ${process.env.DATABASE_URL ? '✓ Set (TCP blocked locally)' : '✗ Missing'}`);
    
    if (embeddingsExists) {
        // Count existing embeddings
        const res = await fetch(
            `${SUPABASE_URL}/rest/v1/ncert_embeddings?select=count`,
            { headers }
        );
        if (res.ok) {
            const data = await res.json();
            const count = data[0]?.count || 0;
            console.log(`\n📊 Current embeddings in DB: ${count}`);
            if (count === 0) {
                console.log('   → Run: node scripts/embed-ncert-chunks.mjs --dry-run (to test first)');
                console.log('   → Run: node scripts/embed-ncert-chunks.mjs --subject biology (to embed one subject)');
            }
        }
    }
    
    console.log('\n✅ Migration runner complete.\n');
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
