/**
 * Cosmic Mathematics Formulas Database
 * Sources: NASA, JPL, IAU
 */

export const COSMIC_FORMULAS = {
  title: "Cosmic Mathematics Formula Encyclopedia",
  version: "1.0.0",
  sources: ["NASA/JPL", "IAU Standards", "Particle Data Group"],
  formulas: [
    // Kepler Laws
    {
      category: "Kepler Laws",
      name: "Kepler 1st Law (Ellipse)",
      formula: "r = p / (1 + e cos(theta))",
      description: "Planetary orbits are ellipses"
    },
    {
      category: "Kepler Laws",
      name: "Kepler 2nd Law (Area)",
      formula: "dA/dt = constant",
      description: "Equal areas in equal times"
    },
    {
      category: "Kepler Laws",
      name: "Kepler 3rd Law (Harmonic)",
      formula: "T squared = (4 pi squared / GM) a cubed",
      description: "Period squared proportional to semi-major axis cubed"
    },
    // Gravitation
    {
      category: "Gravitation",
      name: "Universal Gravitation",
      formula: "F = G M1 M2 / r squared",
      description: "Attractive force between masses"
    },
    {
      category: "Gravitation",
      name: "Escape Velocity",
      formula: "v = sqrt(2GM / r)",
      description: "Velocity to escape gravitational field"
    },
    // Orbital Mechanics
    {
      category: "Orbital Mechanics",
      name: "Orbital Velocity",
      formula: "v = sqrt(GM (2/r - 1/a))",
      description: "Velocity at any orbital point"
    },
    {
      category: "Orbital Mechanics",
      name: "Circular Orbit Velocity",
      formula: "v = sqrt(GM / r)",
      description: "Velocity for circular orbit"
    },
    {
      category: "Orbital Mechanics",
      name: "Orbital Period",
      formula: "T = 2 pi sqrt(a cubed / GM)",
      description: "Time for one orbit"
    },
    // Cosmology
    {
      category: "Cosmology",
      name: "Hubble Law",
      formula: "v = H0 d",
      description: "Expansion velocity proportional to distance"
    },
    {
      category: "Cosmology",
      name: "Friedmann Equation",
      formula: "H squared = (8 pi G / 3) rho",
      description: "Cosmic expansion dynamics"
    },
    // Astrophysics
    {
      category: "Astrophysics",
      name: "Stefan-Boltzmann",
      formula: "L = 4 pi R squared sigma T to the 4th",
      description: "Blackbody radiation power"
    },
    {
      category: "Astrophysics",
      name: "Schwarzschild Radius",
      formula: "rs = 2GM / c squared",
      description: "Black hole event horizon"
    },
    // Relativity
    {
      category: "Relativity",
      name: "Mass-Energy",
      formula: "E = m c squared",
      description: "Mass-energy equivalence"
    },
    {
      category: "Relativity",
      name: "Lorentz Factor",
      formula: "gamma = 1 / sqrt(1 - v squared / c squared)",
      description: "Relativistic effects factor"
    }
  ]
};

export default COSMIC_FORMULAS;
