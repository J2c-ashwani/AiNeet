// Complete NEET Syllabus: Subject → Chapter → Topic hierarchy
const NEET_SYLLABUS = {
    physics: {
        name: 'Physics',
        icon: '⚡',
        color: '#3b82f6',
        chapters: [
            {
                name: 'Physical World and Measurement',
                class: 11,
                topics: ['Physical quantities', 'SI Units', 'Dimensional analysis', 'Errors in measurement', 'Significant figures']
            },
            {
                name: 'Kinematics',
                class: 11,
                topics: ['Motion in a straight line', 'Equations of motion', 'Relative motion', 'Projectile motion', 'Circular motion']
            },
            {
                name: 'Laws of Motion',
                class: 11,
                topics: ["Newton's laws", 'Friction', 'Circular motion dynamics', 'Free body diagrams', 'Pseudo forces']
            },
            {
                name: 'Work, Energy and Power',
                class: 11,
                topics: ['Work-energy theorem', 'Kinetic energy', 'Potential energy', 'Conservation of energy', 'Power and collisions']
            },
            {
                name: 'Rotational Motion',
                class: 11,
                topics: ['Moment of inertia', 'Torque', 'Angular momentum', 'Rolling motion', 'Equilibrium of rigid bodies']
            },
            {
                name: 'Gravitation',
                class: 11,
                topics: ["Newton's law of gravitation", 'Gravitational potential', 'Orbital velocity', 'Escape velocity', "Kepler's laws"]
            },
            {
                name: 'Properties of Solids and Liquids',
                class: 11,
                topics: ['Elasticity', "Young's modulus", 'Surface tension', 'Viscosity', "Bernoulli's theorem", 'Thermal expansion']
            },
            {
                name: 'Thermodynamics',
                class: 11,
                topics: ['Laws of thermodynamics', 'Heat engines', 'Carnot cycle', 'Entropy', 'Specific heat capacities']
            },
            {
                name: 'Kinetic Theory of Gases',
                class: 11,
                topics: ['Ideal gas equation', 'Kinetic energy of gas', 'Degrees of freedom', 'Mean free path', 'Gas laws']
            },
            {
                name: 'Oscillations and Waves',
                class: 11,
                topics: ['SHM', 'Spring oscillations', 'Pendulum', 'Wave motion', 'Superposition', 'Standing waves', 'Doppler effect']
            },
            {
                name: 'Electrostatics',
                class: 12,
                topics: ["Coulomb's law", 'Electric field', 'Electric potential', 'Gauss theorem', 'Capacitors', 'Dielectrics']
            },
            {
                name: 'Current Electricity',
                class: 12,
                topics: ["Ohm's law", "Kirchhoff's laws", 'Wheatstone bridge', 'Meter bridge', 'Potentiometer', 'EMF and internal resistance']
            },
            {
                name: 'Magnetic Effects of Current and Magnetism',
                class: 12,
                topics: ['Biot-Savart law', "Ampere's law", 'Solenoid', 'Moving coil galvanometer', 'Earth magnetism', 'Magnetic materials']
            },
            {
                name: 'Electromagnetic Induction and AC',
                class: 12,
                topics: ["Faraday's law", "Lenz's law", 'Self and mutual inductance', 'AC circuits', 'Transformers', 'LC oscillations']
            },
            {
                name: 'Optics',
                class: 12,
                topics: ['Reflection', 'Refraction', 'Lenses', 'Optical instruments', 'Wave optics', 'Interference', 'Diffraction', 'Polarization']
            },
            {
                name: 'Dual Nature of Matter and Radiation',
                class: 12,
                topics: ['Photoelectric effect', 'de Broglie wavelength', 'Davisson-Germer experiment', 'Einstein photoelectric equation']
            },
            {
                name: 'Atoms and Nuclei',
                class: 12,
                topics: ['Bohr model', 'Hydrogen spectrum', 'Radioactivity', 'Nuclear fission', 'Nuclear fusion', 'Mass-energy relation']
            },
            {
                name: 'Electronic Devices',
                class: 12,
                topics: ['Semiconductors', 'p-n junction', 'Diode', 'Transistor', 'Logic gates']
            }
        ]
    },
    chemistry: {
        name: 'Chemistry',
        icon: '🧪',
        color: '#10b981',
        chapters: [
            {
                name: 'Some Basic Concepts of Chemistry',
                class: 11,
                topics: ['Mole concept', 'Stoichiometry', 'Atomic and molecular masses', 'Percentage composition', 'Empirical formula']
            },
            {
                name: 'Structure of Atom',
                class: 11,
                topics: ['Bohr model', 'Quantum numbers', 'Electronic configuration', 'Aufbau principle', "Hund's rule", 'Shapes of orbitals']
            },
            {
                name: 'Classification of Elements',
                class: 11,
                topics: ['Periodic table', 'Periodic properties', 'Ionization energy', 'Electron affinity', 'Electronegativity']
            },
            {
                name: 'Chemical Bonding',
                class: 11,
                topics: ['Ionic bond', 'Covalent bond', 'VSEPR theory', 'Hybridization', 'Molecular orbital theory', 'Hydrogen bonding']
            },
            {
                name: 'States of Matter',
                class: 11,
                topics: ['Gas laws', 'Ideal gas equation', 'Kinetic molecular theory', 'Liquefaction', 'Vapour pressure']
            },
            {
                name: 'Thermodynamics',
                class: 11,
                topics: ['Enthalpy', 'Entropy', 'Gibbs free energy', "Hess's law", 'Born-Haber cycle']
            },
            {
                name: 'Equilibrium',
                class: 11,
                topics: ['Chemical equilibrium', 'Le Chatelier principle', 'Ionic equilibrium', 'pH and buffers', 'Solubility product']
            },
            {
                name: 'Redox Reactions',
                class: 11,
                topics: ['Oxidation-reduction', 'Balancing redox equations', 'Electrode potential', 'Electrochemical cells']
            },
            {
                name: 'Organic Chemistry Basics',
                class: 11,
                topics: ['IUPAC nomenclature', 'Isomerism', 'Electronic effects', 'Reaction mechanisms', 'Hyperconjugation']
            },
            {
                name: 'Hydrocarbons',
                class: 11,
                topics: ['Alkanes', 'Alkenes', 'Alkynes', 'Aromatic compounds', 'Benzene reactions']
            },
            {
                name: 'Solid State',
                class: 12,
                topics: ['Crystal structures', 'Unit cell', 'Packing efficiency', 'Defects in solids', 'Electrical properties']
            },
            {
                name: 'Solutions',
                class: 12,
                topics: ['Concentration terms', 'Colligative properties', "Raoult's law", 'Osmotic pressure', "Henry's law"]
            },
            {
                name: 'Electrochemistry',
                class: 12,
                topics: ['Nernst equation', 'Conductance', 'Electrolysis', 'Batteries', 'Fuel cells', 'Corrosion']
            },
            {
                name: 'Chemical Kinetics',
                class: 12,
                topics: ['Rate of reaction', 'Rate law', 'Order of reaction', 'Arrhenius equation', 'Collision theory']
            },
            {
                name: 'p-Block Elements',
                class: 12,
                topics: ['Group 15 elements', 'Group 16 elements', 'Group 17 elements', 'Group 18 elements', 'Interhalogen compounds']
            },
            {
                name: 'd and f Block Elements',
                class: 12,
                topics: ['Transition elements', 'Lanthanoids', 'Actinoids', 'Coordination compounds', 'Werner theory', 'Crystal field theory']
            },
            {
                name: 'Aldehydes, Ketones and Carboxylic Acids',
                class: 12,
                topics: ['Nomenclature', 'Nucleophilic addition', 'Aldol condensation', 'Cannizzaro reaction', 'Acidity of carboxylic acids']
            },
            {
                name: 'Amines and Biomolecules',
                class: 12,
                topics: ['Classification of amines', 'Basicity', 'Diazonium salts', 'Carbohydrates', 'Proteins', 'Nucleic acids', 'Vitamins']
            }
        ]
    },
    biology: {
        name: 'Biology',
        icon: '🧬',
        color: '#f97316',
        chapters: [
            {
                name: 'The Living World',
                class: 11,
                topics: ['Biodiversity', 'Taxonomy', 'Taxonomic categories', 'Nomenclature', 'Taxonomic aids']
            },
            {
                name: 'Biological Classification',
                class: 11,
                topics: ['Five kingdom classification', 'Monera', 'Protista', 'Fungi', 'Plantae', 'Animalia', 'Viruses']
            },
            {
                name: 'Plant Kingdom',
                class: 11,
                topics: ['Algae', 'Bryophytes', 'Pteridophytes', 'Gymnosperms', 'Angiosperms', 'Plant life cycles']
            },
            {
                name: 'Animal Kingdom',
                class: 11,
                topics: ['Basis of classification', 'Phylum Porifera to Chordata', 'Non-chordates', 'Chordates']
            },
            {
                name: 'Morphology of Flowering Plants',
                class: 11,
                topics: ['Root system', 'Stem modifications', 'Leaf morphology', 'Inflorescence', 'Flower parts', 'Fruit types', 'Seed structure']
            },
            {
                name: 'Anatomy of Flowering Plants',
                class: 11,
                topics: ['Tissues', 'Tissue system', 'Anatomy of root stem leaf', 'Secondary growth']
            },
            {
                name: 'Cell Biology',
                class: 11,
                topics: ['Cell theory', 'Prokaryotic vs eukaryotic', 'Cell organelles', 'Cell membrane', 'Cell division']
            },
            {
                name: 'Biomolecules',
                class: 11,
                topics: ['Carbohydrates', 'Proteins', 'Lipids', 'Nucleic acids', 'Enzymes', 'Metabolism']
            },
            {
                name: 'Plant Physiology',
                class: 11,
                topics: ['Transport in plants', 'Mineral nutrition', 'Photosynthesis', 'Respiration', 'Plant growth', 'Plant hormones']
            },
            {
                name: 'Human Physiology',
                class: 11,
                topics: ['Digestion', 'Breathing', 'Body fluids and circulation', 'Excretion', 'Locomotion', 'Neural control', 'Chemical coordination']
            },
            {
                name: 'Reproduction in Organisms',
                class: 12,
                topics: ['Asexual reproduction', 'Sexual reproduction', 'Pollination', 'Fertilization', 'Post-fertilization events']
            },
            {
                name: 'Genetics and Evolution',
                class: 12,
                topics: ["Mendel's laws", 'Inheritance patterns', 'Chromosomal theory', 'DNA replication', 'Gene expression', 'Mutation', 'Evolution theories']
            },
            {
                name: 'Biology and Human Welfare',
                class: 12,
                topics: ['Health and disease', 'Immunity', 'AIDS and cancer', 'Drugs and alcohol abuse', 'Microbes in human welfare']
            },
            {
                name: 'Biotechnology',
                class: 12,
                topics: ['Recombinant DNA technology', 'PCR', 'Gene cloning', 'Transgenic organisms', 'Gene therapy', 'GMO']
            },
            {
                name: 'Ecology',
                class: 12,
                topics: ['Organisms and environment', 'Ecosystems', 'Biodiversity', 'Environmental issues', 'Population ecology']
            },
            {
                name: 'Human Reproduction',
                class: 12,
                topics: ['Male reproductive system', 'Female reproductive system', 'Gametogenesis', 'Menstrual cycle', 'Embryo development', 'Contraception']
            }
        ]
    }
};

module.exports = { NEET_SYLLABUS };
