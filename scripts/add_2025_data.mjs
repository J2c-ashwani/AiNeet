/**
 * Script to add 2025 data to zoology blueprint from extracted PDF text.
 * Reads zoology_extracted.txt, parses the 2025 column, and updates ncert-data.js
 */
import fs from 'fs';
import path from 'path';

// 2025 data extracted from zoology_extracted.txt (the 6th numeric column per topic row)
const data2025 = {
    'Structural Organisation in Animals': {
        'Epithelial Tissue (Simple Epithelium)': 0,
        'Epithelial Tissue (Glandular Epithelium)': 0,
        'Epithelial Tissue (Cell-Cell Communication Junctions)': 0,
        'Connective Tissue (Loose Connective Tissue)': 0,
        'Connective Tissue (Dense Regular Connective Tissue)': 0,
        'Dense Connective Tissue (Irregular Dense Connective Tissue)': 0,
        'Connective Tissue (Specialised Connective Tissue)': 0,
        'Connective Tissue (Specialised - Blood)': 0,
        'Epithelial Tissue (Compound Epithelium)': 0,
    },
    'Breathing and Exchange of Gases': {
        'Transport of Gases (O2 & CO2)': 0,
        'Mechanism of Breathing (Inspiration & Muscles)': 0,
        'Disorders of Respiratory System': 0,
        'Exchange of Gases (pO2, pCO2, Alveoli, Blood/Tissue)': 0,
        'Human Respiratory System': 0,
        'Respiratory Volumes and Capacities (TV, IRV, ERV, etc.)': 0,
        'Respiratory Capacities (Vital Capacity)': 0,
    },
    'Body Fluids and Circulation': {
        'ECG (PQRST & Clinical Significance)': 0,
        'Blood - Formed Elements (Leucocytes & Disorders)': 0,
        'Coagulation of Blood': 0,
        'Blood Groups (ABO)': 0,
        'Circulatory Pathways': 0,
        'Blood Plasma': 0,
        'Cardiac Cycle': 0,
        'Regulation of Cardiac Activity': 1,
    },
    'Excretory Products': {
        'Disorders of the Excretory System': 0,
        'Mechanism of Filtrate Concentration (Counter Current)': 0,
        'Regulation of Kidney Function (JGA, RAAS)': 0,
        'Osmoregulation (Introduction & Different Organisms)': 0,
        'Human Excretory System': 0,
        'Regulation of Kidney Function (Heart ANF)': 0,
        'Regulation of Kidney Function (ADH, RAAS, ANF)': 0,
        'Functions of the Tubules (PCT)': 0,
        "Functions of the Tubules (PCT, Henle's Loop, DCT)": 1,
    },
    'Locomotion and Movement': {
        'Skeletal System (Appendicular Skeleton)': 0,
        'Disorders of Muscular and Skeletal System': 1,
        'Types of Muscle (Smooth Muscle)': 0,
        'Skeletal System (Axial Skeleton)': 0,
        'Joints (Fibrous, Cartilaginous, Synovial)': 0,
        'Mechanism of Muscle Contraction (Sliding Filament Theory)': 0,
        'Types of Muscle (Cardiac Muscle)': 0,
    },
    'Neural Control and Coordination': {
        'Conduction of Nerve Impulse (Saltatory Conduction)': 0,
        'Parts of Brain (Forebrain)': 0,
        'Parts of Brain (Hindbrain)': 0,
    },
    'Chemical Coordination & Integration': {
        'Hormonal Disorders (Examples)': 0,
        'Adrenal Gland (Cortex Hormones)': 0,
        'Parathyroid Hormones & Function': 0,
        'Hormones (Current & Scientific Definition)': 0,
        'Thyroid Hormones & Function': 0,
        'Classification of Hormones (Protein & Steroid)': 0,
        'Adrenal Gland (Medulla Hormones)': 1,
        'Hormones of Gastrointestinal Tract': 1,
        'Hypothalamus (Location & Hormones)': 1,
        'Ovary Hormones & Function': 1,
    },
    'Animal Kingdom': {
        'Non-Chordate Classification (Coelenterata/Cnidaria)': 0,
        'Basis of Classification (Notochord)': 0,
        'Chordate Classification (Pisces - Chondrichthyes)': 0,
        'Non-Chordate Classification (Porifera)': 0,
        'Non-Chordate Classification (Ctenophora)': 0,
        'Non-Chordate Classification (Annelida)': 0,
        'Chordate Classification (Class Aves)': 0,
        'Non-Chordate Classification (Mollusca)': 0,
        'Non-Chordate Classification (Arthropoda)': 0,
        'Non-Chordate Classification (Aschelminthes/Nematoda)': 0,
        'Non-Chordate Classification (Platyhelminthes)': 0,
        'Non-Chordate Classification (Echinodermata)': 1,
        'Introduction (General Description)': 0,
        'Chordata and Non-Chordata (Differences/Examples)': 0,
        'Non-Chordate Classification (Hemichordata)': 0,
        'Chordate Classification (Class Mammalia)': 0,
        'Chordata - Vertebrata (Pisces: Chondrichthyes & Osteichthyes)': 0,
        'Broad Classification (Coelom)': 1,
        'Chordata - Vertebrata (Class Cyclostomata)': 1,
        'Phylum Chordata (Basic Features)': 1,
    },
    'Biomolecules': {
        'Enzymes (Classification & Nomenclature)': 1,
        'Nature of Bonds Linking Monomers (Glycosidic, Peptide, etc.)': 0,
        'Primary and Secondary Metabolites (Examples & Function)': 0,
        'Nucleic Acids (DNA)': 1,
        'Amino Acids (Types)': 0,
        'Proteins (Function)': 0,
        'Lipids (Glycerol & Fatty Acid)': 0,
        'Carbohydrates (Cell Wall Composition)': 0,
        'Lipids (Phospholipid, Triglycerides, Steroids, etc.)': 0,
        'Carbohydrates (Disaccharides)': 0,
        'Carbohydrates (Polysaccharides)': 0,
        'Enzymes (Inhibition)': 0,
        'Proteins (Structure)': 0,
        'Enzymes (Competitive/Non- Competitive Inhibition)': 0,
        'Enzymes (Co- factors)': 2,
        'Enzymes (Mechanism of Action)': 0,
        'Analysis of Chemical Composition (DNA)': 1,
    },
    'Human Reproduction': {
        'Gametogenesis (Oogenesis)': 0,
        'Placenta (Hormones)': 0,
        'Fertilisation (Mechanism & Significance)': 0,
        'Parturition (Foetal Ejection Reflex)': 0,
        'Pregnancy/Gestation (Period/Trimesters)': 0,
        'Gametogenesis (Spermatogenesis & Oogenesis)': 0,
        'Gametogenesis (Spermatogenesis)': 0,
        'Male Reproductive System (Parts & Accessory Glands)': 0,
        'Female Reproductive System (Parts & Accessory Glands)': 0,
        'Embryonic Development (Morula, Blastula, Gastrulation)': 0,
        'Menstrual Cycle': 2,
        'Female Reproductive System (External Genitalia)': 0,
        'Gametogenesis (Hormonal Control of Spermatogenesis and Oogenesis)': 0,
        'Lactation': 0,
        'Gametogenesis (Structure of Sperm)': 1,
        'Embryonic Development (Organ Development in Foetus)': 1,
        'Cleavage (Types)': 1,
    },
    'Reproductive Health': {
        'Assisted Reproductive Technologies (ART, IVF, etc.)': 1,
        'Sexually Transmitted Diseases (STDs)': 0,
        'Birth Control (Barrier Methods)': 0,
        'Birth Control (IUDS)': 0,
        'Birth Control (Sterilisation Procedure)': 0,
        'Birth Control (Natural Methods)': 0,
        'Birth Control (Oral Contraceptive)': 0,
        'Reproductive Health (Problems & Strategies)': 0,
    },
    'Human Health and Diseases': {
        'Common Diseases in Humans (Typhoid, Pneumonia, etc.)': 0,
        'Common Diseases in Humans (Life Cycle of Plasmodium)': 0,
        'Immunity (Active & Passive)': 0,
        'Common Diseases in Humans (Disease Causing Organisms)': 0,
        'Drugs (Different Types)': 0,
        'Immunity (Acquired)': 0,
        'AIDS (HIV Virus, Transmission, Symptoms)': 0,
        'Drugs (Opioids, Cannabinoids, Cocaine, etc.)': 0,
        'Lymphoid Organs (Secondary)': 1,
        'Cancer (Introduction)': 1,
        'Immunity (Structure of Antibody)': 1,
        'Immunity (Innate)': 1,
    },
    'Biotechnology: Principles': {
        'Gel Electrophoresis (DNA Fragments)': 1,
        'Restriction Enzymes (Types, Nomenclature, Ends)': 0,
        'Tools of Recombinant DNA Technology (Restriction Enzymes & Others)': 0,
        'Cloning Vectors (Plasmid pBR322)': 0,
        'Polymerase Chain Reaction (PCR Process & Applications)': 1,
        'Process of Recombinant DNA Technologies (Isolation of Genetic Material)': 0,
        'Identification of Clones (Antibiotic Resistance)': 0,
        'Principles of Biotechnology (Introduction)': 0,
        'Identification of Clones (Blue White Screening)': 1,
        'Methods of Gene Transfer (Gene Gun, Electroporation, etc.)': 0,
        'Cloning Vectors (Pbr322, Cosmids, etc.)': 1,
        'Process of Recombinant DNA Technologies (Insertion into Host Cell)': 0,
        'Obtaining Foreign Gene Product (Bioreactors)': 1,
        'Cloning Vectors (Ti Plasmid, Retrovirus for Plants/Animals)': 0,
        'Processes of Recombinant DNA Technologies (Gene Amplification using PCR)': 1,
    },
    'Biotechnology: Applications': {
        'Applications in Medicine (Recombinant Insulin - Humulin)': 2,
        'Applications in Agriculture (Bt Cotton)': 0,
        'Applications in Agriculture (RNA Interference)': 2,
        'Applications in Medicine (Gene Therapy)': 0,
        'Applications in Agriculture (Introduction)': 0,
        'Applications in Agriculture (Green Revolution)': 0,
        'Applications in Medicine (Molecular Diagnosis)': 0,
        'Applications in Medicine (Treatment of Cancer)': 1,
    },
    'Evolution': {
        'Origin of Life (Oparin-Haldane Theory)': 0,
        'Evidences for Evolution (Embryological)': 0,
        'Mechanism of Evolution (Variation, Mutation, Recombination)': 0,
        'Convergent and Divergent Evolution': 0,
        'Hardy-Weinberg Principle': 0,
        'Evidences for Evolution (Biogeographical)': 0,
        'Adaptive Radiation (Convergence & Divergence)': 0,
        'Natural Selection (Types)': 0,
        'Origin and Evolution of Man': 0,
        'Brief Account of Evolution (Animal Forms)': 0,
        'Evidences for Evolution (Morphological)': 1,
    },
};

// Read ncert-data.js
const filePath = path.join(process.cwd(), 'lib', 'ncert-data.js');
let content = fs.readFileSync(filePath, 'utf-8');

// For each chapter/topic, find the line with 2024 value and add 2025
let updated = 0;
let notFound = [];

for (const [chapter, topics] of Object.entries(data2025)) {
    for (const [topic, val2025] of Object.entries(topics)) {
        // Escape special regex chars in topic name
        const escapedTopic = topic.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Match the topic line with its year data object, specifically the 2024 entry
        // Pattern: 'Topic Name': { ..., 2024: X },  or  2024: X }
        const regex = new RegExp(
            `('${escapedTopic}':\\s*\\{[^}]*2024:\\s*)(\\d+)(\\s*\\})`,
            's'
        );

        const match = content.match(regex);
        if (match) {
            content = content.replace(regex, `$1$2, 2025: ${val2025}$3`);
            updated++;
        } else {
            notFound.push(`${chapter} > ${topic}`);
        }
    }
}

fs.writeFileSync(filePath, content);
console.log(`✅ Updated ${updated} topics with 2025 data`);
if (notFound.length > 0) {
    console.log(`\n⚠️  ${notFound.length} topics not found (may need manual check):`);
    notFound.forEach(t => console.log(`   - ${t}`));
}
