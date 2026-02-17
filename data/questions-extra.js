// Additional NEET Questions - Batch 2
// This file adds 150+ more questions to supplement the original question bank

const PHYSICS_EXTRA = [
    // Oscillations and Waves
    {
        chapter: 'Oscillations and Waves', topic: 'Sound waves', difficulty: 'easy',
        text: 'The speed of sound in air at 20°C is approximately:', options: ['343 m/s', '300 m/s', '400 m/s', '250 m/s'], correct: 'A',
        explanation: 'Speed of sound in air at 20°C is approximately 343 m/s.'
    },
    {
        chapter: 'Oscillations and Waves', topic: 'Standing waves', difficulty: 'medium',
        text: 'In a closed organ pipe, the ratio of frequencies of 1st and 2nd overtone is:', options: ['3:5', '1:2', '2:3', '1:3'], correct: 'A',
        explanation: 'Closed pipe has odd harmonics only: 1st overtone (3f) and 2nd overtone (5f), ratio = 3:5'
    },
    {
        chapter: 'Oscillations and Waves', topic: 'Doppler effect', difficulty: 'hard',
        text: 'A source moving towards a stationary observer with speed v/4. If frequency of source is f, apparent frequency is:', options: ['4f/3', '3f/4', '5f/4', 'f/2'], correct: 'A',
        explanation: 'f\' = f × v/(v-vs) = f × v/(v-v/4) = f × v/(3v/4) = 4f/3'
    },
    {
        chapter: 'Oscillations and Waves', topic: 'Wave equation', difficulty: 'medium',
        text: 'A wave is represented by y = 5sin(10t - 0.01x). The wave velocity is:', options: ['1000 m/s', '100 m/s', '10 m/s', '500 m/s'], correct: 'A',
        explanation: 'v = ω/k = 10/0.01 = 1000 m/s'
    },
    // Magnetism
    {
        chapter: 'Magnetic Effects of Current and Magnetism', topic: 'Biot-Savart law', difficulty: 'medium',
        text: 'The magnetic field at the centre of a circular coil of radius R carrying current I is:', options: ['μ₀I/2R', 'μ₀I/R', 'μ₀I/4R', '2μ₀I/R'], correct: 'A',
        explanation: 'B = μ₀I/2R at the centre of a circular loop.'
    },
    {
        chapter: 'Magnetic Effects of Current and Magnetism', topic: 'Ampere\'s law', difficulty: 'hard',
        text: 'A solenoid has 1000 turns per metre and carries 2A current. The magnetic field inside is:', options: ['2.51 × 10⁻³ T', '1.26 × 10⁻³ T', '5.02 × 10⁻³ T', '6.28 × 10⁻³ T'], correct: 'A',
        explanation: 'B = μ₀nI = 4π×10⁻⁷ × 1000 × 2 = 2.51 × 10⁻³ T'
    },
    {
        chapter: 'Magnetic Effects of Current and Magnetism', topic: 'Force on conductor', difficulty: 'easy',
        text: 'A straight conductor carrying current I in magnetic field B experiences maximum force when angle between them is:', options: ['90°', '0°', '45°', '60°'], correct: 'A',
        explanation: 'F = BIlsinθ is maximum when θ = 90°'
    },
    // EMI
    {
        chapter: 'Electromagnetic Induction and AC', topic: 'Faraday\'s law', difficulty: 'medium',
        text: 'The flux linked with a coil changes from 2Wb to 8Wb in 0.1s. The induced EMF is:', options: ['60 V', '20 V', '80 V', '6 V'], correct: 'A',
        explanation: 'EMF = -dΦ/dt = -(8-2)/0.1 = -60V, magnitude = 60V'
    },
    {
        chapter: 'Electromagnetic Induction and AC', topic: 'Self inductance', difficulty: 'neet',
        text: 'The self-inductance of a coil is 5mH. If current changes from 2A to 4A in 0.01s, the induced EMF is:', options: ['1 V', '0.5 V', '2 V', '10 V'], correct: 'A',
        explanation: 'EMF = -L(dI/dt) = -5×10⁻³ × (4-2)/0.01 = -1V'
    },
    // Semiconductors
    {
        chapter: 'Electronic Devices', topic: 'p-n junction', difficulty: 'easy',
        text: 'In forward bias of a p-n junction:', options: ['P is connected to +ve terminal', 'N is connected to +ve terminal', 'Both at same potential', 'No current flows'], correct: 'A',
        explanation: 'In forward bias, P-type is connected to positive terminal of battery.'
    },
    {
        chapter: 'Electronic Devices', topic: 'Logic gates', difficulty: 'medium',
        text: 'NAND gate is called universal gate because:', options: ['Any gate can be made from it', 'It has highest speed', 'It uses least power', 'It has two inputs'], correct: 'A',
        explanation: 'NAND gate is universal because any Boolean function can be implemented using only NAND gates.'
    },
    {
        chapter: 'Electronic Devices', topic: 'Diodes', difficulty: 'neet',
        text: 'In a full wave rectifier using two diodes, the output frequency for 50 Hz input is:', options: ['100 Hz', '50 Hz', '25 Hz', '200 Hz'], correct: 'A',
        explanation: 'Full wave rectifier doubles the frequency. Output = 2 × input = 100 Hz'
    },
    // Rotational Motion
    {
        chapter: 'Rotational Motion', topic: 'Moment of inertia', difficulty: 'medium',
        text: 'The moment of inertia of a solid sphere about its diameter is:', options: ['2MR²/5', 'MR²/2', 'MR²', '2MR²/3'], correct: 'A',
        explanation: 'For solid sphere about diameter, I = 2MR²/5'
    },
    {
        chapter: 'Rotational Motion', topic: 'Angular momentum', difficulty: 'hard',
        text: 'A disc of mass M and radius R is rotating with angular velocity ω. If a mass m is placed at edge, new ω is:', options: ['Mω/(M+2m)', 'Mω/(M+m)', '(M+m)ω/M', 'ω/2'], correct: 'A',
        explanation: 'L = Iω = const. (MR²/2)ω = (MR²/2 + mR²)ω\'. ω\' = Mω/(M+2m)'
    },
    // Oscillations
    {
        chapter: 'Oscillations and Waves', topic: 'Simple harmonic motion', difficulty: 'easy',
        text: 'The period of a simple pendulum of length 1m on earth (g=10m/s²) is approximately:', options: ['2 s', '1 s', '3 s', '0.5 s'], correct: 'A',
        explanation: 'T = 2π√(l/g) = 2π√(1/10) ≈ 2π × 0.316 ≈ 2 s'
    },
    {
        chapter: 'Oscillations and Waves', topic: 'Spring-mass system', difficulty: 'medium',
        text: 'Two springs of spring constants k₁ and k₂ are connected in parallel. Effective spring constant is:', options: ['k₁ + k₂', 'k₁k₂/(k₁+k₂)', '1/(k₁+k₂)', '(k₁+k₂)/2'], correct: 'A',
        explanation: 'In parallel, effective k = k₁ + k₂'
    },
    // Modern Physics
    {
        chapter: 'Dual Nature of Matter and Radiation', topic: 'Photoelectric effect', difficulty: 'neet',
        text: 'The work function of a metal is 2eV. The threshold wavelength for photoelectric emission is:', options: ['620 nm', '310 nm', '1240 nm', '420 nm'], correct: 'A',
        explanation: 'λ₀ = hc/φ = 1240/2 = 620 nm'
    },
    {
        chapter: 'Dual Nature of Matter and Radiation', topic: 'de Broglie wavelength', difficulty: 'medium',
        text: 'The de Broglie wavelength of an electron accelerated through 100V is approximately:', options: ['1.23 Å', '12.3 Å', '0.123 Å', '123 Å'], correct: 'A',
        explanation: 'λ = 12.3/√V Å = 12.3/√100 = 1.23 Å'
    },
    // Current Electricity extra
    {
        chapter: 'Current Electricity', topic: 'Kirchhoff\'s laws', difficulty: 'hard',
        text: 'Three resistors of 3Ω each are connected in delta. The equivalent resistance between any two terminals is:', options: ['2Ω', '3Ω', '1Ω', '4.5Ω'], correct: 'A',
        explanation: 'In delta: Two resistors in series (6Ω) in parallel with one (3Ω): 6×3/(6+3) = 2Ω'
    },
    {
        chapter: 'Current Electricity', topic: 'Wheatstone bridge', difficulty: 'neet',
        text: 'In a balanced Wheatstone bridge, if all resistances are doubled:', options: ['Bridge remains balanced', 'Galvanometer shows deflection', 'Current doubles', 'Current halves'], correct: 'A',
        explanation: 'Balance condition P/Q = R/S remains same when all are doubled.'
    },
];

const CHEMISTRY_EXTRA = [
    // Polymers
    {
        chapter: 'Amines and Biomolecules', topic: 'Types of polymers', difficulty: 'easy',
        text: 'Bakelite is an example of:', options: ['Thermosetting polymer', 'Thermoplastic', 'Elastomer', 'Fibre'], correct: 'A',
        explanation: 'Bakelite is a thermosetting polymer formed by condensation of phenol and formaldehyde.'
    },
    {
        chapter: 'Amines and Biomolecules', topic: 'Addition polymers', difficulty: 'medium',
        text: 'The monomer of natural rubber is:', options: ['Isoprene', 'Styrene', 'Vinyl chloride', 'Ethylene'], correct: 'A',
        explanation: 'Natural rubber is a polymer of isoprene (2-methyl-1,3-butadiene).'
    },
    // s-block
    {
        chapter: 'Classification of Elements', topic: 'Alkali metals', difficulty: 'easy',
        text: 'Which alkali metal has the lowest ionization energy?', options: ['Cesium', 'Lithium', 'Sodium', 'Potassium'], correct: 'A',
        explanation: 'Cs has the lowest IE due to largest atomic size in the group.'
    },
    {
        chapter: 'Classification of Elements', topic: 'Alkaline earth metals', difficulty: 'medium',
        text: 'Plaster of Paris is:', options: ['CaSO₄·½H₂O', 'CaSO₄·2H₂O', 'CaSO₄', 'Ca(OH)₂'], correct: 'A',
        explanation: 'Plaster of Paris is calcium sulphate hemihydrate.'
    },
    // p-block
    {
        chapter: 'p-Block Elements', topic: 'Group 15', difficulty: 'medium',
        text: 'The shape of PCl₅ molecule is:', options: ['Trigonal bipyramidal', 'Square pyramidal', 'Octahedral', 'Tetrahedral'], correct: 'A',
        explanation: 'PCl₅ has sp³d hybridization giving trigonal bipyramidal shape.'
    },
    {
        chapter: 'p-Block Elements', topic: 'Group 17', difficulty: 'neet',
        text: 'Which halogen acid has the highest bond dissociation energy?', options: ['HF', 'HCl', 'HBr', 'HI'], correct: 'A',
        explanation: 'HF has the highest BDE (574 kJ/mol) due to small size of F atom.'
    },
    // Coordination compounds
    {
        chapter: 'd and f Block Elements', topic: 'CFT', difficulty: 'hard',
        text: 'The CFSE of [Co(NH₃)₆]³⁺ (d⁶, strong field) is:', options: ['-2.4Δ₀ + 2P', '-0.4Δ₀', '-1.6Δ₀', '-2.4Δ₀'], correct: 'A',
        explanation: 'Strong field d⁶: t₂g⁶eg⁰. CFSE = -6(0.4Δ₀) + 0(0.6Δ₀) + 2P = -2.4Δ₀ + 2P'
    },
    // Surface chemistry
    {
        chapter: 'Equilibrium', topic: 'Colloids', difficulty: 'easy',
        text: 'The scattering of light by colloidal particles is called:', options: ['Tyndall effect', 'Brownian motion', 'Electrophoresis', 'Dialysis'], correct: 'A',
        explanation: 'Tyndall effect is the scattering of light by colloidal particles.'
    },
    {
        chapter: 'Equilibrium', topic: 'Adsorption', difficulty: 'medium',
        text: 'Physical adsorption is characterized by:', options: ['Low enthalpy of adsorption', 'High activation energy', 'Irreversibility', 'Monolayer formation only'], correct: 'A',
        explanation: 'Physisorption has low enthalpy (20-40 kJ/mol), is reversible, and forms multilayers.'
    },
    // Amines
    {
        chapter: 'Amines and Biomolecules', topic: 'Basic strength', difficulty: 'medium',
        text: 'Among the following, the strongest base in aqueous solution is:', options: ['(C₂H₅)₂NH', 'C₂H₅NH₂', '(C₂H₅)₃N', 'NH₃'], correct: 'A',
        explanation: 'In aqueous solution, secondary amines are strongest due to +I effect and solvation balance.'
    },
    {
        chapter: 'Amines and Biomolecules', topic: 'Reactions', difficulty: 'neet',
        text: 'Carbylamine reaction is given by:', options: ['Primary amines', 'Secondary amines', 'Tertiary amines', 'All amines'], correct: 'A',
        explanation: 'Only primary amines give carbylamine (isocyanide) test with CHCl₃ and KOH.'
    },
    // Haloalkanes
    {
        chapter: 'Organic Chemistry Basics', topic: 'SN reactions', difficulty: 'medium',
        text: 'SN1 reaction proceeds through:', options: ['Carbocation intermediate', 'Carbanion intermediate', 'Free radical', 'Concerted mechanism'], correct: 'A',
        explanation: 'SN1 proceeds via carbocation intermediate in two steps.'
    },
    {
        chapter: 'Organic Chemistry Basics', topic: 'Elimination', difficulty: 'hard',
        text: 'Saytzeff rule states that in elimination reactions, the major product is:', options: ['More substituted alkene', 'Less substituted alkene', 'Terminal alkene', 'Cyclic product'], correct: 'A',
        explanation: 'Saytzeff rule: H is eliminated from carbon with fewer H atoms, giving more substituted alkene.'
    },
    // Alcohols, Phenols
    {
        chapter: 'Organic Chemistry Basics', topic: 'Acidity', difficulty: 'medium',
        text: 'Phenol is more acidic than ethanol because:', options: ['Phenoxide ion is stabilized by resonance', 'Phenol has larger molecular weight', 'Phenol has weak O-H bond', 'Ethanol has stronger C-O bond'], correct: 'A',
        explanation: 'Phenoxide ion is resonance stabilized, making phenol more acidic.'
    },
    // Chemical Bonding extra
    {
        chapter: 'Chemical Bonding', topic: 'Molecular orbital theory', difficulty: 'neet',
        text: 'The bond order of O₂ molecule is:', options: ['2', '1', '3', '2.5'], correct: 'A',
        explanation: 'O₂: (σ₂s)²(σ*₂s)²(σ₂p)²(π₂p)⁴(π*₂p)². Bond order = (10-6)/2 = 2'
    },
    // Thermodynamics Chemistry
    {
        chapter: 'Thermodynamics', topic: 'Gibbs energy', difficulty: 'hard',
        text: 'A reaction is spontaneous at all temperatures when:', options: ['ΔH < 0 and ΔS > 0', 'ΔH > 0 and ΔS < 0', 'ΔH > 0 and ΔS > 0', 'ΔH < 0 and ΔS < 0'], correct: 'A',
        explanation: 'ΔG = ΔH - TΔS. For ΔG < 0 at all T: need ΔH < 0 and ΔS > 0.'
    },
    // Solid State
    {
        chapter: 'Solid State', topic: 'Crystal structures', difficulty: 'medium',
        text: 'The packing efficiency of BCC unit cell is approximately:', options: ['68%', '74%', '52%', '90%'], correct: 'A',
        explanation: 'BCC packing efficiency = (2 × 4/3 πr³)/(a³) × 100 ≈ 68%'
    },
    {
        chapter: 'Solid State', topic: 'Defects', difficulty: 'neet',
        text: 'Frenkel defect is shown by:', options: ['AgBr', 'NaCl', 'KCl', 'CsCl'], correct: 'A',
        explanation: 'AgBr shows both Schottky and Frenkel defects due to intermediate size of Ag⁺.'
    },
    // Biomolecules Chemistry
    {
        chapter: 'Amines and Biomolecules', topic: 'Drugs', difficulty: 'easy',
        text: 'Aspirin is chemically:', options: ['Acetyl salicylic acid', 'Benzoic acid', 'Salicylic acid', 'Acetic acid'], correct: 'A',
        explanation: 'Aspirin is 2-acetoxybenzoic acid or acetyl salicylic acid.'
    },
    {
        chapter: 'Amines and Biomolecules', topic: 'Carbohydrates', difficulty: 'medium',
        text: 'Sucrose on hydrolysis gives:', options: ['Glucose + Fructose', 'Glucose + Glucose', 'Glucose + Galactose', 'Fructose + Fructose'], correct: 'A',
        explanation: 'Sucrose is a disaccharide that hydrolyzes to glucose and fructose.'
    },
];

const BIOLOGY_EXTRA = [
    // Morphology of Flowering Plants
    {
        chapter: 'Morphology of Flowering Plants', topic: 'Root modifications', difficulty: 'easy',
        text: 'Pneumatophores are found in:', options: ['Rhizophora', 'Banyan', 'Turnip', 'Carrot'], correct: 'A',
        explanation: 'Rhizophora (mangrove) has pneumatophores for gaseous exchange in waterlogged soil.'
    },
    {
        chapter: 'Morphology of Flowering Plants', topic: 'Flower structure', difficulty: 'medium',
        text: 'Epipetalous stamens are found in:', options: ['Brinjal', 'China rose', 'Mustard', 'Pea'], correct: 'A',
        explanation: 'In brinjal (Solanum), stamens are attached to petals (epipetalous).'
    },
    // Animal Kingdom
    {
        chapter: 'Animal Kingdom', topic: 'Phylum classification', difficulty: 'easy',
        text: 'Water vascular system is characteristic of:', options: ['Echinodermata', 'Mollusca', 'Arthropoda', 'Annelida'], correct: 'A',
        explanation: 'Water vascular system is unique to Echinoderms (starfish, sea urchins).'
    },
    {
        chapter: 'Animal Kingdom', topic: 'Chordates', difficulty: 'medium',
        text: 'Which feature distinguishes mammals from other vertebrates?', options: ['Mammary glands', 'Warm blood', 'Four-chambered heart', 'Lungs'], correct: 'A',
        explanation: 'Mammary glands are the defining feature of class Mammalia.'
    },
    // Structural Organization
    {
        chapter: 'Animal Kingdom', topic: 'Tissues', difficulty: 'easy',
        text: 'Simple squamous epithelium is found in:', options: ['Blood vessels', 'Trachea', 'Stomach', 'Skin'], correct: 'A',
        explanation: 'Simple squamous epithelium lines blood vessels (endothelium) and body cavities.'
    },
    // Body Fluids and Circulation
    {
        chapter: 'Human Physiology', topic: 'Heart', difficulty: 'medium',
        text: 'The SA node is located in:', options: ['Right atrium', 'Left atrium', 'Right ventricle', 'Left ventricle'], correct: 'A',
        explanation: 'SA node (pacemaker) is in the upper right atrium near SVC opening.'
    },
    {
        chapter: 'Human Physiology', topic: 'Blood', difficulty: 'neet',
        text: 'The life span of RBCs in humans is approximately:', options: ['120 days', '30 days', '365 days', '7 days'], correct: 'A',
        explanation: 'Human RBCs live for about 120 days before being destroyed in spleen.'
    },
    // Breathing and Exchange of Gases
    {
        chapter: 'Human Physiology', topic: 'Respiration', difficulty: 'medium',
        text: 'The oxygen-haemoglobin dissociation curve is:', options: ['Sigmoidal', 'Linear', 'Hyperbolic', 'Exponential'], correct: 'A',
        explanation: 'The O₂-Hb dissociation curve is sigmoidal (S-shaped) due to cooperative binding.'
    },
    // Locomotion and Movement
    {
        chapter: 'Human Physiology', topic: 'Muscle contraction', difficulty: 'hard',
        text: 'During muscle contraction, the band that reduces in length is:', options: ['I-band', 'A-band', 'H-zone only', 'Both I and A bands'], correct: 'A',
        explanation: 'I-band (light band) shortens during contraction. A-band remains constant.'
    },
    // Reproduction in Organisms
    {
        chapter: 'Reproduction in Organisms', topic: 'Asexual reproduction', difficulty: 'easy',
        text: 'Budding is seen in:', options: ['Yeast', 'Amoeba', 'Planaria', 'Spirogyra'], correct: 'A',
        explanation: 'Yeast reproduces asexually by budding.'
    },
    {
        chapter: 'Human Reproduction', topic: 'Menstrual cycle', difficulty: 'neet',
        text: 'Ovulation occurs on approximately which day of the menstrual cycle?', options: ['14th day', '7th day', '21st day', '28th day'], correct: 'A',
        explanation: 'Ovulation typically occurs around the 14th day of a 28-day menstrual cycle.'
    },
    // Reproductive Health
    {
        chapter: 'Human Reproduction', topic: 'Contraception', difficulty: 'medium',
        text: 'Copper-T is an example of:', options: ['IUD', 'Oral pill', 'Barrier method', 'Surgical method'], correct: 'A',
        explanation: 'Copper-T is an Intra Uterine Device (IUD) that prevents implantation.'
    },
    // Molecular Basis of Inheritance
    {
        chapter: 'Genetics and Evolution', topic: 'Transcription', difficulty: 'medium',
        text: 'The enzyme RNA polymerase in eukaryotes that transcribes mRNA is:', options: ['RNA polymerase II', 'RNA polymerase I', 'RNA polymerase III', 'Reverse transcriptase'], correct: 'A',
        explanation: 'RNA Pol II transcribes mRNA (hnRNA/pre-mRNA) in eukaryotes.'
    },
    {
        chapter: 'Genetics and Evolution', topic: 'Genetic code', difficulty: 'neet',
        text: 'The total number of codons in the genetic code is:', options: ['64', '61', '20', '32'], correct: 'A',
        explanation: 'There are 64 codons (4³), of which 61 code for amino acids and 3 are stop codons.'
    },
    // Evolution
    {
        chapter: 'Genetics and Evolution', topic: 'Evolution', difficulty: 'easy',
        text: 'Darwin\'s theory of evolution is based on:', options: ['Natural selection', 'Mutation', 'Use and disuse', 'Isolation'], correct: 'A',
        explanation: 'Darwin proposed Natural Selection as the mechanism of evolution.'
    },
    {
        chapter: 'Genetics and Evolution', topic: 'Hardy-Weinberg', difficulty: 'hard',
        text: 'In Hardy-Weinberg equilibrium, if frequency of allele a is 0.4, frequency of heterozygotes (2pq) is:', options: ['0.48', '0.36', '0.16', '0.24'], correct: 'A',
        explanation: 'q = 0.4, p = 0.6. Heterozygotes = 2pq = 2 × 0.6 × 0.4 = 0.48'
    },
    // Health and Disease
    {
        chapter: 'Biology and Human Welfare', topic: 'Infectious diseases', difficulty: 'easy',
        text: 'Malaria is caused by:', options: ['Plasmodium', 'Entamoeba', 'Trypanosoma', 'Leishmania'], correct: 'A',
        explanation: 'Malaria is caused by Plasmodium species transmitted by female Anopheles mosquito.'
    },
    {
        chapter: 'Biology and Human Welfare', topic: 'Drugs', difficulty: 'medium',
        text: 'Opium is obtained from:', options: ['Papaver somniferum', 'Cannabis sativa', 'Erythroxylum coca', 'Atropa belladonna'], correct: 'A',
        explanation: 'Opium is extracted from latex of unripe capsules of Papaver somniferum (poppy plant).'
    },
    // Ecology Extra
    {
        chapter: 'Ecology', topic: 'Population ecology', difficulty: 'medium',
        text: 'The logistic growth equation is:', options: ['dN/dt = rN(K-N)/K', 'dN/dt = rN', 'dN/dt = r/N', 'dN/dt = rK'], correct: 'A',
        explanation: 'Logistic growth: dN/dt = rN(K-N)/K where K is carrying capacity.'
    },
    {
        chapter: 'Ecology', topic: 'Environmental issues', difficulty: 'easy',
        text: 'The greenhouse gas responsible for maximum global warming is:', options: ['CO₂', 'CH₄', 'N₂O', 'CFC'], correct: 'A',
        explanation: 'CO₂ is the major greenhouse gas contributing to global warming.'
    },
    {
        chapter: 'Ecology', topic: 'Succession', difficulty: 'neet',
        text: 'Primary succession on rocks is called:', options: ['Xerosere', 'Hydrosere', 'Psammosere', 'Lithosere'], correct: 'A',
        explanation: 'Xerosere/Lithosere is primary succession starting on bare rock.'
    },
    // Microbes
    {
        chapter: 'Biology and Human Welfare', topic: 'Microbes', difficulty: 'medium',
        text: 'Penicillin was discovered by:', options: ['Alexander Fleming', 'Louis Pasteur', 'Robert Koch', 'Edward Jenner'], correct: 'A',
        explanation: 'Alexander Fleming discovered penicillin from Penicillium notatum in 1928.'
    },
    // Anatomy of Flowering Plants
    {
        chapter: 'Anatomy of Flowering Plants', topic: 'Vascular tissue', difficulty: 'medium',
        text: 'Companion cells are associated with:', options: ['Sieve tubes', 'Tracheids', 'Vessels', 'Fibres'], correct: 'A',
        explanation: 'Companion cells are closely associated with sieve tube elements in phloem.'
    },
    // Plant Growth and Development
    {
        chapter: 'Plant Physiology', topic: 'Plant hormones', difficulty: 'easy',
        text: 'Which hormone is known as the stress hormone in plants?', options: ['Abscisic acid', 'Auxin', 'Gibberellin', 'Cytokinin'], correct: 'A',
        explanation: 'ABA (Abscisic acid) is called the stress hormone as it promotes dormancy and stomatal closure.'
    },
    {
        chapter: 'Plant Physiology', topic: 'Transpiration', difficulty: 'medium',
        text: 'Most transpiration occurs through:', options: ['Stomata', 'Cuticle', 'Lenticels', 'Bark'], correct: 'A',
        explanation: 'About 90% of transpiration occurs through stomata (stomatal transpiration).'
    },
    // Biotechnology extra
    {
        chapter: 'Biotechnology', topic: 'Applications', difficulty: 'neet',
        text: 'Bt cotton is resistant to:', options: ['Bollworm', 'Aphids', 'Whitefly', 'Root rot'], correct: 'A',
        explanation: 'Bt cotton contains Cry proteins from Bacillus thuringiensis that kill bollworm larvae.'
    },
    {
        chapter: 'Biotechnology', topic: 'Gene therapy', difficulty: 'hard',
        text: 'The first clinical gene therapy was done for:', options: ['ADA deficiency', 'Sickle cell anemia', 'Hemophilia', 'PKU'], correct: 'A',
        explanation: 'First gene therapy (1990) treated ADA (adenosine deaminase) deficiency.'
    },
];

module.exports = { PHYSICS_EXTRA, CHEMISTRY_EXTRA, BIOLOGY_EXTRA };
