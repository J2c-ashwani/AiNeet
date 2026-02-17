// Seed questions for Physics, Chemistry, and Biology
// Each question follows NEET format: MCQ with 4 options

const PHYSICS_QUESTIONS = [
    // Kinematics
    {
        chapter: 'Kinematics', topic: 'Equations of motion', difficulty: 'easy',
        text: 'A body starts from rest and accelerates uniformly at 2 m/s². The distance travelled in the 5th second is:',
        options: ['9 m', '11 m', '13 m', '15 m'], correct: 'A',
        explanation: 'Distance in nth second = u + a(2n-1)/2 = 0 + 2(2×5-1)/2 = 9 m'
    },
    {
        chapter: 'Kinematics', topic: 'Projectile motion', difficulty: 'medium',
        text: 'A projectile is thrown at angle 60° with horizontal with speed 20 m/s. The maximum height reached is (g = 10 m/s²):',
        options: ['15 m', '20 m', '10 m', '5 m'], correct: 'A',
        explanation: 'H = u²sin²θ/(2g) = 400×(3/4)/(20) = 15 m'
    },
    {
        chapter: 'Kinematics', topic: 'Circular motion', difficulty: 'medium',
        text: 'A particle moves in a circle of radius 20 cm with a linear speed of 10 m/s. The angular speed is:',
        options: ['50 rad/s', '100 rad/s', '25 rad/s', '75 rad/s'], correct: 'A',
        explanation: 'ω = v/r = 10/0.2 = 50 rad/s'
    },
    {
        chapter: 'Kinematics', topic: 'Motion in a straight line', difficulty: 'easy',
        text: 'A car moving at 36 km/h is brought to rest in 10 seconds. The retardation is:',
        options: ['1 m/s²', '2 m/s²', '3 m/s²', '4 m/s²'], correct: 'A',
        explanation: '36 km/h = 10 m/s. Retardation = v/t = 10/10 = 1 m/s²'
    },
    // Laws of Motion
    {
        chapter: 'Laws of Motion', topic: "Newton's laws", difficulty: 'easy',
        text: 'A force of 10 N acts on a body of mass 2 kg. The acceleration produced is:',
        options: ['5 m/s²', '10 m/s²', '2 m/s²', '20 m/s²'], correct: 'A',
        explanation: 'F = ma, so a = F/m = 10/2 = 5 m/s²'
    },
    {
        chapter: 'Laws of Motion', topic: 'Friction', difficulty: 'medium',
        text: 'A block of mass 5 kg on a rough surface (μ = 0.4) is pulled by a force of 30 N horizontally. The acceleration is (g = 10 m/s²):',
        options: ['2 m/s²', '4 m/s²', '6 m/s²', '8 m/s²'], correct: 'A',
        explanation: 'Friction = μmg = 0.4×5×10 = 20 N. Net force = 30-20 = 10 N. a = 10/5 = 2 m/s²'
    },
    {
        chapter: 'Laws of Motion', topic: "Newton's laws", difficulty: 'neet',
        text: 'Two blocks of masses 3 kg and 2 kg are connected by a string and placed on a frictionless surface. A force of 25 N is applied on the 3 kg block. The tension in the string is:',
        options: ['10 N', '15 N', '20 N', '5 N'], correct: 'A',
        explanation: 'Common acceleration = 25/5 = 5 m/s². Tension = 2×5 = 10 N'
    },
    // Work, Energy and Power
    {
        chapter: 'Work, Energy and Power', topic: 'Work-energy theorem', difficulty: 'easy',
        text: 'A body of mass 2 kg moving with velocity 10 m/s is brought to rest. The work done by the retarding force is:',
        options: ['-100 J', '100 J', '-50 J', '50 J'], correct: 'A',
        explanation: 'Work done = ΔKE = 0 - ½mv² = -½×2×100 = -100 J'
    },
    {
        chapter: 'Work, Energy and Power', topic: 'Conservation of energy', difficulty: 'medium',
        text: 'A ball is dropped from height 10 m. What is its velocity just before hitting the ground? (g = 10 m/s²)',
        options: ['√200 m/s', '10 m/s', '20 m/s', '√100 m/s'], correct: 'A',
        explanation: 'Using v² = 2gh, v = √(2×10×10) = √200 m/s ≈ 14.14 m/s'
    },
    // Gravitation
    {
        chapter: 'Gravitation', topic: 'Orbital velocity', difficulty: 'hard',
        text: 'The orbital velocity of a satellite orbiting close to earth surface is approximately:',
        options: ['7.9 km/s', '11.2 km/s', '3.1 km/s', '15.8 km/s'], correct: 'A',
        explanation: 'v₀ = √(gR) = √(9.8 × 6.4×10⁶) ≈ 7.9 km/s'
    },
    // Thermodynamics
    {
        chapter: 'Thermodynamics', topic: 'Laws of thermodynamics', difficulty: 'medium',
        text: 'In an isothermal process, the change in internal energy is:',
        options: ['Zero', 'Positive', 'Negative', 'Cannot be determined'], correct: 'A',
        explanation: 'In isothermal process, temperature is constant, so ΔU = 0 for ideal gas.'
    },
    {
        chapter: 'Thermodynamics', topic: 'Carnot cycle', difficulty: 'hard',
        text: 'A Carnot engine works between 127°C and 27°C. Its efficiency is:',
        options: ['25%', '50%', '75%', '100%'], correct: 'A',
        explanation: 'η = 1 - T₂/T₁ = 1 - 300/400 = 0.25 = 25%'
    },
    // Optics
    {
        chapter: 'Optics', topic: 'Refraction', difficulty: 'medium',
        text: 'The refractive index of glass is 1.5. The speed of light in glass is:',
        options: ['2 × 10⁸ m/s', '3 × 10⁸ m/s', '1.5 × 10⁸ m/s', '4.5 × 10⁸ m/s'], correct: 'A',
        explanation: 'v = c/n = 3×10⁸/1.5 = 2×10⁸ m/s'
    },
    {
        chapter: 'Optics', topic: 'Lenses', difficulty: 'easy',
        text: 'A convex lens has focal length 20 cm. Its power is:',
        options: ['5 D', '0.2 D', '20 D', '0.05 D'], correct: 'A',
        explanation: 'P = 1/f = 1/0.2 = 5 D'
    },
    {
        chapter: 'Optics', topic: 'Interference', difficulty: 'neet',
        text: 'In Young\'s double slit experiment, the fringe width is 0.5 mm. If the distance between slits is halved, the new fringe width is:',
        options: ['1.0 mm', '0.25 mm', '0.5 mm', '2.0 mm'], correct: 'A',
        explanation: 'β = λD/d. If d is halved, β doubles = 1.0 mm'
    },
    // Electrostatics
    {
        chapter: 'Electrostatics', topic: "Coulomb's law", difficulty: 'easy',
        text: 'Two charges of 1C each are placed 1m apart. The force between them is:',
        options: ['9 × 10⁹ N', '9 × 10⁻⁹ N', '1 N', '9 N'], correct: 'A',
        explanation: 'F = kq₁q₂/r² = 9×10⁹×1×1/1 = 9×10⁹ N'
    },
    {
        chapter: 'Electrostatics', topic: 'Capacitors', difficulty: 'medium',
        text: 'Three capacitors of 3 μF each are connected in series. The equivalent capacitance is:',
        options: ['1 μF', '9 μF', '3 μF', '6 μF'], correct: 'A',
        explanation: '1/C = 1/3 + 1/3 + 1/3 = 1. C = 1 μF'
    },
    // Current Electricity
    {
        chapter: 'Current Electricity', topic: "Ohm's law", difficulty: 'easy',
        text: 'A wire of resistance 10Ω carries current of 2A. The potential difference across it is:',
        options: ['20 V', '5 V', '12 V', '0.2 V'], correct: 'A',
        explanation: 'V = IR = 2 × 10 = 20 V'
    },
    // Atoms and Nuclei
    {
        chapter: 'Atoms and Nuclei', topic: 'Radioactivity', difficulty: 'hard',
        text: 'The half-life of a radioactive substance is 5 years. What fraction remains after 15 years?',
        options: ['1/8', '1/4', '1/2', '1/16'], correct: 'A',
        explanation: 'After 15 years = 3 half-lives. Fraction = (1/2)³ = 1/8'
    },
    {
        chapter: 'Atoms and Nuclei', topic: 'Bohr model', difficulty: 'neet',
        text: 'The radius of the first Bohr orbit of hydrogen atom is 0.529 Å. The radius of the third orbit is:',
        options: ['4.761 Å', '1.587 Å', '0.176 Å', '15.87 Å'], correct: 'A',
        explanation: 'rₙ = n²r₁ = 9 × 0.529 = 4.761 Å'
    },
];

const CHEMISTRY_QUESTIONS = [
    // Mole concept
    {
        chapter: 'Some Basic Concepts of Chemistry', topic: 'Mole concept', difficulty: 'easy',
        text: 'The number of moles of CO₂ in 44g of CO₂ is:',
        options: ['1', '2', '0.5', '4'], correct: 'A',
        explanation: 'Molar mass of CO₂ = 44 g/mol. Moles = 44/44 = 1'
    },
    {
        chapter: 'Some Basic Concepts of Chemistry', topic: 'Stoichiometry', difficulty: 'medium',
        text: 'How many moles of H₂O are produced when 2 moles of H₂ react with excess O₂?',
        options: ['2', '1', '4', '0.5'], correct: 'A',
        explanation: '2H₂ + O₂ → 2H₂O. 2 moles H₂ give 2 moles H₂O'
    },
    // Atomic Structure
    {
        chapter: 'Structure of Atom', topic: 'Quantum numbers', difficulty: 'medium',
        text: 'The maximum number of electrons in a subshell with l=2 is:',
        options: ['10', '6', '14', '2'], correct: 'A',
        explanation: 'Max electrons in a subshell = 2(2l+1) = 2(5) = 10'
    },
    {
        chapter: 'Structure of Atom', topic: 'Electronic configuration', difficulty: 'easy',
        text: 'The electronic configuration of Na (Z=11) is:',
        options: ['1s²2s²2p⁶3s¹', '1s²2s²2p⁶3p¹', '1s²2s²2p⁵3s²', '1s²2s²3s²2p⁵'], correct: 'A',
        explanation: 'Na has 11 electrons: 1s²2s²2p⁶3s¹'
    },
    // Chemical Bonding
    {
        chapter: 'Chemical Bonding', topic: 'Hybridization', difficulty: 'medium',
        text: 'The hybridization of carbon in methane (CH₄) is:',
        options: ['sp³', 'sp²', 'sp', 'sp³d'], correct: 'A',
        explanation: 'Carbon in CH₄ has 4 bond pairs and no lone pairs → sp³ hybridization'
    },
    {
        chapter: 'Chemical Bonding', topic: 'VSEPR theory', difficulty: 'neet',
        text: 'The shape of SF₆ molecule is:',
        options: ['Octahedral', 'Trigonal bipyramidal', 'Square planar', 'Tetrahedral'], correct: 'A',
        explanation: 'SF₆ has 6 bond pairs and no lone pairs → Octahedral'
    },
    // Equilibrium
    {
        chapter: 'Equilibrium', topic: 'pH and buffers', difficulty: 'easy',
        text: 'The pH of 0.01 M HCl solution is:',
        options: ['2', '1', '3', '0.01'], correct: 'A',
        explanation: 'pH = -log[H⁺] = -log(0.01) = -log(10⁻²) = 2'
    },
    {
        chapter: 'Equilibrium', topic: 'Chemical equilibrium', difficulty: 'hard',
        text: 'For the reaction N₂ + 3H₂ ⇌ 2NH₃, if Kc = 0.5, then the value of Kc for ½N₂ + 3/2H₂ ⇌ NH₃ is:',
        options: ['0.707', '0.25', '2', '0.5'], correct: 'A',
        explanation: 'When equation is halved, K becomes √K = √0.5 = 0.707'
    },
    // Organic Chemistry
    {
        chapter: 'Organic Chemistry Basics', topic: 'IUPAC nomenclature', difficulty: 'easy',
        text: 'The IUPAC name of CH₃-CH₂-CH₂-OH is:',
        options: ['Propan-1-ol', 'Propan-2-ol', 'Ethanol', 'Butanol'], correct: 'A',
        explanation: 'Three carbon chain with OH at position 1 → Propan-1-ol'
    },
    {
        chapter: 'Organic Chemistry Basics', topic: 'Isomerism', difficulty: 'medium',
        text: 'The number of structural isomers of C₄H₁₀ is:',
        options: ['2', '3', '4', '1'], correct: 'A',
        explanation: 'C₄H₁₀ has 2 isomers: n-butane and isobutane (2-methylpropane)'
    },
    {
        chapter: 'Hydrocarbons', topic: 'Aromatic compounds', difficulty: 'neet',
        text: 'Benzene undergoes which type of reaction predominantly?',
        options: ['Electrophilic substitution', 'Nucleophilic addition', 'Electrophilic addition', 'Free radical substitution'], correct: 'A',
        explanation: 'Benzene being electron-rich due to delocalized π electrons undergoes electrophilic substitution.'
    },
    // Electrochemistry
    {
        chapter: 'Electrochemistry', topic: 'Nernst equation', difficulty: 'hard',
        text: 'The standard electrode potential of Zn²⁺/Zn is -0.76V and Cu²⁺/Cu is +0.34V. The EMF of Daniell cell is:',
        options: ['1.10 V', '0.42 V', '-1.10 V', '0.76 V'], correct: 'A',
        explanation: 'E°cell = E°cathode - E°anode = 0.34 - (-0.76) = 1.10 V'
    },
    // Chemical Kinetics
    {
        chapter: 'Chemical Kinetics', topic: 'Order of reaction', difficulty: 'medium',
        text: 'For a first-order reaction, the half-life is:',
        options: ['0.693/k', 'k/0.693', '1/k', '2/k'], correct: 'A',
        explanation: 'For first-order reaction, t₁/₂ = ln2/k = 0.693/k'
    },
    // Solutions
    {
        chapter: 'Solutions', topic: 'Colligative properties', difficulty: 'medium',
        text: 'The boiling point elevation for 0.5 m solution of NaCl (i=2) with Kb=0.52 is:',
        options: ['0.52°C', '0.26°C', '1.04°C', '0.13°C'], correct: 'A',
        explanation: 'ΔTb = i×Kb×m = 2×0.52×0.5 = 0.52°C'
    },
    // Periodic Table
    {
        chapter: 'Classification of Elements', topic: 'Periodic properties', difficulty: 'easy',
        text: 'Which element has the highest electronegativity?',
        options: ['Fluorine', 'Oxygen', 'Chlorine', 'Nitrogen'], correct: 'A',
        explanation: 'Fluorine has the highest electronegativity (3.98 on Pauling scale)'
    },
    // Thermodynamics
    {
        chapter: 'Thermodynamics', topic: 'Enthalpy', difficulty: 'medium',
        text: 'An exothermic reaction has:',
        options: ['Negative ΔH', 'Positive ΔH', 'Zero ΔH', 'Cannot be determined'], correct: 'A',
        explanation: 'Exothermic reactions release heat, so ΔH is negative.'
    },
    // d-block
    {
        chapter: 'd and f Block Elements', topic: 'Transition elements', difficulty: 'neet',
        text: 'Which of the following ions is colourless?',
        options: ['Sc³⁺', 'Ti³⁺', 'Cr³⁺', 'Cu²⁺'], correct: 'A',
        explanation: 'Sc³⁺ has no d-electrons (d⁰), so it cannot undergo d-d transition and is colourless.'
    },
    {
        chapter: 'Aldehydes, Ketones and Carboxylic Acids', topic: 'Nucleophilic addition', difficulty: 'medium',
        text: 'Fehling\'s solution is reduced by:',
        options: ['Formaldehyde', 'Acetone', 'Benzaldehyde', 'Acetophenone'], correct: 'A',
        explanation: 'Fehling\'s solution is reduced by aliphatic aldehydes like formaldehyde. Ketones and aromatic aldehydes do not reduce it.'
    },
    {
        chapter: 'Redox Reactions', topic: 'Oxidation-reduction', difficulty: 'easy',
        text: 'In the reaction 2Mg + O₂ → 2MgO, magnesium is:',
        options: ['Oxidized', 'Reduced', 'Neither', 'Both'], correct: 'A',
        explanation: 'Mg goes from 0 to +2 oxidation state, so it is oxidized.'
    },
    {
        chapter: 'States of Matter', topic: 'Gas laws', difficulty: 'easy',
        text: 'At constant temperature, if the pressure of a gas is doubled, the volume becomes:',
        options: ['Half', 'Double', 'Same', 'Four times'], correct: 'A',
        explanation: "According to Boyle's law, PV = constant. If P doubles, V halves."
    },
];

const BIOLOGY_QUESTIONS = [
    // Cell Biology
    {
        chapter: 'Cell Biology', topic: 'Cell organelles', difficulty: 'easy',
        text: 'Which organelle is called the powerhouse of the cell?',
        options: ['Mitochondria', 'Chloroplast', 'Nucleus', 'Ribosome'], correct: 'A',
        explanation: 'Mitochondria is called the powerhouse because it produces ATP through cellular respiration.'
    },
    {
        chapter: 'Cell Biology', topic: 'Cell division', difficulty: 'medium',
        text: 'During which phase of mitosis do chromosomes align at the cell equator?',
        options: ['Metaphase', 'Anaphase', 'Prophase', 'Telophase'], correct: 'A',
        explanation: 'In metaphase, chromosomes align at the metaphase plate (cell equator).'
    },
    {
        chapter: 'Cell Biology', topic: 'Prokaryotic vs eukaryotic', difficulty: 'easy',
        text: 'Which of the following is absent in prokaryotic cells?',
        options: ['Nuclear membrane', 'Ribosome', 'Cell wall', 'DNA'], correct: 'A',
        explanation: 'Prokaryotic cells lack a nuclear membrane; their DNA is in the nucleoid region.'
    },
    // Genetics
    {
        chapter: 'Genetics and Evolution', topic: "Mendel's laws", difficulty: 'easy',
        text: 'The phenotypic ratio of a monohybrid cross is:',
        options: ['3:1', '1:2:1', '9:3:3:1', '1:1'], correct: 'A',
        explanation: "Mendel's monohybrid cross gives a 3:1 phenotypic ratio (dominant:recessive)."
    },
    {
        chapter: 'Genetics and Evolution', topic: 'DNA replication', difficulty: 'medium',
        text: 'DNA replication is:',
        options: ['Semi-conservative', 'Conservative', 'Dispersive', 'Non-conservative'], correct: 'A',
        explanation: 'Meselson-Stahl experiment proved that DNA replication is semi-conservative.'
    },
    {
        chapter: 'Genetics and Evolution', topic: 'Gene expression', difficulty: 'hard',
        text: 'The codon AUG codes for:',
        options: ['Methionine', 'Leucine', 'Valine', 'Alanine'], correct: 'A',
        explanation: 'AUG is the start codon and codes for methionine in eukaryotes.'
    },
    {
        chapter: 'Genetics and Evolution', topic: 'Mutation', difficulty: 'neet',
        text: 'Sickle cell anaemia is caused by substitution of:',
        options: ['Glutamic acid by valine', 'Valine by glutamic acid', 'Leucine by valine', 'Alanine by glycine'], correct: 'A',
        explanation: 'In sickle cell anaemia, glutamic acid at position 6 of β-globin chain is replaced by valine.'
    },
    // Plant Physiology
    {
        chapter: 'Plant Physiology', topic: 'Photosynthesis', difficulty: 'easy',
        text: 'The pigment primarily responsible for photosynthesis is:',
        options: ['Chlorophyll a', 'Chlorophyll b', 'Carotenoids', 'Xanthophyll'], correct: 'A',
        explanation: 'Chlorophyll a is the primary photosynthetic pigment and the reaction centre pigment.'
    },
    {
        chapter: 'Plant Physiology', topic: 'Photosynthesis', difficulty: 'neet',
        text: 'C4 plants differ from C3 plants in having:',
        options: ['Kranz anatomy', 'Bundle sheath without chloroplasts', 'Only one type of chloroplast', 'No photorespiration at all'], correct: 'A',
        explanation: 'C4 plants have Kranz anatomy with specialized bundle sheath cells containing chloroplasts.'
    },
    {
        chapter: 'Plant Physiology', topic: 'Respiration', difficulty: 'medium',
        text: 'The net gain of ATP in glycolysis is:',
        options: ['2', '4', '8', '36'], correct: 'A',
        explanation: 'Glycolysis produces 4 ATP but consumes 2 ATP, giving a net gain of 2 ATP.'
    },
    // Human Physiology
    {
        chapter: 'Human Physiology', topic: 'Digestion', difficulty: 'easy',
        text: 'Which enzyme breaks down starch into maltose?',
        options: ['Amylase', 'Pepsin', 'Lipase', 'Trypsin'], correct: 'A',
        explanation: 'Amylase (salivary and pancreatic) breaks down starch into maltose.'
    },
    {
        chapter: 'Human Physiology', topic: 'Body fluids and circulation', difficulty: 'medium',
        text: 'Which blood group is called the universal donor?',
        options: ['O', 'AB', 'A', 'B'], correct: 'A',
        explanation: 'Blood group O has no antigens on RBCs, so it can be donated to all blood groups.'
    },
    {
        chapter: 'Human Physiology', topic: 'Neural control', difficulty: 'hard',
        text: 'The resting membrane potential of a neuron is approximately:',
        options: ['-70 mV', '+70 mV', '-30 mV', '0 mV'], correct: 'A',
        explanation: 'The resting membrane potential is about -70 mV due to unequal distribution of ions.'
    },
    {
        chapter: 'Human Physiology', topic: 'Excretion', difficulty: 'neet',
        text: 'The functional unit of kidney is:',
        options: ['Nephron', 'Neuron', 'Glomerulus', 'Bowman\'s capsule'], correct: 'A',
        explanation: 'Nephron is the structural and functional unit of kidney, responsible for urine formation.'
    },
    // Ecology
    {
        chapter: 'Ecology', topic: 'Ecosystems', difficulty: 'easy',
        text: 'The 10% law of energy transfer was given by:',
        options: ['Lindeman', 'Odum', 'Tansley', 'Haeckel'], correct: 'A',
        explanation: 'Lindeman gave the 10% law which states only 10% energy is transferred to next trophic level.'
    },
    {
        chapter: 'Ecology', topic: 'Biodiversity', difficulty: 'medium',
        text: 'Which region is called a biodiversity hotspot in India?',
        options: ['Western Ghats', 'Thar Desert', 'Indo-Gangetic Plains', 'Deccan Plateau'], correct: 'A',
        explanation: 'Western Ghats is one of the 36 biodiversity hotspots of the world.'
    },
    // Reproduction
    {
        chapter: 'Reproduction in Organisms', topic: 'Pollination', difficulty: 'easy',
        text: 'Transfer of pollen grains from anther to stigma of the same flower is called:',
        options: ['Autogamy', 'Geitonogamy', 'Xenogamy', 'Cleistogamy'], correct: 'A',
        explanation: 'Autogamy is self-pollination within the same flower.'
    },
    {
        chapter: 'Human Reproduction', topic: 'Gametogenesis', difficulty: 'medium',
        text: 'The number of sperms produced from one primary spermatocyte is:',
        options: ['4', '2', '1', '8'], correct: 'A',
        explanation: 'One primary spermatocyte undergoes meiosis to form 4 spermatids, which mature into 4 sperms.'
    },
    // Biotechnology
    {
        chapter: 'Biotechnology', topic: 'Recombinant DNA technology', difficulty: 'medium',
        text: 'Which enzyme is used to cut DNA at specific sites?',
        options: ['Restriction endonuclease', 'DNA ligase', 'DNA polymerase', 'Reverse transcriptase'], correct: 'A',
        explanation: 'Restriction endonucleases are molecular scissors that cut DNA at specific recognition sequences.'
    },
    {
        chapter: 'Biotechnology', topic: 'PCR', difficulty: 'neet',
        text: 'PCR (Polymerase Chain Reaction) requires:',
        options: ['Taq polymerase', 'DNA ligase', 'Restriction enzyme', 'RNA polymerase'], correct: 'A',
        explanation: 'PCR uses thermostable Taq polymerase (from Thermus aquaticus) for DNA amplification.'
    },
    // Classification
    {
        chapter: 'Biological Classification', topic: 'Five kingdom classification', difficulty: 'easy',
        text: 'Five kingdom classification was proposed by:',
        options: ['Whittaker', 'Linnaeus', 'Haeckel', 'Copeland'], correct: 'A',
        explanation: 'R.H. Whittaker proposed the five kingdom classification in 1969.'
    },
    // Biomolecules
    {
        chapter: 'Biomolecules', topic: 'Enzymes', difficulty: 'medium',
        text: 'Enzymes are chemically:',
        options: ['Proteins', 'Carbohydrates', 'Lipids', 'Nucleic acids'], correct: 'A',
        explanation: 'Almost all enzymes are proteins (except ribozymes which are RNA).'
    },
    // Biology and Human Welfare
    {
        chapter: 'Biology and Human Welfare', topic: 'Immunity', difficulty: 'neet',
        text: 'Which type of immunity is provided by vaccination?',
        options: ['Active acquired immunity', 'Passive acquired immunity', 'Innate immunity', 'Natural immunity'], correct: 'A',
        explanation: 'Vaccination provides active acquired immunity by stimulating antibody production against antigens.'
    },
    {
        chapter: 'Biology and Human Welfare', topic: 'AIDS and cancer', difficulty: 'medium',
        text: 'HIV attacks which type of immune cells?',
        options: ['Helper T cells', 'B cells', 'Killer T cells', 'Macrophages'], correct: 'A',
        explanation: 'HIV infects helper T cells (CD4+), weakening the immune system.'
    },
];

module.exports = { PHYSICS_QUESTIONS, CHEMISTRY_QUESTIONS, BIOLOGY_QUESTIONS };
