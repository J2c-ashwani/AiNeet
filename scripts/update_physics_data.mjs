/**
 * Script to replace flat physics data with nested topic-wise data (2020-2025)
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

const physicsTopicData = {
    'Units and Measurement': {
        'Measuring Instruments (Screw Gauge)': { 2020: 1, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'Dimensions of Physical Quantities': { 2020: 1, 2021: 0, 2022: 1, 2023: 0, 2024: 1, 2025: 0 },
        'Significant Figures': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'Dimensional Analysis (Finding Unknowns)': { 2020: 0, 2021: 2, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'Rules for Arithmetic with Significant Figures': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
        'Errors in Measurement (Systematic/Random/Gross)': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
        'Errors in Measurement (Combination of Errors)': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 1 },
        'Measuring Instruments (Vernier Callipers)': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 1 },
        'Dimensional Constants': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
        'Dimensional Analysis (Deducing Relation)': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
    },
    'Motion in a Straight Line': {
        'Motion under Gravity (Free Fall)': { 2020: 1, 2021: 0, 2022: 1, 2023: 1, 2024: 0, 2025: 0 },
        'Displacement in nth Second': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'Graphs in Motion (Motion Diagram)': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
        'Average Velocity and Average Speed': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
        'Equations of Motion': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
        'Kinematical Quantities (Velocity-Time Graph)': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
        'Acceleration (Instantaneous)': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
        'Relative Velocity in One Dimension': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
    },
    'Motion in a Plane': {
        'Motion with Constant Acceleration': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'Projectile Motion (Maximum Height)': { 2020: 0, 2021: 1, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
        'Projectile Motion (Analysis)': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
    },
    'Laws of Motion': {
        "Newton's Second Law (Application)": { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
        'Friction (Contact Force and Constant)': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
        'Various Forces in Nature': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
        'Applications of Friction Force': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 1 },
    },
    'Work, Energy and Power': {
        'Power (Efficiency)': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'Power (Definition)': { 2020: 0, 2021: 0, 2022: 2, 2023: 0, 2024: 0, 2025: 0 },
        'Potential Energy (Spring)': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
        'Power (Instantaneous)': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
        'Calculation of Work (Constant Force including Gravity)': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
    },
    'Circular Motion': {
        'Non-Uniform Circular Motion': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
        'Uniform Circular Motion (Centripetal Acceleration)': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
        'Dynamics of Circular Motion': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
        'Vertical Circular Motion': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
    },
    'Centre of Mass and System of Particles': {
        'Centre of Mass (Two Body System)': { 2020: 1, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
        'Collisions (One Dimension)': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
        'Conservation of Linear Momentum': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
        'Collisions (Inelastic)': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
    },
    'Rotational Motion': {
        'Torque of a Force About a Point': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'Moment of Inertia (Important Cases)': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
        'Equilibrium of Rigid Body (Principle of Moments)': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
        'Moment of Inertia (Radius of Gyration)': { 2020: 0, 2021: 0, 2022: 1, 2023: 1, 2024: 0, 2025: 0 },
        "Analogue of Newton's Second Law for Rotation": { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
        'Moment of Inertia (Rectangular Lamina)': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
        'Rolling Motion (Horizontal Plane)': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
        'Torque and Angular Momentum (Conservation)': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
    },
    'Gravitation': {
        'Acceleration Due to Gravity (Variation due to Height)': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
        'Gravitational Potential Energy': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'Escape Speed or Escape Energy': { 2020: 0, 2021: 2, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'Gravitational Field (Bodies of Different Shapes)': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
        'Gravitational Field Intensity (Point Mass)': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
        'Satellite Motion (Time Period)': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
        'Acceleration Due to Gravity (Mass and Density)': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
        'Earth Satellite, Geostationary and Polar Satellites': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
        "Kepler's Laws (Law of Periods)": { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
    },
    'Mechanical Properties of Solids': {
        "Hooke's Law": { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'Shear Modulus (Modulus of Rigidity)': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
        'Stress and Strain (Tensile/Compressive)': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
        "Young's Modulus": { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 2, 2025: 0 },
    },
    'Mechanical Properties of Fluids': {
        'Surface Tension (Capillary Rise)': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'Viscosity (Terminal Velocity)': { 2020: 0, 2021: 1, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
        'Surface Tension (Bubbles Excess Pressure)': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
        'Surface Tension (Surface Energy)': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
        "Bernoulli's Equation (Pitot Tube)": { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
        'Surface Tension': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 1 },
    },
    'Thermal Properties of Matter': {
        'Heat Transfer (Conduction)': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
        'Calorimetry (Principle of Calorimetry)': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
    },
    'Kinetic Theory': {
        'Mean Free Path': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'Average Kinetic Energy of Gas Molecule': { 2020: 1, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'RMS Speed': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'Ideal Gas Equation': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
        'Mean Square Speed': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
        "Charles' Law": { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
        'Kinetic Theory of an Ideal Gas': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
    },
    'Thermodynamics': {
        'Thermodynamic State Variables': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'Thermodynamic Processes (Adiabatic)': { 2020: 1, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
        "Carnot's Engine": { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
        'Internal Energy': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
        'First Law of Thermodynamics': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
        'Work Done (P-V Curve)': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
    },
    'Oscillations': {
        'Simple Harmonic Motion (Phase)': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'Oscillations Due to a Spring': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 2 },
        'Energy in SHM': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'The Simple Pendulum': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
        'Velocity and Acceleration in SHM': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
        'SHM (Time Period and Frequency)': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 2, 2025: 0 },
    },
    'Waves': {
        'Beats': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'Speed of Transverse Wave on Stretched String': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
        'Standing Waves (Open Organ Pipe)': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 1 },
    },
    'Electric Charges and Fields': {
        'Electric Field': { 2020: 1, 2021: 0, 2022: 1, 2023: 2, 2024: 0, 2025: 0 },
        'Dipole in Non-Uniform External Field': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'Electric Dipole (Axis)': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
        'Electric Flux': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
        'Charging Methods (Induction, Friction, Conduction)': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
    },
    'Electrostatic Potential & Capacitance': {
        'Equipotential Surfaces': { 2020: 1, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
        'Effect of Dielectric on Capacitance': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
        'Potential due to Point Charge & Dipole': { 2020: 1, 2021: 1, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
        'Sharing of Charge and Common Potential': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'Potential Energy of a Dipole': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'Energy Stored in a Capacitor': { 2020: 0, 2021: 1, 2022: 1, 2023: 0, 2024: 1, 2025: 0 },
        'Combination of Capacitors (Series, Parallel)': { 2020: 0, 2021: 1, 2022: 0, 2023: 1, 2024: 1, 2025: 0 },
        'Electrostatic Potential (Potential Difference)': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
        'Capacitance (Types)': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
        'Potential due to Continuous Charge (Spherical Shell)': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
        'Work Done on Electric Dipole': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
    },
    'Current Electricity': {
        'Electrical Resistance (Temperature Dependence & Resistivity)': { 2020: 2, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
        'Colour Coding of Resistances': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'Electric Current (Mobility)': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'Electric Current (Drift Velocity)': { 2020: 1, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'Meter Bridge': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'Current Density': { 2020: 0, 2021: 1, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
        'Resistivity & Conductivity': { 2020: 0, 2021: 1, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
        'Combination of Resistors (Series and Parallel)': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 1, 2025: 1 },
        'Potentiometer': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'Equivalent Resistance (Complex Circuits)': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'Electrical Energy/Power': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 1, 2025: 0 },
        'Wheatstone Bridge': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 1 },
        "Kirchhoff's Rules (Loop Rule)": { 2020: 0, 2021: 0, 2022: 0, 2023: 2, 2024: 0, 2025: 0 },
        'Heating Effect of Current': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
        'Electric Current (Equation)': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
        'Emf of Cell (Equivalent Emf/Internal Resistance)': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
        'Voltage Division and Current Division Rule': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
    },
    'Moving Charges and Magnetism': {
        'Solenoid and Toroid': { 2020: 1, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
        'Magnetic Force (Direction and Properties)': { 2020: 0, 2021: 2, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'Magnetic Field (Thin Straight Conductor)': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'Current Loop as Magnetic Dipole': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 2 },
        'Biot-Savart Law': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
        "Ampere's Circuital Law": { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
        'Magnetic Field at Centre of Circular Arc': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 1, 2025: 0 },
        'Magnetic Force on Current-Carrying Conductor': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
        'Velocity Selector, Cyclotron': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
    },
    'Magnetism and Matter': {
        'Magnetic Susceptibility': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'Magnetic Permeability': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
        "Magnetism and Gauss's Law": { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
        'Diamagnetism, Paramagnetism, Ferromagnetism': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
        'Bar Magnet (Angular SHM, Tangent Law)': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
        'Bar Magnet (Magnetic Dipole Moment, Field)': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
    },
    'Electromagnetic Induction': {
        'Mutual Inductance (Coaxial Solenoids)': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'Magnetic Flux': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
        "Faraday's Law (Lenz's Law)": { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 1, 2025: 0 },
        'Inductor (Energy Stored)': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
        'Self-Inductance': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
    },
    'Alternating Current': {
        'AC Voltage on Inductor and Capacitor': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
        'Power Factor in AC Circuits': { 2020: 1, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'LCR Circuit (Impedance Variation)': { 2020: 0, 2021: 1, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
        'Transformers': { 2020: 0, 2021: 1, 2022: 0, 2023: 1, 2024: 1, 2025: 0 },
        'RMS Value of AC': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
        'LCR Circuit (Phasor Diagram)': { 2020: 0, 2021: 0, 2022: 1, 2023: 1, 2024: 0, 2025: 0 },
        'Reactance of Capacitive Circuit': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
        'LCR Circuit (Phase Relationship)': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
    },
    'Electromagnetic Waves': {
        'Relation Between E, B and Speed of Light': { 2020: 1, 2021: 1, 2022: 0, 2023: 1, 2024: 0, 2025: 1 },
        'Intensity of EM Wave': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'EM Spectrum (Microwaves)': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
        'Characteristics of EM Waves': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 1, 2025: 0 },
        'Displacement Current': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 1, 2025: 1 },
    },
    'Ray Optics': {
        'Refraction through a Prism': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
        'Optical Instruments (Telescope)': { 2020: 1, 2021: 1, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
        'Dispersion by Prism (Angular Dispersion)': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'Combination of Thin Lenses': { 2020: 0, 2021: 1, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
        'Combination of Lens and Mirror': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'Lens Formula': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
        'Refraction through Glass Slab': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
        'Total Internal Reflection': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
        'Critical Angle, Grazing Emergence': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
        'Thin Lenses': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 1 },
        'Optical Instruments (Microscope)': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
    },
    'Wave Optics': {
        "Polarisation by Reflection (Brewster's Law)": { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 1 },
        'Interference (YDSE - Positions of Fringes)': { 2020: 1, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
        'YDSE Fringe Width': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
        'Interference (YDSE - Shape of Fringes)': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
    },
    'Dual Nature of Radiation & Matter': {
        "Einstein's Photoelectric Equation": { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'De Broglie Wavelength': { 2020: 1, 2021: 1, 2022: 1, 2023: 0, 2024: 1, 2025: 1 },
        'Particle Nature of Light (Photon)': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
        'Laws of Photoelectric Emission': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
        "Photoelectric Effect (Hertz's/Hallwachs Observations)": { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
        'Effect of Intensity on Photocurrent': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
    },
    'Atoms': {
        "Bohr Model (Failure of Bohr's Theory)": { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'Bohr Model (Energy of Electron in nth Orbit)': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
        'Hydrogen Spectrum': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 1, 2025: 0 },
        'X-Rays (Properties)': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
        "Bohr Model (Radius in nth Orbit)": { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 0, 2025: 1 },
        'Thomson Model': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
        "de-Broglie's Explanation of Bohr's Quantization": { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 1 },
    },
    'Nuclei': {
        'Mass-Energy and Nuclear Binding Energy': { 2020: 1, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'Nuclear Energy (Fission)': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'Atomic Masses (Electron Volt)': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'Radioactivity (Alpha/Beta Decay)': { 2020: 0, 2021: 1, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'Radioactivity (Half-Life/Mean-Life)': { 2020: 0, 2021: 1, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
        'Composition of Nucleus': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
        'Nuclear Density': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
        'Nuclear Energy (Chain Reaction)': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
    },
    'Semiconductor Electronics': {
        'P-N Junction (Forward/Reverse Bias)': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'Transistor Configurations': { 2020: 1, 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 0 },
        'Digital Electronics and Logic Gates': { 2020: 1, 2021: 1, 2022: 1, 2023: 1, 2024: 2, 2025: 1 },
        'P-N Junction Formation': { 2020: 0, 2021: 1, 2022: 1, 2023: 0, 2024: 0, 2025: 0 },
        'Zener Diode': { 2020: 0, 2021: 1, 2022: 0, 2023: 1, 2024: 0, 2025: 0 },
        'Junction Diode as Rectifier': { 2020: 0, 2021: 0, 2022: 1, 2023: 0, 2024: 0, 2025: 1 },
        'Semiconductor Diode': { 2020: 0, 2021: 0, 2022: 0, 2023: 1, 2024: 1, 2025: 0 },
        'Photo Diode, LED, Solar Cell': { 2020: 0, 2021: 0, 2022: 0, 2023: 0, 2024: 1, 2025: 0 },
    },
};

// Map old flat keys to new nested data keys
const replacements = {
    "'Units and Measurement': { 2021: 1, 2022: 1, 2023: 1, 2024: 1 },": 'Units and Measurement',
    "'Motion in a Straight Line': { 2021: 1, 2022: 1, 2023: 2, 2024: 1 },": 'Motion in a Straight Line',
    "'Motion in a Plane': { 2021: 1, 2022: 1, 2023: 1, 2024: 2 },": 'Motion in a Plane',
    "'Laws of Motion': { 2021: 2, 2022: 3, 2023: 1, 2024: 2 },": 'Laws of Motion',
    "'Work, Energy and Power': { 2021: 2, 2022: 2, 2023: 2, 2024: 2 },": 'Work, Energy and Power',
    "'System of Particles & Rotational Motion': { 2021: 2, 2022: 3, 2023: 3, 2024: 2 },": null, // Split into 3 new chapters
    "'Gravitation': { 2021: 2, 2022: 2, 2023: 1, 2024: 2 },": 'Gravitation',
    "'Mechanical Properties of Solids': { 2021: 1, 2022: 1, 2023: 1, 2024: 1 },": 'Mechanical Properties of Solids',
    "'Mechanical Properties of Fluids': { 2021: 1, 2022: 1, 2023: 2, 2024: 1 },": 'Mechanical Properties of Fluids',
    "'Thermal Properties of Matter': { 2021: 1, 2022: 1, 2023: 1, 2024: 1 },": 'Thermal Properties of Matter',
    "'Thermodynamics': { 2021: 4, 2022: 3, 2023: 2, 2024: 3 },": 'Thermodynamics',
    "'Kinetic Theory': { 2021: 1, 2022: 1, 2023: 1, 2024: 1 },": 'Kinetic Theory',
    "'Oscillations': { 2021: 1, 2022: 1, 2023: 1, 2024: 1 },": 'Oscillations',
    "'Waves': { 2021: 1, 2022: 2, 2023: 1, 2024: 1 },": 'Waves',
    "'Electric Charges and Fields': { 2021: 1, 2022: 1, 2023: 2, 2024: 2 },": 'Electric Charges and Fields',
    "'Electrostatic Potential & Capacitance': { 2021: 2, 2022: 1, 2023: 1, 2024: 1 },": 'Electrostatic Potential & Capacitance',
    "'Current Electricity': { 2021: 3, 2022: 5, 2023: 3, 2024: 3 },": 'Current Electricity',
    "'Moving Charges and Magnetism': { 2021: 2, 2022: 1, 2023: 2, 2024: 2 },": 'Moving Charges and Magnetism',
    "'Magnetism and Matter': { 2021: 1, 2022: 1, 2023: 1, 2024: 1 },": 'Magnetism and Matter',
    "'Electromagnetic Induction': { 2021: 2, 2022: 1, 2023: 2, 2024: 2 },": 'Electromagnetic Induction',
    "'Alternating Current': { 2021: 2, 2022: 2, 2023: 1, 2024: 1 },": 'Alternating Current',
    "'Electromagnetic Waves': { 2021: 2, 2022: 1, 2023: 1, 2024: 1 },": 'Electromagnetic Waves',
    "'Ray Optics': { 2021: 2, 2022: 2, 2023: 2, 2024: 3 },": 'Ray Optics',
    "'Wave Optics': { 2021: 2, 2022: 2, 2023: 2, 2024: 1 },": 'Wave Optics',
    "'Dual Nature of Radiation & Matter': { 2021: 2, 2022: 1, 2023: 2, 2024: 2 },": 'Dual Nature of Radiation & Matter',
    "'Atoms': { 2021: 1, 2022: 1, 2023: 1, 2024: 1 },": 'Atoms',
    "'Nuclei': { 2021: 1, 2022: 1, 2023: 1, 2024: 1 },": 'Nuclei',
    "'Semiconductor Electronics': { 2021: 4, 2022: 2, 2023: 2, 2024: 2 },": 'Semiconductor Electronics',
};

let replacedCount = 0;

for (const [oldLine, key] of Object.entries(replacements)) {
    if (content.includes(oldLine)) {
        if (key === null) {
            // System of Particles & Rotational Motion -> split into 3 chapters
            const circularNested = buildNestedJS(physicsTopicData['Circular Motion']);
            const centreNested = buildNestedJS(physicsTopicData['Centre of Mass and System of Particles']);
            const rotationalNested = buildNestedJS(physicsTopicData['Rotational Motion']);
            content = content.replace(
                `        ${oldLine}`,
                `        'Circular Motion': {\n${circularNested}\n        },\n        'Centre of Mass and System of Particles': {\n${centreNested}\n        },\n        'Rotational Motion': {\n${rotationalNested}\n        },`
            );
            replacedCount += 3;
        } else {
            const topicData = physicsTopicData[key];
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

fs.writeFileSync(filePath, content);
console.log(`\n✅ Replaced ${replacedCount} physics chapters with nested topic-wise data`);
