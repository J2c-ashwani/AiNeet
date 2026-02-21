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
        'The Living World': {
            'Species/Genus/Family/Order/Class/Phylum/Division/Kingdom': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
        },
        'Biological Classification': {
            'Viruses and Acellular organisms': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'General Characters (Fungi)/Mycorrhiza': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 2, 2025: 0 },
            'Ascomycetes': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
            'Mycoplasma': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
            'Characteristics': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
            'Five Kingdom': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
        },
        'Plant Kingdom': {
            'Rhodophyceae': { 2020: 1, 2021: 1, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
            'Chlorophyceae': { 2020: 1, 2021: 1, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
            'Characteristics and Importance': { 2020: 1, 2021: 1, 2022: 0, 2023: 1, 2024: 0, 2025: 1 },
            'Liverworts': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'Phaeophyceae': { 2020: 0, 2021: 1, 2022: 1, 2023: 0, 2024: 1, 2025: 0 },
            'Mosses': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
            'General Characteristics and Importance': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 1 },
            'Introduction, Characteristics': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 2 },
        },
        'Morphology of Flowering Plants': {
            'Types': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'Gynoecium (Carpels)': { 2020: 2, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'Androecium (Stamens)': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
            'Brassicaceae': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'Poaceae': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'Symmetry': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 1, 2025: 0 },
            'Modifications': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
            'Aestivation': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
            'Solanaceae': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
            'Placentation': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
            'Solitary Flowers': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
            'Structure of Monocotyledonous Seed': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 1 },
            'Terminology/Symmetry/Thalamus/Position of Floral Parts': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 1 },
            'Types of Fruits': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
            'Floral Formula': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
        },
        'Anatomy of Flowering Plants': {
            'Vascular Cambium': { 2020: 1, 2021: 1, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
            'Anatomy of Monocotyledonous Stem': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
            'Complex Tissues': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'Epidermal Tissue System': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
            'Anatomy of Monocotyledonous Root': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
            'Vascular Tissue System': { 2020: 0, 2021: 0, 2022: 1, 2023: 1, 2024: 0, 2025: 0 },
            'Cork Cambium': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
            'Anatomy of Monocotyledonous (Isobilateral) Leaf': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
            'Simple Tissue': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
        },
        'Cell: The Unit of Life': {
            'Golgi body': { 2020: 1, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 1 },
            'Mitochondria': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
            'Endoplasmic Reticulum': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'Chromosomes': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
            'Ribosomes': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 1 },
            'Cell Organelles': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 1 },
            'Plastids': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
            'Nucleus, Karyotype, Polytene, Lampbrush etc.': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
            'What is a Cell? Overview of the Cell': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
            'Prokaryotic Ribosomes, Inclusion Bodies, Mesosomes, Nucleoid etc.': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
        },
        'Photosynthesis in Higher Plants': {
            'Photorespiration': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
            'What is Light Reaction?': { 2020: 1, 2021: 1, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
            'Hatch and Slack Pathway': { 2020: 0, 2021: 1, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
            'Chemiosmotic Hypothesis': { 2020: 0, 2021: 0, 2022: 1, 2023: 1, 2024: 0, 2025: 0 },
            'Calvin Cycle (C3 Cycle/Primary Acceptor/Stages)': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 2, 2025: 2 },
            'Chlorophyll a, b, c, Xanthophylls, Carotenoids, Absorption and Action Spectrum': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
        },
        'Respiration in Plants': {
            'TCA Cycle': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
            'Electron Transport Chain': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 1, 2025: 1 },
            'Alcoholic and Lactic Acid Fermentation': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
            'Formation of Pyruvic Acid': { 2020: 0, 2021: 0, 2022: 1, 2023: 2, 2024: 0, 2025: 0 },
        },
        'Plant Growth and Development': {
            'Growth Phases': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'Gibberellins': { 2020: 1, 2021: 0, 2022: 0, 2023: 1, 2024: 1, 2025: 0 },
            'Abscisic Acid': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'Plasticity': { 2020: 0, 2021: 1, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
            'Introduction': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'Auxins': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 1, 2025: 1 },
            'Ethylene': { 2020: 0, 2021: 0, 2022: 2, 2023: 1, 2024: 0, 2025: 0 },
            'Differentiation, Dedifferentiation and Redifferentiation': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 1, 2025: 0 },
            'Effects of PGR': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
        },
        'Sexual Reproduction in Flowering Plants': {
            'Microsporogenesis, T.S. of Anther, Pollen Grain, Pollen Viability': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'Pollination/Agents/Outbreeding Devices/Emasculation': { 2020: 1, 2021: 1, 2022: 3, 2023: 2, 2024: 2, 2025: 1 },
            'Structure and Development of Ovule and Female Gametophyte': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 2 },
            'Double Fertilisation': { 2020: 0, 2021: 1, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
            'Types of Fruits (Epicarp, Mesocarp, Endocarp, Endosperm)': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
            'Structure and Development of Anther and Male Gametophyte': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
            'Formation of Seed, Classification of Seed': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
        },
        'Principles of Inheritance and Variation': {
            'Co-Dominance': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
            'Haemophilia': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'Selection of Pea Plant': { 2020: 1, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
            'Chromosomal Theory of Inheritance': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'Punnett Square': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'Sickle-cell Anaemia': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'Sex Determination in Other Organisms': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
            'Autosomal Recessive/Dominant Disorders': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
            'Dihybrid Cross, Law of Independent Assortment': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 1 },
            'Linkage and Recombination': { 2020: 0, 2021: 0, 2022: 1, 2023: 1, 2024: 0, 2025: 0 },
            'Colour Blindness': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
            'Pleiotropy': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
            'Klinefelter\'s Syndrome': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 1, 2025: 0 },
            'Down\'s Syndrome': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
            'Pedigree Analysis': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 1 },
            'Test Cross': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
            'Incomplete Dominance': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
            'Monohybrid Cross, Law of Dominance, Law of Segregation': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
            'Law of Dominance': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
            'Polygenic Inheritance': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
        },
        'Molecular Basis of Inheritance': {
            'Process of Translation': { 2020: 1, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
            'Initiation, Elongation and Termination, Enzymes Involved': { 2020: 1, 2021: 1, 2022: 0, 2023: 0, 2024: 1, 2025: 1 },
            'Nucleotide': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'Nitrogen Base': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'Salient Features of Genetic Code': { 2020: 1, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'Mutations and the Genetic Code': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'Derivation of DNA Structure and Central Dogma': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'Post Transcriptional Process': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
            'DNA Fingerprinting': { 2020: 0, 2021: 1, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
            'RNA Polymerases': { 2020: 0, 2021: 1, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
            'Chargaff\'s Rule': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'RNA World': { 2020: 0, 2021: 1, 2022: 0, 2023: 1, 2024: 0, 2025: 1 },
            'Nucleosome, Histone Proteins etc.': { 2020: 0, 2021: 1, 2022: 1, 2023: 1, 2024: 0, 2025: 1 },
            'Hershey-Chase Experiment': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 1 },
            'Salient Features of Human Genome': { 2020: 0, 2021: 0, 2022: 1, 2023: 1, 2024: 0, 2025: 1 },
            'Properties of Genetic Material (DNA Versus RNA)': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
            'Lac-Operon': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 1, 2025: 0 },
            'Transcription Unit': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
            'The Experimental Proof': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
            'DNA Replication Machinery and Mechanism': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
            'Process of Transcription': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 1, 2025: 0 },
            'Genetic Code/tRNA - The Adapter Molecule': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
        },
        'Microbes in Human Welfare': {
            'Primary Treatment': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'Bioactive Molecules': { 2020: 1, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
            'Chemicals': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'Enzymes': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 1 },
            'Fermented Beverages': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
            'Microbes as Biofertilizers': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
            'Microbes in Household Products': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
        },
        'Organisms and Populations': {
            'Natality, Mortality, Immigration and Emigration': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'Types of Population Interactions': { 2020: 0, 2021: 2, 2022: 2, 2023: 2, 2024: 1, 2025: 1 },
            'Growth Models: Exponential and Logistic Growth': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 1, 2025: 1 },
            'Population Attributes': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
        },
        'Ecosystem': {
            'Food Chain': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
            'GPP': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'Pyramid of Biomass': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'NPP': { 2020: 0, 2021: 1, 2022: 0, 2023: 1, 2024: 1, 2025: 1 },
            'Process Involved in Decomposition': { 2020: 0, 2021: 0, 2022: 2, 2023: 1, 2024: 0, 2025: 0 },
            'Primary Productivity': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
            'Introduction': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
        },
        'Biodiversity and Conservation': {
            'Introduction': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'Patterns of Biodiversity': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'Botanical Gardens, Zoological Parks and Wildlife Safari Parks': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 1, 2025: 2 },
            'IUCN Red List, Evil Quartet, Over-Exploitation, Alien Species': { 2020: 0, 2021: 0, 2022: 1, 2023: 1, 2024: 2, 2025: 0 },
            'Hot Spots, Major Hotspots in India, Sacred Groves': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
            'Earth Summit': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
            'Latitudinal Gradients': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
            'Productivity Stability Hypothesis, Rivet Popper Hypothesis': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
        },
        'Environmental Issues': { 2020: 0, 2021: 2, 2022: 2, 2023: 2, 2024: 2, 2025: 0 },
        'Structural Organisation in Animals': {
            'Epithelial Tissue (Simple Epithelium)': { 2020: 1, 2021: 0, 2022: 1, 2023: 1, 2024: 0, 2025: 0 },
            'Epithelial Tissue (Glandular Epithelium)': { 2020: 1, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
            'Epithelial Tissue (Cell-Cell Communication Junctions)': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'Connective Tissue (Loose Connective Tissue)': { 2020: 0, 2021: 0, 2022: 2, 2023: 0, 2024: 0, 2025: 0 },
            'Connective Tissue (Dense Regular Connective Tissue)': { 2020: 0, 2021: 0, 2022: 1, 2023: 1, 2024: 0, 2025: 0 },
            'Dense Connective Tissue (Irregular Dense Connective Tissue)': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
            'Connective Tissue (Specialised Connective Tissue)': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
            'Connective Tissue (Specialised - Blood)': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
            'Epithelial Tissue (Compound Epithelium)': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
        },
        'Breathing and Exchange of Gases': {
            'Transport of Gases (O2 & CO2)': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
            'Mechanism of Breathing (Inspiration & Muscles)': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'Disorders of Respiratory System': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'Exchange of Gases (pO2, pCO2, Alveoli, Blood/Tissue)': { 2020: 0, 2021: 2, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
            'Human Respiratory System': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
            'Respiratory Volumes and Capacities (TV, IRV, ERV, etc.)': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
            'Respiratory Capacities (Vital Capacity)': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
        },
        'Body Fluids and Circulation': {
            'ECG (PQRST & Clinical Significance)': { 2020: 1, 2021: 0, 2022: 0, 2023: 1, 2024: 1, 2025: 0 },
            'Blood - Formed Elements (Leucocytes & Disorders)': { 2020: 1, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
            'Coagulation of Blood': { 2020: 0, 2021: 1, 2022: 2, 2023: 0, 2024: 0, 2025: 0 },
            'Blood Groups (ABO)': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'Circulatory Pathways': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
            'Blood Plasma': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
            'Cardiac Cycle': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
            'Regulation of Cardiac Activity': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
        },
        'Excretory Products': {
            'Disorders of the Excretory System': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'Mechanism of Filtrate Concentration (Counter Current)': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'Regulation of Kidney Function (JGA, RAAS)': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'Osmoregulation (Introduction & Different Organisms)': { 2020: 0, 2021: 0, 2022: 1, 2023: 1, 2024: 0, 2025: 0 },
            'Human Excretory System': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 1, 2025: 0 },
            'Regulation of Kidney Function (Heart ANF)': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
            'Regulation of Kidney Function (ADH, RAAS, ANF)': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
            'Functions of the Tubules (PCT)': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
            'Functions of the Tubules (PCT, Henle\'s Loop, DCT)': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
        },
        'Locomotion and Movement': {
            'Skeletal System (Appendicular Skeleton)': { 2020: 1, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'Disorders of Muscular and Skeletal System': { 2020: 0, 2021: 4, 2022: 3, 2023: 1, 2024: 1, 2025: 1 },
            'Types of Muscle (Smooth Muscle)': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'Skeletal System (Axial Skeleton)': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'Joints (Fibrous, Cartilaginous, Synovial)': { 2020: 0, 2021: 0, 2022: 1, 2023: 1, 2024: 1, 2025: 0 },
            'Mechanism of Muscle Contraction (Sliding Filament Theory)': { 2020: 0, 2021: 1, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
            'Types of Muscle (Cardiac Muscle)': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
        },
        'Neural Control and Coordination': {
            'Conduction of Nerve Impulse (Saltatory Conduction)': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
            'Parts of Brain (Forebrain)': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
            'Parts of Brain (Hindbrain)': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 2, 2025: 0 },
        },
        'Chemical Coordination & Integration': {
            'Hormonal Disorders (Examples)': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'Adrenal Gland (Cortex Hormones)': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'Parathyroid Hormones & Function': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
            'Hormones (Current & Scientific Definition)': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
            'Thyroid Hormones & Function': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 1, 2025: 0 },
            'Classification of Hormones (Protein & Steroid)': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
            'Adrenal Gland (Medulla Hormones)': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
            'Hormones of Gastrointestinal Tract': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
            'Hypothalamus (Location & Hormones)': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
            'Ovary Hormones & Function': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
        },
        'Animal Kingdom': {
            'Non-Chordate Classification (Coelenterata/Cnidaria)': { 2020: 1, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'Basis of Classification (Notochord)': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'Chordate Classification (Pisces - Chondrichthyes)': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'Non-Chordate Classification (Porifera)': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'Non-Chordate Classification (Ctenophora)': { 2020: 0, 2021: 2, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'Non-Chordate Classification (Annelida)': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'Chordate Classification (Class Aves)': { 2020: 0, 2021: 1, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
            'Non-Chordate Classification (Mollusca)': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'Non-Chordate Classification (Arthropoda)': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'Non-Chordate Classification (Aschelminthes/Nematoda)': { 2020: 0, 2021: 2, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
            'Non-Chordate Classification (Platyhelminthes)': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'Non-Chordate Classification (Echinodermata)': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
            'Introduction (General Description)': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
            'Chordata and Non-Chordata (Differences/Examples)': { 2020: 0, 2021: 0, 2022: 1, 2023: 1, 2024: 1, 2025: 0 },
            'Non-Chordate Classification (Hemichordata)': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
            'Chordate Classification (Class Mammalia)': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
            'Chordata - Vertebrata (Pisces: Chondrichthyes & Osteichthyes)': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 2, 2025: 0 },
            'Broad Classification (Coelom)': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
            'Chordata - Vertebrata (Class Cyclostomata)': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
            'Phylum Chordata (Basic Features)': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
        },
        'Biomolecules': {
            'Enzymes (Classification & Nomenclature)': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 1 },
            'Nature of Bonds Linking Monomers (Glycosidic, Peptide, etc.)': { 2020: 1, 2021: 2, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'Primary and Secondary Metabolites (Examples & Function)': { 2020: 1, 2021: 2, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'Nucleic Acids (DNA)': { 2020: 1, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 1 },
            'Amino Acids (Types)': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'Proteins (Function)': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
            'Lipids (Glycerol & Fatty Acid)': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'Carbohydrates (Cell Wall Composition)': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
            'Lipids (Phospholipid, Triglycerides, Steroids, etc.)': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 1, 2025: 0 },
            'Carbohydrates (Disaccharides)': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
            'Carbohydrates (Polysaccharides)': { 2020: 0, 2021: 0, 2022: 1, 2023: 1, 2024: 0, 2025: 0 },
            'Enzymes (Inhibition)': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
            'Proteins (Structure)': { 2020: 0, 2021: 1, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
            'Enzymes (Competitive/Non- Competitive Inhibition)': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
            'Enzymes (Co- factors)': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 2 },
            'Enzymes (Mechanism of Action)': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 1, 2025: 0 },
            'Analysis of Chemical Composition (DNA)': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
        },
        'Human Reproduction': {
            'Gametogenesis (Oogenesis)': { 2020: 2, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
            'Placenta (Hormones)': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'Fertilisation (Mechanism & Significance)': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'Parturition (Foetal Ejection Reflex)': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'Pregnancy/Gestation (Period/Trimesters)': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'Gametogenesis (Spermatogenesis & Oogenesis)': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
            'Gametogenesis (Spermatogenesis)': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
            'Male Reproductive System (Parts & Accessory Glands)': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
            'Female Reproductive System (Parts & Accessory Glands)': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 1, 2025: 0 },
            'Embryonic Development (Morula, Blastula, Gastrulation)': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
            'Menstrual Cycle': { 2020: 0, 2021: 0, 2022: 0, 2023: 2, 2024: 0, 2025: 2 },
            'Female Reproductive System (External Genitalia)': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
            'Gametogenesis (Hormonal Control of Spermatogenesis and Oogenesis)': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 2, 2025: 0 },
            'Lactation': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
            'Gametogenesis (Structure of Sperm)': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
            'Embryonic Development (Organ Development in Foetus)': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
            'Cleavage (Types)': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
        },
        'Reproductive Health': {
            'Assisted Reproductive Technologies (ART, IVF, etc.)': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
            'Sexually Transmitted Diseases (STDs)': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'Birth Control (Barrier Methods)': { 2020: 0, 2021: 1, 2022: 1, 2023: 1, 2024: 1, 2025: 0 },
            'Birth Control (IUDS)': { 2020: 0, 2021: 2, 2022: 2, 2023: 1, 2024: 1, 2025: 0 },
            'Birth Control (Sterilisation Procedure)': { 2020: 0, 2021: 1, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
            'Birth Control (Natural Methods)': { 2020: 0, 2021: 0, 2022: 1, 2023: 1, 2024: 0, 2025: 0 },
            'Birth Control (Oral Contraceptive)': { 2020: 0, 2021: 0, 2022: 1, 2023: 1, 2024: 0, 2025: 0 },
            'Reproductive Health (Problems & Strategies)': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
        },
        'Human Health and Diseases': {
            'Common Diseases in Humans (Typhoid, Pneumonia, etc.)': { 2020: 1, 2021: 1, 2022: 0, 2023: 0, 2024: 2, 2025: 0 },
            'Common Diseases in Humans (Life Cycle of Plasmodium)': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'Immunity (Active & Passive)': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'Common Diseases in Humans (Disease Causing Organisms)': { 2020: 0, 2021: 1, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
            'Drugs (Different Types)': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
            'Immunity (Acquired)': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
            'AIDS (HIV Virus, Transmission, Symptoms)': { 2020: 0, 2021: 0, 2022: 0, 2023: 2, 2024: 0, 2025: 0 },
            'Drugs (Opioids, Cannabinoids, Cocaine, etc.)': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 1, 2025: 0 },
            'Lymphoid Organs (Secondary)': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 1 },
            'Cancer (Introduction)': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
            'Immunity (Structure of Antibody)': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
            'Immunity (Innate)': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
        },
        'Biotechnology: Principles': {
            'Gel Electrophoresis (DNA Fragments)': { 2020: 1, 2021: 1, 2022: 1, 2023: 1, 2024: 0, 2025: 1 },
            'Restriction Enzymes (Types, Nomenclature, Ends)': { 2020: 2, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
            'Tools of Recombinant DNA Technology (Restriction Enzymes & Others)': { 2020: 1, 2021: 1, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
            'Cloning Vectors (Plasmid pBR322)': { 2020: 1, 2021: 0, 2022: 1, 2023: 0, 2024: 1, 2025: 0 },
            'Polymerase Chain Reaction (PCR Process & Applications)': { 2020: 0, 2021: 3, 2022: 1, 2023: 0, 2024: 0, 2025: 1 },
            'Process of Recombinant DNA Technologies (Isolation of Genetic Material)': { 2020: 0, 2021: 1, 2022: 0, 2023: 2, 2024: 0, 2025: 0 },
            'Identification of Clones (Antibiotic Resistance)': { 2020: 0, 2021: 1, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
            'Principles of Biotechnology (Introduction)': { 2020: 0, 2021: 0, 2022: 1, 2023: 1, 2024: 0, 2025: 0 },
            'Identification of Clones (Blue White Screening)': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 1 },
            'Methods of Gene Transfer (Gene Gun, Electroporation, etc.)': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
            'Cloning Vectors (Pbr322, Cosmids, etc.)': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 1 },
            'Process of Recombinant DNA Technologies (Insertion into Host Cell)': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
            'Obtaining Foreign Gene Product (Bioreactors)': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 1 },
            'Cloning Vectors (Ti Plasmid, Retrovirus for Plants/Animals)': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
            'Processes of Recombinant DNA Technologies (Gene Amplification using PCR)': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
        },
        'Biotechnology: Applications': {
            'Applications in Medicine (Recombinant Insulin - Humulin)': { 2020: 1, 2021: 1, 2022: 1, 2023: 0, 2024: 0, 2025: 2 },
            'Applications in Agriculture (Bt Cotton)': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
            'Applications in Agriculture (RNA Interference)': { 2020: 1, 2021: 2, 2022: 1, 2023: 0, 2024: 0, 2025: 2 },
            'Applications in Medicine (Gene Therapy)': { 2020: 0, 2021: 2, 2022: 1, 2023: 0, 2024: 1, 2025: 0 },
            'Applications in Agriculture (Introduction)': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 2, 2025: 0 },
            'Applications in Agriculture (Green Revolution)': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'Applications in Medicine (Molecular Diagnosis)': { 2020: 0, 2021: 2, 2022: 1, 2023: 1, 2024: 0, 2025: 0 },
            'Applications in Medicine (Treatment of Cancer)': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
        },
        'Evolution': {
            'Origin of Life (Oparin-Haldane Theory)': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'Evidences for Evolution (Embryological)': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'Mechanism of Evolution (Variation, Mutation, Recombination)': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'Convergent and Divergent Evolution': { 2020: 1, 2021: 2, 2022: 1, 2023: 1, 2024: 1, 2025: 0 },
            'Hardy-Weinberg Principle': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
            'Evidences for Evolution (Biogeographical)': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
            'Adaptive Radiation (Convergence & Divergence)': { 2020: 0, 2021: 1, 2022: 1, 2023: 1, 2024: 0, 2025: 0 },
            'Natural Selection (Types)': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
            'Origin and Evolution of Man': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
            'Brief Account of Evolution (Animal Forms)': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
            'Evidences for Evolution (Morphological)': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
        },
    }
};
