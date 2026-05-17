import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';
import { getUserFromRequest } from '@/lib/core/auth';
import { checkFeatureAccess } from '@/lib/plan_gate';

export const runtime = 'nodejs';

function sanitizePdfText(value) {
    return String(value ?? '')
        .normalize('NFKD')
        .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, '')
        .replace(/[\\()]/g, '\\$&');
}

function wrapText(value, maxChars = 92) {
    const words = String(value ?? '').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
    const lines = [];
    let line = '';

    for (const word of words) {
        if ((line + ' ' + word).trim().length > maxChars) {
            if (line) lines.push(line);
            line = word;
        } else {
            line = (line + ' ' + word).trim();
        }
    }

    if (line) lines.push(line);
    return lines.length ? lines : [''];
}

function buildMistakeNotebookPdf(userName, mistakes) {
    const pages = [[]];
    let y = 800;

    function addLine(text, size = 10, gap = 14) {
        if (y < 54) {
            pages.push([]);
            y = 800;
        }
        pages[pages.length - 1].push({ text, size, y });
        y -= gap;
    }

    addLine('AI NEET Coach - Mistake Notebook', 18, 24);
    addLine(`Generated for ${userName || 'Student'} | ${mistakes.length} concepts to revise`, 10, 22);

    mistakes.forEach((mistake, index) => {
        addLine(`Question ${index + 1}`, 13, 18);
        const tags = [mistake.subject_name, mistake.year_asked ? `PYQ ${mistake.year_asked}` : null].filter(Boolean).join(' | ');
        if (tags) addLine(tags, 9, 14);

        wrapText(mistake.text, 88).forEach(line => addLine(line, 10, 13));
        ['A', 'B', 'C', 'D'].forEach(option => {
            const value = mistake[`option_${option.toLowerCase()}`];
            if (value) wrapText(`${option}. ${value}`, 86).forEach(line => addLine(line, 9, 12));
        });
        addLine(`Correct Answer: ${mistake.correct_option || '-'}`, 10, 14);
        if (mistake.explanation) {
            addLine('Explanation:', 10, 13);
            wrapText(mistake.explanation, 88).slice(0, 12).forEach(line => addLine(line, 9, 12));
        }
        addLine('', 8, 10);
    });

    const objects = [];
    const addObject = (body) => {
        objects.push(body);
        return objects.length;
    };

    const catalogId = addObject('<< /Type /Catalog /Pages 2 0 R >>');
    const pagesId = addObject('');
    const fontId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
    const pageRefs = [];

    for (const pageLines of pages) {
        const content = pageLines.map(line =>
            `BT /F1 ${line.size} Tf 42 ${line.y} Td (${sanitizePdfText(line.text)}) Tj ET`
        ).join('\n');
        const contentId = addObject(`<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`);
        const pageId = addObject(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentId} 0 R >>`);
        pageRefs.push(`${pageId} 0 R`);
    }

    objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageRefs.join(' ')}] /Count ${pageRefs.length} >>`;
    objects[catalogId - 1] = '<< /Type /Catalog /Pages 2 0 R >>';

    let pdf = '%PDF-1.4\n';
    const offsets = [0];
    objects.forEach((body, index) => {
        offsets.push(Buffer.byteLength(pdf));
        pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
    });

    const xrefOffset = Buffer.byteLength(pdf);
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    offsets.slice(1).forEach(offset => {
        pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
    });
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

    return Buffer.from(pdf);
}

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
                    text, option_a, option_b, option_c, option_d, correct_option, explanation, year_asked,
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

        const pdf = buildMistakeNotebookPdf(user.name, mistakes);

        return new NextResponse(pdf, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${user.name.split(' ')[0]}_NEET_Mistakes.pdf"`,
            }
        });

    } catch (error) {
        console.error('PDF generation error:', error);
        return NextResponse.json({ error: 'Failed to generate PDF. Please try again in a moment.' }, { status: 500 });
    }
}
