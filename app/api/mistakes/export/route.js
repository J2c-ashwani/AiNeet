import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';
import { getUserFromRequest } from '@/lib/core/auth';
import { checkFeatureAccess } from '@/lib/plan_gate';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

export const runtime = 'nodejs'; // Puppeteer requires nodejs

export async function GET(request) {
    try {
        const supabase = await getDb();
        const decoded = await getUserFromRequest(request);

        if (!decoded) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        // Plan gate: PDF export requires Pro or Premium
        const blocked = await checkFeatureAccess(decoded.id, 'pdf_export_enabled', 'pro');
        if (blocked) return blocked;

        const { data: user } = await supabase.from('users').select('name').eq('id', decoded.id).single();

        // Fetch User's mistakes
        const { data: mistakeRows } = await supabase
            .from('mistake_log')
            .select(`
                last_mistake_at,
                questions!inner(
                    text, option_a, option_b, option_c, option_d, correct_option, explanation,
                    subjects(name)
                )
            `)
            .eq('user_id', decoded.id)
            .order('last_mistake_at', { ascending: false })
            .limit(100);

        const mistakes = (mistakeRows || []).map(m => ({
            ...m.questions,
            subject_name: m.questions?.subjects?.name
        }));

        if (mistakes.length === 0) {
            return NextResponse.json({ error: 'No mistakes found. Take a test first!' }, { status: 400 });
        }

        // HTML Template for the PDF
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${user.name}'s Mistake Notebook</title>
                <style>
                    body { font-family: 'Helvetica', 'Arial', sans-serif; padding: 40px; color: #1e293b; }
                    .header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #6366f1; }
                    .header h1 { color: #0f172a; margin: 0; font-size: 32px; }
                    .header p { color: #64748b; font-size: 14px; margin-top: 8px; }
                    .watermark { position: fixed; bottom: 20px; right: 20px; color: #cbd5e1; font-size: 12px; font-weight: bold; }
                    .question-card { margin-bottom: 30px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; page-break-inside: avoid; }
                    .q-number { font-weight: bold; color: #6366f1; margin-bottom: 10px; font-size: 18px; }
                    .q-text { font-size: 16px; margin-bottom: 15px; line-height: 1.5; }
                    .options { margin-bottom: 15px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
                    .option { padding: 8px 12px; background: #f8fafc; border-radius: 6px; font-size: 14px; border: 1px solid #f1f5f9; }
                    .ans { color: #10b981; font-weight: bold; margin-bottom: 10px; }
                    .exp { background: #f0fdf4; padding: 15px; border-radius: 8px; font-size: 14px; color: #166534; line-height: 1.5; border-left: 4px solid #10b981; }
                    .tag { display: inline-block; padding: 4px 8px; background: #e0e7ff; color: #4338ca; border-radius: 4px; font-size: 12px; font-weight: bold; margin-bottom: 10px; }
                </style>
            </head>
            <body>
                <div class="watermark">AI NEET Coach (aineetcoach.com)</div>
                <div class="header">
                    <h1>🧠 AI Mistake Notebook</h1>
                    <p>Generated for ${user.name} • ${mistakes.length} Concepts to Revise Before NEET</p>
                </div>
                
                ${mistakes.map((m, i) => `
                    <div class="question-card">
                        ${m.subject_name ? `<div class="tag">${m.subject_name}</div>` : ''}
                        <div class="q-number">Question ${i + 1}</div>
                        <div class="q-text">${m.text?.replace(/\n/g, '<br/>')}</div>
                        <div class="options">
                            <div class="option">A. ${m.option_a}</div>
                            <div class="option">B. ${m.option_b}</div>
                            <div class="option">C. ${m.option_c}</div>
                            <div class="option">D. ${m.option_d}</div>
                        </div>
                        <div class="ans">Correct Answer: ${m.correct_option}</div>
                        ${m.explanation ? `<div class="exp"><strong>Explanation:</strong> ${m.explanation}</div>` : ''}
                    </div>
                `).join('')}
            </body>
            </html>
        `;

        const executablePath = await chromium.executablePath();
        const browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: executablePath || undefined,
            headless: chromium.headless,
        });

        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });

        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' }
        });

        await browser.close();

        return new NextResponse(pdf, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${user.name.split(' ')[0]}_NEET_Mistakes.pdf"`,
            }
        });

    } catch (error) {
        console.error('PDF generation error:', error);
        return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
    }
}
