/**
 * lib/alert.js
 * Sends critical business alerts to a Discord or Slack webhook.
 */

import { checkedFetch } from './http';

export async function sendCriticalAlert(title, message, context = {}) {
    try {
        const webhookUrl = process.env.DISCORD_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL;
        
        if (!webhookUrl) {
            console.warn('[Alert] Webhook URL not configured. Cannot send alert:', title);
            return;
        }

        const payload = {
            embeds: [
                {
                    title: `🚨 CRITICAL: ${title}`,
                    description: message,
                    color: 16711680, // Red
                    fields: Object.entries(context).map(([key, value]) => ({
                        name: key,
                        value: typeof value === 'object' ? JSON.stringify(value).slice(0, 1024) : String(value).slice(0, 1024),
                        inline: true
                    })),
                    timestamp: new Date().toISOString()
                }
            ]
        };

        // Slack format fallback if it's a Slack URL
        if (webhookUrl.includes('slack.com')) {
            const slackPayload = {
                text: `🚨 CRITICAL: *${title}*\n${message}\n\nContext:\n\`\`\`${JSON.stringify(context, null, 2)}\`\`\``
            };
            await checkedFetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(slackPayload)
            }, {
                errorMessage: 'Failed to send Slack alert',
            });
            return;
        }

        // Default Discord payload
        await checkedFetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }, {
            errorMessage: 'Failed to send Discord alert',
        });

    } catch (err) {
        console.error('[Alert] Failed to send critical alert:', err);
    }
}
