/**
 * Backup Error Logger — writes to error_logs table
 * Serves as fall-through monitoring when Sentry quota is exhausted
 */

export async function logError(supabase, { userId, route, method, error, metadata = {} }) {
    try {
        const errorLogs = supabase.from('error_logs');
        const { error: insertError } = await errorLogs.insert({
            user_id: userId || null,
            route: route || 'unknown',
            method: method || 'UNKNOWN',
            error_message: error?.message || String(error),
            error_stack: error?.stack?.substring(0, 2000) || null,
            severity: 'error',
            metadata,
            created_at: new Date().toISOString()
        });
        if (insertError) throw insertError;
    } catch (logErr) {
        console.error('[ERROR_LOGGER_FAILED]', logErr.message);
    }
}
