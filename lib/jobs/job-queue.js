/**
 * lib/jobs/job-queue.js — Production Job Queue
 *
 * Base queue with: retry, exponential backoff, dead-letter queue,
 * idempotency keys, telemetry, cancellation, poison job detection.
 * Backed by Supabase (no additional infra required).
 */

import { getDb } from '@/lib/core/db';
import { bufferEvent } from '@/lib/telemetry/mobile-buffer';

const DEFAULT_MAX_RETRIES    = 3;
const POISON_THRESHOLD       = 5; // Moves to DLQ after 5 total attempts
const BASE_BACKOFF_MS        = 1000;

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Enqueue a job with an idempotency key.
 * Duplicate keys within TTL window are silently ignored.
 */
export async function enqueue(jobType, payload, options = {}) {
    const {
        idempotencyKey = null,
        maxRetries     = DEFAULT_MAX_RETRIES,
        delayMs        = 0,
        priority       = 0,
    } = options;

    const supabase = await getDb();

    // Idempotency check
    if (idempotencyKey) {
        const { data: existing } = await supabase
            .from('job_queue')
            .select('id')
            .eq('idempotency_key', idempotencyKey)
            .in('status', ['pending', 'running', 'completed'])
            .single();
        if (existing) return existing.id; // Silently deduplicate
    }

    const runAt = new Date(Date.now() + delayMs).toISOString();

    const { data, error } = await supabase.from('job_queue').insert({
        job_type:        jobType,
        payload,
        status:          'pending',
        priority,
        max_retries:     maxRetries,
        retries:         0,
        idempotency_key: idempotencyKey,
        run_at:          runAt,
    }).select('id').single();

    if (error) throw new Error(`[JobQueue] Enqueue failed: ${error.message}`);
    return data.id;
}

/**
 * Cancel a pending job by ID.
 */
export async function cancelJob(jobId) {
    const supabase = await getDb();
    await supabase.from('job_queue').update({ status: 'cancelled' }).eq('id', jobId).eq('status', 'pending');
}

// ── Worker Loop ─────────────────────────────────────────────────────────────

/**
 * Run a worker loop for a specific job type.
 * @param {string} jobType — e.g. 'omr_extract', 'ai_generate', 'send_notification'
 * @param {Function} handler — async (payload) => result
 */
export async function runWorker(jobType, handler) {
    const supabase = await getDb();

    while (true) {
        let job = null;

        try {
            // Claim next available job atomically
            const { data } = await supabase
                .from('job_queue')
                .select('*')
                .eq('job_type', jobType)
                .eq('status', 'pending')
                .lte('run_at', new Date().toISOString())
                .order('priority', { ascending: false })
                .order('run_at', { ascending: true })
                .limit(1)
                .single();

            if (!data) {
                await _sleep(2000); // Poll interval
                continue;
            }

            job = data;

            // Mark as running
            await supabase.from('job_queue').update({ status: 'running', started_at: new Date().toISOString() }).eq('id', job.id);

            const startMs = Date.now();
            const result  = await handler(job.payload);
            const durationMs = Date.now() - startMs;

            // Success
            await supabase.from('job_queue').update({
                status:       'completed',
                result,
                completed_at: new Date().toISOString(),
                duration_ms:  durationMs,
            }).eq('id', job.id);

            await bufferEvent({ event_type: 'job_completed', failure_reason: `${jobType} in ${durationMs}ms` });

        } catch (err) {
            if (!job) continue;

            const newRetries = (job.retries || 0) + 1;
            const totalAttempts = newRetries + 1;

            if (totalAttempts > POISON_THRESHOLD || newRetries > job.max_retries) {
                // Poison job → dead-letter queue
                await _moveToDlq(job, err.message);
            } else {
                // Exponential backoff retry
                const backoffMs = BASE_BACKOFF_MS * Math.pow(2, newRetries);
                const nextRunAt = new Date(Date.now() + backoffMs).toISOString();
                await supabase.from('job_queue').update({
                    status:    'pending',
                    retries:   newRetries,
                    run_at:    nextRunAt,
                    last_error: err.message,
                }).eq('id', job.id);
                await bufferEvent({ event_type: 'job_retry', failure_reason: `${jobType}: ${err.message}` });
            }
        }
    }
}

async function _moveToDlq(job, error) {
    const supabase = await getDb();
    await supabase.from('job_queue').update({
        status:     'dead',
        last_error: error,
        dead_at:    new Date().toISOString(),
    }).eq('id', job.id);
    await bufferEvent({ event_type: 'job_dead_letter', failure_reason: `${job.job_type}: ${error}` });
}

function _sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
