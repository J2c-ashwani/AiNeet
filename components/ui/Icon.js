'use client';
/**
 * components/ui/Icon.js — Centralized Icon System
 * Wave 7: Experience Hardening
 *
 * Single import point for all icons. Uses Lucide React.
 * ZERO system emojis. All icons are SVG-based, consistent
 * across all Android OEMs.
 *
 * Usage:
 *   import { Icon } from '@/components/ui/Icon';
 *   <Icon name="Home" size={22} color="var(--accent-primary)" />
 */

import {
    Home, BookOpen, Zap, MessageCircle, User,
    Brain, Trophy, Target, TrendingUp, Clock,
    CheckCircle, XCircle, AlertCircle, Info,
    ArrowRight, ChevronRight, ChevronLeft, ChevronDown,
    Star, Flame, Award, Shield, Lock,
    Search, Filter, Settings, Bell, Share2,
    RefreshCw, RotateCcw, Download, Upload,
    Play, Pause, Square, SkipForward,
    BarChart2, PieChart, Activity, Layers,
    Pencil, Trash2, PlusCircle, MinusCircle,
    BookMarked, NotebookPen, Lightbulb, HelpCircle,
    Wrench, Cpu, Eye, EyeOff, Check, X,
    GraduationCap, Microscope, Atom, Dna,
    CalendarDays, TimerReset, Wifi, WifiOff,
    ScanLine, Camera, FileText, Image,
    HeartPulse, Sparkles, Medal, Crown,
} from 'lucide-react';

const ICON_MAP = {
    // Navigation
    Home, Practice: BookOpen, Test: Zap, Doubt: MessageCircle, Profile: User,
    // Academic
    Brain, Trophy, Target, TrendingUp, Clock, GraduationCap, Microscope, Atom, Dna,
    // Status
    CheckCircle, XCircle, AlertCircle, Info, Check, X,
    // Actions
    ArrowRight, ChevronRight, ChevronLeft, ChevronDown,
    Search, Filter, Settings, Bell, Share2,
    RefreshCw, RotateCcw, Download, Upload,
    Play, Pause, Square, SkipForward,
    Pencil, Trash2, PlusCircle, MinusCircle,
    // Content
    BookMarked, NotebookPen, Lightbulb, HelpCircle, FileText, Image,
    // Analytics
    BarChart2, PieChart, Activity, Layers,
    // Gamification
    Star, Flame, Award, Shield, Medal, Crown, Sparkles, HeartPulse,
    // Auth / Security
    Lock, Eye, EyeOff,
    // Utility
    Wrench, Cpu, CalendarDays, TimerReset,
    Wifi, WifiOff, ScanLine, Camera,
};

export function Icon({ name, size = 20, color = 'currentColor', className = '', strokeWidth = 1.75, ...props }) {
    const LucideIcon = ICON_MAP[name];

    if (!LucideIcon) {
        if (process.env.NODE_ENV === 'development') {
            console.warn(`[Icon] Unknown icon: "${name}". Add it to ICON_MAP in components/ui/Icon.js`);
        }
        return null;
    }

    return (
        <LucideIcon
            size={size}
            color={color}
            strokeWidth={strokeWidth}
            className={className}
            aria-hidden="true"
            {...props}
        />
    );
}

// Named export of all icons for direct use when needed
export {
    Home, BookOpen, Zap, MessageCircle, User,
    Brain, Trophy, Target, TrendingUp, Flame,
    CheckCircle, XCircle, AlertCircle, Star,
    ArrowRight, ChevronRight, NotebookPen,
    BarChart2, Activity, Sparkles, Shield,
};
