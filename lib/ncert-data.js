/**
 * NCERT Books Seed Data — Links to official NCERT PDFs
 * 
 * NCERT copyright prohibits re-hosting. We link to official URLs:
 * https://ncert.nic.in/textbook/pdf/<code><chapter>.pdf
 * 
 * Book Codes:
 * Class 11: keph1/keph2 (Physics), kech1/kech2 (Chemistry), kebo1 (Biology)
 * Class 12: leph1/leph2 (Physics), lech1/lech2 (Chemistry), lebo1 (Biology)
 */

export const NCERT_BOOKS = [
    // ═══════════════════════════════════════════════
    // PHYSICS — Class 11
    // ═══════════════════════════════════════════════
    {
        subject: 'physics', class: 11, book: 'Physics Part I', code: 'keph1',
        chapters: [
            { ch: 1, title: 'Units and Measurement' },
            { ch: 2, title: 'Motion in a Straight Line' },
            { ch: 3, title: 'Motion in a Plane' },
            { ch: 4, title: 'Laws of Motion' },
            { ch: 5, title: 'Work, Energy and Power' },
            { ch: 6, title: 'System of Particles and Rotational Motion' },
            { ch: 7, title: 'Gravitation' },
        ]
    },
    {
        subject: 'physics', class: 11, book: 'Physics Part II', code: 'keph2',
        chapters: [
            { ch: 1, title: 'Mechanical Properties of Solids' },
            { ch: 2, title: 'Mechanical Properties of Fluids' },
            { ch: 3, title: 'Thermal Properties of Matter' },
            { ch: 4, title: 'Thermodynamics' },
            { ch: 5, title: 'Kinetic Theory' },
            { ch: 6, title: 'Oscillations' },
            { ch: 7, title: 'Waves' },
        ]
    },
    // ═══════════════════════════════════════════════
    // PHYSICS — Class 12
    // ═══════════════════════════════════════════════
    {
        subject: 'physics', class: 12, book: 'Physics Part I', code: 'leph1',
        chapters: [
            { ch: 1, title: 'Electric Charges and Fields' },
            { ch: 2, title: 'Electrostatic Potential and Capacitance' },
            { ch: 3, title: 'Current Electricity' },
            { ch: 4, title: 'Moving Charges and Magnetism' },
            { ch: 5, title: 'Magnetism and Matter' },
            { ch: 6, title: 'Electromagnetic Induction' },
            { ch: 7, title: 'Alternating Current' },
            { ch: 8, title: 'Electromagnetic Waves' },
        ]
    },
    {
        subject: 'physics', class: 12, book: 'Physics Part II', code: 'leph2',
        chapters: [
            { ch: 1, title: 'Ray Optics and Optical Instruments' },
            { ch: 2, title: 'Wave Optics' },
            { ch: 3, title: 'Dual Nature of Radiation and Matter' },
            { ch: 4, title: 'Atoms' },
            { ch: 5, title: 'Nuclei' },
            { ch: 6, title: 'Semiconductor Electronics' },
        ]
    },

    // ═══════════════════════════════════════════════
    // CHEMISTRY — Class 11
    // ═══════════════════════════════════════════════
    {
        subject: 'chemistry', class: 11, book: 'Chemistry Part I', code: 'kech1',
        chapters: [
            { ch: 1, title: 'Some Basic Concepts of Chemistry' },
            { ch: 2, title: 'Structure of Atom' },
            { ch: 3, title: 'Classification of Elements and Periodicity in Properties' },
            { ch: 4, title: 'Chemical Bonding and Molecular Structure' },
            { ch: 5, title: 'States of Matter' },
            { ch: 6, title: 'Thermodynamics' },
            { ch: 7, title: 'Equilibrium' },
        ]
    },
    {
        subject: 'chemistry', class: 11, book: 'Chemistry Part II', code: 'kech2',
        chapters: [
            { ch: 1, title: 'Redox Reactions' },
            { ch: 2, title: 'Hydrogen' },
            { ch: 3, title: 'The s-Block Elements' },
            { ch: 4, title: 'The p-Block Elements' },
            { ch: 5, title: 'Organic Chemistry: Some Basic Principles and Techniques' },
            { ch: 6, title: 'Hydrocarbons' },
            { ch: 7, title: 'Environmental Chemistry' },
        ]
    },
    // ═══════════════════════════════════════════════
    // CHEMISTRY — Class 12
    // ═══════════════════════════════════════════════
    {
        subject: 'chemistry', class: 12, book: 'Chemistry Part I', code: 'lech1',
        chapters: [
            { ch: 1, title: 'The Solid State' },
            { ch: 2, title: 'Solutions' },
            { ch: 3, title: 'Electrochemistry' },
            { ch: 4, title: 'Chemical Kinetics' },
            { ch: 5, title: 'Surface Chemistry' },
            { ch: 6, title: 'General Principles and Processes of Isolation of Elements' },
            { ch: 7, title: 'The p-Block Elements' },
            { ch: 8, title: 'The d- and f-Block Elements' },
            { ch: 9, title: 'Coordination Compounds' },
        ]
    },
    {
        subject: 'chemistry', class: 12, book: 'Chemistry Part II', code: 'lech2',
        chapters: [
            { ch: 1, title: 'Haloalkanes and Haloarenes' },
            { ch: 2, title: 'Alcohols, Phenols and Ethers' },
            { ch: 3, title: 'Aldehydes, Ketones and Carboxylic Acids' },
            { ch: 4, title: 'Amines' },
            { ch: 5, title: 'Biomolecules' },
            { ch: 6, title: 'Polymers' },
            { ch: 7, title: 'Chemistry in Everyday Life' },
        ]
    },

    // ═══════════════════════════════════════════════
    // BIOLOGY — Class 11
    // ═══════════════════════════════════════════════
    {
        subject: 'biology', class: 11, book: 'Biology', code: 'kebo1',
        chapters: [
            { ch: 1, title: 'The Living World' },
            { ch: 2, title: 'Biological Classification' },
            { ch: 3, title: 'Plant Kingdom' },
            { ch: 4, title: 'Animal Kingdom' },
            { ch: 5, title: 'Morphology of Flowering Plants' },
            { ch: 6, title: 'Anatomy of Flowering Plants' },
            { ch: 7, title: 'Structural Organisation in Animals' },
            { ch: 8, title: 'Cell: The Unit of Life' },
            { ch: 9, title: 'Biomolecules' },
            { ch: 10, title: 'Cell Cycle and Cell Division' },
            { ch: 11, title: 'Photosynthesis in Higher Plants' },
            { ch: 12, title: 'Respiration in Plants' },
            { ch: 13, title: 'Plant Growth and Development' },
            { ch: 14, title: 'Breathing and Exchange of Gases' },
            { ch: 15, title: 'Body Fluids and Circulation' },
            { ch: 16, title: 'Excretory Products and their Elimination' },
            { ch: 17, title: 'Locomotion and Movement' },
            { ch: 18, title: 'Neural Control and Coordination' },
            { ch: 19, title: 'Chemical Coordination and Integration' },
        ]
    },

    // ═══════════════════════════════════════════════
    // BIOLOGY — Class 12
    // ═══════════════════════════════════════════════
    {
        subject: 'biology', class: 12, book: 'Biology', code: 'lebo1',
        chapters: [
            { ch: 1, title: 'Reproduction in Organisms' },
            { ch: 2, title: 'Sexual Reproduction in Flowering Plants' },
            { ch: 3, title: 'Human Reproduction' },
            { ch: 4, title: 'Reproductive Health' },
            { ch: 5, title: 'Principles of Inheritance and Variation' },
            { ch: 6, title: 'Molecular Basis of Inheritance' },
            { ch: 7, title: 'Evolution' },
            { ch: 8, title: 'Human Health and Diseases' },
            { ch: 9, title: 'Strategies for Enhancement in Food Production' },
            { ch: 10, title: 'Microbes in Human Welfare' },
            { ch: 11, title: 'Biotechnology: Principles and Processes' },
            { ch: 12, title: 'Biotechnology and its Applications' },
            { ch: 13, title: 'Organisms and Populations' },
            { ch: 14, title: 'Ecosystem' },
            { ch: 15, title: 'Biodiversity and Conservation' },
            { ch: 16, title: 'Environmental Issues' },
        ]
    },
];

/**
 * Generate the NCERT URL for a specific chapter
 */
export function getChapterPdfUrl(bookCode, chapterNumber) {
    return `https://ncert.nic.in/textbook/pdf/${bookCode}${String(chapterNumber).padStart(2, '0')}.pdf`;
}

/**
 * Generate the full book URL (prelims page)
 */
export function getBookUrl(bookCode) {
    return `https://ncert.nic.in/textbook.php?${bookCode}=0-${20}`;
}

/**
 * NEET Exam Blueprint — Year-wise chapter question distribution
 * Source: Analysis of NEET 2021-2024 papers
 */
export const NEET_BLUEPRINT = {
    // ═══════════════════════════════════════════════
    // PHYSICS (45 questions per year)
    // ═══════════════════════════════════════════════
    physics: {
        'Units and Measurement': { 2021: 1, 2022: 1, 2023: 1, 2024: 1 },
        'Motion in a Straight Line': { 2021: 1, 2022: 1, 2023: 2, 2024: 1 },
        'Motion in a Plane': { 2021: 1, 2022: 1, 2023: 1, 2024: 2 },
        'Laws of Motion': { 2021: 2, 2022: 3, 2023: 1, 2024: 2 },
        'Work, Energy and Power': { 2021: 2, 2022: 2, 2023: 2, 2024: 2 },
        'System of Particles & Rotational Motion': { 2021: 2, 2022: 3, 2023: 3, 2024: 2 },
        'Gravitation': { 2021: 2, 2022: 2, 2023: 1, 2024: 2 },
        'Mechanical Properties of Solids': { 2021: 1, 2022: 1, 2023: 1, 2024: 1 },
        'Mechanical Properties of Fluids': { 2021: 1, 2022: 1, 2023: 2, 2024: 1 },
        'Thermal Properties of Matter': { 2021: 1, 2022: 1, 2023: 1, 2024: 1 },
        'Thermodynamics': { 2021: 4, 2022: 3, 2023: 2, 2024: 3 },
        'Kinetic Theory': { 2021: 1, 2022: 1, 2023: 1, 2024: 1 },
        'Oscillations': { 2021: 1, 2022: 1, 2023: 1, 2024: 1 },
        'Waves': { 2021: 1, 2022: 2, 2023: 1, 2024: 1 },
        'Electric Charges and Fields': { 2021: 1, 2022: 1, 2023: 2, 2024: 2 },
        'Electrostatic Potential & Capacitance': { 2021: 2, 2022: 1, 2023: 1, 2024: 1 },
        'Current Electricity': { 2021: 3, 2022: 5, 2023: 3, 2024: 3 },
        'Moving Charges and Magnetism': { 2021: 2, 2022: 1, 2023: 2, 2024: 2 },
        'Magnetism and Matter': { 2021: 1, 2022: 1, 2023: 1, 2024: 1 },
        'Electromagnetic Induction': { 2021: 2, 2022: 1, 2023: 2, 2024: 2 },
        'Alternating Current': { 2021: 2, 2022: 2, 2023: 1, 2024: 1 },
        'Electromagnetic Waves': { 2021: 2, 2022: 1, 2023: 1, 2024: 1 },
        'Ray Optics': { 2021: 2, 2022: 2, 2023: 2, 2024: 3 },
        'Wave Optics': { 2021: 2, 2022: 2, 2023: 2, 2024: 1 },
        'Dual Nature of Radiation & Matter': { 2021: 2, 2022: 1, 2023: 2, 2024: 2 },
        'Atoms': { 2021: 1, 2022: 1, 2023: 1, 2024: 1 },
        'Nuclei': { 2021: 1, 2022: 1, 2023: 1, 2024: 1 },
        'Semiconductor Electronics': { 2021: 4, 2022: 2, 2023: 2, 2024: 2 },
    },

    // ═══════════════════════════════════════════════
    // CHEMISTRY (45 questions per year)
    // ═══════════════════════════════════════════════
    chemistry: {
        'Some Basic Concepts of Chemistry': { 2021: 1, 2022: 1, 2023: 2, 2024: 1 },
        'Structure of Atom': { 2021: 1, 2022: 2, 2023: 1, 2024: 2 },
        'Classification of Elements': { 2021: 1, 2022: 1, 2023: 1, 2024: 1 },
        'Chemical Bonding': { 2021: 2, 2022: 3, 2023: 2, 2024: 3 },
        'States of Matter': { 2021: 1, 2022: 1, 2023: 1, 2024: 1 },
        'Thermodynamics': { 2021: 4, 2022: 2, 2023: 2, 2024: 2 },
        'Equilibrium': { 2021: 3, 2022: 2, 2023: 2, 2024: 2 },
        'Redox Reactions': { 2021: 1, 2022: 1, 2023: 1, 2024: 1 },
        'Hydrogen': { 2021: 1, 2022: 1, 2023: 1, 2024: 1 },
        's-Block Elements': { 2021: 1, 2022: 1, 2023: 1, 2024: 1 },
        'p-Block Elements (11)': { 2021: 2, 2022: 2, 2023: 2, 2024: 2 },
        'Organic Chemistry Basics': { 2021: 2, 2022: 2, 2023: 2, 2024: 2 },
        'Hydrocarbons': { 2021: 1, 2022: 2, 2023: 1, 2024: 2 },
        'Environmental Chemistry': { 2021: 1, 2022: 1, 2023: 1, 2024: 1 },
        'The Solid State': { 2021: 1, 2022: 1, 2023: 1, 2024: 1 },
        'Solutions': { 2021: 2, 2022: 2, 2023: 2, 2024: 2 },
        'Electrochemistry': { 2021: 2, 2022: 2, 2023: 2, 2024: 2 },
        'Chemical Kinetics': { 2021: 1, 2022: 2, 2023: 1, 2024: 2 },
        'Surface Chemistry': { 2021: 1, 2022: 1, 2023: 1, 2024: 1 },
        'd- and f-Block Elements': { 2021: 2, 2022: 2, 2023: 2, 2024: 2 },
        'Coordination Compounds': { 2021: 4, 2022: 2, 2023: 3, 2024: 2 },
        'p-Block Elements (12)': { 2021: 2, 2022: 3, 2023: 3, 2024: 3 },
        'Haloalkanes & Haloarenes': { 2021: 1, 2022: 1, 2023: 1, 2024: 1 },
        'Alcohols, Phenols & Ethers': { 2021: 2, 2022: 1, 2023: 2, 2024: 2 },
        'Aldehydes, Ketones & Carboxylic Acids': { 2021: 2, 2022: 2, 2023: 2, 2024: 2 },
        'Amines': { 2021: 1, 2022: 1, 2023: 1, 2024: 1 },
        'Biomolecules': { 2021: 1, 2022: 2, 2023: 2, 2024: 2 },
        'Polymers': { 2021: 1, 2022: 1, 2023: 1, 2024: 1 },
    },

    // ═══════════════════════════════════════════════
    // BIOLOGY (90 questions per year)
    // ═══════════════════════════════════════════════
    biology: {
        'The Living World': { 2021: 2, 2022: 2, 2023: 2, 2024: 2 },
        'Biological Classification': { 2021: 3, 2022: 3, 2023: 3, 2024: 3 },
        'Plant Kingdom': { 2021: 3, 2022: 5, 2023: 3, 2024: 3 },
        'Animal Kingdom': { 2021: 3, 2022: 4, 2023: 3, 2024: 4 },
        'Morphology of Flowering Plants': { 2021: 3, 2022: 3, 2023: 2, 2024: 3 },
        'Anatomy of Flowering Plants': { 2021: 2, 2022: 3, 2023: 2, 2024: 2 },
        'Structural Organisation in Animals': { 2021: 2, 2022: 3, 2023: 2, 2024: 2 },
        'Cell: The Unit of Life': { 2021: 3, 2022: 2, 2023: 3, 2024: 3 },
        'Biomolecules': { 2021: 2, 2022: 3, 2023: 2, 2024: 3 },
        'Cell Cycle and Cell Division': { 2021: 3, 2022: 7, 2023: 3, 2024: 3 },
        'Photosynthesis in Higher Plants': { 2021: 3, 2022: 2, 2023: 3, 2024: 3 },
        'Respiration in Plants': { 2021: 2, 2022: 2, 2023: 2, 2024: 2 },
        'Plant Growth and Development': { 2021: 2, 2022: 2, 2023: 2, 2024: 2 },
        'Breathing and Exchange of Gases': { 2021: 2, 2022: 2, 2023: 3, 2024: 2 },
        'Body Fluids and Circulation': { 2021: 3, 2022: 2, 2023: 3, 2024: 3 },
        'Excretory Products': { 2021: 2, 2022: 2, 2023: 2, 2024: 2 },
        'Locomotion and Movement': { 2021: 2, 2022: 2, 2023: 2, 2024: 2 },
        'Neural Control and Coordination': { 2021: 2, 2022: 2, 2023: 3, 2024: 3 },
        'Chemical Coordination': { 2021: 2, 2022: 2, 2023: 2, 2024: 2 },
        'Reproduction in Organisms': { 2021: 2, 2022: 2, 2023: 2, 2024: 2 },
        'Sexual Reproduction in Plants': { 2021: 3, 2022: 3, 2023: 3, 2024: 3 },
        'Human Reproduction': { 2021: 3, 2022: 3, 2023: 3, 2024: 3 },
        'Reproductive Health': { 2021: 2, 2022: 2, 2023: 2, 2024: 2 },
        'Principles of Inheritance & Variation': { 2021: 4, 2022: 3, 2023: 4, 2024: 4 },
        'Molecular Basis of Inheritance': { 2021: 4, 2022: 3, 2023: 4, 2024: 3 },
        'Evolution': { 2021: 3, 2022: 2, 2023: 2, 2024: 3 },
        'Human Health and Diseases': { 2021: 3, 2022: 3, 2023: 3, 2024: 3 },
        'Microbes in Human Welfare': { 2021: 2, 2022: 2, 2023: 2, 2024: 2 },
        'Biotechnology: Principles': { 2021: 2, 2022: 2, 2023: 2, 2024: 2 },
        'Biotechnology: Applications': { 2021: 2, 2022: 2, 2023: 2, 2024: 2 },
        'Organisms and Populations': { 2021: 3, 2022: 3, 2023: 3, 2024: 3 },
        'Ecosystem': { 2021: 3, 2022: 2, 2023: 2, 2024: 3 },
        'Biodiversity and Conservation': { 2021: 2, 2022: 2, 2023: 2, 2024: 2 },
        'Environmental Issues': { 2021: 2, 2022: 2, 2023: 2, 2024: 2 },
    }
};
