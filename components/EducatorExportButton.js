'use client';

import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';

export default function EducatorExportButton() {
    const handleExport = () => {
        const previousTitle = document.title;
        document.title = 'NEET Coach Classroom Report';
        window.print();
        window.setTimeout(() => {
            document.title = previousTitle;
        }, 1000);
    };

    return (
        <Button
            onClick={handleExport}
            className="ml-auto space_px_4 space_py_2 radius_md surface_white tone_black font-bold text-sm flex items-center gap-2"
            title="Export this classroom report as a PDF"
        >
            <Icon name="FileText" size={16} />
            Export Weekly PDF
        </Button>
    );
}
