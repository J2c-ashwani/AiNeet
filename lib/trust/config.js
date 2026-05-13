/**
 * lib/trust/config.js
 * Central configuration for all Trust Layer signals.
 * No hardcoded trust labels are allowed in pages.
 */

export const TRUST_LEVELS = {
    // AI Confidence Bands
    AI_HIGH: {
        id: 'ai-high',
        label: "AI Reviewed • High Confidence",
        color: "#a78bfa", // Muted Purple
        bg: "rgba(167,139,250,0.10)"
    },
    AI_MODERATE: {
        id: 'ai-moderate',
        label: "AI Reviewed • Moderate Confidence",
        color: "#fbbf24", // Muted Amber
        bg: "rgba(251,191,36,0.10)"
    },
    AI_LOW: {
        id: 'ai-low',
        label: "AI Reviewed • Needs Verification",
        color: "#f87171", // Muted Red (desaturated)
        bg: "rgba(248,113,113,0.10)"
    },

    // Verified PYQ
    VERIFIED_PYQ: {
        id: 'verified-pyq',
        label: "Verified PYQ",
        color: "#60a5fa", // muted blue shield per MD direction
        bg: "rgba(96,165,250,0.10)"
    },

    // Recovery
    RECOVERY_SUCCESS: {
        id: 'recovery-success',
        label: "Recovered successfully after interruption",
        color: "#22c55e",
        bg: "rgba(34,197,94,0.10)"
    },

    // Teacher Reviewed
    TEACHER_REVIEWED: {
        id: 'teacher-reviewed',
        label: "Teacher Reviewed",
        color: "#10b981", // muted emerald
        bg: "rgba(16,185,129,0.10)"
    },

    // Autosave
    AUTOSAVE: {
        id: 'autosave',
        label: "Draft saved", // dynamically updated for time if needed
        color: "#10b981", // muted green
        bg: "rgba(16,185,129,0.10)"
    }
};

/**
 * Maps a raw ML/AI score (0.0 to 1.0) into a governed confidence band.
 */
export function getAIConfidenceBand(score) {
    if (score >= 0.9) return TRUST_LEVELS.AI_HIGH;
    if (score >= 0.7) return TRUST_LEVELS.AI_MODERATE;
    return TRUST_LEVELS.AI_LOW;
}
