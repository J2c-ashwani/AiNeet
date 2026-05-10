import * as Sentry from '@sentry/nextjs';
import { supabaseServiceRole } from '@/lib/supabase'; // assuming a service role exists, else we can skip DB backup

export const Logger = {
    // 1. Structured Server Logging for Failures
    error: (category, message, metadata = {}) => {
        console.error(`[${category}] ${message}`, metadata);
        
        Sentry.withScope((scope) => {
            scope.setTag('category', category);
            scope.setExtras(metadata);
            // Don't send sensitive user data
            if (metadata.user_id) scope.setUser({ id: metadata.user_id });
            
            Sentry.captureException(new Error(message));
        });
    },

    // 2. Critical Alerts (Use Sentry Tags to trigger Alerts in Sentry Dashboard)
    alert: (alertType, message, metadata = {}) => {
        console.error(`[CRITICAL_ALERT: ${alertType}] ${message}`, metadata);
        
        Sentry.withScope((scope) => {
            scope.setLevel('fatal');
            scope.setTag('alert_type', alertType);
            scope.setExtras(metadata);
            
            Sentry.captureMessage(`[ALERT] ${message}`);
        });
    },

    // 3. User Journey Tracking (Custom Events / Breadcrumbs)
    trackJourney: (step, status, metadata = {}) => {
        console.log(`[JOURNEY: ${step}] ${status}`, metadata);
        
        Sentry.addBreadcrumb({
            category: 'user_journey',
            message: step,
            level: status === 'success' ? 'info' : 'warning',
            data: metadata,
        });

        // For conversion tracking, you might want to log this as a specific transaction or event
        if (['signup_completion', 'otp_verification', 'test_generation', 'doubt_solver', 'payment_conversion'].includes(step)) {
            Sentry.captureMessage(`[Journey Metric] ${step}: ${status}`, {
                level: 'info',
                tags: { journey_step: step, journey_status: status },
                extra: metadata
            });
        }
    }
};

// Aliases for specific requested failure types
export const ServerLog = {
    apiFailure: (route, err, meta) => Logger.error('API_FAILURE', `API failed: ${route}`, { ...meta, error: err?.message }),
    webhookFailure: (type, err, meta) => Logger.alert('WEBHOOK_FAILED', `Webhook failed: ${type}`, { ...meta, error: err?.message }),
    authFailure: (type, err, meta) => Logger.error('AUTH_FAILURE', `Auth failed: ${type}`, { ...meta, error: err?.message }),
    otpDeliveryFailure: (email, err) => Logger.error('OTP_FAILURE', `OTP failed to deliver to masked email`, { error: err?.message, emailHash: email ? email.substring(0,3)+'***' : 'unknown' }),
    aiTimeout: (provider, err) => Logger.alert('AI_TIMEOUT', `AI Provider Timeout: ${provider}`, { error: err?.message })
};
