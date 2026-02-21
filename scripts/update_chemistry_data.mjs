/**
 * Script to replace flat chemistry data with nested topic-wise data (2020-2025)
 */
import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'lib', 'ncert-data.js');
let content = fs.readFileSync(filePath, 'utf-8');

function buildNestedJS(topics, indent = '            ') {
    let lines = [];
    for (const [topic, years] of Object.entries(topics)) {
        const yearStr = Object.entries(years).map(([y, v]) => `${y}: ${v}`).join(', ');
        lines.push(`${indent}'${topic.replace(/'/g, "\\'")}': { ${yearStr} },`);
    }
    return lines.join('\n');
}

const chemistryTopicData = {
    'Some Basic Concepts of Chemistry': {
        'Atoms and Molecules': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'Empirical and Molecular Formula': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
        'Concentration Terms & Application': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
        'Stoichiometry and Stoichiometric Calculations': { 2020: 0, 2021: 0, 2022: 2, 2023: 2, 2024: 0, 2025: 0 },
        'Miscellaneous': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
        'Mole': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 1 },
        "Dalton's Atomic Theory": { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
    },
    'Redox Reactions': {
        'Oxidation Number': { 2020: 1, 2021: 0, 2022: 1, 2023: 0, 2024: 1, 2025: 1 },
        'Types of Redox Reaction': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'Balancing of Redox Reaction': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
    },
    'Solutions': {
        'Colligative Properties': { 2020: 1, 2021: 1, 2022: 0, 2023: 0, 2024: 1, 2025: 2 },
        'Ideal and Non-Ideal Solutions': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'Vapour Pressure of Liquid Solutions': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
        'Solubility': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 1, 2025: 0 },
        'Binary Solution': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
    },
    'Thermodynamics': {
        'Expansion or Contraction of a Gas': { 2020: 1, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'Second Law of Thermodynamics (Spontaneity)': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
        'Heat of Reaction (Constant Pressure vs Volume)': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'Pressure-Volume Work': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
        'Gibbs Energy Change': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
        'Bomb Calorimeter (dU and dH)': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
        'Thermodynamic Processes': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 2, 2025: 0 },
        'Enthalpy Change': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
    },
    'Equilibrium': {
        'Solubility and Solubility Product': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'Relationship Between K, Q and Gibbs Free Energy': { 2020: 1, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
        'Different Theory For Acid And Base': { 2020: 0, 2021: 2, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
        'pH Calculation': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
        'Application of Equilibrium Constant': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 2, 2025: 0 },
        'Equilibrium Constant of Various Equilibrium': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
        "Le Chatelier's Principle": { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
    },
    'Electrochemistry': {
        'Electrolysis': { 2020: 1, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
        "Faraday's Laws": { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 2, 2025: 0 },
        "Kohlrausch's Law": { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'Conductance and Conductivity': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'Electrochemical Series': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
        'Nernst Equation': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
        'Cell Constant': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
        'Molar Conductivity': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
    },
    'Chemical Kinetics': {
        'Activation Energy': { 2020: 1, 2021: 1, 2022: 0, 2023: 1, 2024: 1, 2025: 0 },
        'Integrated Rate Equations': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 2 },
        'Rate Constant': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 1, 2025: 0 },
        'Experimental Determination of Order': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
        'Temperature Dependence of Rate': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'Ratio of Rate Constants at Different Temperatures': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
        'Potential Energy Curve': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
    },
    'Structure of Atom': {
        "Bohr's Model For Hydrogen Atom": { 2020: 1, 2021: 1, 2022: 1, 2023: 0, 2024: 1, 2025: 2 },
        'Quantum Mechanical Model': { 2020: 0, 2021: 0, 2022: 1, 2023: 1, 2024: 1, 2025: 0 },
        'Some Important Atomic Terms': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
    },
    'Classification of Elements': {
        'Nomenclature of Elements (Atomic Number > 100)': { 2020: 1, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
        'Effective Nuclear Charge': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
        'Periodic Properties': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 2, 2025: 1 },
        'Electronic Configuration and Periodic Table': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
    },
    'Chemical Bonding': {
        'Bond Parameters': { 2020: 1, 2021: 0, 2022: 1, 2023: 1, 2024: 0, 2025: 1 },
        'Dipole Moment': { 2020: 1, 2021: 1, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
        'Kössel-Lewis Approach': { 2020: 0, 2021: 0, 2022: 1, 2023: 1, 2024: 0, 2025: 0 },
        'VSEPR Theory': { 2020: 0, 2021: 1, 2022: 1, 2023: 0, 2024: 1, 2025: 0 },
        'Hybridisation': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
        'Hydrogen Bonds': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
        'Molecular Orbital Theory (MOT)': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
    },
    'Organic Chemistry Basics': {
        'Methods of Purification': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 1 },
        'Reaction Intermediate': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
        'Nomenclature of Organic Compounds': { 2020: 0, 2021: 1, 2022: 1, 2023: 0, 2024: 1, 2025: 1 },
        'Isomerism': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 1, 2025: 1 },
        'Qualitative Analysis of Organic Compounds': { 2020: 0, 2021: 0, 2022: 1, 2023: 1, 2024: 0, 2025: 1 },
        'Aromaticity': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
        'General Introduction': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
        'Hyperconjugation Effect': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
    },
    'Hydrocarbons': {
        'Preparation of Alkene': { 2020: 1, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'Chemical Properties of Alkene': { 2020: 1, 2021: 1, 2022: 1, 2023: 0, 2024: 1, 2025: 1 },
        'Preparation of Alkane': { 2020: 1, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'Conformations': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'Aromatic Hydrocarbon': { 2020: 0, 2021: 0, 2022: 1, 2023: 1, 2024: 0, 2025: 1 },
        'Chemical Properties of Alkane': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
        'Physical Properties of Alkane': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
        'Test of Unsaturation of Alkene': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
    },
    'Haloalkanes & Haloarenes': {
        'Chemical Properties': { 2020: 1, 2021: 1, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
        'Nature of C-X Bond': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'Stereochemical Aspects of Nucleophilic Substitution': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 1 },
        'Preparation of Haloarenes': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
        'Classification of Haloalkanes & Haloarenes': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
        'Preparation of Haloalkanes': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
        'Isomerism': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
    },
    'Alcohols, Phenols & Ethers': {
        'Ethers': { 2020: 1, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 1 },
        'Phenols': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
        'Alcohols': { 2020: 0, 2021: 0, 2022: 1, 2023: 1, 2024: 2, 2025: 0 },
    },
    'Aldehydes, Ketones & Carboxylic Acids': {
        'Methods of Preparation For Aldehydes': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
        'Chemical Reactions of Aldehydes And Ketones': { 2020: 2, 2021: 3, 2022: 3, 2023: 3, 2024: 1, 2025: 1 },
        'Physical Properties of Aldehydes And Ketones': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
        'Carboxylic Acid': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 1 },
    },
    'Amines': {
        'Chemical Reactions of Amines & Anilines': { 2020: 1, 2021: 2, 2022: 2, 2023: 2, 2024: 1, 2025: 1 },
        'Preparation of Amines': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
        'Diazonium Salts': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
    },
    'Biomolecules': {
        'Disaccharides': { 2020: 2, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'Proteins': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'Vitamins': { 2020: 0, 2021: 1, 2022: 0, 2023: 1, 2024: 0, 2025: 1 },
        'Enzymes': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
        'Nucleic Acids': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
        'Glucose': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
        'Monosaccharides': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
    },
    'Coordination Compounds': {
        'Ligand Field Theory': { 2020: 1, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 1 },
        'Chelation and Denticity': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'Magnetism': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 1, 2025: 1 },
        'Nomenclature of Coordination Compounds': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
        'Coordination Compounds': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
        'Stability of Coordination Compounds': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
        'Isomerism In Coordination Compounds': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 1 },
        'Important Terms in Coordination Compounds': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
        "Werner's Theory": { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
        'Application of Coordination Compounds': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
    },
    'd- and f-Block Elements': {
        'General Properties of Transition Elements': { 2020: 2, 2021: 1, 2022: 0, 2023: 2, 2024: 1, 2025: 1 },
        'Inner Transition Elements': { 2020: 1, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
        'Applications of d and f Block Elements': { 2020: 1, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'Chemical Properties': { 2020: 0, 2021: 0, 2022: 1, 2023: 2, 2024: 2, 2025: 0 },
        'The Lanthanoids': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
    },
    'p-Block Elements (11)': {
        'Allotropes of Carbon': { 2020: 1, 2021: 0, 2022: 1, 2023: 1, 2024: 0, 2025: 0 },
        'Important Trends and Anomalous Behaviour of Carbon': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
    },
    'p-Block Elements (12)': {
        'Oxoacids of Sulphur': { 2020: 1, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
        'Group 17 Elements': { 2020: 1, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
        'Group 18 Elements': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
        'Group 16 Elements': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 2, 2025: 0 },
        'Classification of Oxides': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
        'Group 15 Elements': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
    },
    'Salt Analysis': {
        "Lassaigne's Test (N, S, Halogens)": { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 1 },
        'Introduction': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
        'Test of Cation': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
    },
};

// Map old flat keys to new nested data keys
const replacements = {
    "'Some Basic Concepts of Chemistry': { 2021: 1, 2022: 1, 2023: 2, 2024: 1 },": 'Some Basic Concepts of Chemistry',
    "'Structure of Atom': { 2021: 1, 2022: 2, 2023: 1, 2024: 2 },": 'Structure of Atom',
    "'Classification of Elements': { 2021: 1, 2022: 1, 2023: 1, 2024: 1 },": 'Classification of Elements',
    "'Chemical Bonding': { 2021: 2, 2022: 3, 2023: 2, 2024: 3 },": 'Chemical Bonding',
    "'States of Matter': { 2021: 1, 2022: 1, 2023: 1, 2024: 1 },": null, // Not in PDF - keep flat extending range
    "'Thermodynamics': { 2021: 4, 2022: 2, 2023: 2, 2024: 2 },": 'Thermodynamics',
    "'Equilibrium': { 2021: 3, 2022: 2, 2023: 2, 2024: 2 },": 'Equilibrium',
    "'Redox Reactions': { 2021: 1, 2022: 1, 2023: 1, 2024: 1 },": 'Redox Reactions',
    "'Hydrogen': { 2021: 1, 2022: 1, 2023: 1, 2024: 1 },": null, // Not in PDF
    "'s-Block Elements': { 2021: 1, 2022: 1, 2023: 1, 2024: 1 },": null, // Not in PDF
    "'p-Block Elements (11)': { 2021: 2, 2022: 2, 2023: 2, 2024: 2 },": 'p-Block Elements (11)',
    "'Organic Chemistry Basics': { 2021: 2, 2022: 2, 2023: 2, 2024: 2 },": 'Organic Chemistry Basics',
    "'Hydrocarbons': { 2021: 1, 2022: 2, 2023: 1, 2024: 2 },": 'Hydrocarbons',
    "'Environmental Chemistry': { 2021: 1, 2022: 1, 2023: 1, 2024: 1 },": null, // Not in PDF
    "'The Solid State': { 2021: 1, 2022: 1, 2023: 1, 2024: 1 },": null, // Not in PDF
    "'Solutions': { 2021: 2, 2022: 2, 2023: 2, 2024: 2 },": 'Solutions',
    "'Electrochemistry': { 2021: 2, 2022: 2, 2023: 2, 2024: 2 },": 'Electrochemistry',
    "'Chemical Kinetics': { 2021: 1, 2022: 2, 2023: 1, 2024: 2 },": 'Chemical Kinetics',
    "'Surface Chemistry': { 2021: 1, 2022: 1, 2023: 1, 2024: 1 },": null, // Not in PDF
    "'d- and f-Block Elements': { 2021: 2, 2022: 2, 2023: 2, 2024: 2 },": 'd- and f-Block Elements',
    "'Coordination Compounds': { 2021: 4, 2022: 2, 2023: 3, 2024: 2 },": 'Coordination Compounds',
    "'p-Block Elements (12)': { 2021: 2, 2022: 3, 2023: 3, 2024: 3 },": 'p-Block Elements (12)',
    "'Haloalkanes & Haloarenes': { 2021: 1, 2022: 1, 2023: 1, 2024: 1 },": 'Haloalkanes & Haloarenes',
    "'Alcohols, Phenols & Ethers': { 2021: 2, 2022: 1, 2023: 2, 2024: 2 },": 'Alcohols, Phenols & Ethers',
    "'Aldehydes, Ketones & Carboxylic Acids': { 2021: 2, 2022: 2, 2023: 2, 2024: 2 },": 'Aldehydes, Ketones & Carboxylic Acids',
    "'Amines': { 2021: 1, 2022: 1, 2023: 1, 2024: 1 },": 'Amines',
    "'Biomolecules': { 2021: 1, 2022: 2, 2023: 2, 2024: 2 },": 'Biomolecules',
    "'Polymers': { 2021: 1, 2022: 1, 2023: 1, 2024: 1 },": null, // Not in PDF
};

let replacedCount = 0;

for (const [oldLine, key] of Object.entries(replacements)) {
    if (content.includes(oldLine)) {
        if (key === null) {
            // Not in PDF - extend flat entry with 2020 and 2025 as 0
            const match = oldLine.match(/'([^']+)'/);
            const name = match[1];
            const yearMatch = oldLine.match(/\{ (.+) \}/);
            const yearData = yearMatch[1];
            content = content.replace(
                `        ${oldLine}`,
                `        '${name}': { 2020: 0, ${yearData}, 2025: 0 },`
            );
            replacedCount++;
        } else {
            const topicData = chemistryTopicData[key];
            if (topicData) {
                const nested = buildNestedJS(topicData);
                content = content.replace(
                    `        ${oldLine}`,
                    `        '${key}': {\n${nested}\n        },`
                );
                replacedCount++;
            }
        }
    } else {
        console.log(`⚠️  Not found: ${oldLine.substring(0, 50)}...`);
    }
}

// Add Salt Analysis chapter (new - not in existing flat data)
const saltAnalysisData = chemistryTopicData['Salt Analysis'];
const saltNested = buildNestedJS(saltAnalysisData);
const saltBlock = `        'Salt Analysis': {\n${saltNested}\n        },`;

// Insert before the closing brace of chemistry section
const chemClose = content.indexOf("    },\n\n    // ═══════════════════════════════════════════════\n    // BIOLOGY");
if (chemClose > -1) {
    content = content.slice(0, chemClose) + saltBlock + '\n' + content.slice(chemClose);
    replacedCount++;
    console.log('✅ Added Salt Analysis chapter');
}

fs.writeFileSync(filePath, content);
console.log(`\n✅ Replaced/updated ${replacedCount} chemistry chapters with nested topic-wise data`);
