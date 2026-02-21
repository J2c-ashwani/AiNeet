/**
 * Script to replace flat botany data with nested topic-wise data (2020-2025)
 * from the extracted botany blueprint PDF.
 */
import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'lib', 'ncert-data.js');
let content = fs.readFileSync(filePath, 'utf-8');

// The botany chapters currently stored as flat data (lines 270-286 approx)
// We need to replace each flat entry with nested topic data

const botanyTopicData = {
    // Chapter 1: Cell: The Unit of Life
    "'Cell: The Unit of Life'": {
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

    // Chapter 2: Cell Cycle and Cell Division (new - not currently in flat data as separate)
    "'Cell Cycle and Cell Division'": {
        'G1 Phase': { 2020: 2, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'Meiosis I': { 2020: 1, 2021: 1, 2022: 2, 2023: 1, 2024: 2, 2025: 0 },
        'Meiosis II': { 2020: 0, 2021: 1, 2022: 0, 2023: 2, 2024: 0, 2025: 0 },
        'Mitosis': { 2020: 0, 2021: 1, 2022: 2, 2023: 0, 2024: 1, 2025: 1 },
        'S Phase': { 2020: 0, 2021: 1, 2022: 0, 2023: 2, 2024: 0, 2025: 0 },
        'G2 Phase': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
        'Interphase': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
    },

    // Chapter 3: The Living World
    "'The Living World'": {
        'Species/Genus/Family/Order/Class/Phylum/Division/Kingdom': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
    },

    // Chapter 4: Biological Classification
    "'Biological Classification'": {
        'Viruses and Acellular organisms': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'General Characters (Fungi)/Mycorrhiza': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 2, 2025: 0 },
        'Ascomycetes': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
        'Mycoplasma': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
        'Characteristics': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
        'Five Kingdom': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
    },

    // Chapter 5: Plant Kingdom
    "'Plant Kingdom'": {
        'Rhodophyceae': { 2020: 1, 2021: 1, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
        'Chlorophyceae': { 2020: 1, 2021: 1, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
        'Characteristics and Importance': { 2020: 1, 2021: 1, 2022: 0, 2023: 1, 2024: 0, 2025: 1 },
        'Liverworts': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'Phaeophyceae': { 2020: 0, 2021: 1, 2022: 1, 2023: 0, 2024: 1, 2025: 0 },
        'Mosses': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
        'General Characteristics and Importance': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 1 },
        'Introduction, Characteristics': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 2 },
    },

    // Chapter 6: Morphology of Flowering Plants
    "'Morphology of Flowering Plants'": {
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

    // Chapter 7: Anatomy of Flowering Plants
    "'Anatomy of Flowering Plants'": {
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

    // Chapter 8: Plant Growth and Development
    "'Plant Growth and Development'": {
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

    // Chapter 9: Photosynthesis in Higher Plants
    "'Photosynthesis in Higher Plants'": {
        'Photorespiration': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
        'What is Light Reaction?': { 2020: 1, 2021: 1, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
        'Hatch and Slack Pathway': { 2020: 0, 2021: 1, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
        'Chemiosmotic Hypothesis': { 2020: 0, 2021: 0, 2022: 1, 2023: 1, 2024: 0, 2025: 0 },
        'Calvin Cycle (C3 Cycle/Primary Acceptor/Stages)': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 2, 2025: 2 },
        'Chlorophyll a, b, c, Xanthophylls, Carotenoids, Absorption and Action Spectrum': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
    },

    // Chapter 10: Respiration in Plants
    "'Respiration in Plants'": {
        'TCA Cycle': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
        'Electron Transport Chain': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 1, 2025: 1 },
        'Alcoholic and Lactic Acid Fermentation': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
        'Formation of Pyruvic Acid': { 2020: 0, 2021: 0, 2022: 1, 2023: 2, 2024: 0, 2025: 0 },
    },

    // Chapter 11: Sexual Reproduction in Flowering Plants
    "'Sexual Reproduction in Flowering Plants'": {
        'Microsporogenesis, T.S. of Anther, Pollen Grain, Pollen Viability': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'Pollination/Agents/Outbreeding Devices/Emasculation': { 2020: 1, 2021: 1, 2022: 3, 2023: 2, 2024: 2, 2025: 1 },
        'Structure and Development of Ovule and Female Gametophyte': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 2 },
        'Double Fertilisation': { 2020: 0, 2021: 1, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
        'Types of Fruits (Epicarp, Mesocarp, Endocarp, Endosperm)': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
        'Structure and Development of Anther and Male Gametophyte': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
        'Formation of Seed, Classification of Seed': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
    },

    // Chapter 12: Molecular Basis of Inheritance
    "'Molecular Basis of Inheritance'": {
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
        "Chargaff's Rule": { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
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

    // Chapter 13: Principles of Inheritance and Variation
    "'Principles of Inheritance and Variation'": {
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
        "Klinefelter's Syndrome": { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 1, 2025: 0 },
        "Down's Syndrome": { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
        'Pedigree Analysis': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 1 },
        'Test Cross': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
        'Incomplete Dominance': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
        'Monohybrid Cross, Law of Dominance, Law of Segregation': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
        'Law of Dominance': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
        'Polygenic Inheritance': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
    },

    // Chapter 14: Microbes in Human Welfare
    "'Microbes in Human Welfare'": {
        'Primary Treatment': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'Bioactive Molecules': { 2020: 1, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
        'Chemicals': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'Enzymes': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 1 },
        'Fermented Beverages': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
        'Microbes as Biofertilizers': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
        'Microbes in Household Products': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
    },

    // Chapter 15: Organisms and Populations
    "'Organisms and Populations'": {
        'Natality, Mortality, Immigration and Emigration': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'Types of Population Interactions': { 2020: 0, 2021: 2, 2022: 2, 2023: 2, 2024: 1, 2025: 1 },
        'Growth Models: Exponential and Logistic Growth': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 1, 2025: 1 },
        'Population Attributes': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
    },

    // Chapter 16: Ecosystem
    "'Ecosystem'": {
        'Food Chain': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
        'GPP': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'Pyramid of Biomass': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'NPP': { 2020: 0, 2021: 1, 2022: 0, 2023: 1, 2024: 1, 2025: 1 },
        'Process Involved in Decomposition': { 2020: 0, 2021: 0, 2022: 2, 2023: 1, 2024: 0, 2025: 0 },
        'Primary Productivity': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
        'Introduction': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
    },

    // Chapter 17: Biodiversity and Conservation
    "'Biodiversity and Conservation'": {
        'Introduction': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'Patterns of Biodiversity': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'Botanical Gardens, Zoological Parks and Wildlife Safari Parks': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 1, 2025: 2 },
        'IUCN Red List, Evil Quartet, Over-Exploitation, Alien Species': { 2020: 0, 2021: 0, 2022: 1, 2023: 1, 2024: 2, 2025: 0 },
        'Hot Spots, Major Hotspots in India, Sacred Groves': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
        'Earth Summit': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
        'Latitudinal Gradients': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
        'Productivity Stability Hypothesis, Rivet Popper Hypothesis': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
    },
};

// Now replace each flat line in the biology section with nested topic data
// The flat entries look like: 'Chapter Name': { 2021: X, 2022: Y, 2023: Z, 2024: W },
// We need to replace them with nested objects

function buildNestedJS(topics, indent = '            ') {
    let lines = [];
    for (const [topic, years] of Object.entries(topics)) {
        const yearStr = Object.entries(years).map(([y, v]) => `${y}: ${v}`).join(', ');
        lines.push(`${indent}'${topic.replace(/'/g, "\\'")}': { ${yearStr} },`);
    }
    return lines.join('\n');
}

// Map of old flat key patterns to their new nested data
const replacements = {
    "'The Living World': { 2021: 2, 2022: 2, 2023: 2, 2024: 2 },": "'The Living World'",
    "'Biological Classification': { 2021: 3, 2022: 3, 2023: 3, 2024: 3 },": "'Biological Classification'",
    "'Plant Kingdom': { 2021: 3, 2022: 5, 2023: 3, 2024: 3 },": "'Plant Kingdom'",
    "'Morphology of Flowering Plants': { 2021: 3, 2022: 3, 2023: 2, 2024: 3 },": "'Morphology of Flowering Plants'",
    "'Anatomy of Flowering Plants': { 2021: 2, 2022: 3, 2023: 2, 2024: 2 },": "'Anatomy of Flowering Plants'",
    "'Cell: The Unit of Life': { 2021: 3, 2022: 2, 2023: 3, 2024: 3 },": "'Cell: The Unit of Life'",
    "'Photosynthesis in Higher Plants': { 2021: 3, 2022: 2, 2023: 3, 2024: 3 },": "'Photosynthesis in Higher Plants'",
    "'Respiration in Plants': { 2021: 2, 2022: 2, 2023: 2, 2024: 2 },": "'Respiration in Plants'",
    "'Plant Growth and Development': { 2021: 2, 2022: 2, 2023: 2, 2024: 2 },": "'Plant Growth and Development'",
    "'Sexual Reproduction in Flowering Plants': { 2021: 3, 2022: 3, 2023: 3, 2024: 3 },": "'Sexual Reproduction in Flowering Plants'",
    "'Principles of Inheritance and Variation': { 2021: 4, 2022: 3, 2023: 4, 2024: 4 },": "'Principles of Inheritance and Variation'",
    "'Molecular Basis of Inheritance': { 2021: 4, 2022: 3, 2023: 4, 2024: 3 },": "'Molecular Basis of Inheritance'",
    "'Microbes in Human Welfare': { 2021: 2, 2022: 2, 2023: 2, 2024: 2 },": "'Microbes in Human Welfare'",
    "'Organisms and Populations': { 2021: 3, 2022: 3, 2023: 3, 2024: 3 },": "'Organisms and Populations'",
    "'Ecosystem': { 2021: 3, 2022: 2, 2023: 2, 2024: 3 },": "'Ecosystem'",
    "'Biodiversity and Conservation': { 2021: 2, 2022: 2, 2023: 2, 2024: 2 },": "'Biodiversity and Conservation'",
    "'Environmental Issues': { 2021: 2, 2022: 2, 2023: 2, 2024: 2 },": null, // No PDF data for this chapter, keep flat but add 2020/2025
};

let replacedCount = 0;

for (const [oldLine, key] of Object.entries(replacements)) {
    if (content.includes(oldLine)) {
        if (key === null) {
            // Environmental Issues - no PDF data, just add 2020 and 2025 with 0
            content = content.replace(
                oldLine,
                "'Environmental Issues': { 2020: 0, 2021: 2, 2022: 2, 2023: 2, 2024: 2, 2025: 0 },"
            );
            replacedCount++;
        } else {
            const topicData = botanyTopicData[key];
            if (topicData) {
                const nested = buildNestedJS(topicData);
                content = content.replace(
                    `        ${oldLine}`,
                    `        ${key}: {\n${nested}\n        },`
                );
                replacedCount++;
            }
        }
    }
}

// Also add "Cell Cycle and Cell Division" which doesn't exist as a flat entry
// It was previously part of "Cell: The Unit of Life" or missing
// Insert it after Cell: The Unit of Life
const cellCycleData = botanyTopicData["'Cell Cycle and Cell Division'"];
const cellCycleNested = buildNestedJS(cellCycleData);
const cellCycleBlock = `        'Cell Cycle and Cell Division': {\n${cellCycleNested}\n        },`;

// Insert after the Cell: The Unit of Life block
const cellUnitEnd = content.indexOf("        },\n        'The Living World'");
if (cellUnitEnd > -1) {
    content = content.slice(0, cellUnitEnd + 10) + '\n' + cellCycleBlock + '\n' + content.slice(cellUnitEnd + 10);
    replacedCount++;
    console.log('✅ Added Cell Cycle and Cell Division');
}

fs.writeFileSync(filePath, content);
console.log(`\n✅ Replaced ${replacedCount} botany chapters with nested topic-wise data`);

// Verify no flat entries left
const flatPattern = /'\w[^']+': \{ 2021: \d/g;
const remaining = content.match(flatPattern) || [];
if (remaining.length > 0) {
    console.log(`\n⚠️  ${remaining.length} flat entries still present:`);
    remaining.forEach(r => console.log(`   - ${r}`));
}
