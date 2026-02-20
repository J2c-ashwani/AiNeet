import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase URL or Anon Key not set. Storage features will not work.');
}

// Singleton client
let supabase = null;

export function getSupabase() {
    if (!supabase && supabaseUrl && supabaseAnonKey) {
        supabase = createClient(supabaseUrl, supabaseAnonKey);
    }
    return supabase;
}

// Storage bucket name for NCERT books
const NCERT_BUCKET = 'ncert-books';

/**
 * Upload a file to Supabase Storage
 * @param {Buffer} buffer - File content
 * @param {string} fileName - Destination filename in bucket
 * @param {string} contentType - MIME type (e.g. 'application/pdf')
 * @returns {Promise<{ url: string, path: string }>}
 */
export async function uploadFile(buffer, fileName, contentType = 'application/pdf') {
    const client = getSupabase();
    if (!client) throw new Error('Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');

    const filePath = `books/${fileName}`;

    const { data, error } = await client.storage
        .from(NCERT_BUCKET)
        .upload(filePath, buffer, {
            contentType,
            upsert: true
        });

    if (error) {
        console.error('Supabase upload error:', error);
        throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = client.storage
        .from(NCERT_BUCKET)
        .getPublicUrl(filePath);

    return {
        url: urlData.publicUrl,
        path: filePath
    };
}

/**
 * Delete a file from Supabase Storage
 * @param {string} filePath - Path within the bucket
 */
export async function deleteFile(filePath) {
    const client = getSupabase();
    if (!client) return;

    const { error } = await client.storage
        .from(NCERT_BUCKET)
        .remove([filePath]);

    if (error) console.error('Supabase delete error:', error);
}

/**
 * List all files in the NCERT bucket
 */
export async function listFiles(folder = 'books') {
    const client = getSupabase();
    if (!client) return [];

    const { data, error } = await client.storage
        .from(NCERT_BUCKET)
        .list(folder, { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });

    if (error) {
        console.error('Supabase list error:', error);
        return [];
    }
    return data;
}
